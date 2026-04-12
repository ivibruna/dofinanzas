import { Module } from '@nestjs/common';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DebtController],
  providers: [DebtService],
})
export class DebtModule {}
