import { Inject, Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class TipsService {
  constructor(
    private prisma: PrismaService,
    @Inject('REQUEST') private req: Request,
  ) {}

  calculatePregnancyWeeks(dueDate) {
    const now = new Date();
    const dueDateObj = new Date(dueDate);

    const differenceInMs = Math.abs(now.getTime() - dueDateObj.getTime());

    const weeks = Math.floor(differenceInMs / (1000 * 60 * 60 * 24 * 7));

    return weeks;
  }

  async getRandom() {
    const { id } = this.req.user;
    const { dueDate, userMode } = await this.prisma.users.findUniqueOrThrow({
      where: { id },
      select: { userMode: true, dueDate: true },
    });

    return this.prisma.$queryRaw`
      SELECT id, type, title, content, condition_start_week, condition_end_week FROM tips WHERE type = ${userMode}::user_type ${userMode !== 'baby' ? `AND condition_start_week <= ${this.calculatePregnancyWeeks(dueDate)} AND condition_end_week >= ${this.calculatePregnancyWeeks(dueDate)}` : ''} ORDER BY random() limit 3
    `;
  }
}
