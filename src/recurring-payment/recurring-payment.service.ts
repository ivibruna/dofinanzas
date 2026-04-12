import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringPaymentDto } from './dto/create-recurring-payment.dto';
import { UpdateRecurringPaymentDto } from './dto/update-recurring-payment.dto';

@Injectable()
export class RecurringPaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateRecurringPaymentDto) {
    // Verificamos que la cuenta y categoría existen y son del usuario
    const [account, category] = await Promise.all([
      this.prisma.account.findFirst({ where: { id: dto.accountId, userId } }),
      this.prisma.expenseCategory.findFirst({ where: { id: dto.categoryId, userId } }),
    ]);

    if (!account) throw new NotFoundException('Cuenta no encontrada');
    if (!category) throw new NotFoundException('Categoría no encontrada');

    return this.prisma.recurringPayment.create({
      data: {
        name: dto.name,
        amount: dto.amount,
        frequency: dto.frequency as any,
        nextDueDate: new Date(dto.nextDueDate),
        active: dto.active ?? true,
        userId: userId,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.recurringPayment.findMany({
      where: { userId },
      include: {
        account: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { nextDueDate: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const payment = await this.prisma.recurringPayment.findFirst({
      where: { id, userId },
      include: { account: true, category: true },
    });
    if (!payment) throw new NotFoundException('Pago recurrente no encontrado');
    return payment;
  }

  async update(userId: string, id: string, dto: UpdateRecurringPaymentDto) {
    await this.findOne(userId, id);

    return this.prisma.recurringPayment.update({
      where: { id },
      data: {
        ...dto,
        nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : undefined,
        frequency: dto.frequency as any,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.recurringPayment.delete({ where: { id } });
  }
}
