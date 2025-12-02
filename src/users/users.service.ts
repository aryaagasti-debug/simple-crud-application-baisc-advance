import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { AppLogger } from '../utils/logger';
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloud: CloudinaryService,
  ) {}

  async create(dto: CreateUserDto) {
    AppLogger.info('Creating new user', { email: dto.email });

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashed },
    });

    AppLogger.info('User created successfully', { userId: user.id });
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  // ✅ ✅ UPLOAD AVATAR TO CLOUDINARY & SAVE URL
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
