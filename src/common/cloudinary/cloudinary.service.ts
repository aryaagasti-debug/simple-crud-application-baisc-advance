import { Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof Cloudinary) {}

  async uploadFile(filePath: string): Promise<UploadApiResponse> {
    return this.cloudinary.uploader.upload(filePath, {
      folder: 'avatars',
    });
  }
}
