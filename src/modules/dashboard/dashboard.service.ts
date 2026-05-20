import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [products, suppliersCount, lastMovements] = await Promise.all([
      this.prisma.product.findMany({
        select: {
          id: true,
          name: true,
          sku: true,
          currentStock: true,
          minStock: true,
          unitCost: true,
        },
      }),
      this.prisma.supplier.count(),
      this.prisma.stockMovement.findMany({
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const lowStockProducts = products.filter(
      (product) => product.currentStock <= product.minStock,
    );
    const stockQuantity = products.reduce(
      (total, product) => total + product.currentStock,
      0,
    );
    const inventoryValue = products.reduce(
      (total, product) =>
        total + product.currentStock * Number(product.unitCost),
      0,
    );

    return {
      productsCount: products.length,
      suppliersCount,
      lowStockCount: lowStockProducts.length,
      stockQuantity,
      inventoryValue,
      lowStockProducts: lowStockProducts.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        currentStock: product.currentStock,
        minStock: product.minStock,
      })),
      lastMovements,
    };
  }
}
