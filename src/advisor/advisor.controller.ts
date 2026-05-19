import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; // <-- Importamos Swagger
import { AdvisorService } from './advisor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Advisor (IA)') // Para que quede ordenado en Swagger
@ApiBearerAuth()         // <-- ¡MAGIA! Esto le dice a Swagger que pida el token
@Controller('advisor')
export class AdvisorController {
  constructor(private readonly advisorService: AdvisorService) {}

  @UseGuards(JwtAuthGuard)
  @Get('advice')
  async getAdvice(@Req() req) {
    // Si tu jwt.strategy.ts devuelve 'sub' como ID, usa req.user.sub. 
    // Si devuelve 'id', usa req.user.id
    const userId = req.user.id || req.user.sub; 
    return this.advisorService.getFinancialAdvice(userId);
  }
}