import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Esto carga las variables del archivo .env a la memoria del proceso
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'npx ts-node prisma/seed.ts', // <-- ¡Añade esta línea exacta!
  },
});
