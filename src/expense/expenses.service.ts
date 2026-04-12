import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpenseDto) {
    // 1. Verificamos que la cuenta es suya y está activa
    const account = await this.prisma.account.findFirst({
      where: { id: dto.accountId, userId: userId, isActive: true },
    });
    if (!account) throw new NotFoundException('Cuenta no encontrada o inactiva');

    // 2. Verificamos que la categoría es suya
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id: dto.categoryId, userId: userId },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    // 3. LA TRANSACCIÓN: O se hacen ambas cosas, o ninguna
    // Prisma maneja el tipo Decimal perfectamente con operaciones matemáticas
    const [expense, updatedAccount] = await this.prisma.$transaction([
      // A. Crear el ticket
      this.prisma.expense.create({
        data: {
          amount: dto.amount,
          description: dto.description,
          date: dto.date ? new Date(dto.date) : new Date(),
          userId: userId,
          accountId: dto.accountId,
          categoryId: dto.categoryId,
        },
      }),
      // B. Restar el dinero de la cuenta
      this.prisma.account.update({
        where: { id: dto.accountId },
        data: {
          balance: {
            decrement: dto.amount, // Prisma resta automáticamente
          },
        },
      }),
    ]);

    return expense;
  }

  async findAll(userId: string) {
    return this.prisma.expense.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' }, // Los más recientes primero
      // Le decimos a Prisma que nos traiga también el nombre de la cuenta y categoría
      include: {
        account: { select: { name: true } },
        category: { select: { name: true, colorCode: true } },
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    // 1. Buscamos el ticket original tal y como estaba
    const originalExpense = await this.prisma.expense.findFirst({
      where: { id: id, userId: userId },
    });
    if (!originalExpense) throw new NotFoundException('Gasto no encontrado');

    // 2. Preparamos los datos nuevos (Si el usuario no manda algo, dejamos lo que había)
    const newAmount = dto.amount ?? originalExpense.amount;
    const newAccountId = dto.accountId ?? originalExpense.accountId;
    const newCategoryId = dto.categoryId ?? originalExpense.categoryId;

    // 3. Preparamos la matriz de operaciones para la Transacción
    const operations: any[] = [];

    // PASO A: Reembolsar el dinero viejo a la cuenta vieja
    operations.push(
      this.prisma.account.update({
        where: { id: originalExpense.accountId },
        data: { balance: { increment: originalExpense.amount } },
      })
    );

    // PASO B: Cobrar el dinero nuevo a la cuenta nueva (o a la misma)
    operations.push(
      this.prisma.account.update({
        where: { id: newAccountId },
        data: { balance: { decrement: newAmount } },
      })
    );

    // PASO C: Actualizar el papel (el ticket)
    operations.push(
      this.prisma.expense.update({
        where: { id: id },
        data: {
          amount: newAmount,
          description: dto.description ?? originalExpense.description,
          date: dto.date ? new Date(dto.date) : originalExpense.date,
          accountId: newAccountId,
          categoryId: newCategoryId,
        },
      })
    );

    // 4. ¡EJECUTAR LA TRANSACCIÓN! (Si falla un paso, Prisma cancela los 3)
    await this.prisma.$transaction(operations);

    return { message: 'Gasto actualizado y cuentas rebalanceadas correctamente' };
  }

  async remove(userId: string, id: string) {
    // 1. Buscamos el gasto
    const expense = await this.prisma.expense.findFirst({
      where: { id: id, userId: userId },
    });
    if (!expense) throw new NotFoundException('Gasto no encontrado');

    // 2. TRANSACCIÓN INVERSA: Borramos el ticket y devolvemos el dinero
    await this.prisma.$transaction([
      this.prisma.expense.delete({ where: { id: id } }),
      this.prisma.account.update({
        where: { id: expense.accountId },
        data: { balance: { increment: expense.amount } }, // Devolvemos la pasta
      }),
    ]);

    return { message: 'Gasto eliminado y dinero devuelto a la cuenta' };
  }
}
