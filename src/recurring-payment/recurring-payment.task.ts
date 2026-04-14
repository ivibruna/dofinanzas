import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecurringPaymentTask {
  private readonly logger = new Logger(RecurringPaymentTask.name);

  constructor(private readonly prisma: PrismaService) {}
  @Cron('1 0 * * *') // Se ejecuta todos los días a las 00:01
  //@Cron(CronExpression.EVERY_MINUTE) //Esto es cada minuto, solo lo utilizamos para pruebas 
  async handleRecurringPayments() {
    this.logger.log('Iniciando procesamiento de pagos recurrentes...');

    const today = new Date();

    // 1. Buscamos pagos activos que ya han vencido
    const pendingPayments = await this.prisma.recurringPayment.findMany({
      where: {
        active: true,
        nextDueDate: { lte: today },
      },
    });

    this.logger.log(`Se han encontrado ${pendingPayments.length} pagos pendientes.`);

    for (const payment of pendingPayments) {
      try {
        await this.processPayment(payment);
      } catch (error) {
        this.logger.error(`Error procesando pago ${payment.id}: ${error.message}`);
      }
    }
  }

  private async processPayment(payment: any) {
    const nextDate = this.calculateNextDate(payment.nextDueDate, payment.frequency);

    await this.prisma.$transaction([
      // A. Crear el Gasto real
      this.prisma.expense.create({
        data: {
          amount: payment.amount,
          description: `Auto: ${payment.name}`,
          date: payment.nextDueDate,
          userId: payment.userId,
          accountId: payment.accountId,
          categoryId: payment.categoryId,
        },
      }),
      // B. Restar dinero de la cuenta
      this.prisma.account.update({
        where: { id: payment.accountId },
        data: { balance: { decrement: payment.amount } },
      }),
      // C. Actualizar la fecha del próximo cobro en la suscripción
      this.prisma.recurringPayment.update({
        where: { id: payment.id },
        data: { nextDueDate: nextDate },
      }),
    ]);

    this.logger.log(`Pago '${payment.name}' procesado. Próximo cobro: ${nextDate.toISOString()}`);
  }

  private calculateNextDate(currentDate: Date, frequency: string): Date {
    const date = new Date(currentDate);
    switch (frequency) {
      case 'DAILY':
        date.setDate(date.getDate() + 1);
        break;
      case 'WEEKLY':
        date.setDate(date.getDate() + 7);
        break;
      case 'MONTHLY':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'YEARLY':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  }
}
