import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';

// PartialType copia CreateAccountDto pero hace que todo sea opcional
export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
