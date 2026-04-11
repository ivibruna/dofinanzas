import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

@ApiTags('Auth') // Esto pone el título bonito en Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  register(@Body() dto: AuthDto) {
    // Ahora sí, delegamos el trabajo en el servicio
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Cambiamos el 201 por un 200
  @ApiOperation({ summary: 'Iniciar sesión' })
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }
}
