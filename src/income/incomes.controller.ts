import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Incomes (Ingresos)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo ingreso de dinero' })
  create(@Request() req, @Body() createIncomeDto: CreateIncomeDto) {
    return this.incomesService.create(req.user.userId, createIncomeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ver historial completo de ingresos' })
  findAll(@Request() req) {
    return this.incomesService.findAll(req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar un ingreso (Reajusta el saldo)' })
  update(@Request() req, @Param('id') id: string, @Body() updateIncomeDto: UpdateIncomeDto) {
    return this.incomesService.update(req.user.userId, id, updateIncomeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Borrar un ingreso (Resta el dinero)' })
  remove(@Request() req, @Param('id') id: string) {
    return this.incomesService.remove(req.user.userId, id);
  }
}
