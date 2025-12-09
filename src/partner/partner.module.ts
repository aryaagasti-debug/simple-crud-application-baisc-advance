import { Module } from '@nestjs/common';
import { PartnerController } from './partner.controller';
import { ApiKeysModule } from '../api-keys/api-keys.module'; // ✅ IMPORTANT

@Module({
  imports: [ApiKeysModule], // ✅ ApiKeyService yahin se aayega
  controllers: [PartnerController],
})
export class PartnerModule {}
