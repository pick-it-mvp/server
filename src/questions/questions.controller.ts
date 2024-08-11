import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsService } from './questions.service';

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post('')
  create(@Body() body: CreateQuestionDto) {
    return this.questionsService.create(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.questionsService.get(+id);
  }

  @Get('')
  getAll() {
    return this.questionsService.getAll();
  }
}
