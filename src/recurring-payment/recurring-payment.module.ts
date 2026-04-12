import { Module } from '@nestjs/common';
import { RecurringPaymentService } from './recurring-payment.service';
import { RecurringPaymentController } from './recurring-payment.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecurringPaymentController],
  providers: [RecurringPaymentService],
})
export class RecurringPaymentModule {}
