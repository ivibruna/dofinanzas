import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeCategoryDto } from './dto/create-income-category.dto';
import { UpdateIncomeCategoryDto } from './dto/update-income-category.dto';

@Injectable()
export class IncomeCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateIncomeCategoryDto) {
    try {
      return await this.prisma.incomeCategory.create({
        data: { ...dto, userId },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una categoría de ingreso con ese nombre');
      }
      throw error;
    }
  }

  async findAll(userId: string) {
    return this.prisma.incomeCategory.findMany({
      where: { userId },
    });
  }

  async findOne(userId: string, id: string) {
    const category = await this.prisma.incomeCategory.findFirst({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException('Categoría de ingreso no encontrada');
    return category;
  }

  async update(userId: string, id: string, dto: UpdateIncomeCategoryDto) {
    await this.findOne(userId, id); 
    return this.prisma.incomeCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.incomeCategory.delete({
      where: { id },
    });
  }
}
