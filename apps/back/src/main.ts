import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import * as express from 'express';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { getSwaggerConfig } from './core/config/swagger/swagger.config';
import { cors } from './core/config/cors/cors.config';
import { winstonLogger } from './core/config/logs/logger';
import { WinstonModule } from 'nest-winston';
import { BadRequestException, ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: cors,
    snapshot: true,
    logger: WinstonModule.createLogger({ instance: winstonLogger })
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),

  );


  app.setGlobalPrefix('api');

  // глобально подключаем interceptor
  app.useGlobalInterceptors(
    new ResponseInterceptor(),

  );
  app.useGlobalFilters(app.get(GlobalExceptionFilter));
  // app.enableCors();

  // Увеличиваем лимит тела запроса (например, до 50MB)
  app.use(express.json({ limit: '150mb' }));
  app.use(express.urlencoded({ limit: '150mb', extended: true }));


  //ws
  app.useWebSocketAdapter(new IoAdapter(app));


  //documentation
  getSwaggerConfig(app)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
