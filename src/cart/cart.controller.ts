import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private getCustomerId(req: any): number {
    // Procura por todas as variações, incluindo user_id
    const id = req.user?.user_id || req.user?.customer_id || req.user?.userId || req.user?.id || req.user?.sub;
    // Se o ID vier nulo, lançamos um erro claro em vez de um erro 500 silencioso
    if (!id || isNaN(Number(id))) {
      throw new BadRequestException('ID do utilizador não encontrado no token JWT.');
    }
    return Number(id);
  }

  @Get()
  getCart(@Req() req: any) {
    const customer_id = this.getCustomerId(req);
    return this.cartService.getCartByCustomer(customer_id);
  }

  @Post('items')
  addItem(@Req() req: any, @Body() body: { product_id: number; quantity: number }) {
    const customer_id = this.getCustomerId(req);
    return this.cartService.addItem(customer_id, body.product_id, body.quantity);
  }

  @Delete('items/:productId')
  removeItem(@Req() req: any, @Param('productId') productId: string) {
    const customer_id = this.getCustomerId(req);
    return this.cartService.removeItem(customer_id, +productId);
  }
}