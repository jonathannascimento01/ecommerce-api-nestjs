import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'O ID do endereço de entrega é obrigatório.' })
  @Type(() => Number)
  @IsInt({ message: 'O ID do endereço deve ser um número inteiro.' })
  address_id: number;

  @IsOptional()
  @IsString({ message: 'O código do cupom deve ser uma string válida.' })
  coupon_code?: string;
}