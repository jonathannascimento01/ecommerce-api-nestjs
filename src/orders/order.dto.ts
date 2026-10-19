import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  product_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  quantity: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  unit_price: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  subtotal: number;
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'O ID do cliente é obrigatório.' })
  @Type(() => Number)
  @IsInt()
  customer_id: number;

  @IsNotEmpty({ message: 'O valor total é obrigatório.' })
  @Type(() => Number)
  @IsNumber()
  total_amount: number;

  @IsNotEmpty({ message: 'O subtotal é obrigatório.' })
  @Type(() => Number)
  @IsNumber()
  subtotal_amount: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  address_id?: number;

  @IsOptional()
  @IsString()
  coupon_code?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}