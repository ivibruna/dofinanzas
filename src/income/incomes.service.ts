import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateIncomeDto) {
    const account = await this.prisma.account.findFirst({
      where: { id: dto.accountId, userId: userId, isActive: true },
    });
    if (!account) throw new NotFoundException('Cuenta no encontrada o inactiva');

    const category = await this.prisma.incomeCategory.findFirst({
      where: { id: dto.categoryId, userId: userId },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    // Creamos ingreso y sumar dinero
    const [income] = await this.prisma.$transaction([
      this.prisma.income.create({
        data: {
          amount: dto.amount,
          description: dto.description,
          date: dto.date ? new Date(dto.date) : new Date(),
          userId: userId,
          accountId: dto.accountId,
          categoryId: dto.categoryId,
        },
      }),
      this.prisma.account.update({
        where: { id: dto.accountId },
        data: { balance: { increment: dto.amount } }, // <-- Sumamos el dinero
      }),
    ]);

    return income;
  }

  async findAll(userId: string) {
    return this.prisma.income.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' },
      include: {
        account: { select: { name: true } },
        category: { select: { name: true, colorCode: true } },
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateIncomeDto) {
    const originalIncome = await this.prisma.income.findFirst({
      where: { id: id, userId: userId },
    });
    if (!originalIncome) throw new NotFoundException('Ingreso no encontrado');

    const newAmount = dto.amount ?? originalIncome.amount;
    const newAccountId = dto.accountId ?? originalIncome.accountId;
    const newCategoryId = dto.categoryId ?? originalIncome.categoryId;

    const operations: any[] = []; 

    //Restar el dinero viejo de la cuenta vieja
    operations.push(
      this.prisma.account.update({
        where: { id: originalIncome.accountId },
        data: { balance: { decrement: originalIncome.amount } },
      })
    );

    //Sumar el dinero nuevo a la cuenta nueva (o a la misma)
    operations.push(
      this.prisma.account.update({
        where: { id: newAccountId },
        data: { balance: { increment: newAmount } },
      })
    );

    //Actualizar el registro del ingreso
    operations.push(
      this.prisma.income.update({
        where: { id: id },
        data: {
          amount: newAmount,
          description: dto.description ?? originalIncome.description,
          date: dto.date ? new Date(dto.date) : originalIncome.date,
          accountId: newAccountId,
          categoryId: newCategoryId,
        },
      })
    );

    await this.prisma.$transaction(operations);
    return { message: 'Ingreso actualizado y cuentas rebalanceadas' };
  }

  async remove(userId: string, id: string) {
    const income = await this.prisma.income.findFirst({
      where: { id: id, userId: userId },
    });
    if (!income) throw new NotFoundException('Ingreso no encontrado');

    //Borrar registro y restar dinero devuelto
    await this.prisma.$transaction([
      this.prisma.income.delete({ where: { id: id } }),
      this.prisma.account.update({
        where: { id: income.accountId },
        data: { balance: { decrement: income.amount } },
      }),
    ]);

    return { message: 'Ingreso eliminado y dinero descontado de la cuenta' };
  }
}
