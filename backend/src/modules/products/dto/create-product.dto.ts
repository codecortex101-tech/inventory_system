import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength,
  Min,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  sku: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsNumber()
  @Min(0)
  currentStock: number;

  @IsNumber()
  @Min(0)
  minimumStock: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}
