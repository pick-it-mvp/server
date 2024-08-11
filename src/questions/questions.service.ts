import { Inject, Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable({ scope: Scope.REQUEST })
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    @Inject('REQUEST') private req: Request,
  ) {}

  create(data: CreateQuestionDto) {
    const uid = this.req.user.id;
    return this.prisma.questions.create({ data: { ...data, uid } });
  }

  async get(id: number) {
    const uid = this.req.user.id;
    await this.prisma.question_views.create({
      data: { uid, question_id: id },
    });
    return this.prisma.questions.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        ai_reply: true,
        created_at: true,
        replies: {
          select: {
            user: {
              select: {
                nickName: true,
              },
            },
            content: true,
            created_at: true,
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
    });
  }
  async getAll() {
    return (
      await this.prisma.questions.findMany({
        select: {
          id: true,
          title: true,
          content: true,
          created_at: true,
          _count: {
            select: {
              views: true,
            },
          },
        },
      })
    ).map((qt) => {
      const data: any = qt;
      data.is_hot = data._count.views > 5;
      delete data._count;

      return data;
    });
  }
}
