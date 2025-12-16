import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
//import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { csrfProtection } from './common/middleware/csrf.middleware';
import { createKafkaTopic } from './kafka/topic';
import { startOrderConsumer } from './kafka/consumers/order.consume';
import { startNotificationConsumer } from './kafka/consumers/notification.consumer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //create kafka topics
  await createKafkaTopic();
  //start kafka consumers
  await startOrderConsumer();
  await startNotificationConsumer();

  // ✅ ✅ FIXED TRUST PROXY (RATE LIMIT WILL WORK)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  //cors setup
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins = [
        undefined, // ✅ Postman / curl / mobile apps
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:4200',
        'https://frontend.mydomain.com',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },

    credentials: true, // ✅ REQUIRED for cookies (JWT)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  //app.useGlobalFilters(new HttpExceptionFilter());

  // adding helment secruites http
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  //adding csrf protection

  app.use(csrfProtection);

  const config = new DocumentBuilder()
    .setTitle('Simple CRUD API')
    .setDescription('API documentation for users, posts, auth and uploads')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}
void bootstrap();
