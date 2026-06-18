import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt'; //Para que el encriptado de la contraseña funcione bien

// Configuramos el Pool nativo de Postgres
const connectionString = "postgresql://dofinanzas:dofinanzas@localhost:5433/dofinanzas_db?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// CREACION DE PERFILES EN BBDD

// FUNCION DE SEMILLADO: RAUL GARCIA
async function seedRaul(prisma: any, userId: string) {
  console.log('Iniciando inyección de datos para: RAÚL (25 años, Gestoría)...');

  // Funciones auxiliares necesarias
  async function getExpCat(name: string) {
    let cat = await prisma.expenseCategory.findFirst({ where: { name, userId } });
    if (!cat) cat = await prisma.expenseCategory.create({ data: { name, userId } });
    return cat.id;
  }
  async function getIncCat(name: string) {
    let cat = await prisma.incomeCategory.findFirst({ where: { name, userId } });
    if (!cat) cat = await prisma.incomeCategory.create({ data: { name, userId } });
    return cat.id;
  }

  const catNomina = await getIncCat('Nómina');
  const catTraspasoInc = await getIncCat('Traspaso Recibido');
  const catTraspasoExp = await getExpCat('Traspaso Emitido');
  const catInversion = await getExpCat('Inversión Indexada');
  const catAcciones = await getExpCat('Acciones y Valores');
  const catOcio = await getExpCat('Ocio y Restaurantes');
  const catGasolina = await getExpCat('Transporte y Gasolina');
  const catSuper = await getExpCat('Supermercado');
  const catGastosHormiga = await getExpCat('Gastos Hormiga');

  await prisma.expense.deleteMany({ where: { userId } });
  await prisma.income.deleteMany({ where: { userId } });
  await prisma.savingGoal.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId } });

  const accBBVA = await prisma.account.create({
    data: { userId, name: 'BBVA Cuenta Principal', balance: 180, type: 'BANK' } 
  });
  const accRevolut = await prisma.account.create({
    data: { userId, name: 'Revolut Viajes y Ocio', balance: 85, type: 'BANK' }
  });
  const accMyInvestor = await prisma.account.create({
    data: { userId, name: 'MyInvestor Inversiones', balance: 7450, type: 'INVESTMENT' }
  });

  for (let m = 1; m <= 6; m++) {
    const mes = m.toString().padStart(2, '0');
    const maxDias = m === 6 ? 15 : 28; 

    await prisma.income.create({
      data: { userId, accountId: accBBVA.id, categoryId: catNomina, amount: 1200, date: new Date(`2026-${mes}-01T08:00:00Z`), description: `Nómina Gestoría Mes ${m}` }
    });

    await prisma.expense.create({
      data: { userId, accountId: accBBVA.id, categoryId: catTraspasoExp, amount: 200, date: new Date(`2026-${mes}-02T09:00:00Z`), description: 'Transferencia periódica a MyInvestor' }
    });
    await prisma.income.create({
      data: { userId, accountId: accMyInvestor.id, categoryId: catTraspasoInc, amount: 200, date: new Date(`2026-${mes}-02T09:05:00Z`), description: 'Ingreso desde BBVA' }
    });
    
    await prisma.expense.create({
      data: { userId, accountId: accMyInvestor.id, categoryId: catInversion, amount: 150, date: new Date(`2026-${mes}-03T10:00:00Z`), description: 'Aportación MSCI World' }
    });
    await prisma.expense.create({
      data: { userId, accountId: accMyInvestor.id, categoryId: catInversion, amount: 50, date: new Date(`2026-${mes}-03T10:05:00Z`), description: 'Aportación Mercados Emergentes' }
    });

    await prisma.expense.create({
      data: { userId, accountId: accBBVA.id, categoryId: catTraspasoExp, amount: 400, date: new Date(`2026-${mes}-02T09:30:00Z`), description: 'Recarga mensual Revolut' }
    });
    await prisma.income.create({
      data: { userId, accountId: accRevolut.id, categoryId: catTraspasoInc, amount: 400, date: new Date(`2026-${mes}-02T09:35:00Z`), description: 'Recarga mensual BBVA' }
    });

    await prisma.expense.create({
      data: { userId, accountId: accBBVA.id, categoryId: catGasolina, amount: 45 + (Math.random() * 15), date: new Date(`2026-${mes}-05T18:30:00Z`), description: 'Gasolinera Repsol' }
    });
    await prisma.expense.create({
      data: { userId, accountId: accBBVA.id, categoryId: catSuper, amount: 30 + (Math.random() * 20), date: new Date(`2026-${mes}-12T19:00:00Z`), description: 'Supermercado Local' }
    });
    
    for (let i = 0; i < 4; i++) {
        let randomDay = Math.floor(Math.random() * maxDias) + 1;
        await prisma.expense.create({
            data: { userId, accountId: accBBVA.id, categoryId: catGastosHormiga, amount: 1.50, date: new Date(`2026-${mes}-${randomDay.toString().padStart(2, '0')}T08:15:00Z`), description: 'Café Bar Plaza' }
        });
    }

    await prisma.expense.create({
      data: { userId, accountId: accRevolut.id, categoryId: catOcio, amount: 22.50, date: new Date(`2026-${mes}-08T22:30:00Z`), description: 'Bizum Cena Amigos' }
    });
    await prisma.expense.create({
      data: { userId, accountId: accRevolut.id, categoryId: catOcio, amount: 15, date: new Date(`2026-${mes}-14T23:45:00Z`), description: 'Copas Discoteca' }
    });
    await prisma.expense.create({
      data: { userId, accountId: accRevolut.id, categoryId: catOcio, amount: 35, date: new Date(`2026-${mes}-20T14:30:00Z`), description: 'Comida Hamburguesería' }
    });

    if (m === 3) { 
      await prisma.expense.create({
        data: { userId, accountId: accMyInvestor.id, categoryId: catAcciones, amount: 200, date: new Date(`2026-03-15T16:00:00Z`), description: 'Compra 3x Acciones Alibaba (BABA)' }
      });
    }
    if (m === 5) { 
      await prisma.expense.create({
        data: { userId, accountId: accMyInvestor.id, categoryId: catAcciones, amount: 150, date: new Date(`2026-05-10T16:30:00Z`), description: 'Compra Acciones Porsche' }
      });
    }
  }

  await prisma.savingGoal.create({
    data: { userId, name: 'Cambio de Coche (Segunda Mano)', targetAmount: 6000, currentAmount: 1200, dueDate: new Date('2027-06-01') }
  });

  console.log('OK! Datos de RAÚL generados correctamente.');
}

// FUNCION DE SEMILLADO: SERGIO
async function seedSergio(prisma: any, userId: string) {
  console.log('Iniciando inyección de datos para: SERGIO (22 años, Guardia Civil)...');

  // Funciones auxiliares
  async function getExpCat(name: string) {
    let cat = await prisma.expenseCategory.findFirst({ where: { name, userId } });
    if (!cat) cat = await prisma.expenseCategory.create({ data: { name, userId } });
    return cat.id;
  }
  async function getIncCat(name: string) {
    let cat = await prisma.incomeCategory.findFirst({ where: { name, userId } });
    if (!cat) cat = await prisma.incomeCategory.create({ data: { name, userId } });
    return cat.id;
  }

  // Categorias
  const catNomina = await getIncCat('Nómina');
  const catTraspasoInc = await getIncCat('Traspaso Recibido');
  const catTraspasoExp = await getExpCat('Traspaso Emitido');
  const catVivienda = await getExpCat('Alquiler y Suministros');
  const catSuscripciones = await getExpCat('Suscripciones');
  const catSuper = await getExpCat('Supermercado');
  const catCoche = await getExpCat('Coche y Mantenimiento');
  const catSeguros = await getExpCat('Seguros');

  // Limpieza
  await prisma.expense.deleteMany({ where: { userId } });
  await prisma.income.deleteMany({ where: { userId } });
  await prisma.savingGoal.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId } });

  // Cuentas
  const accCaixa = await prisma.account.create({
    data: { userId, name: 'CaixaBank Nómina', balance: 1200, type: 'BANK' }
  });
  const accMediolanum = await prisma.account.create({
    data: { userId, name: 'Mediolanum Ahorro', balance: 16500, type: 'BANK' }
  });

  // Historial (Enero - Junio 2026)
  for (let m = 1; m <= 6; m++) {
    const mes = m.toString().padStart(2, '0');
    const maxDias = m === 6 ? 15 : 28;

    // Ingreso
    await prisma.income.create({
      data: { userId, accountId: accCaixa.id, categoryId: catNomina, amount: 2000, date: new Date(`2026-${mes}-01T08:00:00Z`), description: `Nómina Guardia Civil Mes ${m}` }
    });

    // Gastos Fijos
    await prisma.expense.create({
      data: { userId, accountId: accCaixa.id, categoryId: catVivienda, amount: 650, date: new Date(`2026-${mes}-03T09:00:00Z`), description: 'Alquiler Piso Valencia' }
    });
    await prisma.expense.create({
      data: { userId, accountId: accCaixa.id, categoryId: catVivienda, amount: 60, date: new Date(`2026-${mes}-05T10:00:00Z`), description: 'Recibo Luz' }
    });

    // Suscripciones
    await prisma.expense.create({
      data: { userId, accountId: accCaixa.id, categoryId: catSuscripciones, amount: 40, date: new Date(`2026-${mes}-02T08:00:00Z`), description: 'Cuota Gimnasio' }
    });
    await prisma.expense.create({
      data: { userId, accountId: accCaixa.id, categoryId: catSuscripciones, amount: 15.99, date: new Date(`2026-${mes}-10T12:00:00Z`), description: 'Netflix' }
    });
    await prisma.expense.create({
      data: { userId, accountId: accCaixa.id, categoryId: catSuscripciones, amount: 10.99, date: new Date(`2026-${mes}-15T12:00:00Z`), description: 'Spotify Premium' }
    });

    // Ahorro (Traspaso a Mediolanum)
    const ahorroMensual = m === 6 ? 250 : 700;
    await prisma.expense.create({
      data: { userId, accountId: accCaixa.id, categoryId: catTraspasoExp, amount: ahorroMensual, date: new Date(`2026-${mes}-06T09:00:00Z`), description: 'Traspaso mensual a hucha' }
    });
    await prisma.income.create({
      data: { userId, accountId: accMediolanum.id, categoryId: catTraspasoInc, amount: ahorroMensual, date: new Date(`2026-${mes}-06T09:05:00Z`), description: 'Ahorro desde CaixaBank' }
    });

    // Supermercado y Gasolina
    for (let i = 1; i <= 3; i++) {
      let randomDay = Math.floor(Math.random() * maxDias) + 1;
      await prisma.expense.create({
        data: { userId, accountId: accCaixa.id, categoryId: catSuper, amount: 60 + (Math.random() * 30), date: new Date(`2026-${mes}-${randomDay.toString().padStart(2, '0')}T18:00:00Z`), description: 'Mercadona' }
      });
    }
    await prisma.expense.create({
      data: { userId, accountId: accCaixa.id, categoryId: catCoche, amount: 55, date: new Date(`2026-${mes}-12T16:00:00Z`), description: 'Gasolina' }
    });

    // Eventos anomalos
    if (m === 2) {
      // Seguro Anual del Coche
      await prisma.expense.create({
        data: { userId, accountId: accCaixa.id, categoryId: catSeguros, amount: 450, date: new Date(`2026-02-18T10:00:00Z`), description: 'Seguro Coche (Anual)' }
      });
    }

    if (m === 6) {
      // Gastos del coche
      await prisma.expense.create({
        data: { userId, accountId: accCaixa.id, categoryId: catCoche, amount: 300, date: new Date(`2026-06-04T11:30:00Z`), description: 'Cambio 4 Neumáticos Michelin' }
      });
      await prisma.expense.create({
        data: { userId, accountId: accCaixa.id, categoryId: catCoche, amount: 54.90, date: new Date(`2026-06-08T09:15:00Z`), description: 'Tasas ITV (Desfavorable)' }
      });
      await prisma.expense.create({
        data: { userId, accountId: accCaixa.id, categoryId: catCoche, amount: 25.50, date: new Date(`2026-06-14T10:00:00Z`), description: 'Tasas ITV (2ª Revisión)' }
      });
    }
  }

  // Huchas
  await prisma.savingGoal.createMany({
    data: [
      { userId, name: 'Viaje a Brasil (Septiembre)', targetAmount: 2500, currentAmount: 1800, dueDate: new Date('2026-09-01') },
      { userId, name: 'Fondo de Emergencia', targetAmount: 15000, currentAmount: 14700, dueDate: new Date('2027-12-31') }
    ]
  });

  console.log('OK! Datos de SERGIO generados correctamente.');
}

// FUNCION DE SEMILLADO: LUCIA MADRID
async function seedLucia(prisma: any, userId: string) {
  console.log('Iniciando inyección de datos para: LUCÍA (24 años, Estudiante/Desempleada)...');

  // Funciones auxiliares
  async function getExpCat(name: string) {
    let cat = await prisma.expenseCategory.findFirst({ where: { name, userId } });
    if (!cat) cat = await prisma.expenseCategory.create({ data: { name, userId } });
    return cat.id;
  }
  async function getIncCat(name: string) {
    let cat = await prisma.incomeCategory.findFirst({ where: { name, userId } });
    if (!cat) cat = await prisma.incomeCategory.create({ data: { name, userId } });
    return cat.id;
  }

  // Categorias
  const catPaga = await getIncCat('Paga Familiar');
  const catOcio = await getExpCat('Ocio y Bizums');
  const catRopaEventos = await getExpCat('Ropa y Eventos');

  // Limpieza
  await prisma.expense.deleteMany({ where: { userId } });
  await prisma.income.deleteMany({ where: { userId } });
  await prisma.savingGoal.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId } });

  // Cuentas
  const accSantander = await prisma.account.create({
    data: { userId, name: 'Banco Santander Smart', balance: 120, type: 'BANK' }
  });
  const accRevolut = await prisma.account.create({
    data: { userId, name: 'Revolut Viajes', balance: 20, type: 'BANK' }
  });

  // Historial (Enero - Junio 2026)
  for (let m = 1; m <= 6; m++) {
    const mes = m.toString().padStart(2, '0');
    
    // Ingreso familiar a principios de mes
    await prisma.income.create({
      data: { userId, accountId: accSantander.id, categoryId: catPaga, amount: 200, date: new Date(`2026-${mes}-02T10:00:00Z`), description: 'Paga mensual padres' }
    });

    // Gastos
    await prisma.expense.create({
      data: { userId, accountId: accSantander.id, categoryId: catOcio, amount: 25, date: new Date(`2026-${mes}-10T20:00:00Z`), description: 'Bizum Cena' }
    });
    
    if (m !== 6) { // En junio aún no ha gastado esto
        await prisma.expense.create({
        data: { userId, accountId: accSantander.id, categoryId: catOcio, amount: 40, date: new Date(`2026-${mes}-22T18:30:00Z`), description: 'Gastos fin de semana' }
        });
    }

    // Eventos anomalos
    if (m === 5) {
      // En mayo compró la entrada del festival
      await prisma.expense.create({
        data: { userId, accountId: accSantander.id, categoryId: catRopaEventos, amount: 95, date: new Date(`2026-05-15T12:00:00Z`), description: 'Abono Festival Septiembre' }
      });
    }
  }

  // Huchas
  await prisma.savingGoal.createMany({
    data: [
      { userId, name: 'Regalo Boda Septiembre', targetAmount: 150, currentAmount: 0, dueDate: new Date('2026-09-10') },
      { userId, name: 'Gastos Festival (Comida/Bebida)', targetAmount: 100, currentAmount: 15, dueDate: new Date('2026-09-01') }
    ]
  });

  console.log('OK! Datos de LUCIA generados correctamente.');
}

// FUNCION DE SEMILLADO: CARLOS
async function seedCarlos(prisma: any, userId: string) {
  console.log('Iniciando inyección de datos para: CARLOS (38 años, Rentista e Informático)...');

  // Funciones auxiliares
  async function getExpCat(name: string) {
    let cat = await prisma.expenseCategory.findFirst({ where: { name, userId } });
    if (!cat) cat = await prisma.expenseCategory.create({ data: { name, userId } });
    return cat.id;
  }
  async function getIncCat(name: string) {
    let cat = await prisma.incomeCategory.findFirst({ where: { name, userId } });
    if (!cat) cat = await prisma.incomeCategory.create({ data: { name, userId } });
    return cat.id;
  }

  // Categorías
  const catNomina = await getIncCat('Nómina Consultoría');
  const catAlquileres = await getIncCat('Ingreso Inquilinos');
  const catTraspasoInc = await getIncCat('Traspaso Recibido');
  
  const catTraspasoExp = await getExpCat('Traspaso Emitido');
  const catHipoteca = await getExpCat('Hipotecas e IBI');
  const catCripto = await getExpCat('Inversión Criptomonedas');
  const catOcioViajes = await getExpCat('Ocio y Vuelos');
  const catRestaurantes = await getExpCat('Restaurantes y Personal');

  // Limpieza
  await prisma.expense.deleteMany({ where: { userId } });
  await prisma.income.deleteMany({ where: { userId } });
  await prisma.savingGoal.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId } });

  // Cuentas
  const accBBVA = await prisma.account.create({
    data: { userId, name: 'BBVA Personal y Nómina', balance: 3200, type: 'BANK' }
  });
  const accBankinter = await prisma.account.create({
    data: { userId, name: 'Bankinter Gestión Inmobiliaria', balance: 350, type: 'BANK' } 
  });
  const accKraken = await prisma.account.create({
    data: { userId, name: 'Kraken / Ledger (BTC)', balance: 42000, type: 'INVESTMENT' }
  });
  const accConjunta = await prisma.account.create({
    data: { userId, name: 'Cuenta Conjunta (China)', balance: 3500, type: 'BANK' }
  });

  // Historial (Enero - Junio 2026)
  for (let m = 1; m <= 6; m++) {
    const mes = m.toString().padStart(2, '0');
    const maxDias = m === 6 ? 15 : 28;

    // Ingresos
    await prisma.income.create({
      data: { userId, accountId: accBBVA.id, categoryId: catNomina, amount: 1900, date: new Date(`2026-${mes}-01T08:00:00Z`), description: `Nómina Consultoría Mes ${m}` }
    });
    
    await prisma.income.create({
      data: { userId, accountId: accBankinter.id, categoryId: catAlquileres, amount: 800, date: new Date(`2026-${mes}-02T10:00:00Z`), description: 'Alquiler Piso Centro' }
    });

    await prisma.income.create({
      data: { userId, accountId: accBankinter.id, categoryId: catAlquileres, amount: 750, date: new Date(`2026-${mes}-03T10:00:00Z`), description: 'Alquiler Piso Universidad' }
    });

    // Gastos inmoviliarios
    await prisma.expense.create({
      data: { userId, accountId: accBankinter.id, categoryId: catHipoteca, amount: 550, date: new Date(`2026-${mes}-05T08:00:00Z`), description: 'Hipoteca Piso Centro' }
    });
    await prisma.expense.create({
      data: { userId, accountId: accBankinter.id, categoryId: catHipoteca, amount: 480, date: new Date(`2026-${mes}-05T08:05:00Z`), description: 'Hipoteca Piso Universidad' }
    });
    await prisma.expense.create({
      data: { userId, accountId: accBankinter.id, categoryId: catHipoteca, amount: 110, date: new Date(`2026-${mes}-10T09:00:00Z`), description: 'Comunidad Inmuebles' }
    });

    // Inversion y cuenta conjunta
    await prisma.expense.create({
      data: { userId, accountId: accBBVA.id, categoryId: catTraspasoExp, amount: 200, date: new Date(`2026-${mes}-06T10:00:00Z`), description: 'Envío a Exchange' }
    });
    await prisma.income.create({
      data: { userId, accountId: accKraken.id, categoryId: catTraspasoInc, amount: 200, date: new Date(`2026-${mes}-06T10:05:00Z`), description: 'Fondeo desde BBVA' }
    });
    await prisma.expense.create({
      data: { userId, accountId: accKraken.id, categoryId: catCripto, amount: 200, date: new Date(`2026-${mes}-06T10:10:00Z`), description: 'Compra de Bitcoin (DCA)' }
    });

    await prisma.expense.create({
      data: { userId, accountId: accBBVA.id, categoryId: catTraspasoExp, amount: 300, date: new Date(`2026-${mes}-07T12:00:00Z`), description: 'Aportación Viaje a China' }
    });
    await prisma.income.create({
      data: { userId, accountId: accConjunta.id, categoryId: catTraspasoInc, amount: 300, date: new Date(`2026-${mes}-07T12:05:00Z`), description: 'Aportación Carlos' }
    });

    // Vida personal
    for (let i = 0; i < 3; i++) {
       let randomDay = Math.floor(Math.random() * maxDias) + 1;
       await prisma.expense.create({
          data: { userId, accountId: accBBVA.id, categoryId: catRestaurantes, amount: 40 + (Math.random() * 30), date: new Date(`2026-${mes}-${randomDay.toString().padStart(2, '0')}T21:00:00Z`), description: 'Restaurante / Compras' }
       });
    }

    // Eventos
    if (m === 3) {
      await prisma.expense.create({
        data: { userId, accountId: accBBVA.id, categoryId: catOcioViajes, amount: 1450, date: new Date(`2026-03-12T16:00:00Z`), description: 'Vuelos I/V Pekín (2 personas)' }
      });
    }
    if (m === 5) {
      await prisma.expense.create({
        data: { userId, accountId: accBankinter.id, categoryId: catHipoteca, amount: 450, date: new Date(`2026-05-20T09:00:00Z`), description: 'IBI Pisos (Ayuntamiento)' }
      });
      await prisma.expense.create({
        data: { userId, accountId: accBankinter.id, categoryId: catHipoteca, amount: 280, date: new Date(`2026-05-25T09:00:00Z`), description: 'Seguro Hogar Inquilinos' }
      });
    }
  }

  // Huchas
  await prisma.savingGoal.createMany({
    data: [
      { userId, name: 'Viaje a China (Noviembre)', targetAmount: 6000, currentAmount: 3500, dueDate: new Date('2026-11-01') },
      { userId, name: 'Provisión IRPF Renta', targetAmount: 3000, currentAmount: 1500, dueDate: new Date('2027-06-30') }
    ]
  });

  console.log('OK! Datos de CARLOS generados correctamente.');
}


// MAIN
async function main() {
  console.log('INICIO SEMILLADO DE DATOS (PERFILES TFM)');

  // ID fijos para no duplicar si lanzamos varias veces este archivo
  const raulUserId = '11111111-1111-1111-1111-111111111111';
  const sergioUserId = '22222222-2222-2222-2222-222222222222';
  const luciaUserId = '33333333-3333-3333-3333-333333333333';
  const carlosUserId = '44444444-4444-4444-4444-444444444444';

  // Generamos los hashes estandar para que no haya problema al ejecutar desde SWAGGER
  const hashRaul = await bcrypt.hash('passRAUL', 10);
  const hashSergio = await bcrypt.hash('passSERGIO', 10);
  const hashLucia = await bcrypt.hash('passLUCIA', 10);
  const hashCarlos = await bcrypt.hash('passCARLOS', 10);

  // Crear usuarioos
  await prisma.user.upsert({
    where: { id: raulUserId },
    update: {},
    create: {
      id: raulUserId,
      email: 'raulgarcia.finanzas@gmail.com',
      password: hashRaul, 
      name: 'Raul',
    },
  });
  await seedRaul(prisma, raulUserId);
  
  await prisma.user.upsert({
    where: { id: sergioUserId },
    update: {},
    create: {
      id: sergioUserId,
      email: 'sergioba03@gmail.com',
      password: hashSergio, 
      name: 'Sergio',
    },
  });
  await seedSergio(prisma, sergioUserId);
  
  await prisma.user.upsert({
    where: { id: luciaUserId },
    update: {},
    create: {
      id: luciaUserId,
      email: 'luciamadridabad01@gmail.com',
      password: hashLucia, 
      name: 'Lucia',
    },
  });
  await seedLucia(prisma, luciaUserId);

  await prisma.user.upsert({
    where: { id: carlosUserId },
    update: {},
    create: {
      id: carlosUserId,
      email: 'carlos.colegantt@gmail.com',
      password: hashCarlos, 
      name: 'Carlos',
    },
  });
  await seedCarlos(prisma, carlosUserId);

  console.log('SEMILLADO TOTAL COMPLETADO CON ÉXITO');
}

main()
  .catch((e) => {
    console.error('ERROR EN EL SEMILLADO: ', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });