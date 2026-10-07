import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: any) {
    const created = await this.prisma.tbl_products.create({
      data: {
        ...createProductDto,
        brand_id: createProductDto.brand_id ? BigInt(createProductDto.brand_id) : null,
        category_id: createProductDto.category_id ? BigInt(createProductDto.category_id) : null,
      },
    });

    return JSON.parse(
      JSON.stringify(created, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }

  async findAll() {
    const products = await this.prisma.tbl_products.findMany({
      include: {
        tbl_brands: true,
        tbl_categories: true,
      },
    });

    return JSON.parse(
      JSON.stringify(products, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }

  async findOne(id: number) {
    const product = await this.prisma.tbl_products.findUnique({
      where: { product_id: BigInt(id) },
      include: {
        tbl_brands: true,
        tbl_categories: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }

    return JSON.parse(
      JSON.stringify(product, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }

  async update(id: number, updateProductDto: any) {
    await this.findOne(id);
    const updated = await this.prisma.tbl_products.update({
      where: { product_id: BigInt(id) },
      data: {
        ...updateProductDto,
        brand_id: updateProductDto.brand_id ? BigInt(updateProductDto.brand_id) : undefined,
        category_id: updateProductDto.category_id ? BigInt(updateProductDto.category_id) : undefined,
      },
    });

    return JSON.parse(
      JSON.stringify(updated, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.tbl_products.delete({
      where: { product_id: BigInt(id) },
    });

    return JSON.parse(
      JSON.stringify(deleted, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }
}