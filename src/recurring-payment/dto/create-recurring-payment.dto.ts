import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsDateString, Min, IsOptional, IsBoolean, IsUUID } from 'class-validator';

// Asegúrate de que estos valores coincidan con tu Enum 'Frequency' en Prisma
export enum PaymentFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateRecurringPaymentDto {
  @ApiProperty({
    example: 'Suscripción Netflix',
    description: 'Nombre del pago'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 15.99,
    description: 'Importe del cobro recurrente'
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    enum: PaymentFrequency,
    example: 'MONTHLY'
  })
  @IsEnum(PaymentFrequency)
  frequency: PaymentFrequency;

  @ApiProperty({
    example: '2026-05-01T00:00:00Z',
    description: 'Primer cobro'
  })
  @IsDateString()
  nextDueDate: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    example: 'uuid-de-la-cuenta',
    description: 'Cuenta de origen obligatoria'
  })
  @IsUUID()
  accountId: string;

  @ApiProperty({
    example: 'uuid-de-la-categoria',
    description: 'Categoría de gasto obligatoria'
  })
  @IsUUID()
  categoryId: string;
}
