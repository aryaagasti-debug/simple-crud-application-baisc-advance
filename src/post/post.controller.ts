import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtCookieGuard } from '../auth/guards/jwt-cookie.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  imageFileFilter,
  maxImageSize,
} from '../common/validators/file-image.validator';
import { diskStorage } from 'multer';
import * as authRequest from '../auth/types/auth-request';
import { AppLogger } from '../utils/logger';
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // ✅ ✅ MULTIPLE IMAGE POST CREATE (FINAL FIXED VERSION)
  @UseGuards(JwtCookieGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: { fileSize: maxImageSize },
      fileFilter: imageFileFilter,
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { title: string; content: string },
    @Req() req: authRequest.AuthRequest,
  ) {
    AppLogger.info('Creating post', {
      userId: req.user.id,
      imageCount: files.length,
    });
    const imagePaths = files?.map((file) => file.path) ?? [];
    return this.postService.createPost(body, req.user.id, imagePaths);
  }

  // ✅ PUBLIC READ
  @Get()
  findAll() {
    return this.postService.getAllPosts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.getPostById(Number(id));
  }

  // ✅ AUTHOR OR ADMIN UPDATE
  @UseGuards(JwtCookieGuard, RolesGuard)
  @Roles('user', 'admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string },
    @Req() req: authRequest.AuthRequest,
  ) {
    return this.postService.updatePost(
      Number(id),
      req.user.id,
      req.user.role,
      body,
    );
  }

  // ✅ ADMIN OR AUTHOR DELETE
  @UseGuards(JwtCookieGuard, RolesGuard)
  @Roles('admin', 'user')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: authRequest.AuthRequest) {
    return this.postService.deletePost(Number(id), req.user.id, req.user.role);
  }
}
