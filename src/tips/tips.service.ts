import { Inject, Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class TipsService {
  constructor(
    private prisma: PrismaService,
    @Inject('REQUEST') private req: Request,
  ) {}

  getRandom() {
    const { userMode } = this.req.user;

    return this.prisma.$queryRaw`
      SELECT id, type, content, conditionStart, conditionEnd FROM tips WHERE type = ${userMode} ORDER BY random() limit 3
    `;
  }
}
