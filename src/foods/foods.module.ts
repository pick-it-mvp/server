import { Module } from '@nestjs/common';
import { SearchService } from 'src/search/search.service';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';

@Module({
  controllers: [FoodsController],
  providers: [FoodsService, SearchService],
})
export class FoodsModule {}
