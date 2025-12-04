import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtCookieGuard } from '../auth/guards/jwt-cookie.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  imageFileFilter,
  maxImageSize,
} from '../common/validators/file-image.validator';
import { diskStorage } from 'multer';
import * as authRequest from '../auth/types/auth-request';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
// import { Throttle } from '@nestjs/throttler'; // Removed import as it's no longer needed

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  // ✅ CREATE USER
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  // ✅ GET ALL USERS
  @Get()
  findAll() {
    return this.users.findAll();
  }

  // ✅ GET SINGLE USER
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.users.findOne(id);
  }

  // ✅ UPDATE USER
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  // ✅ DELETE USER
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.users.remove(id);
  }

  // ✅ ✅ UPLOAD PROFILE AVATAR (JWT PROTECTED)
  @UseGuards(JwtCookieGuard)
  // @Throttle({ default: { limit: 3, ttl: 60 } }) // Removed - uses global default
  @Patch('avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: maxImageSize },
      fileFilter: imageFileFilter,
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, callback) => {
          callback(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: authRequest.AuthRequest,
  ) {
    return this.users.uploadAvatar(req.user.id, file.path);
  }
}
