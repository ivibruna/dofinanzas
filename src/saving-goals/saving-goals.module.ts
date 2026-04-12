import { Module } from '@nestjs/common';
import { SavingGoalsService } from './saving-goals.service';
import { SavingGoalsController } from './saving-goals.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavingGoalsController],
  providers: [SavingGoalsService],
})
export class SavingGoalsModule {}
