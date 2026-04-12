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
    example: 'https://mi-servidor.com/archivos/ticket-123.pdf',
    description: 'Ruta o URL del archivo físico'
  })
  @IsString()
  // @IsUrl() // Opcional: Descomenta esto si vas a forzar que sea una URL de internet (S3, Cloudinary). Si vas a usar rutas locales como '/uploads/file.pdf', déjalo solo con @IsString()
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
