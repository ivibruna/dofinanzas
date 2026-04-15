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
}
