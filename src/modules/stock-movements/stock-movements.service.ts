import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StockMovementType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateStockInDto } from './dto/create-stock-in.dto';
import { CreateStockOutDto } from './dto/create-stock-out.dto';

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(productId?: string) {
    return this.prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  stockIn(dto: CreateStockInDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      const resultingStock = product.currentStock + dto.quantity;
      await tx.product.update({
        where: { id: product.id },
        data: { currentStock: resultingStock },
      });

      return tx.stockMovement.create({
        data: {
          productId: product.id,
          userId,
          type: StockMovementType.IN,
          quantity: dto.quantity,
          previousStock: product.currentStock,
          resultingStock,
          reason: dto.reason,
        },
      });
    });
  }

  stockOut(dto: CreateStockOutDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      if (product.currentStock < dto.quantity) {
        throw new BadRequestException('Insufficient stock.');
      }

      const resultingStock = product.currentStock - dto.quantity;
      await tx.product.update({
        where: { id: product.id },
        data: { currentStock: resultingStock },
      });

      return tx.stockMovement.create({
        data: {
          productId: product.id,
          userId,
          type: StockMovementType.OUT,
          quantity: dto.quantity,
          previousStock: product.currentStock,
          resultingStock,
          reason: dto.reason,
        },
      });
    });
  }

  adjust(dto: AdjustStockDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      await tx.product.update({
        where: { id: product.id },
        data: { currentStock: dto.newStock },
      });

      return tx.stockMovement.create({
        data: {
          productId: product.id,
          userId,
          type: StockMovementType.ADJUST,
          quantity: Math.abs(dto.newStock - product.currentStock),
          previousStock: product.currentStock,
          resultingStock: dto.newStock,
          reason: dto.reason,
        },
      });
    });
  }
}
