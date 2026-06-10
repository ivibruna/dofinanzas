import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

//Configuramos el Pool nativo de Postgres
const connectionString = "postgresql://dofinanzas:dofinanzas@localhost:5433/dofinanzas_db?schema=public";
const pool = new Pool({ connectionString });

//Creamos el adaptador
const adapter = new PrismaPg(pool);

//Instanciamos Prisma
const prisma = new PrismaClient({ adapter });

async function main() {
  const userId = 'c03d99ae-e5ef-4622-96e5-7832625296e5';

  console.log('INICIO SEMILLADO DE DATOS');

  // 1. Asegurar el Usuario
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: 'demo.ingeniero@dofinanzas.com',
      password: '$2b$10$ep/1hE81jNToq1E1H1b.r.V5zM3mYI9Y7/O/z8Oq9Y4Y9r6/Q/K6m', 
      name: 'Ivan Demo',
    },
  });

  //Funciones para Categorías
  async function getExpenseCategory(name: string) {
    let category = await prisma.expenseCategory.findFirst({ where: { name, userId } });
    if (!category) {
      category = await prisma.expenseCategory.create({ data: { name, userId } });
    }
    return category.id;
  }

  async function getIncomeCategory(name: string) {
    let category = await prisma.incomeCategory.findFirst({ where: { name, userId } });
    if (!category) {
      category = await prisma.incomeCategory.create({ data: { name, userId } });
    }
    return category.id;
  }
  
  //Variables perfil
  const catVivienda = await getExpenseCategory('Vivienda');
  const catOcio = await getExpenseCategory('Ocio');
  const catComida = await getExpenseCategory('Alimentación');
  const catGym = await getExpenseCategory('Deporte');
  const catNomina = await getIncomeCategory('Nómina');

  //Limpieza total para el usuario
  console.log('LIMPIANDO DATOS ANTIGUOS');
  await prisma.expense.deleteMany({ where: { userId } });
  await prisma.income.deleteMany({ where: { userId } });
  await prisma.savingGoal.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId } });

  //Generamos cuentas para el usuario
  const accCorriente = await prisma.account.create({
    data: { userId, name: 'Cuenta Corriente BBVA', balance: 2500, type: 'BANK' } 
  });

  const accAhorro = await prisma.account.create({
    data: { userId, name: 'Cuenta Ahorro Revolut', balance: 9000, type: 'BANK' }
  });

  //Generamos historial para el usuario
  console.log('GENERAMOS HISTORIAL ULTIMOS 6 MESES DEL USUARIO');
  for (let m = 1; m <= 6; m++) {
    const mes = m.toString().padStart(2, '0');
    
    await prisma.income.create({
      data: {
        userId, accountId: accCorriente.id, categoryId: catNomina,
        amount: 2600, date: new Date(`2026-${mes}-01T10:00:00Z`), description: `Nómina Mes ${m}`
      }
    });

    await prisma.expense.create({
      data: {
        userId, accountId: accCorriente.id, categoryId: catVivienda,
        amount: 900, date: new Date(`2026-${mes}-05T10:00:00Z`), description: 'Alquiler'
      }
    });

    for (let i = 1; i <= 4; i++) {
      await prisma.expense.create({
        data: {
          userId, accountId: accCorriente.id, categoryId: catComida,
          amount: 70 + (Math.random() * 50), date: new Date(`2026-${mes}-${(i*7).toString().padStart(2, '0')}T12:00:00Z`), description: 'Super'
        }
      });
      await prisma.expense.create({
        data: {
          userId, accountId: accCorriente.id, categoryId: catOcio,
          amount: 40 + (Math.random() * 80), date: new Date(`2026-${mes}-${(i*7+2).toString().padStart(2, '0')}T21:00:00Z`), description: 'Cena/Ocio'
        }
      });
    }
  }

  //Generamos huchas
  await prisma.savingGoal.createMany({
    data: [
      { userId, name: 'Fondo de Emergencia', targetAmount: 12000, currentAmount: 8500, dueDate: new Date('2026-12-31') },
      { userId, name: 'Viaje a Japón', targetAmount: 3500, currentAmount: 1850, dueDate: new Date('2026-08-15') },
    ]
  });

  console.log('SEMILLADO DATOS COMPLETADO');
}

main()
  .catch((e) => {
    console.error('ERROR EN EL SEMILLLADO: ', e);
    process.exit(1);
  })
  .finally(async () => {
    // Cerramos Prisma
    await prisma.$disconnect();
    await pool.end();
  });
