import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Ensina o JSON.stringify a converter campos BigInt do PostgreSQL automaticamente
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(4000);
  console.log('API rodando em http://127.0.0.1:4000');
}
bootstrap();