import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: any) {
    return this.prisma.tbl_products.create({
      data: createProductDto,
    });
  }

  async findAll() {
    return this.prisma.tbl_products.findMany();
  }

  async findOne(id: number) {
    return this.prisma.tbl_products.findUnique({
      where: { product_id: BigInt(id) },
    });
  }

  async update(id: number, updateProductDto: any) {
    return this.prisma.tbl_products.update({
      where: { product_id: BigInt(id) },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    return this.prisma.tbl_products.delete({
      where: { product_id: BigInt(id) },
    });
  }
}