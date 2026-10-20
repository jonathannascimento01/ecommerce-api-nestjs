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

  // Criar um novo produto (suportando o seed e o painel admin)
  async create(createDto: any) {
    try {
      // 1. Garantir que existe uma marca padrão (ex: Natura/Avon) se não vier no DTO
      let brandId = createDto.brand_id;
      if (!brandId) {
        let defaultBrand = await this.prisma.tbl_brands.findFirst({
          where: { brand_name: 'Natura / Avon' },
        });
        if (!defaultBrand) {
          defaultBrand = await this.prisma.tbl_brands.create({
            data: { brand_name: 'Natura / Avon' },
          });
        }
        brandId = defaultBrand.brand_id;
      }

      // 2. Garantir que existe uma categoria padrão se não vier no DTO
      let categoryId = createDto.category_id;
      if (!categoryId) {
        let defaultCategory = await this.prisma.tbl_categories.findFirst({
          where: { category_name: 'Geral' },
        });
        if (!defaultCategory) {
          defaultCategory = await this.prisma.tbl_categories.create({
            data: { category_name: 'Geral' },
          });
        }
        categoryId = defaultCategory.category_id;
      }

      // 3. Criar o produto ligando às relações corretas do Prisma
      const newProduct = await this.prisma.tbl_products.create({
        data: {
          product_name: createDto.product_name,
          sku: createDto.sku,
          price: createDto.price,
          description: createDto.description,
          active: true,
          brand_id: BigInt(brandId),
          category_id: BigInt(categoryId),
          // Inserir imagem na tabela relacional tbl_product_images se fornecida
          tbl_product_images: createDto.image_url ? {
            create: {
              image_url: createDto.image_url,
              sort_order: 1,
            }
          } : undefined,
          // Criar stock inicial zerado ou padrão
          tbl_stock: {
            create: {
              quantity: 100, // Stock inicial para testes
            }
          }
        },
        include: {
          tbl_brands: true,
          tbl_categories: true,
          tbl_stock: true,
          tbl_product_images: true,
        },
      });

      return this.serializeData(newProduct);
    } catch (error) {
      console.error('ERRO AO CRIAR O PRODUTO:', error);
      throw error;
    }
  }

  // Atualizar um produto existente
  async update(id: number | bigint, updateDto: any) {
    try {
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