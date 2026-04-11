import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Le decimos que busque el token en la cabecera 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Usamos la misma clave secreta con la que firmamos el token
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  // Si la firma es válida, NestJS ejecuta esto y extrae los datos del token
  async validate(payload: any) {
    // Al devolver esto, NestJS inyecta automáticamente { userId, email } en el objeto Request
    return { userId: payload.sub, email: payload.email };
  }
}
