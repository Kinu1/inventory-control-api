import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

type ProductWithRelations = Product & {
  category?: { id: string; name: string };
  supplier?: { id: string; name: string } | null;
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        description: dto.description,
        minStock: dto.minStock,
        unitCost: dto.unitCost,
        categoryId: dto.categoryId,
        supplierId: dto.supplierId,
      },
      include: this.defaultInclude(),
    });

    return this.serializeProduct(product);
  }

  async findAll(search?: string, lowStock?: boolean) {
    const products = await this.prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: this.defaultInclude(),
      orderBy: { createdAt: 'desc' },
    });

    const filteredProducts = lowStock
      ? products.filter((product) => product.currentStock <= product.minStock)
      : products;

    return filteredProducts.map((product) => this.serializeProduct(product));
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return this.serializeProduct(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        sku: dto.sku,
        description: dto.description,
        minStock: dto.minStock,
        unitCost: dto.unitCost,
        categoryId: dto.categoryId,
        supplierId: dto.supplierId,
      },
      include: this.defaultInclude(),
    });

    return this.serializeProduct(product);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { deleted: true };
  }

  serializeProduct(product: ProductWithRelations) {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      currentStock: product.currentStock,
      minStock: product.minStock,
      unitCost: Number(product.unitCost),
      isLowStock: product.currentStock <= product.minStock,
      category: product.category,
      supplier: product.supplier,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private defaultInclude() {
    return {
      category: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
    };
  }
}
