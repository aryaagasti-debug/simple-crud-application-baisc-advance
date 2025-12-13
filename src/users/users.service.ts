import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { AppLogger } from '../utils/logger';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloud: CloudinaryService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateUserDto) {
    AppLogger.info('Creating new user', { email: dto.email });

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashed },
    });

    // ✅ CACHE INVALIDATION
    await this.redis.client.del('users:all');

    AppLogger.info('User created successfully', { userId: user.id });
    return user;
  }

  async findAll() {
    const cacheKey = 'users:all';

    const cached = await this.redis.client.get(cacheKey);

    if (cached) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(cached);
      } catch (err) {
        // ✅ CACHE IS BAD → DELETE IT
        AppLogger.error(
          'Corrupted Redis cache for users:all. Clearing cache.',
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            error: err instanceof Error ? err.message : err,
          },
        );

        await this.redis.client.del(cacheKey);
      }
    }

    // ✅ DB HIT
    const users = await this.prisma.user.findMany();

    // ✅ SAVE CLEAN JSON TO REDIS (TTL 60s)
    await this.redis.client.set(cacheKey, JSON.stringify(users), 'EX', 60);

    return users;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    // ✅ CACHE INVALIDATION
    await this.redis.client.del('users:all');

    return user;
  }

  async remove(id: number) {
    const user = await this.prisma.user.delete({
      where: { id },
    });

    // ✅ CACHE INVALIDATION
    await this.redis.client.del('users:all');

    return user;
  }

  async uploadAvatar(userId: number, filePath: string) {
    AppLogger.info('Uploading user avatar', { userId });

    const { secure_url } = await this.cloud.uploadFile(filePath);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: secure_url },
    });

    AppLogger.info('Avatar uploaded successfully', { userId });
    return updated;
  }
}
