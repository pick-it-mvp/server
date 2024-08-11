import { ForbiddenException, Inject, Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject('REQUEST') private req: Request,
  ) {}

  create(data: CreateUserDto) {
    const { user } = this.req;
    if (user) return this.prisma.users.create({ data });
  }

  findOneByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  async findOne(id: number) {
    return await this.prisma.users.findUniqueOrThrow({
      where: { id },
    });
  }

  async findOneForDetail(id: number) {
    return await this.prisma.users.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        userMode: true,
        nickName: true,
        dueDate: true,
      },
    });
  }

  async findHistory(id: number) {
    const uid = this.req.user.id;
    if (uid !== id) throw new ForbiddenException('Not matched about id between parameter and header');

    return await this.prisma.user_searches.findMany({
      where: { uid },
      select: {
        id: true,
        food: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 5,
    });
  }

  remove(id: number) {
    if (this.req.user.id !== id) throw new ForbiddenException('Not matched about id between parameter and header');

    return this.prisma.users.update({
      where: { id },
      data: { withdrew_at: new Date() },
    });
  }
}
