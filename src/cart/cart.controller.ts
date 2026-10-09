import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemToCartDto } from './cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: any) {
    const customerId = req.user?.userId || 1; 
    return this.cartService.getCart(customerId);
  }

  @Post('items')
  async addItem(@Req() req: any, @Body() dto: AddItemToCartDto) {
    const customerId = req.user?.userId || 1;
    return this.cartService.addItem(customerId, dto);
  }

  @Delete('items/:id')
  async removeItem(@Req() req: any, @Param('id') id: string) {
    const customerId = req.user?.userId || 1;
    return this.cartService.removeItem(customerId, Number(id));
  }
}