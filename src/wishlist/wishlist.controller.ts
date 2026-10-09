import { Controller, Get, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './wishlist.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Req() req: any) {
    const customerId = req.user?.userId || 1;
    return this.wishlistService.getWishlist(customerId);
  }

  @Post()
  async addItem(@Req() req: any, @Body() dto: AddToWishlistDto) {
    const customerId = req.user?.userId || 1;
    return this.wishlistService.addItem(customerId, dto);
  }

  @Delete(':productId')
  async removeItem(@Req() req: any, @Param('productId') productId: string) {
    const customerId = req.user?.userId || 1;
    return this.wishlistService.removeItem(customerId, Number(productId));
  }
}