import { Controller, Get } from '@nestjs/common';
import { TipsService } from './tips.service';

@Controller('tips')
export class TipsController {
  constructor(private readonly tipsService: TipsService) {}

  @Get('')
  getRandom() {
    return this.tipsService.getRandom();
  }
}
