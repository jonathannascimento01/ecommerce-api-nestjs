import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Prisma conectado aqui!
  controllers: [BrandsController],
  providers: [BrandsService],
})
export class BrandsModule {}