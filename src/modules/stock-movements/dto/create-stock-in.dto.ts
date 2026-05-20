import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateStockInDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ example: 'Compra recebida do fornecedor.' })
  @IsOptional()
  @IsString()
  reason?: string;
}
