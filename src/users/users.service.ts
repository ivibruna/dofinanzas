import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // Inyectamos nuestro cable a la base de datos
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // 1. Verificamos si el usuario ya existe en la base de datos
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      // Si existe, cortamos la ejecución y lanzamos un error HTTP 409
      throw new ConflictException('Este email ya está registrado en el sistema');
    }

    // 2. Encriptamos la contraseña usando bcrypt con 10 "rondas" de sal
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // 3. Guardamos el nuevo usuario en PostgreSQL
    const newUser = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        // Nota: el ID (uuid), la fecha y el rol (USER) se generan automáticamente por Prisma
      },
    });

    // 4. Filtramos la contraseña encriptada para no devolverla nunca al Frontend/Swagger
    const { password, ...result } = newUser;
    return result;
  }

  // (Por ahora deja los demás métodos findAll, findOne, etc., tal como venían por defecto)
}
