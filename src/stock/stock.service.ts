import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async create(createStockDto: any) {
    const created = await this.prisma.tbl_stock.create({
      data: {
        product_id: BigInt(createStockDto.product_id),
        quantity: createStockDto.quantity,
      },
    });

    return JSON.parse(
      JSON.stringify(created, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }

  async findAll() {
    const stockList = await this.prisma.tbl_stock.findMany({
      include: { tbl_products: true },
    });

    return JSON.parse(
      JSON.stringify(stockList, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }

  async findOne(product_id: number) {
    const stock = await this.prisma.tbl_stock.findUnique({
      where: { product_id: BigInt(product_id) },
      include: { tbl_products: true },
    });

    if (!stock) {
      throw new NotFoundException(`Stock para o produto ID ${product_id} não encontrado.`);
    }

    return JSON.parse(
      JSON.stringify(stock, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }

  async update(product_id: number, updateStockDto: any) {
    await this.findOne(product_id);
    const updated = await this.prisma.tbl_stock.update({
      where: { product_id: BigInt(product_id) },
      data: {
        quantity: updateStockDto.quantity,
      },
    });

    return JSON.parse(
      JSON.stringify(updated, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }
}