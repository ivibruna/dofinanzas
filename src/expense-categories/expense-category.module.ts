import { Module } from '@nestjs/common';
import { ExpenseCategoriesService } from './expense-category.service';
import { ExpenseCategoriesController } from './expense-category.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExpenseCategoriesController],
  providers: [ExpenseCategoriesService],
})
export class ExpenseCategoriesModule {}