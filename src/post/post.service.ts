import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { AppLogger } from '../utils/logger';
import { sanitizeText } from '../common/utils/sanitize';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloud: CloudinaryService,
  ) {}

  async createPost(
    data: { title: string; content: string },
    userId: number,
    imagePaths: string[] = [],
  ) {
    AppLogger.info('Uploading post images', {
      userId,
      imageCount: imagePaths.length,
    });

    const uploadedUrls: string[] = [];

    for (const path of imagePaths) {
      const uploaded = await this.cloud.uploadFile(path);
      uploadedUrls.push(uploaded.secure_url);
    }

    const post = await this.prisma.post.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        title: sanitizeText(data.title),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        content: sanitizeText(data.content),
        imageUrls: uploadedUrls,
        authorId: userId,
      },
    });

    AppLogger.info('Post created successfully', {
      postId: post.id,
    });

    return post;
  }

  getAllPosts() {
    return this.prisma.post.findMany({
      include: { author: true },
    });
  }

  getPostById(id: number) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  async updatePost(
    postId: number,
    userId: number,
    role: string,
    data: { title?: string; content?: string },
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new ForbiddenException('Post not found');

    if (post.authorId !== userId && role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data,
    });
  }

  async deletePost(postId: number, userId: number, role: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new ForbiddenException('Post not found');

    if (post.authorId !== userId && role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.post.delete({
      where: { id: postId },
    });
  }
}
