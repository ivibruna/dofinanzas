import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsUrl, IsUUID, IsOptional } from 'class-validator';

export enum DocumentType {
  INVOICE = 'INVOICE',   // Factura
  RECEIPT = 'RECEIPT',   // Ticket
  PAYROLL = 'PAYROLL',   // Nómina
  CONTRACT = 'CONTRACT', // Contrato
  OTHER = 'OTHER',       // Otros
}

export class CreateDocumentDto {
  @ApiProperty({
    example: 'Ticket Mercadona Compra Semanal',
    description: 'Nombre del archivo'
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: DocumentType,
    example: 'RECEIPT',
    description: 'Tipo de documento'
  })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({
    example: 'https:Ruta donde esta el archivo',
    description: 'Ruta o URL del archivo Drive'
  })
  @IsString()
  url: string;

  @ApiProperty({
    example: 'uuid-del-gasto',
    required: false,
    description: 'Gasto al que pertenece este ticket (Opcional)'
  })
  @IsUUID()
  @IsOptional()
  expenseId?: string;
}
