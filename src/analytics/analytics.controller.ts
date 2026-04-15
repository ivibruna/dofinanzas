import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Analytics (Estadísticas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('expenses-by-category')
  @ApiOperation({ summary: 'Obtener gastos del mes actual agrupados por categoría' })
  getExpensesByCategory(@Request() req) {
    return this.analyticsService.getExpensesByCategory(req.user.userId);
  }

  @Get('incomes-by-category')
  @ApiOperation({ summary: 'Obtener ingresos del mes actual agrupados por categoría' })
  getIncomesByCategory(@Request() req) {
    return this.analyticsService.getIncomesByCategory(req.user.userId);
  }

  @Get('top-subscriptions')
  @ApiOperation({ summary: 'Obtener el Top 5 de suscripciones ordenadas por impacto anual' })
  getTopSubscriptions(@Request() req) {
    return this.analyticsService.getTopRecurringExpenses(req.user.userId);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Obtener Ingresos vs Gastos de los últimos 6 meses' })
  getSixMonthCashFlow(@Request() req) {
    return this.analyticsService.getSixMonthCashFlow(req.user.userId);
  }

  @Get('net-worth-evolution')
  @ApiOperation({ summary: 'Evolución del patrimonio neto de los últimos 6 meses' })
  getNetWorthEvolution(@Request() req) {
    return this.analyticsService.getNetWorthEvolution(req.user.userId);
  }

  @Get('expense-averages')
  @ApiOperation({ summary: 'Promedio de gasto diario y semanal del mes en curso' })
  getExpenseAverages(@Request() req) {
    return this.analyticsService.getExpenseAverages(req.user.userId);
  }

  @Get('saving-goals-progress')
  @ApiOperation({ summary: 'Ver el porcentaje de cumplimiento de las huchas' })
  getSavingGoalsProgress(@Request() req) {
    return this.analyticsService.getSavingGoalsProgress(req.user.userId);
  }

  @Get('savings-ratio')
  @ApiOperation({ summary: 'Calcular el ratio de ahorro mensual y estado financiero' })
  getSavingsRatio(@Request() req) {
    return this.analyticsService.getSavingsRatio(req.user.userId);
  }

  @Get('runway')
  @ApiOperation({ summary: 'Calcular los meses de supervivencia financiera (Runway)' })
  getRunway(@Request() req) {
    return this.analyticsService.getFinancialRunway(req.user.userId);
  }
}
