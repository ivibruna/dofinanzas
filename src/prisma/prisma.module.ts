import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Hacemos que Prisma esté disponible en todo el proyecto
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Lo exportamos para que otros módulos lo usen
})
export class PrismaModule {}
