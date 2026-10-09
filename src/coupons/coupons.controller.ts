import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createCoupon(
    @Body()
    body: {
      coupon_code: string;
      description?: string;
      discount_type: 'PERCENTAGE' | 'FIXED';
      discount_value: number;
      minimum_value?: number;
      start_date: string;
      end_date: string;
      max_uses?: number;
    },
  ) {
    return await this.couponsService.createCoupon(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return await this.couponsService.findAll();
  }
}