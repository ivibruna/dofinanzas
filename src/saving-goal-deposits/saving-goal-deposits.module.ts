import { Module } from '@nestjs/common';
import { SavingGoalDepositsService } from './saving-goal-deposits.service';
import { SavingGoalDepositsController } from './saving-goal-deposits.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavingGoalDepositsController],
  providers: [SavingGoalDepositsService],
})
export class SavingGoalDepositsModule {}
