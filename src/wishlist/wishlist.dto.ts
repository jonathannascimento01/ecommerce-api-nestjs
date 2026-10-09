import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToWishlistDto {
  @IsNotEmpty({ message: 'O ID do produto é obrigatório.' })
  @Type(() => Number)
  @IsInt({ message: 'O ID do produto deve ser um número inteiro.' })
  product_id: number;
}