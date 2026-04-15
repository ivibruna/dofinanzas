import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Gasto total agrupado por categoría (Mes actual)
  async getExpensesByCategory(userId: string) {
    // Calculamos el primer y último día del mes actual
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Hacemos la magia con Prisma
    const expensesByCategory = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: userId,
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Como Prisma nos devuelve solo el ID de la categoría y la suma, 
    // vamos a buscar los nombres y colores para que el Frontend lo tenga fácil.
    const categories = await this.prisma.expenseCategory.findMany({
      where: { userId: userId },
    });

    // Mapeamos el resultado para devolver un JSON limpio y listo para el gráfico
    return expensesByCategory.map((item) => {
      const categoryInfo = categories.find((c) => c.id === item.categoryId);
      return {
        categoryName: categoryInfo?.name || 'Desconocida',
        colorCode: categoryInfo?.colorCode || '#CCCCCC',
        totalAmount: item._sum.amount,
      };
    });
  }
}
