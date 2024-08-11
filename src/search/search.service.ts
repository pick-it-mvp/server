import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';
import config from 'src/common/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSearchByNaverDto } from './dto/create-search.dto';

@Injectable({ scope: Scope.REQUEST })
export class SearchService {
  private http = new HttpService();

  constructor(
    private prisma: PrismaService,
    @Inject('REQUEST') private req: Request,
  ) {}

  async search(id: number) {
    const uid = this.req.user.id;

    const result = await this.prisma.foods.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        searches: {
          where: {
            uid,
          },
          select: { id: true },
        },
      },
    });

    if (result) {
      if (result.searches.length > 0)
        await this.prisma.user_searches.delete({
          where: {
            id: result.searches[0].id,
          },
        });

      await this.prisma.user_searches.create({
        data: {
          uid,
          food_id: result.id,
        },
      });
    }

    return true;
  }

  getList(name: string) {
    return this.prisma.foods.findMany({
      where: { name: { contains: name } },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async searchByNaver(data: CreateSearchByNaverDto) {
    const { content } = data;
    const { naver_client, naver_secret } = config();

    const blog = (
      await lastValueFrom(
        this.http.get(
          `https://developers.naver.com/proxyapi/openapi/v1/search/blog?query=${content}&display=10&start=1&sort=sim&filter=all`,
          {
            headers: {
              'X-Naver-Client-Id': naver_client,
              'X-Naver-Client-Secret': naver_secret,
            },
          },
        ),
      )
    ).data.items.slice(0, 2);

    return blog;
  }

  delete(id: number) {
    return this.prisma.user_searches.delete({ where: { id } });
  }
}
