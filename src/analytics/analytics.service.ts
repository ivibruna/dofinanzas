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

  // 2. Distribución de Ingresos (Mes actual)
  async getIncomesByCategory(userId: string) {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const incomesByCategory = await this.prisma.income.groupBy({
      by: ['categoryId'],
      where: {
        userId: userId,
        date: { gte: firstDay, lte: lastDay },
      },
      _sum: { amount: true },
    });

    const categories = await this.prisma.incomeCategory.findMany({
      where: { userId: userId },
    });

    return incomesByCategory.map((item) => {
      const categoryInfo = categories.find((c) => c.id === item.categoryId);
      return {
        categoryName: categoryInfo?.name || 'Desconocida',
        colorCode: categoryInfo?.colorCode || '#4CAF50', // Verde por defecto para ingresos
        totalAmount: Number(item._sum.amount),
      };
    });
  }

  // 3. Top 5 Gastos Recurrentes (Los "vampiros" financieros)
  async getTopRecurringExpenses(userId: string) {
    // Traemos todas las suscripciones activas
    const subscriptions = await this.prisma.recurringPayment.findMany({
      where: { userId: userId, active: true },
      include: { category: true },
    });

    // Mapeamos y calculamos el impacto anual de cada una
    const mappedSubscriptions = subscriptions.map(sub => {
      let annualCost = 0;
      const amount = Number(sub.amount); 

      switch (sub.frequency) {
        case 'DAILY': annualCost = amount * 365; break;
        case 'WEEKLY': annualCost = amount * 52; break;
        case 'MONTHLY': annualCost = amount * 12; break;
        case 'YEARLY': annualCost = amount; break;
        default: annualCost = amount * 12; 
      }

      return {
        name: sub.name,
        frequency: sub.frequency,
        amountPerCharge: amount,
        annualImpact: Number(annualCost.toFixed(2)),
        colorCode: sub.category?.colorCode || '#CCCCCC'
      };
    });

    // Ordenamos de mayor a menor impacto anual y nos quedamos con el Top 5
    return mappedSubscriptions
      .sort((a, b) => b.annualImpact - a.annualImpact)
      .slice(0, 5);
  }
}
