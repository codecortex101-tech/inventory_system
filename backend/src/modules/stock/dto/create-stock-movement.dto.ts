import { IsString, IsNumber, IsEnum, Min, IsNotEmpty } from 'class-validator';
import { StockMovementType } from '@prisma/client';

export class CreateStockMovementDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsEnum(StockMovementType)
  type: StockMovementType;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
