import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ExpenseCategoriesService } from './expense-category.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Expense Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una categoría de gasto' })
  create(@Request() req, @Body() createExpenseCategoryDto: CreateExpenseCategoryDto) {
    return this.expenseCategoriesService.create(req.user.userId, createExpenseCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas mis categorías de gasto' })
  findAll(@Request() req) {
    return this.expenseCategoriesService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalles de una categoría' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.expenseCategoriesService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría' })
  update(@Request() req, @Param('id') id: string, @Body() updateExpenseCategoryDto: UpdateExpenseCategoryDto) {
    return this.expenseCategoriesService.update(req.user.userId, id, updateExpenseCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una categoría' })
  remove(@Request() req, @Param('id') id: string) {
    return this.expenseCategoriesService.remove(req.user.userId, id);
  }
}