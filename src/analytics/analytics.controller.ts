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
}
