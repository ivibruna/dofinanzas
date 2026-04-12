import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DebtService } from './debt.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Debt (Deudas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('debt')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva deuda o préstamo' })
  create(@Request() req, @Body() createDebtDto: CreateDebtDto) {
    return this.debtService.create(req.user.userId, createDebtDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas mis deudas' })
  findAll(@Request() req) {
    return this.debtService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalles de una deuda específica' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.debtService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar deuda (Ej: Reducir cantidad o marcar como pagada)' })
  update(@Request() req, @Param('id') id: string, @Body() updateDebtDto: UpdateDebtDto) {
    return this.debtService.update(req.user.userId, id, updateDebtDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar el registro de una deuda' })
  remove(@Request() req, @Param('id') id: string) {
    return this.debtService.remove(req.user.userId, id);
  }
}
