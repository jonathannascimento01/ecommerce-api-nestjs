import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToWishlistDto } from './wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  // 1. Listar os favoritos do cliente
  async getWishlist(customerId: number) {
    const items = await this.prisma.tbl_wishlist.findMany({
      where: { customer_id: BigInt(customerId) },
      include: {
        tbl_products: {
          include: {
            tbl_product_images: true,
            tbl_brands: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return items.map((item: any) => ({
      wishlist_id: Number(item.wishlist_id),
      product_id: Number(item.product_id),
      created_at: item.created_at,
      product: {
        id: Number(item.tbl_products.product_id),
        name: item.tbl_products.product_name,
        price: Number(item.tbl_products.price),
        promotional_price: item.tbl_products.promotional_price ? Number(item.tbl_products.promotional_price) : null,
        sku: item.tbl_products.sku,
        brand: item.tbl_products.tbl_brands?.brand_name || null,
        images: item.tbl_products.tbl_product_images.map((img: any) => img.image_url),
      },
    }));
  }

  // 2. Adicionar produto à wishlist
  async addItem(customerId: number, dto: AddToWishlistDto) {
    const product = await this.prisma.tbl_products.findUnique({
      where: { product_id: BigInt(dto.product_id) },
    });

    if (!product || !product.active) {
      throw new NotFoundException('Produto não encontrado ou inativo.');
    }

    // Verificar se já existe na wishlist usando findFirst
    const existing = await this.prisma.tbl_wishlist.findFirst({
      where: {
        customer_id: BigInt(customerId),
        product_id: BigInt(dto.product_id),
      },
    });

    if (existing) {
      throw new ConflictException('Este produto já se encontra na sua lista de desejos.');
    }

    const wishlistItem = await this.prisma.tbl_wishlist.create({
      data: {
        customer_id: BigInt(customerId),
        product_id: BigInt(dto.product_id),
      },
    });

    return {
      message: 'Produto adicionado à lista de desejos com sucesso!',
      wishlist_id: Number(wishlistItem.wishlist_id),
    };
  }

  // 3. Remover produto da wishlist
  async removeItem(customerId: number, productId: number) {
    const existing = await this.prisma.tbl_wishlist.findFirst({
      where: {
        customer_id: BigInt(customerId),
        product_id: BigInt(productId),
      },
    });

    if (!existing) {
      throw new NotFoundException('Produto não encontrado na sua lista de desejos.');
    }

    await this.prisma.tbl_wishlist.delete({
      where: {
        wishlist_id: existing.wishlist_id,
      },
    });

    return { message: 'Produto removido da lista de desejos com sucesso.' };
  }
}