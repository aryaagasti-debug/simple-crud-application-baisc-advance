import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('partner')
@UseGuards(ApiKeyGuard)
export class PartnerController {
  @Get('data')
  getPartnerData() {
    return {
      secure: true,
      source: 'API KEY',
    };
  }

  @Get('stats')
  getStats() {
    return {
      users: 1200,
      posts: 4500,
    };
  }
}
