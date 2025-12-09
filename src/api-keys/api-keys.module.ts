import { Module } from '@nestjs/common';
import { ApiKeyService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApiKeysController], // ✅ VERY IMPORTANT
  providers: [ApiKeyService],
  exports: [ApiKeyService],
})
export class ApiKeysModule {}
