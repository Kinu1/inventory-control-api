/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { StockMovementType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StockMovementsService } from './stock-movements.service';

describe('StockMovementsService', () => {
  let service: StockMovementsService;
  const tx = {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    stockMovement: {
      create: jest.fn(),
    },
  };
  const prisma = {
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
    stockMovement: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        StockMovementsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(StockMovementsService);
  });

  it('blocks stock out when quantity is greater than current stock', async () => {
    tx.product.findUnique.mockResolvedValue({
      id: 'product-1',
      currentStock: 2,
    });

    await expect(
      service.stockOut(
        { productId: 'product-1', quantity: 3, reason: 'Venda interna' },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a stock in movement and updates product stock', async () => {
    tx.product.findUnique.mockResolvedValue({
      id: 'product-1',
      currentStock: 5,
    });
    tx.stockMovement.create.mockResolvedValue({
      id: 'movement-1',
      type: StockMovementType.IN,
      resultingStock: 8,
    });

    await service.stockIn(
      { productId: 'product-1', quantity: 3, reason: 'Compra' },
      'user-1',
    );

    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { currentStock: 8 },
    });
    expect(tx.stockMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining<Record<string, unknown>>({
        type: StockMovementType.IN,
        quantity: 3,
        previousStock: 5,
        resultingStock: 8,
      }),
    });
  });
});
