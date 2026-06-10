import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { IncomeCategoryService } from './income-category.service';
import { CreateIncomeCategoryDto } from './dto/create-income-category.dto';
import { UpdateIncomeCategoryDto } from './dto/update-income-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Income Category')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('income-category')
export class IncomeCategoryController {
  constructor(private readonly incomeCategoryService: IncomeCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva categoría de ingresos' })
  create(@Request() req, @Body() createIncomeCategoryDto: CreateIncomeCategoryDto) {
    return this.incomeCategoryService.create(req.user.userId, createIncomeCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener mis categorías de ingresos' })
  findAll(@Request() req) {
    return this.incomeCategoryService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalles de una categoría de ingresos' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.incomeCategoryService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría de ingresos' })
  update(@Request() req, @Param('id') id: string, @Body() updateIncomeCategoryDto: UpdateIncomeCategoryDto) {
    return this.incomeCategoryService.update(req.user.userId, id, updateIncomeCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una categoría de ingresos' })
  remove(@Request() req, @Param('id') id: string) {
    return this.incomeCategoryService.remove(req.user.userId, id);
  }
}
