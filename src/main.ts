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

  await app.listen(4000, '0.0.0.0');
  console.log('API rodando em http://192.168.56.1:4000 (e acessível na rede local)');
}
bootstrap();