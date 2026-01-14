import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  organizationName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
