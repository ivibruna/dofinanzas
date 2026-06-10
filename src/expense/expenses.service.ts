import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpenseDto) {
    // Verificamos que la cuenta es suya y está activa
    const account = await this.prisma.account.findFirst({
      where: { id: dto.accountId, userId: userId, isActive: true },
    });
    if (!account) throw new NotFoundException('Cuenta no encontrada o inactiva');

    // Verificamos que la categoría es suya
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id: dto.categoryId, userId: userId },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    // Gestionamos la TRANSACCION (hacemos ambas cosas o ninguna)
    const [expense, updatedAccount] = await this.prisma.$transaction([
      // Crear el ticket
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
      // Restar el dinero de la cuenta
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
      orderBy: { date: 'desc' }, // Los mas recientes primero
      // Traemos el nombre de la cuenta y categoría
      include: {
        account: { select: { name: true } },
        category: { select: { name: true, colorCode: true } },
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    // Buscamos el ticket original
    const originalExpense = await this.prisma.expense.findFirst({
      where: { id: id, userId: userId },
    });
    if (!originalExpense) throw new NotFoundException('Gasto no encontrado');

    // Preparamos los datos nuevos (Si el usuario no manda algo, dejamos lo antiguo)
    const newAmount = dto.amount ?? originalExpense.amount;
    const newAccountId = dto.accountId ?? originalExpense.accountId;
    const newCategoryId = dto.categoryId ?? originalExpense.categoryId;

    // Preparamos la operaciones para la transaccion
    const operations: any[] = [];

    // Reembolsar el dinero viejo a la cuenta vieja
    operations.push(
      this.prisma.account.update({
        where: { id: originalExpense.accountId },
        data: { balance: { increment: originalExpense.amount } },
      })
    );

    // Cobrar el dinero nuevo a la cuenta nueva (o a la misma)
    operations.push(
      this.prisma.account.update({
        where: { id: newAccountId },
        data: { balance: { decrement: newAmount } },
      })
    );

    // Actualizar el ticket
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

    // Se ejecuta la transaccion (si algun paso falla se cancelan todos)
    await this.prisma.$transaction(operations);

    return { message: 'Gasto actualizado y cuentas rebalanceadas correctamente' };
  }

  async remove(userId: string, id: string) {
    // Buscamos el gasto
    const expense = await this.prisma.expense.findFirst({
      where: { id: id, userId: userId },
    });
    if (!expense) throw new NotFoundException('Gasto no encontrado');

    // Borramos el ticket y devolvemos el dinero
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
