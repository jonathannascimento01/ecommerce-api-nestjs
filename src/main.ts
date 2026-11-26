import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Permite que o NestJS serialize campos BigInt do Prisma/PostgreSQL em JSON
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Servidor EFK rodando na porta ${port}`);
}
bootstrap();