import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1.1 Gasto total agrupado por categoría (Mes actual)
  async getExpensesByCategory(userId: string) {
    // Calculamos el primer y último día del mes actual
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

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

  // 1.2. Distribución de Ingresos (Mes actual)
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

  // 1.3. Top 5 Gastos Recurrentes (Los "vampiros" financieros)
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

  // 2.1. Cash Flow Mensual (Últimos 6 meses)
  async getSixMonthCashFlow(userId: string) {
    const today = new Date();
    
    // Calculamos el día 1 de hace 5 meses (para tener 6 meses en total contando el actual)
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Hacemos las dos peticiones a la vez para que sea súper rápido
    const [expenses, incomes] = await Promise.all([
      this.prisma.expense.findMany({
        where: { userId: userId, date: { gte: sixMonthsAgo } },
        select: { amount: true, date: true } // Solo traemos lo necesario para no saturar memoria
      }),
      this.prisma.income.findMany({
        where: { userId: userId, date: { gte: sixMonthsAgo } },
        select: { amount: true, date: true }
      })
    ]);

    // Preparamos el array base con los últimos 6 meses en formato "YYYY-MM"
    // Preparamos el array base con los últimos 6 meses definiendo su Tipo
    const cashFlow: Array<{ month: string; income: number; expense: number; balance: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      cashFlow.push({
        month: monthString,
        income: 0,
        expense: 0,
        balance: 0
      });
    }

    // Rellenamos los Gastos
    expenses.forEach(e => {
      const m = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, '0')}`;
      const monthData = cashFlow.find(x => x.month === m);
      if (monthData) monthData.expense += Number(e.amount);
    });

    // Rellenamos los Ingresos
    incomes.forEach(i => {
      const m = `${i.date.getFullYear()}-${String(i.date.getMonth() + 1).padStart(2, '0')}`;
      const monthData = cashFlow.find(x => x.month === m);
      if (monthData) monthData.income += Number(i.amount);
    });

    // Calculamos el balance final de cada mes y redondeamos a 2 decimales
    cashFlow.forEach(m => {
      m.balance = Number((m.income - m.expense).toFixed(2));
      m.income = Number(m.income.toFixed(2));
      m.expense = Number(m.expense.toFixed(2));
    });

    return cashFlow;
  }

  // 2.2 Evolución del Saldo Neto (Patrimonio Histórico)
  async getNetWorthEvolution(userId: string) {
    // 1. Calculamos la liquidez total EXACTA de hoy sumando todas las cuentas
    const accounts = await this.prisma.account.findMany({
      where: { userId: userId },
      select: { balance: true }
    });
    const currentNetWorth = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // 2. Reutilizamos la función de Cash Flow que ya tenemos
    const cashFlow = await this.getSixMonthCashFlow(userId);

    // 3. Reconstruimos el pasado "caminando hacia atrás"
    const netWorthHistory: Array<{ month: string; netWorth: number }> = [];
    let runningBalance = currentNetWorth;

    // Recorremos el Cash Flow del revés (desde el mes actual hacia el más antiguo)
    for (let i = cashFlow.length - 1; i >= 0; i--) {
      // Guardamos la foto del mes
      netWorthHistory.unshift({
        month: cashFlow[i].month,
        netWorth: Number(runningBalance.toFixed(2))
      });
      // Para saber cuánto teníamos el mes anterior, al saldo actual le RESTAMOS el balance de este mes
      runningBalance -= cashFlow[i].balance;
    }

    return netWorthHistory;
  }

  // 2.3 Promedios de Gasto Diario y Semanal
  async getExpenseAverages(userId: string) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Sumamos todo lo gastado en el mes actual hasta el día de hoy
    const expenses = await this.prisma.expense.aggregate({
      where: {
        userId: userId,
        date: { gte: firstDayOfMonth, lte: today }
      },
      _sum: { amount: true }
    });

    const totalAmount = Number(expenses._sum.amount || 0);

    // Calculamos cuántos días llevamos de mes
    const daysPassed = today.getDate(); // Si hoy es 15, devuelve 15

    // Evitamos dividir por cero si es el día 1 del mes y acaba de empezar el día
    const safeDaysPassed = daysPassed === 0 ? 1 : daysPassed;

    const dailyAverage = totalAmount / safeDaysPassed;
    const weeklyAverage = dailyAverage * 7;

    return {
      currentMonthTotal: totalAmount,
      daysPassed: safeDaysPassed,
      dailyAverage: Number(dailyAverage.toFixed(2)),
      weeklyAverage: Number(weeklyAverage.toFixed(2))
    };
  }

  // 3.1 Progreso de Huchas (Saving Goals)
  async getSavingGoalsProgress(userId: string) {
    const goals = await this.prisma.savingGoal.findMany({
      where: { userId: userId }
    });

    return goals.map(goal => {
      const target = Number(goal.targetAmount);
      const current = Number(goal.currentAmount);
      
      // Evitamos dividir por cero si el usuario no le puso objetivo
      const percentage = target > 0 ? (current / target) * 100 : 0;

      return {
        name: goal.name,
        targetAmount: target,
        currentAmount: current,
        progressPercentage: Number(percentage.toFixed(2)),
        colorCode: '#2196F3', // Ponemos un color azul por defecto fijo
        dueDate: goal.dueDate // Usamos tu campo real 'dueDate' en lugar de 'deadline'
      };
    });
  }

  // 3.2 Ratio de Ahorro Mensual
  async getSavingsRatio(userId: string) {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

    // Buscamos ingresos y gastos de este mes
    const [expenses, incomes] = await Promise.all([
      this.prisma.expense.aggregate({
        where: { userId: userId, date: { gte: firstDay } },
        _sum: { amount: true }
      }),
      this.prisma.income.aggregate({
        where: { userId: userId, date: { gte: firstDay } },
        _sum: { amount: true }
      })
    ]);

    const totalExpense = Number(expenses._sum.amount || 0);
    const totalIncome = Number(incomes._sum.amount || 0);

    let ratio = 0;
    if (totalIncome > 0) {
      ratio = ((totalIncome - totalExpense) / totalIncome) * 100;
    }

    // Pequeña IA de estado financiero
    let status = 'PELIGRO'; // Gasta más de lo que ingresa
    if (ratio >= 20) status = 'EXCELENTE';
    else if (ratio >= 10) status = 'BUENO';
    else if (ratio > 0) status = 'REGULAR';

    return {
      month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      savingsRatio: Number(ratio.toFixed(2)),
      status: status
    };
  }

  // 3.3 Runway (Meses de supervivencia)
  async getFinancialRunway(userId: string) {
    // 1. Calculamos liquidez total
    const accounts = await this.prisma.account.findMany({
      where: { userId: userId },
      select: { balance: true }
    });
    const totalLiquidity = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // 2. Calculamos el gasto medio de los últimos 3 meses (90 días) para ser precisos
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentExpenses = await this.prisma.expense.aggregate({
      where: { userId: userId, date: { gte: ninetyDaysAgo } },
      _sum: { amount: true }
    });

    const threeMonthExpense = Number(recentExpenses._sum.amount || 0);
    const averageMonthlyExpense = threeMonthExpense / 3;

    // 3. Calculamos supervivencia (capeamos a 999 meses si no gasta nada para no romper el front)
    let runwayMonths = 999;
    if (averageMonthlyExpense > 0) {
      runwayMonths = totalLiquidity / averageMonthlyExpense;
    }

    return {
      totalLiquidity: Number(totalLiquidity.toFixed(2)),
      averageMonthlyExpense: Number(averageMonthlyExpense.toFixed(2)),
      runwayMonths: Number(runwayMonths.toFixed(1))
    };
  }

  // 4. Proyecciones: Previsión de saldo a fin de mes
  async getEndOfMonthForecast(userId: string) {
    const today = new Date();
    // Calculamos el último día del mes actual
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysRemaining = lastDayOfMonth.getDate() - today.getDate();

    // 1. Liquidez Actual (Saldo de todas las cuentas)
    const accounts = await this.prisma.account.findMany({
      where: { userId: userId },
      select: { balance: true }
    });
    const currentBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // 2. Gastos fijos pendientes (Suscripciones que vencen de aquí a final de mes)
    const pendingSubscriptions = await this.prisma.recurringPayment.aggregate({
      where: {
        userId: userId,
        active: true,
        nextDueDate: {
          gte: today, // Que venzan hoy o después
          lte: lastDayOfMonth // Pero antes de que acabe el mes
        }
      },
      _sum: { amount: true }
    });
    const pendingFixedExpenses = Number(pendingSubscriptions._sum.amount || 0);

    // 3. Estimación de gastos variables (Basado en el ritmo de este mes)
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const expensesSoFar = await this.prisma.expense.aggregate({
      where: {
        userId: userId,
        date: { gte: firstDayOfMonth, lte: today }
      },
      _sum: { amount: true }
    });

    const totalSpentSoFar = Number(expensesSoFar._sum.amount || 0);
    const daysPassed = today.getDate() === 0 ? 1 : today.getDate(); // Evitar dividir por 0
    const dailyAverage = totalSpentSoFar / daysPassed;
    
    // Lo que prevemos que vas a gastar en los días que quedan de mes
    const projectedVariableExpenses = dailyAverage * daysRemaining;

    // 4. Cálculo final del saldo proyectado
    const projectedBalance = currentBalance - pendingFixedExpenses - projectedVariableExpenses;

    return {
      daysRemaining: daysRemaining,
      currentBalance: Number(currentBalance.toFixed(2)),
      pendingFixedExpenses: Number(pendingFixedExpenses.toFixed(2)),
      projectedVariableExpenses: Number(projectedVariableExpenses.toFixed(2)),
      expectedEndOfMonthBalance: Number(projectedBalance.toFixed(2))
    };
  }
}
