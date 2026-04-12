import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ExpenseCategoryService } from './expense-category.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Expense Category')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expense-category')
export class ExpenseCategoryController {
  constructor(private readonly expenseCategoryService: ExpenseCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una categoría de gasto' })
  create(@Request() req, @Body() createExpenseCategoryDto: CreateExpenseCategoryDto) {
    return this.expenseCategoryService.create(req.user.userId, createExpenseCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas mis categorías de gasto' })
  findAll(@Request() req) {
    return this.expenseCategoryService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalles de una categoría' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.expenseCategoryService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría' })
  update(@Request() req, @Param('id') id: string, @Body() updateExpenseCategoryDto: UpdateExpenseCategoryDto) {
    return this.expenseCategoryService.update(req.user.userId, id, updateExpenseCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una categoría' })
  remove(@Request() req, @Param('id') id: string) {
    return this.expenseCategoryService.remove(req.user.userId, id);
  }
}