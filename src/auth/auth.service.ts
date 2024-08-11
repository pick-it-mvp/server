import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { ConflictException, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { subDays } from 'date-fns';
import { Request } from 'express';
import { Redis } from 'ioredis';
import parse from 'parse-duration';
import { UserByJWT } from 'src/users/entities';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto, LoginUserDto } from './dto';

export interface JwtReturn {
  accessToken: string;
}

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    private jwt: JwtService,
    private user: UsersService,
    private config: ConfigService,
    @InjectRedis()
    private cache: Redis,
    @Inject('REQUEST')
    private req: Request,
  ) {}

  async guestLogin(): Promise<JwtReturn> {
    let user = await this.user.findOneByEmail('custom0@custom.com');
    if (!user) {
      user = await this.user.findOne(1);
    }

    return this.createAccessToken(new UserByJWT(user));
  }

  async verify(accessToken: string, refreshToken: string) {
    const verifyAccess = await this.jwt.verify(accessToken, {
      ignoreExpiration: true,
    });
    const verifyRefresh = await this.jwt.verify(refreshToken, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });

    const refreshTokenByCache = (await this.cache.get(
      `user:${verifyRefresh.email}:refreshToken:${verifyRefresh.iat}`,
    )) as string;

    const currentTime = Math.floor(Date.now() / 1e3);

    if (!refreshTokenByCache) throw new UnauthorizedException('Not found refreshToken on cache');
    else if (refreshTokenByCache !== refreshToken) throw new UnauthorizedException('RefreshToken not matched on cache');
    else if (verifyAccess.email !== verifyRefresh.email)
      throw new UnauthorizedException('Not matched email between accessToken and refreshToken');

    if (verifyRefresh.exp <= currentTime) throw new UnauthorizedException('Expired refreshToken');

    if (verifyAccess.exp <= currentTime) {
      if (verifyRefresh.exp >= subDays(currentTime, 1)) return await this.createAccessToken(verifyAccess, true);
      else return await this.createAccessToken(verifyAccess);
    } else {
      return null;
    }
  }

  async logout(refreshToken: string, withdraw?: boolean) {
    await this.deleteTokensOnCache(refreshToken);
    if (withdraw) return await this.user.remove(this.req.user.id);
    else return true;
  }

  async createAccessToken(user: UserByJWT, renew?: boolean): Promise<JwtReturn> {
    const accessToken = this.jwt.sign(
      {
        id: user.id,
        userMode: user.userMode,
        email: user.email,
      },
      user.email === 'admin@test.com'
        ? {
            expiresIn: '7d',
          }
        : {},
    );

    if (renew) {
      await this.createRefreshToken(user.email);
    }

    return { accessToken };
  }

  async createRefreshToken(email: string) {
    const expiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN');
    const refreshToken: any = this.jwt.sign(
      {
        email,
      },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn,
      },
    );
    const { iat } = this.jwt.decode(refreshToken);

    await this.cache.set(`user:${email}:refreshToken:${iat}`, refreshToken, 'PX', parse(expiresIn, 'ms'));

    const client = this.config.get<string>('CLIENT_URL');
    const localCondition = client.includes('local');
    const options = {
      httpOnly: localCondition,
      maxAge: parse(expiresIn, 's'),
      sameSite: localCondition ? 'strict' : 'lax',
      secure: localCondition,
    };
    console.log(options);

    return ((global as any)['cookie'] = { refreshToken, options });
  }

  async deleteTokensOnCache(refreshToken: string) {
    const { decodeRefreshToken } = this.decodeReresh(refreshToken);

    await this.cache.del(`user:${decodeRefreshToken.email}:refreshToken:${decodeRefreshToken.iat}`);

    return true;
  }

  decodeReresh(refreshToken: string) {
    return {
      decodeRefreshToken: this.jwt.verify(refreshToken, {
        ignoreExpiration: true,
        secret: this.config.get('JWT_REFRESH_SECRET'),
      }),
    };
  }

  async createSpecial(id: number) {
    return await this.createAccessToken(await this.user.findOne(id));
  }

  getTokens(req: Request) {
    const { refreshToken } = req.cookies;
    const accessToken = (req.headers['authorization'] as string).split('Bearer ')[1];

    if (!accessToken) throw new UnauthorizedException();
    return { accessToken, refreshToken };
  }

  accessInfo() {
    return this.req.user;
  }

  async signUp(data: CreateUserDto) {
    const { email, password } = data;

    data.password = bcrypt.hashSync(password, 10);

    if (await this.user.findOneByEmail(email)) throw new ConflictException('Already registed this email');
    else return this.user.create(data);
  }

  async signIn(data: LoginUserDto) {
    const { email, password } = data;
    const user = await this.user.findOneByEmail(email);
    if (!user) throw new NotFoundException('Not found email');
    else if (!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Not matched password');
    else return this.createAccessToken(user);
  }
}
