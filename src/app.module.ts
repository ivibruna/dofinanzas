/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { ExpenseCategoryModule } from './expense-category/expense-category.module';
import { ExpensesModule } from './expense/expenses.module';
import { IncomeCategoryModule } from './income-category/income-category.module';
import { IncomesModule } from './income/incomes.module';
// Asegúrate de NO importar el AuthController aquí arriba

@Module({
imports: [
  AuthModule,
  PrismaModule, 
  AccountsModule, 
  ExpenseCategoryModule, 
  ExpensesModule, 
  IncomeCategoryModule,
  IncomesModule // <-- Añadido
],
  controllers: [], // <-- ¡OJO! Aquí NO debe estar AuthController
  providers: [],
})
export class AppModule {}
