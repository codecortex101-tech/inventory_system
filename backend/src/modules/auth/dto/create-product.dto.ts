import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsUUID,
  IsPositive,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNumber()
  @IsPositive()
  costPrice: number;

  @IsNumber()
  @IsPositive()
  sellingPrice: number;

  @IsOptional()
  @IsInt()
  currentStock?: number;

  @IsOptional()
  @IsInt()
  minimumStock?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  expirationDate?: Date;
}
