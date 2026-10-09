import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private serializeBigInt(data: any) {
    return JSON.parse(
      JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }

  private async ensureCustomerExists(customer_id: number) {
    const customer = await this.prisma.tbl_customers.findUnique({
      where: { customer_id: BigInt(customer_id) },
    });

    if (!customer) {
      // Vamos buscar o utilizador para copiar os dados
      const user = await this.prisma.tbl_users.findUnique({
        where: { user_id: Number(customer_id) },
      });

      if (!user) {
        throw new BadRequestException('Utilizador não encontrado na tabela tbl_users.');
      }

      try {
        // Criamos o cliente respeitando a exata nomenclatura do schema do Prisma
        await this.prisma.tbl_customers.create({
          data: {
            customer_id: BigInt(customer_id),
            full_name: user.name,
            email: user.email,
            password_hash: user.password, // <-- AQUI ESTAVA O PROBLEMA!
          },
        });
      } catch (error) {
        console.error('Erro fatal ao sincronizar cliente em tbl_customers:', error);
        throw new BadRequestException('Falha ao criar o registo do cliente antes do carrinho.');
      }
    }
  }

  async getCartByCustomer(customer_id: number) {
    if (!customer_id) {
      throw new BadRequestException('ID do cliente não fornecido.');
    }

    await this.ensureCustomerExists(customer_id);

    try {
      let cart = await this.prisma.tbl_carts.findUnique({
        where: { customer_id: BigInt(customer_id) },
        include: {
          tbl_cart_items: {
            include: {
              tbl_products: true,
            },
          },
        },
      });

      if (!cart) {
        cart = await this.prisma.tbl_carts.create({
          data: { customer_id: BigInt(customer_id) },
          include: {
            tbl_cart_items: {
              include: {
                tbl_products: true,
              },
            },
          },
        });
      }

      return this.serializeBigInt(cart);
    } catch (error: any) {
      throw new BadRequestException(`Erro na base de dados: ${error?.message || 'Erro desconhecido'}`);
    }
  }

  async addItem(customer_id: number, product_id: number, quantity: number) {
    if (!customer_id) {
      throw new BadRequestException('ID do cliente não fornecido.');
    }
    if (quantity <= 0) {
      throw new BadRequestException('A quantidade deve ser maior que zero.');
    }

    const product = await this.prisma.tbl_products.findUnique({
      where: { product_id: BigInt(product_id) },
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${product_id} não encontrado.`);
    }

    await this.ensureCustomerExists(customer_id);

    let cart = await this.prisma.tbl_carts.findUnique({
      where: { customer_id: BigInt(customer_id) },
    });

    if (!cart) {
      cart = await this.prisma.tbl_carts.create({
        data: { customer_id: BigInt(customer_id) },
      });
    }

    const cartItem = await this.prisma.tbl_cart_items.upsert({
      where: {
        cart_id_product_id: {
          cart_id: cart.cart_id,
          product_id: BigInt(product_id),
        },
      },
      update: {
        quantity: quantity,
      },
      create: {
        cart_id: cart.cart_id,
        product_id: BigInt(product_id),
        quantity: quantity,
      },
      include: {
        tbl_products: true,
      },
    });

    return this.serializeBigInt(cartItem);
  }

  async removeItem(customer_id: number, product_id: number) {
    const cart = await this.prisma.tbl_carts.findUnique({
      where: { customer_id: BigInt(customer_id) },
    });

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado para este cliente.');
    }

    try {
      const deleted = await this.prisma.tbl_cart_items.delete({
        where: {
          cart_id_product_id: {
            cart_id: cart.cart_id,
            product_id: BigInt(product_id),
          },
        },
      });
      return { message: 'Item removido com sucesso do carrinho.', item: this.serializeBigInt(deleted) };
    } catch (error) {
      throw new NotFoundException('Item não encontrado no carrinho.');
    }
  }
}