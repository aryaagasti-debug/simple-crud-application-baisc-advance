import { Controller, Post, Body } from '@nestjs/common';
import { ApiKeyService } from './api-keys.service';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeys: ApiKeyService) {}

  // ✅ POST /api-keys/generate
  @Post('generate')
  async generate(@Body('name') name: string) {
    return this.apiKeys.create(name ?? 'partner-app');
  }
}
