import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdvisorService } from './advisor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Advisor (IA)')
@ApiBearerAuth()
@Controller('advisor')
export class AdvisorController {
  constructor(private readonly advisorService: AdvisorService) {}

  @UseGuards(JwtAuthGuard)
  @Get('advice')
  async getAdvice(@Req() req) {
    const userId = req.user.id || req.user.sub; 
    
    console.log('⏳ Controlador esperando respuesta de la IA...');
    
    // Forzamos al controlador a pausar su ejecución y esperar al servicio
    const result = await this.advisorService.getFinancialAdvice(userId);
    
    console.log('✅ Controlador ha recibido la respuesta, enviando a Swagger!');
    
    return result; 
  }
}
