import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDocumentDto) {
    // Si envían un expenseId, comprobamos que el gasto exista y sea del usuario
    if (dto.expenseId) {
      const expense = await this.prisma.expense.findFirst({
        where: { id: dto.expenseId, userId: userId },
      });
      if (!expense) throw new BadRequestException('El gasto indicado no existe o no te pertenece');
    }

    return this.prisma.document.create({
      data: {
        name: dto.name,
        type: dto.type as any, // Cast temporal por si tu enum de Prisma difiere
        url: dto.url,
        userId: userId,
        expenseId: dto.expenseId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId: userId },
      orderBy: { uploadedAt: 'desc' },
      // Incluimos información básica del gasto si lo tiene (para pintarlo en el Frontend)
      include: {
        expense: { select: { amount: true, description: true, date: true } }
      }
    });
  }

  async findOne(userId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: id, userId: userId },
      include: { expense: true }
    });
    if (!document) throw new NotFoundException('Documento no encontrado');
    return document;
  }

  async update(userId: string, id: string, dto: UpdateDocumentDto) {
    await this.findOne(userId, id);

    if (dto.expenseId) {
      const expense = await this.prisma.expense.findFirst({
        where: { id: dto.expenseId, userId: userId },
      });
      if (!expense) throw new BadRequestException('El gasto indicado no existe');
    }

    return this.prisma.document.update({
      where: { id: id },
      data: {
        ...dto,
        type: dto.type as any,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    
    // NOTA FUTURA: Aquí, además de borrar el registro en base de datos, 
    // se programaría el borrado del archivo físico (PDF/JPG) del servidor (ej: fs.unlinkSync)
    
    return this.prisma.document.delete({
      where: { id: id },
    });
  }
}
