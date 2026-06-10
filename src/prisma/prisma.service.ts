import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

//Ejecutamos la carga ANTES de que se cree la clase
dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Creamos un POOL de conexiones usando la URL del .env
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Envolvemos ese pool en el nuevo Adaptador de Prisma
    const adapter = new PrismaPg(pool);
    
    // Se lo pasamos al constructor de PrismaClient
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
