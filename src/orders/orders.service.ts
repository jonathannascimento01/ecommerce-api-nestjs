import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Helper para serializar BigInt e evitar erros de JSON
  private serializeData(data: any) {
    return JSON.parse(
      JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
    );
  }

  async checkout(userId: number | bigint, checkoutDto: { address_id: number; coupon_code?: string }) {
    const customerId = BigInt(userId);

    // 1. Buscar o carrinho e os itens (incluindo produtos e stock)
    const cart = await this.prisma.tbl_carts.findUnique({
      where: { customer_id: customerId },
      include: {
        tbl_cart_items: {
          include: {
            tbl_products: {
              include: { tbl_stock: true },
            },
          },
        },
      },
    });

    if (!cart || cart.tbl_cart_items.length === 0) {
      throw new BadRequestException('O carrinho está vazio.');
    }

    const cartItems = cart.tbl_cart_items;

    // 2. Calcular o subtotal e verificar stock disponível
    let subtotal = 0;
    for (const item of cartItems) {
      const availableStock = item.tbl_products.tbl_stock?.quantity || 0;
      if (availableStock < item.quantity) {
        throw new BadRequestException(`Stock insuficiente para o produto: ${item.tbl_products.product_name}`);
      }
      subtotal += Number(item.tbl_products.price) * item.quantity;
    }

    let discountAmount = 0;
    let couponId = null;

    // 3. Validar o Cupão (caso tenha sido enviado)
    if (checkoutDto.coupon_code) {
      const coupon = await this.prisma.tbl_coupons.findUnique({
        where: { coupon_code: checkoutDto.coupon_code.toUpperCase() },
      });

      if (!coupon) throw new NotFoundException('Cupão inválido ou não encontrado.');
      if (!coupon.active) throw new BadRequestException('Este cupão já não está ativo.');
      
      const now = new Date();
      if (coupon.start_date > now || coupon.end_date < now) {
        throw new BadRequestException('Cupão fora da validade.');
      }
      if (coupon.minimum_value && subtotal < Number(coupon.minimum_value)) {
        throw new BadRequestException(`O valor mínimo para usar este cupão é de R$ ${coupon.minimum_value}.`);
      }

      couponId = coupon.coupon_id;

      if (coupon.discount_type === 'PERCENTAGE') {
        discountAmount = subtotal * (Number(coupon.discount_value) / 100);
      } else {
        discountAmount = Number(coupon.discount_value);
      }
    }

    const total = Math.max(0, subtotal - discountAmount);
    const orderNumber = `ORD-${Date.now()}`; // Gera um número de encomenda único

    // 4. Iniciar Transação (garante integridade)
    const result = await this.prisma.$transaction(async (prisma) => {
      // a) Criar a encomenda
      const order = await prisma.tbl_orders.create({
        data: {
          customer_id: customerId,
          address_id: checkoutDto.address_id, // Int normal (sem BigInt)
          coupon_id: couponId,
          order_number: orderNumber,
          subtotal_amount: subtotal,
          discount_amount: discountAmount,
          shipping_amount: 0,
          total_amount: total,
          status: 'PENDING',
        },
      });

      // b) Mover itens, calcular subtotais da linha e reduzir stock
      for (const item of cartItems) {
        const itemSubtotal = Number(item.tbl_products.price) * item.quantity;
        
        await prisma.tbl_order_items.create({
          data: {
            order_id: order.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.tbl_products.price,
            subtotal: itemSubtotal,
          },
        });

        await prisma.tbl_stock.update({
          where: { product_id: item.product_id },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // c) Limpar APENAS os itens do carrinho (mantém o carrinho do utilizador ativo)
      await prisma.tbl_cart_items.deleteMany({
        where: { cart_id: cart.cart_id },
      });

      return order;
    });

    // 5. Gerar Link formatado para o WhatsApp
    const waPhone = "5511999999999"; 
    let waMessage = `Olá! Gostaria de finalizar a minha encomenda ${result.order_number}.\n\n`;
    waMessage += `*Subtotal:* R$ ${subtotal.toFixed(2)}\n`;
    if (discountAmount > 0) {
      waMessage += `*Desconto (${checkoutDto.coupon_code}):* -R$ ${discountAmount.toFixed(2)}\n`;
    }
    waMessage += `*Total a pagar:* R$ ${total.toFixed(2)}\n\n`;
    waMessage += `Aguardando instruções de pagamento.`;
    
    const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`;

    return {
      message: 'Checkout processado com sucesso!',
      order: this.serializeData(result),
      whatsapp_link: waLink,
    };
  }

  // Métodos que estavam em falta no controlador
  async findAllByCustomer(userId: number | bigint) {
    const orders = await this.prisma.tbl_orders.findMany({
      where: { customer_id: BigInt(userId) },
      include: { tbl_order_items: true },
      orderBy: { created_at: 'desc' },
    });
    return this.serializeData(orders);
  }

  async updateOrderStatus(orderId: number | bigint, status: string) {
    const order = await this.prisma.tbl_orders.update({
      where: { order_id: BigInt(orderId) },
      data: { status },
    });
    return this.serializeData(order);
  }
}