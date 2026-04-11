import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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
    // 1. Buscar al usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // 2. Si no existe, lanzamos error 401
    // Nota pro: Usamos el mismo mensaje para email o password incorrectos por seguridad
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Comparar la contraseña tecleada con el hash de la BD
    const pwMatches = await bcrypt.compare(dto.password, user.password);

    // 4. Si no coinciden, error 401
    if (!pwMatches) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 5. Si todo está ok, de momento devolvemos un mensaje de éxito
    // (En el siguiente paso aquí generaremos el Token JWT)
    return {
      message: 'Has iniciado sesión correctamente',
      userId: user.id,
      email: user.email
    };
  }
}
