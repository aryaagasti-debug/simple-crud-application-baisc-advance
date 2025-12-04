import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
//import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ ✅ FIXED TRUST PROXY (RATE LIMIT WILL WORK)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  //app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Simple CRUD API')
    .setDescription('API documentation for users, posts, auth and uploads')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
void bootstrap();
