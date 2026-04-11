import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-category.module';
// Asegúrate de NO importar el AuthController aquí arriba

@Module({
  imports: [AuthModule, PrismaModule, AccountsModule, ExpenseCategoriesModule], // Aquí conectamos los módulos
  controllers: [], // <-- ¡OJO! Aquí NO debe estar AuthController
  providers: [],
})
export class AppModule {}
