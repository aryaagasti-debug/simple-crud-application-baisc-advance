import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const errorRes = exception.getResponse();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const message =
      typeof errorRes === 'object' && errorRes['message']
        ? errorRes['message']
        : exception.message;

    res.status(status).json({
      success: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message,
      statusCode: status,
      path: req.url,
    });
  }
}
