import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll() {
    return await this.productsService.findAll();
  }

  @Post('checkout')
  async checkout(@Body() body: any) {
    return await this.productsService.createCheckout(body);
  }

  @Get('orders')
  async findAllOrders() {
    return await this.productsService.findAllOrders();
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return this.productsService.updateOrderStatus(Number(id), body.status, body.reason);
  }

  @Patch(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return await this.productsService.updateStock(Number(id), quantity);
  }

  @Patch(':id/description')
  async updateDescription(
    @Param('id') id: string,
    @Body('description') description: string,
  ) {
    return await this.productsService.updateProductDescription(
      Number(id),
      description,
    );
  }
  @Post(':id/image')
  async saveProductImage(
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return await this.productsService.saveProductImage(Number(id), imageUrl);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importProducts(@UploadedFile() file: any) {
    if (!file) {
      return { success: false, message: 'Nenhum ficheiro foi enviado.' };
    }
    return await this.productsService.importFromExcel(file.buffer);
  }
}