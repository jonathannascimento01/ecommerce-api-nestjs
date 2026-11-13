import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-description')
  async generateDescription(@Body() body: { product_name: string; category: string }) {
    const description = await this.aiService.generateProductDescription(
      body.product_name,
      body.category,
    );
    return {
      product_name: body.product_name,
      ai_description: description,
    };
  }
}