import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  create(@Body() createStockDto: any) {
    return this.stockService.create(createStockDto);
  }

  @Get()
  findAll() {
    return this.stockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateStockDto: any) {
    return this.stockService.update(+id, updateStockDto);
  }
}