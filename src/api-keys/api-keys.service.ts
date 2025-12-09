import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  async create(name: string) {
    const rawKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.prisma.apiKey.create({
      data: {
        name,
        keyHash: hash,
      },
    });

    return { apiKey: rawKey };
  }

  validate(apiKey: string) {
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.apiKey.findFirst({
      where: { keyHash: hash, isActive: true },
    });
  }
}
