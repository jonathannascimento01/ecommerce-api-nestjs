import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const stock = await this.prisma.tbl_stock.findMany({
      include: { tbl_products: true },
    });
    return JSON.parse(
      JSON.stringify(stock, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }

  async findOne(productId: bigint) {
    const stock = await this.prisma.tbl_stock.findUnique({
      where: { product_id: productId },
      include: { tbl_products: true },
    });
    if (!stock) {
      throw new NotFoundException('Stock não encontrado para este produto.');
    }
    return JSON.parse(
      JSON.stringify(stock, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }

  async addStock(productId: bigint, quantity: number, reason: string) {
    const updatedStock = await this.prisma.$transaction(async (tx) => {
      const stock = await tx.tbl_stock.upsert({
        where: { product_id: productId },
        update: {
          quantity: { increment: quantity },
          updated_at: new Date(),
        },
        create: {
          product_id: productId,
          quantity: quantity,
        },
      });

      await tx.tbl_stock_movements.create({
        data: {
          product_id: productId,
          movement_type: 'IN_ENTRY',
          quantity: quantity,
          reason: reason || 'Entrada manual de stock',
        },
      });

      return stock;
    });

    return JSON.parse(
      JSON.stringify(updatedStock, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }
}