import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async checkout(customerId: number, dto: CreateOrderDto) {
    const cart = await this.prisma.tbl_carts.findUnique({
      where: { customer_id: BigInt(customerId) },
      include: {
        tbl_cart_items: {
          include: {
            tbl_products: true,
          },
        },
      },
    });

    if (!cart || cart.tbl_cart_items.length === 0) {
      throw new BadRequestException('O seu carrinho está vazio.');
    }

    const addressExists = await this.prisma.tbl_addresses.findUnique({
      where: { address_id: dto.address_id },
    });

    if (!addressExists) {
      throw new NotFoundException('Endereço de entrega não encontrado.');
    }

    let subtotalAmount = 0;
    const orderItemsData = cart.tbl_cart_items.map((item: any) => {
      const price = Number(item.tbl_products.promotional_price || item.tbl_products.price);
      const subtotal = price * item.quantity;
      subtotalAmount += subtotal;

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: price,
        subtotal: subtotal,
      };
    });

    let discountAmount = 0;
    let couponId: bigint | null = null;

    if (dto.coupon_code) {
      const coupon = await this.prisma.tbl_coupons.findUnique({
        where: { coupon_code: dto.coupon_code },
      });

      if (!coupon || !coupon.active || new Date() > new Date(coupon.end_date)) {
        throw new BadRequestException('Cupom inválido, expirado ou inativo.');
      }

      if (coupon.minimum_value && subtotalAmount < Number(coupon.minimum_value)) {
        throw new BadRequestException(`O valor mínimo para este cupom é ${coupon.minimum_value}.`);
      }

      if (coupon.discount_type === 'PERCENTAGE') {
        discountAmount = (subtotalAmount * Number(coupon.discount_value)) / 100;
      } else {
        discountAmount = Number(coupon.discount_value);
      }

      couponId = coupon.coupon_id;
    }

    const shippingAmount = 15.00;
    const totalAmount = Math.max(0, subtotalAmount - discountAmount) + shippingAmount;
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await this.prisma.$transaction(async (tx: any) => {
      const newOrder = await tx.tbl_orders.create({
        data: {
          customer_id: BigInt(customerId),
          coupon_id: couponId,
          address_id: dto.address_id,
          order_number: orderNumber,
          subtotal_amount: subtotalAmount,
          discount_amount: discountAmount,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          status: 'PENDING',
        },
      });

      for (const item of orderItemsData) {
        await tx.tbl_order_items.create({
          data: {
            order_id: newOrder.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          },
        });
      }

      await tx.tbl_payments.create({
        data: {
          order_id: newOrder.order_id,
          payment_method: 'CREDIT_CARD',
          amount: totalAmount,
          status: 'PENDING',
        },
      });

      await tx.tbl_cart_items.deleteMany({
        where: { cart_id: cart.cart_id },
      });

      return newOrder;
    });

    return {
      message: 'Encomenda criada com sucesso!',
      order_id: Number(order.order_id),
      order_number: order.order_number,
      total_amount: Number(order.total_amount),
      status: order.status,
    };
  }

  async getOrders(customerId: number) {
    const orders = await this.prisma.tbl_orders.findMany({
      where: { customer_id: BigInt(customerId) },
      include: {
        tbl_order_items: {
          include: {
            tbl_products: true,
          },
        },
        tbl_payments: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return orders.map((order: any) => ({
      order_id: Number(order.order_id),
      order_number: order.order_number,
      subtotal_amount: Number(order.subtotal_amount),
      discount_amount: Number(order.discount_amount),
      shipping_amount: Number(order.shipping_amount),
      total_amount: Number(order.total_amount),
      status: order.status,
      created_at: order.created_at,
      payment: order.tbl_payments ? {
        method: order.tbl_payments.payment_method,
        status: order.tbl_payments.status,
      } : null,
      items: order.tbl_order_items.map((i: any) => ({
        product_name: i.tbl_products.product_name,
        quantity: i.quantity,
        unit_price: Number(i.unit_price),
        subtotal: Number(i.subtotal),
      })),
    }));
  }
}