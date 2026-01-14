import { IsUUID, IsInt, IsString, IsIn } from 'class-validator';

export class CreateStockMovementDto {
  @IsUUID()
  productId: string;

  @IsInt()
  quantity: number;

  @IsIn(['IN', 'OUT', 'ADJUSTMENT'])
  type: 'IN' | 'OUT' | 'ADJUSTMENT';

  @IsString()
  reason: string;
}
