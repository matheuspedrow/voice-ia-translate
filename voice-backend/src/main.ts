import 'dotenv/config';
import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './app/Exceptions/http-exception.filter';
import { env } from './app/Config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({ origin: env.frontendUrl });
  app.setGlobalPrefix('api', {
    exclude: [
      { path: '', method: RequestMethod.GET },
      { path: 'ping', method: RequestMethod.GET },
    ],
  });
  await app.listen(env.port);
}
bootstrap();
