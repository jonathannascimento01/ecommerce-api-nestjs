import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  findAll() {
    return this.stockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(BigInt(id));
  }

  @Post('add')
  addStock(@Body() body: { product_id: number; quantity: number; reason: string }) {
    return this.stockService.addStock(
      BigInt(body.product_id),
      body.quantity,
      body.reason,
    );
  }
}