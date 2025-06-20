// Fix for TypeORM crypto issue
if (!global.crypto) {
  global.crypto = require('crypto');
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Apilerimin tamamını görebilmeniz için Swagger Dökümanı
  const config = new DocumentBuilder()
    .setTitle('Location Logging API')
    .setDescription('High-performance location tracking and area monitoring system')
    .setVersion('1.0')
    .addTag('locations', 'Location tracking endpoints')
    .addTag('areas', 'Geographical area management')
    .addTag('logs', 'Area entry logging system')
    .addTag('health', 'System health monitoring')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Location Logging API is running on port ${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
  console.log(`Health Check: http://localhost:${port}/api/v1/health`);
}

bootstrap();
