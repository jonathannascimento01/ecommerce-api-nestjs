import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Helper para serializar BigInt e Decimal para JSON de forma limpa
  private serializeData(data: any) {
    return JSON.parse(
      JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
    );
  }

  // Listar todos os produtos ativos com as relações principais
  async findAll() {
    const products = await this.prisma.tbl_products.findMany({
      where: { active: true },
      include: {
        tbl_brands: true,
        tbl_categories: true,
        tbl_stock: true,
        tbl_product_images: true,
      },
      orderBy: { product_name: 'asc' },
    });
    return this.serializeData(products);
  }

  // Buscar um produto detalhado pelo ID
  async findOne(id: number | bigint) {
    const product = await this.prisma.tbl_products.findUnique({
      where: { product_id: BigInt(id) },
      include: {
        tbl_brands: true,
        tbl_categories: true,
        tbl_stock: true,
        tbl_product_images: true,
      },
    });

    if (!product || !product.active) {
      throw new NotFoundException('Produto não encontrado ou inativo.');
    }

    return this.serializeData(product);
  }

  // Atualizar um produto existente
  async update(id: number | bigint, updateDto: any) {
    try {
      // Verificar se o produto existe antes de atualizar
      await this.findOne(id);

      const updatedProduct = await this.prisma.tbl_products.update({
        where: { product_id: BigInt(id) },
        data: updateDto,
        include: {
          tbl_brands: true,
          tbl_categories: true,
          tbl_stock: true,
          tbl_product_images: true,
        },
      });

      return this.serializeData(updatedProduct);
    } catch (error) {
      console.error('ERRO NO UPDATE DO PRODUTO:', error);
      throw error;
    }
  }
}