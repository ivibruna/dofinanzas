import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateSavingGoalDepositDto {
  @ApiProperty({
    example: 150.00,
    description: 'Cantidad de dinero a ingresar en la hucha'
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    example: 'uuid-de-tu-hucha',
    description: 'ID de la Meta de Ahorro'
  })
  @IsUUID()
  savingGoalId: string;

  @ApiProperty({
    example: 'uuid-de-tu-cuenta',
    description: 'ID de la Cuenta Bancaria origen'
  })
  @IsUUID()
  accountId: string;
}
