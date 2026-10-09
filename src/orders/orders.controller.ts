import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { OrderService } from './orders.service';
import { CreateOrderDto } from './order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  async checkout(@Req() req: any, @Body() dto: CreateOrderDto) {
    const customerId = req.user?.userId || 1;
    return this.orderService.checkout(customerId, dto);
  }

  @Get()
  async getOrders(@Req() req: any) {
    const customerId = req.user?.userId || 1;
    return this.orderService.getOrders(customerId);
  }
}