import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RecurringPaymentService } from './recurring-payment.service';
import { CreateRecurringPaymentDto } from './dto/create-recurring-payment.dto';
import { UpdateRecurringPaymentDto } from './dto/update-recurring-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Recurring Payment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recurring-payment')
export class RecurringPaymentController {
  constructor(private readonly recurringPaymentService: RecurringPaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una suscripción vinculada a cuenta y categoría' })
  create(@Request() req, @Body() createDto: CreateRecurringPaymentDto) {
    return this.recurringPaymentService.create(req.user.userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar mis pagos recurrentes' })
  findAll(@Request() req) {
    return this.recurringPaymentService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalles de un pago recurrente' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.recurringPaymentService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar suscripción' })
  update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateRecurringPaymentDto) {
    return this.recurringPaymentService.update(req.user.userId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar pago recurrente' })
  remove(@Request() req, @Param('id') id: string) {
    return this.recurringPaymentService.remove(req.user.userId, id);
  }
}
