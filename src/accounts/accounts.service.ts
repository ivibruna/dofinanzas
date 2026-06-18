import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  // Creamos la cuenta y la enlazamos obligatoriamente a un usuario
  async create(userId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        ...dto,
        userId: userId,
      },
    });
  }

  // Traemos SOLO las cuentas que pertenezcan a este usuario
  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { 
        userId: userId,
        isActive: true //Solo mostramos las cuentas Activas (TRUE)
    },
    });
  }

  async findOne(userId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: { 
        id: accountId, 
        userId: userId, 
        isActive: true 
      },
    });

    if (!account) throw new NotFoundException('Cuenta no encontrada');
    return account;
  }

  async getNetWorth(userId: string) {
    const aggregation = await this.prisma.account.aggregate({
      _sum: {
        balance: true,
      },
      where: {
        userId: userId,
        isActive: true,
      },
    });

    return {
      totalBalance: aggregation._sum.balance || 0,
    };
  }

  async update(userId: string, accountId: string, dto: UpdateAccountDto) {
    //Verificamos que la cuenta existe y es suya
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId: userId },
    });

    if (!account) throw new NotFoundException('Cuenta no encontrada');

    // 2. Actualizamos
    return this.prisma.account.update({
      where: { id: accountId },
      data: dto,
    });
  }

  async remove(userId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId: userId },
    });

    if (!account) throw new NotFoundException('Cuenta no encontrada');

    // Borrado poniendo a FALSE - No hacemos .delete(), hacemos un .update() del estado
    return this.prisma.account.update({
      where: { id: accountId },
      data: { isActive: false },
    });
  }
}
