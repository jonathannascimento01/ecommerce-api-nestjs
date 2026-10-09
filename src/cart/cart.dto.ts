import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddItemToCartDto {
  @IsNotEmpty({ message: 'O ID do produto é obrigatório.' })
  @Type(() => Number)
  @IsInt({ message: 'O ID do produto deve ser um número inteiro.' })
  product_id: number;

  @IsNotEmpty({ message: 'A quantidade é obrigatória.' })
  @Type(() => Number)
  @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade mínima deve ser 1.' })
  quantity: number;
}