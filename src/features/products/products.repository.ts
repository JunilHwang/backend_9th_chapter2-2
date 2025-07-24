import { Injectable } from '@nestjs/common';
import { Prisma, Product, ProductStatus as PrismaProductStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure';
import { ProductStatus } from './products.dto';

/**
 * 상품 조회 옵션 인터페이스
 */
export interface FindProductsOptions {
  skip?: number;
  take?: number;
  where?: Prisma.ProductWhereInput;
  orderBy?: Prisma.ProductOrderByWithRelationInput;
}

/**
 * 상품 Repository
 */
@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 상품 ID로 단일 상품 조회
   */
  async findById(id: number): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  /**
   * 상품 목록 조회 (페이징)
   */
  async findMany(options: FindProductsOptions = {}): Promise<Product[]> {
    const { skip = 0, take = 20, where, orderBy } = options;

    return this.prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
    });
  }

  /**
   * 상품 총 개수 조회
   */
  async count(where?: Prisma.ProductWhereInput): Promise<number> {
    return this.prisma.product.count({ where });
  }

  /**
   * 여러 상품 ID로 조회
   */
  async findByIds(ids: number[]): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  /**
   * 상품 상태별 조회
   */
  async findByStatus(status: ProductStatus): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        status: status as PrismaProductStatus,
      },
    });
  }

  /**
   * 활성 상품만 조회
   */
  async findActiveProducts(options: FindProductsOptions = {}): Promise<Product[]> {
    return this.findMany({
      ...options,
      where: {
        ...options.where,
        status: PrismaProductStatus.ACTIVE,
      },
    });
  }

  /**
   * 상품 생성 (향후 확장용)
   */
  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  /**
   * 상품 수정 (향후 확장용)
   */
  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * 재고 감소 (트랜잭션 내에서 사용, 향후 주문 기능용)
   */
  async decreaseStock(
    id: number,
    quantity: number,
    tx?: Prisma.TransactionClient
  ): Promise<Product> {
    const client = tx || this.prisma;

    return client.product.update({
      where: { id },
      data: {
        stockQuantity: {
          decrement: quantity,
        },
      },
    });
  }

  /**
   * 재고 증가 (환불/취소 시 사용, 향후 확장용)
   */
  async increaseStock(
    id: number,
    quantity: number,
    tx?: Prisma.TransactionClient
  ): Promise<Product> {
    const client = tx || this.prisma;

    return client.product.update({
      where: { id },
      data: {
        stockQuantity: {
          increment: quantity,
        },
      },
    });
  }
}
