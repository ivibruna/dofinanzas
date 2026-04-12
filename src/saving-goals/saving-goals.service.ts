import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingGoalDto } from './dto/create-saving-goal.dto';
import { UpdateSavingGoalDto } from './dto/update-saving-goal.dto';

@Injectable()
export class SavingGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSavingGoalDto) {
    return this.prisma.savingGoal.create({
      data: {
        name: dto.name,
        targetAmount: dto.targetAmount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        userId: userId,
        // currentAmount empieza en 0 por defecto gracias a tu @default(0)
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.savingGoal.findMany({
      where: { userId: userId },
      include: {
        deposits: {
          orderBy: { date: 'desc' },
          take: 5,
        }
      }
    });
  }

  async findOne(userId: string, id: string) {
    const goal = await this.prisma.savingGoal.findFirst({
      where: { id: id, userId: userId },
      include: { deposits: true },
    });
    if (!goal) throw new NotFoundException('Meta de ahorro no encontrada');
    return goal;
  }

  async update(userId: string, id: string, dto: UpdateSavingGoalDto) {
    await this.findOne(userId, id); 
    
    return this.prisma.savingGoal.update({
      where: { id: id },
      data: {
        name: dto.name,
        targetAmount: dto.targetAmount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.savingGoal.delete({
      where: { id: id },
    });
  }
}
