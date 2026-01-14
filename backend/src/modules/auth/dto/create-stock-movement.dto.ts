import {
  IsString,
  IsInt,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateStockMovementDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  userId: string;

  @IsInt()
  quantity: number;

  // IN | OUT | ADJUSTMENT (string-based for SQLite)
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
