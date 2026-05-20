import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(0)
  newStock!: number;

  @ApiPropertyOptional({ example: 'Ajuste apos inventario fisico.' })
  @IsOptional()
  @IsString()
  reason?: string;
}
