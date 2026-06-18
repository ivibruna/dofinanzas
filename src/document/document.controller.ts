import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Documents (Facturas y Tickets)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo documento' })
  create(@Request() req, @Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(req.user.userId, createDocumentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos mis documentos' })
  findAll(@Request() req) {
    return this.documentService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalles de un documento' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.documentService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar datos de un documento' })
  update(@Request() req, @Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentService.update(req.user.userId, id, updateDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un documento' })
  remove(@Request() req, @Param('id') id: string) {
    return this.documentService.remove(req.user.userId, id);
  }
}
