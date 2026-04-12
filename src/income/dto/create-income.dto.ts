import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, Min, IsDateString } from 'class-validator';

export class CreateIncomeDto {
  @ApiProperty({
    example: 1500.00,
    description: 'Cantidad ingresada'
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    example: 'Nómina de Abril',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '2026-04-28T08:00:00Z',
    description: 'Fecha del ingreso',
    required: false
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    example: 'uuid-de-tu-cuenta',
    description: 'ID de la cuenta destino'
  })
  @IsUUID()
  accountId: string;

  @ApiProperty({
    example: 'uuid-de-la-categoria',
    description: 'ID de la categoría de ingreso'
  })
  @IsUUID()
  categoryId: string;
}
