import { Module } from '@nestjs/common';
import { IncomeCategoryService } from './income-category.service';
import { IncomeCategoryController } from './income-category.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IncomeCategoryController],
  providers: [IncomeCategoryService],
})
export class IncomeCategoryModule {}
