import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Expenses (Gastos)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo ticket de gasto' })
  create(@Request() req, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(req.user.userId, createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ver todo mi historial de gastos' })
  findAll(@Request() req) {
    return this.expensesService.findAll(req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar un gasto (Reajusta el saldo automáticamente)' })
  update(@Request() req, @Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(req.user.userId, id, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Borrar un gasto (Reembolsa el dinero)' })
  remove(@Request() req, @Param('id') id: string) {
    return this.expensesService.remove(req.user.userId, id);
  }
}