import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
 
/**
 * Initializes and starts the NestJS application.
 */
async function bootstrap() {
  // Create the NestJS application using the root module.
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  // Start the application on the configured port.
  // Defaults to port 3000 when PORT is not provided.
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
 