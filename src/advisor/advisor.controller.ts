import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
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
    const userId = req.user.userId;
    
    console.log('⏳ Controlador esperando respuesta de la IA...');
    
    // Forzamos al controlador a pausar su ejecución y esperar al servicio
    const result = await this.advisorService.getFinancialAdvice(userId);
    
    console.log('✅ Controlador ha recibido la respuesta, enviando a Swagger!');
    
    return result; 
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  @ApiBody({ schema: { properties: { message: { type: 'string', example: '¿En qué estoy gastando más dinero este mes?' } } } })
  async askAdvisor(@Req() req, @Body('message') message: string) {
    const userId = req.user.userId;
    
    console.log(`💬 Usuario pregunta: "${message}"`);
    return await this.advisorService.askFinancialAdvisor(userId, message);
  }
}
