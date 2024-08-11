import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchService } from 'src/search/search.service';

@Injectable()
export class FoodsService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
  ) {}

  async get(id: number, search?: boolean) {
    if (search) await this.searchService.search(id);

    const food = await this.prisma.foods.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        desc: true,
        status: true,
        image: true,
        tags: true,
        category: {
          select: {
            image: true,
          },
        },
        crawlings: {
          select: {
            desc: true,
          },
        },
      },
    });
    return food || 'null';
  }

  getRecommend() {
    return this.prisma.$queryRaw`
      SELECT id, image, name FROM foods ORDER BY random() limit 3
    `;
  }

  getCategory() {
    return this.prisma.food_cateogries.findMany({
      select: {
        id: true,
        name: true,
        image: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  getCategoryDetail(id: number) {
    return this.prisma.foods.findMany({
      where: { category_id: id },
      select: {
        id: true,
        image: true,
        name: true,
      },
    });
  }
}
