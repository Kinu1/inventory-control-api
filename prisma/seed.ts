import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import {
  PrismaClient,
  StockMovementType,
  UserRole,
} from '@prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Admin Demo',
      email: 'admin@demo.com',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operador@demo.com' },
    update: {},
    create: {
      name: 'Operador Demo',
      email: 'operador@demo.com',
      passwordHash: await bcrypt.hash('Operador123!', 10),
      role: UserRole.OPERATOR,
    },
  });

  const hardware = await prisma.category.upsert({
    where: { name: 'Hardware' },
    update: {},
    create: { name: 'Hardware' },
  });

  const office = await prisma.category.upsert({
    where: { name: 'Escritorio' },
    update: {},
    create: { name: 'Escritorio' },
  });

  const supplier = await prisma.supplier.upsert({
    where: { name: 'Tech Distribuidora' },
    update: {},
    create: {
      name: 'Tech Distribuidora',
      email: 'contato@techdistribuidora.com',
      phone: '+55 11 99999-9999',
    },
  });

  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'NOTE-DELL-001' },
      update: {},
      create: {
        name: 'Notebook Dell Latitude',
        sku: 'NOTE-DELL-001',
        description: 'Notebook corporativo para equipe comercial.',
        currentStock: 12,
        minStock: 5,
        unitCost: 3499.9,
        categoryId: hardware.id,
        supplierId: supplier.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'MOUSE-LOGI-001' },
      update: {},
      create: {
        name: 'Mouse Logitech M170',
        sku: 'MOUSE-LOGI-001',
        currentStock: 4,
        minStock: 10,
        unitCost: 59.9,
        categoryId: hardware.id,
        supplierId: supplier.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'CADEIRA-ERG-001' },
      update: {},
      create: {
        name: 'Cadeira Ergonomica',
        sku: 'CADEIRA-ERG-001',
        currentStock: 8,
        minStock: 3,
        unitCost: 899.9,
        categoryId: office.id,
        supplierId: supplier.id,
      },
    }),
  ]);

  const existingMovements = await prisma.stockMovement.count();
  if (existingMovements === 0) {
    await prisma.stockMovement.createMany({
      data: products.map((product) => ({
        productId: product.id,
        userId: product.sku === 'MOUSE-LOGI-001' ? operator.id : admin.id,
        type: StockMovementType.IN,
        quantity: product.currentStock,
        previousStock: 0,
        resultingStock: product.currentStock,
        reason: 'Carga inicial de demonstracao.',
      })),
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
