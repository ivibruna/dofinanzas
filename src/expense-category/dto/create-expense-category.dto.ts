import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsHexColor } from 'class-validator';

export class CreateExpenseCategoryDto {
  @ApiProperty({ example: 'Supermercado', description: 'Nombre de la categoría' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Compras en Mercadona, Carrefour, etc.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '#FF5733', description: 'Color para los gráficos en Metabase', required: false })
  @IsHexColor() // Valida que sea un color web real
  @IsOptional()
  colorCode?: string;

  @ApiProperty({ example: 300.50, description: 'Límite de gasto mensual', required: false })
  @IsNumber()
  @IsOptional()
  monthlyBudget?: number;
}
