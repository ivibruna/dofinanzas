import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, Min, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    example: 50.75,
    description: 'Cantidad gastada'
  })
  @IsNumber()
  @Min(0.01) // No tiene sentido un gasto de 0 o negativo
  amount: number;

  @ApiProperty({
    example: 'Compra semanal Mercadona',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '2026-04-15T10:30:00Z',
    description: 'Fecha del gasto',
    required: false
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    example: 'uuid-de-tu-cuenta',
    description: 'ID de la cuenta de donde sale el dinero'
  })
  @IsUUID()
  accountId: string;

  @ApiProperty({
    example: 'uuid-de-la-categoria',
    description: 'ID de la categoría del gasto'
  })
  @IsUUID()
  categoryId: string;
}
