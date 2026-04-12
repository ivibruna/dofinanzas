import { PartialType } from '@nestjs/swagger';
import { CreateRecurringPaymentDto } from './create-recurring-payment.dto';

export class UpdateRecurringPaymentDto extends PartialType(CreateRecurringPaymentDto) {}
