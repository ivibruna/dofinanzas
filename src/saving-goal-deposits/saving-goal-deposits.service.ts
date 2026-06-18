import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingGoalDepositDto } from './dto/create-saving-goal-deposit.dto';

@Injectable()
export class SavingGoalDepositsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSavingGoalDepositDto) {
    // Verificamos la cuenta origen
    const account = await this.prisma.account.findFirst({
      where: { id: dto.accountId, userId: userId, isActive: true },
    });
    if (!account) throw new NotFoundException('Cuenta origen no encontrada');
    
    // Validamos que haya dinero suficiente en el banco
    if (Number(account.balance) < dto.amount) {
      throw new BadRequestException('Saldo insuficiente en la cuenta bancaria');
    }

    // Verificamos la hucha destino
    const goal = await this.prisma.savingGoal.findFirst({
      where: { id: dto.savingGoalId, userId: userId },
    });
    if (!goal) throw new NotFoundException('Meta de ahorro no encontrada');

    // Hacemos la TRANSACCION
    const [deposit] = await this.prisma.$transaction([
      // Crear el ticket del depósito
      this.prisma.savingGoalDeposit.create({
        data: {
          amount: dto.amount,
          savingGoalId: dto.savingGoalId,
        },
      }),
      // Sumar el dinero a la Hucha
      this.prisma.savingGoal.update({
        where: { id: dto.savingGoalId },
        data: { currentAmount: { increment: dto.amount } },
      }),
      // Restar el dinero de la Cuenta Bancaria
      this.prisma.account.update({
        where: { id: dto.accountId },
        data: { balance: { decrement: dto.amount } },
      }),
    ]);

    return deposit;
  }

  // Borrar un deposito (Deshacer la operacion)
  async remove(userId: string, id: string, accountId: string) {
    // Buscamos el deposito y comprobamos que la hucha sea de este usuario
    const deposit = await this.prisma.savingGoalDeposit.findFirst({
      where: { id: id, savingGoal: { userId: userId } },
    });
    if (!deposit) throw new NotFoundException('Depósito no encontrado');

    // Transacción inversa
    await this.prisma.$transaction([
      this.prisma.savingGoalDeposit.delete({ where: { id: id } }),
      this.prisma.savingGoal.update({
        where: { id: deposit.savingGoalId },
        data: { currentAmount: { decrement: deposit.amount } },
      }),
      this.prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: deposit.amount } },
      }),
    ]);

    return { message: 'Depósito revertido correctamente' };
  }
}
