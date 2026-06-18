import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsHexColor } from 'class-validator';

export class CreateIncomeCategoryDto {
  @ApiProperty({
    example: 'Nómina',
    description: 'Nombre de la categoría de ingreso'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Salario mensual y bonos',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '#2ECC71',
    description: 'Color identificativo para reportes',
    required: false 
  })
  @IsHexColor()
  @IsOptional()
  colorCode?: string;
}
