import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    // Configuramos el motor de Tokens JWT
    JwtModule.register({
      global: true, // Lo hacemos global para proteger cualquier ruta después
      secret: process.env.JWT_SECRET, // Leerá la clave secreta de tu archivo .env
      signOptions: { expiresIn: '1h' }, // El token caduca en 1 hora
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
