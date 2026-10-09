import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Ajuste o caminho se necessário

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(
    @Req() req: any, 
    @Body() body: { address_id: number; coupon_code?: string }
  ) {
    const customerId = BigInt(req.user.userId || req.user.sub || req.user.id);
    // Agora passamos o objeto 'body' completo, que encaixa perfeitamente no checkoutDto do serviço!
    return await this.ordersService.checkout(customerId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async getMyOrders(@Req() req: any) {
    const customerId = BigInt(req.user.userId || req.user.sub || req.user.id);
    return await this.ordersService.findAllByCustomer(customerId);
  }

  // Nova rota de administração para atualizar o estado logístico do pedido
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const orderId = BigInt(id);
    return await this.ordersService.updateOrderStatus(orderId, body.status);
  }
}