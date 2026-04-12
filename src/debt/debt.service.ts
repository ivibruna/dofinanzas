import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Injectable()
export class DebtService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDebtDto) {
    return this.prisma.debt.create({
      data: {
        name: dto.name,
        amount: dto.amount,
        interestRate: dto.interestRate,
        dueDate: new Date(dto.dueDate),
        paid: dto.paid ?? false, // Por defecto no está pagada
        userId: userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.debt.findMany({
      where: { userId: userId },
      orderBy: [
        { paid: 'asc' },      // Las no pagadas (false) salen antes que las pagadas (true)
        { dueDate: 'asc' }    // Las que vencen antes salen primero
      ],
    });
  }

  async findOne(userId: string, id: string) {
    const debt = await this.prisma.debt.findFirst({
      where: { id: id, userId: userId },
    });
    if (!debt) throw new NotFoundException('Deuda no encontrada');
    return debt;
  }

  async update(userId: string, id: string, dto: UpdateDebtDto) {
    await this.findOne(userId, id); // Verificamos que existe y es del usuario

    return this.prisma.debt.update({
      where: { id: id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // Verificamos que existe y es del usuario
    
    return this.prisma.debt.delete({
      where: { id: id },
    });
  }
}
