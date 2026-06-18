import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsDateString } from 'class-validator';

export class CreateSavingGoalDto {
  @ApiProperty({
    example: 'Viaje a Japón',
    description: 'Nombre de la meta de ahorro'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 2000.00,
    description: 'Cantidad objetivo a alcanzar'
  })
  @IsNumber()
  @Min(1)
  targetAmount: number;

  @ApiProperty({
    example: '2026-12-31T00:00:00Z',
    description: 'Fecha límite (opcional)',
    required: false
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
