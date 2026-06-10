import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { AccountType } from '@prisma/client'; 

export class CreateAccountDto {
  @ApiProperty({ 
    example: 'Cuenta Corriente BBVA',
    description: 'Nombre identificativo de la cuenta' 
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: AccountType,
    example: AccountType.BANK,
    description: 'Tipo de cuenta financiera (Ej: Banco, Efectivo, Tarjeta, Inversión)'
  })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({
    example: 1500.5,
    description: 'Saldo inicial o actual de la cuenta' 
  })
  @IsNumber()
  balance: number;

  @ApiProperty({
    example: 'Cuenta compartida para los gastos del piso', 
    description: 'Proposito de la cuenta o informacion adicional',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
}