import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajuste se necessário para o caminho correto do seu PrismaService
import { AddItemToCartDto } from './cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateCart(customerId: number) {
    let cart = await this.prisma.tbl_carts.findUnique({
      where: { customer_id: BigInt(customerId) },
    });

    if (!cart) {
      cart = await this.prisma.tbl_carts.create({
        data: { customer_id: BigInt(customerId) },
      });
    }

    return cart;
  }

  async getCart(customerId: number) {
    const cart = await this.getOrCreateCart(customerId);

    const items = await this.prisma.tbl_cart_items.findMany({
      where: { cart_id: cart.cart_id },
      include: {
        tbl_products: {
          include: {
            tbl_product_images: true,
          },
        },
      },
    });

    const formattedItems = items.map((item: any) => ({
      cart_item_id: Number(item.cart_item_id),
      product_id: Number(item.product_id),
      quantity: item.quantity,
      product: {
        id: Number(item.tbl_products.product_id),
        name: item.tbl_products.product_name,
        price: Number(item.tbl_products.price),
        promotional_price: item.tbl_products.promotional_price ? Number(item.tbl_products.promotional_price) : null,
        sku: item.tbl_products.sku,
        images: item.tbl_products.tbl_product_images.map((img: any) => img.image_url),
      },
      subtotal: Number(item.tbl_products.promotional_price || item.tbl_products.price) * item.quantity,
    }));

    const totalAmount = formattedItems.reduce((acc: number, item: any) => acc + item.subtotal, 0);

    return {
      cart_id: Number(cart.cart_id),
      items: formattedItems,
      total_amount: totalAmount,
    };
  }

  async addItem(customerId: number, dto: AddItemToCartDto) {
    const cart = await this.getOrCreateCart(customerId);

    const product = await this.prisma.tbl_products.findUnique({
      where: { product_id: BigInt(dto.product_id) },
    });

    if (!product || !product.active) {
      throw new NotFoundException('Produto não encontrado ou inativo.');
    }

    const existingItem = await this.prisma.tbl_cart_items.findUnique({
      where: {
        cart_id_product_id: {
          cart_id: cart.cart_id,
          product_id: BigInt(dto.product_id),
        },
      },
    });

    if (existingItem) {
      return await this.prisma.tbl_cart_items.update({
        where: { cart_item_id: existingItem.cart_item_id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    }

    return await this.prisma.tbl_cart_items.create({
      data: {
        cart_id: cart.cart_id,
        product_id: BigInt(dto.product_id),
        quantity: dto.quantity,
      },
    });
  }

  async removeItem(customerId: number, itemId: number) {
    const cart = await this.getOrCreateCart(customerId);

    const item = await this.prisma.tbl_cart_items.findFirst({
      where: {
        cart_item_id: BigInt(itemId),
        cart_id: cart.cart_id,
      },
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado no seu carrinho.');
    }

    await this.prisma.tbl_cart_items.delete({
      where: { cart_item_id: BigInt(itemId) },
    });

    return { message: 'Item removido do carrinho com sucesso.' };
  }
}