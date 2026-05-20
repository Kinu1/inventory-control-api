import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Notebook Dell Latitude' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'NOTE-DELL-001' })
  @IsString()
  @MinLength(2)
  sku!: string;

  @ApiPropertyOptional({
    example: 'Notebook corporativo para equipe comercial.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  minStock!: number;

  @ApiProperty({ example: 3499.9 })
  @IsNumber()
  @Min(0)
  unitCost!: number;

  @ApiProperty()
  @IsString()
  categoryId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierId?: string;
}
