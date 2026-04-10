import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Cuando NestJS arranca, se conecta a PostgreSQL automáticamente
  async onModuleInit() {
    await this.$connect();
  }

  // Cuando NestJS se apaga, cierra la conexión de forma segura
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
