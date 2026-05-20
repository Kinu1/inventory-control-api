import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Operador Demo' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'operador@demo.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Operador123!' })
  @IsString()
  @MinLength(6)
  password!: string;
}
