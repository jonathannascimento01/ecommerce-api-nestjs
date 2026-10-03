import { IsString, IsNotEmpty, IsNumber, IsInt, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do produto é obrigatório.' })
  product_name: string;

  @IsString()
  @IsNotEmpty({ message: 'O SKU é obrigatório.' })
  sku: string;

  @IsNumber()
  @IsNotEmpty({ message: 'O preço é obrigatório.' })
  price: number;

  @IsInt()
  @IsNotEmpty({ message: 'A marca (brand_id) é obrigatória.' })
  brand_id: number;

  @IsInt()
  @IsNotEmpty({ message: 'A categoria (category_id) é obrigatória.' })
  category_id: number;
  
  @IsOptional()
  @IsString()
  short_description?: string;
}