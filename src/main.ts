import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://nxhawk.github.io/auth-fe',
    ],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  try {
    await app.listen(3000, () => {
      console.log(`Running on Port ${3000}`);
    });
  } catch (error) {
    console.log(error);
  }
}
bootstrap();
