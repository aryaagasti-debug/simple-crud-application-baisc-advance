import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

export function imageFileFilter(
  _: any,
  file: Express.Multer.File,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback: Function,
) {
  const allowed = /jpg|jpeg|png/;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const ext = extname(file.originalname).toLowerCase();

  if (!allowed.test(ext)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return callback(
      new BadRequestException('Only JPG, JPEG, PNG allowed'),
      false,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  callback(null, true);
}

export const maxImageSize = 2 * 1024 * 1024; // 2MB
