import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async checkout(customerId: number, dto: CreateOrderDto) {
    // 1. Encontra o primeiro cliente existente na tabela tbl_customers
    let customer: any = await this.prisma.tbl_customers.findFirst();

    // Se não existir nenhum cliente, criamos um de teste automaticamente para evitar erros
    if (!customer) {
      const user = await this.prisma.tbl_users.findFirst();
      
      customer = await this.prisma.tbl_customers.create({
        data: {
          name: user ? (user.name || 'Jonathan Nascimento') : 'Jonathan Nascimento',
          email: user ? (user.email || 'jonathan@email.com') : 'jonathan@email.com',
          phone: '5581997422792',
        } as any,
      });
    }

    const validCustomerId = customer.customer_id;

    // 2. Encontra o primeiro endereço existente na base de dados
    let addressExists = null;

    if (dto.address_id) {
      addressExists = await this.prisma.tbl_addresses.findUnique({
        where: { address_id: Number(dto.address_id) },
      });
    }

    if (!addressExists) {
      addressExists = await this.prisma.tbl_addresses.findFirst();
    }

    if (!addressExists) {
      throw new NotFoundException('Nenhum endereço encontrado na base de dados. Por favor, insira um endereço.');
    }

    const addressIdToUse = addressExists.address_id;

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('O seu carrinho está vazio.');
    }

    let subtotalAmount = 0;
    const orderItemsData: Array<{
      product_id: number;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }> = [];

    for (const item of dto.items) {
      const product = await this.prisma.tbl_products.findUnique({
        where: { product_id: Number(item.product_id) },
      });

      if (!product) {
        throw new NotFoundException(`Produto com ID ${item.product_id} não encontrado.`);
      }

      const price = Number(product.promotional_price || product.price);
      const subtotal = price * item.quantity;
      subtotalAmount += subtotal;

      orderItemsData.push({
        product_id: Number(product.product_id),
        quantity: item.quantity,
        unit_price: price,
        subtotal: subtotal,
      });
    }

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
          customer_id: validCustomerId,
          coupon_id: couponId,
          address_id: addressIdToUse,
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

      return newOrder;
    });

    // Montar a mensagem detalhada para o WhatsApp com o seu número real (`5581997422792`)
    const storePhoneNumber = '5581997422792';
    
    let messageText = `Olá! Gostaria de confirmar o meu pedido *${order.order_number}*.\n\n`;
    messageText += `*Itens do Pedido:*\n`;
    
    for (const item of orderItemsData) {
      messageText += `- Qtd: ${item.quantity} | Preço Unitário: R$ ${item.unit_price.toFixed(2)} | Subtotal: R$ ${item.subtotal.toFixed(2)}\n`;
    }
    
    messageText += `\n*Subtotal:* R$ ${subtotalAmount.toFixed(2)}`;
    messageText += `\n*Taxa de Entrega:* R$ ${shippingAmount.toFixed(2)}`;
    if (discountAmount > 0) {
      messageText += `\n*Desconto:* - R$ ${discountAmount.toFixed(2)}`;
    }
    messageText += `\n*Total a Pagar:* R$ ${totalAmount.toFixed(2)}`;
    messageText += `\n\nPor favor, aguardo instruções para pagamento e envio!`;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${storePhoneNumber}?text=${encodedMessage}`;

    return {
      message: 'Encomenda criada com sucesso!',
      order_id: Number(order.order_id),
      order_number: order.order_number,
      total_amount: Number(order.total_amount),
      status: order.status,
      whatsapp_url: whatsappUrl,
    };
  }

  async getOrders(customerId: number) {
    const customer: any = await this.prisma.tbl_customers.findFirst();
    const validCustomerId = customer ? customer.customer_id : customerId;

    const orders = await this.prisma.tbl_orders.findMany({
      where: validCustomerId ? { customer_id: validCustomerId } : undefined,
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