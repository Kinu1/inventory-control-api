import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateStockOutDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ example: 'Separacao para pedido interno.' })
  @IsOptional()
  @IsString()
  reason?: string;
}
