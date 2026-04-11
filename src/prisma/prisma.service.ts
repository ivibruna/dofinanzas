import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv'; // <-- 1. Importamos dotenv

// 2. Ejecutamos la carga ANTES de que se cree la clase
dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Creamos un "Pool" de conexiones clásico usando la URL de tu .env
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // 2. Envolvemos ese pool en el nuevo Adaptador de Prisma
    const adapter = new PrismaPg(pool);
    
    // 3. ¡Se lo pasamos al constructor de PrismaClient!
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}