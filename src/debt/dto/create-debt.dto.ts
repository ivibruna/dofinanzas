import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateDebtDto {
  @ApiProperty({
    example: 'Préstamo Coche',
    description: 'Concepto de la deuda'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 5000.00,
    description: 'Cantidad total que se debe'
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    example: 7.5,
    required: false,
    description: 'Tasa de interés (%) para análisis de IA'
  })
  @IsNumber()
  @IsOptional()
  interestRate?: number;

  @ApiProperty({
    example: '2028-12-31T00:00:00Z',
    description: 'Fecha límite de pago'
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    example: false,
    required: false,
    description: '¿Está la deuda totalmente pagada?'
  })
  @IsBoolean()
  @IsOptional()
  paid?: boolean;
}
