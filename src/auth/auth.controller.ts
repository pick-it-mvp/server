import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Private, Public } from 'src/common/utils';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Get('guest')
  @Public()
  @ApiOperation({ security: [] })
  async guestLoginByGet(@Res() res: Response) {
    const { accessToken } = await this.auth.guestLogin();

    // res.cookie("accessToken", accessToken);
    return res.redirect(`/login?accessToken=${accessToken}`);
  }

  @Post('verify')
  async verify(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = this.auth.getTokens(req);
    const result = await this.auth.verify(accessToken, refreshToken);

    const cookie = (global as any)['cookie'];
    if (cookie) {
      res.cookie('refreshToken', cookie.refreshToken, cookie.options);
    }

    return result;
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { refreshToken } = this.auth.getTokens(req);
    res.clearCookie('refreshToken');

    return await this.auth.logout(refreshToken);
  }

  @Post('delete')
  async delete(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { refreshToken } = this.auth.getTokens(req);
    res.clearCookie('refreshToken');

    return await this.auth.logout(refreshToken, true);
  }

  @Post('sign-up')
  async signUp(@Body() body: CreateUserDto) {
    return this.auth.signUp(body);
  }

  @Get('login')
  async login() {
    return this.auth.accessInfo();
  }

  @Public()
  @Post('login')
  async signIn(@Body() data: LoginUserDto) {
    return this.auth.signIn(data);
  }
  @Get(':id')
  @Private()
  @ApiBearerAuth('authorization')
  specialId(@Param('id') id: string) {
    return this.auth.createSpecial(+id);
  }
}
