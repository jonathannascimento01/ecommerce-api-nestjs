import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // <- Altere para um único ponto (.)

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();