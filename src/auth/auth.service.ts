import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
) {}

  async register(dto: AuthDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('Ese correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name, 
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const pwMatches = await bcrypt.compare(dto.password, user.password);

    if (!pwMatches) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    //Creamos el PAYLOAD (los datos públicos que van del token)
    // SUB para el ID del usuario, que es el estándar JWT
    const payload = { sub: user.id, email: user.email };

    //Firmamos el token usando el secreto del archivo .env
    const token = await this.jwtService.signAsync(payload);

    //Devolvemos el token
    return {
      message: 'Has iniciado sesión correctamente',
      accessToken: token, // Aqui va el PASSPORT
    };
  }
}
