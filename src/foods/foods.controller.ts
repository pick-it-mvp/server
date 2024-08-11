import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FoodsService } from './foods.service';

@ApiTags('foods')
@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get('recommend')
  getRecommend() {
    return this.foodsService.getRecommend();
  }
  @Get('categories')
  getCategory() {
    return this.foodsService.getCategory();
  }

  @Get('categories/:id')
  getCategoryDetail(@Param('id') id: string) {
    return this.foodsService.getCategoryDetail(+id);
  }

  @Get(':id')
  get(@Param('id') id: string, @Query('search') search?: boolean) {
    return this.foodsService.get(+id, search);
  }
}
