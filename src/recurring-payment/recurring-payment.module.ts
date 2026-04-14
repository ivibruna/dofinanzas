import { Module } from '@nestjs/common';
import { RecurringPaymentService } from './recurring-payment.service';
import { RecurringPaymentController } from './recurring-payment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RecurringPaymentTask } from './recurring-payment.task';

@Module({
  imports: [PrismaModule],
  controllers: [RecurringPaymentController],
  providers: [RecurringPaymentService, RecurringPaymentTask],
})
export class RecurringPaymentModule {}
