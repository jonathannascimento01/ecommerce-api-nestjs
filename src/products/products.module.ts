import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { GeminiService } from './gemini.service';
import { PrismaService } from '../prisma/prisma.service'; // Caso o ProductsService utilize o PrismaService

@Module({
  imports: [],
  controllers: [ProductsController],
  providers: [ProductsService, GeminiService, PrismaService],
})
export class ProductsModule {}