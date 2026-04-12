import { Controller, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { SavingGoalDepositsService } from './saving-goal-deposits.service';
import { CreateSavingGoalDepositDto } from './dto/create-saving-goal-deposit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Saving Goal Deposits (Ingresos a Huchas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('saving-goal-deposits')
export class SavingGoalDepositsController {
  constructor(private readonly savingGoalDepositsService: SavingGoalDepositsService) {}

  @Post()
  @ApiOperation({ summary: 'Mover dinero de una cuenta a una hucha' })
  create(@Request() req, @Body() createSavingGoalDepositDto: CreateSavingGoalDepositDto) {
    return this.savingGoalDepositsService.create(req.user.userId, createSavingGoalDepositDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deshacer un depósito y devolver el dinero a la cuenta' })
  @ApiQuery({ name: 'accountId', description: 'ID de la cuenta a la que devolver el dinero' })
  remove(@Request() req, @Param('id') id: string, @Query('accountId') accountId: string) {
    // Al borrar, necesitamos saber por Query (?) a qué cuenta devolver el dinero
    return this.savingGoalDepositsService.remove(req.user.userId, id, accountId);
  }
}
