import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpenseCategoryDto) {
    try {
      return await this.prisma.expenseCategory.create({
        data: { ...dto, userId },
      });
    } catch (error) {
      // Prisma lanza el código P2002 cuando se viola una restricción @@unique
      if (error.code === 'P2002') {
        throw new ConflictException('Ya tienes una categoría con ese nombre');
      }
      throw error;
    }
  }

  async findAll(userId: string) {
    return this.prisma.expenseCategory.findMany({
      where: { userId },
    });
  }

  async findOne(userId: string, id: string) {
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async update(userId: string, id: string, dto: UpdateExpenseCategoryDto) {
    await this.findOne(userId, id); // Verificamos que existe y es suya
    return this.prisma.expenseCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // Verificamos que existe y es suya
    return this.prisma.expenseCategory.delete({
      where: { id },
    });
  }
}
