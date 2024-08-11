import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSearchByNaverDto } from './dto/create-search.dto';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // @Post(':id')
  // search(@Param('id') id: string) {
  //   return this.searchService.search(+id);
  // }

  @Post('naver')
  searchByNaver(@Body() body: CreateSearchByNaverDto) {
    return this.searchService.searchByNaver(body);
  }

  @Get(':name')
  getList(@Param('name') name: string) {
    return this.searchService.getList(name);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.searchService.delete(+id);
  }
}
