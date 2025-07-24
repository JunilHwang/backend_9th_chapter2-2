import { Injectable, Logger } from '@nestjs/common';
import { Product } from '@prisma/client';
import {
  BusinessExceptions,
  PaginatedResponse,
  ResponseUtil
} from '../../common';
import { ProductsRepository } from './products.repository';
import {
  GetProductsQueryDto,
  ProductResponseDto,
  ProductSummaryDto,
  ProductStatus
} from './products.dto';

/**
 * 상품 서비스
 */
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly productsRepository: ProductsRepository) {}

  /**
   * 상품 상세 조회
   */
  async getProductById(id: number): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw BusinessExceptions.productNotFound(id);
    }

    // 비활성화된 상품은 조회 불가
    if (product.status === ProductStatus.INACTIVE) {
      throw BusinessExceptions.productInactive(id);
    }

    return this.mapToProductResponse(product);
  }

  /**
   * 상품 목록 조회 (페이징)
   */
  async getProducts(query: GetProductsQueryDto): Promise<PaginatedResponse<ProductSummaryDto>> {
    const { page, size, skip, take } = ResponseUtil.normalizePagination(query.page, query.size);

    // 정렬 조건 설정
    const orderBy = {
      [query.sortBy || 'createdAt']: String(query.sortOrder || 'DESC').toLowerCase(),
    };

    // 필터 조건 설정
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    // 기본적으로 비활성화된 상품은 제외 (관리자 기능에서는 포함 가능)
    if (!query.status) {
      where.status = {
        not: ProductStatus.INACTIVE,
      };
    }

    const [products, total] = await Promise.all([
      this.productsRepository.findMany({
        skip,
        take,
        where,
        orderBy,
      }),
      this.productsRepository.count(where),
    ]);

    const productSummaries = products.map(product => this.mapToProductSummary(product));

    return ResponseUtil.createPaginatedResponse(productSummaries, page, size, total);
  }

  /**
   * 활성 상품만 조회 (주문 시 사용)
   */
  async getActiveProducts(): Promise<ProductSummaryDto[]> {
    const products = await this.productsRepository.findActiveProducts({
      orderBy: { name: 'asc' },
    });

    return products.map(product => this.mapToProductSummary(product));
  }

  /**
   * 여러 상품 ID로 조회 (주문 생성 시 사용)
   */
  async getProductsByIds(ids: number[]): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.findByIds(ids);

    // 존재하지 않는 상품 ID 체크
    const foundIds = products.map(p => p.id);
    const missingIds = ids.filter(id => !foundIds.includes(BigInt(id)));

    if (missingIds.length > 0) {
      throw BusinessExceptions.productNotFound(missingIds[0]);
    }

    return products.map(product => this.mapToProductResponse(product));
  }

  /**
   * 재고 확인 (주문 시 사용)
   */
  async checkStock(productId: number, requiredQuantity: number): Promise<boolean> {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw BusinessExceptions.productNotFound(productId);
    }

    if (product.status !== ProductStatus.ACTIVE) {
      throw BusinessExceptions.productInactive(productId);
    }

    return product.stockQuantity >= requiredQuantity;
  }

  /**
   * 상품 존재 여부 확인
   */
  async existsById(id: number): Promise<boolean> {
    const product = await this.productsRepository.findById(id);
    return !!product;
  }

  /**
   * Product 엔티티를 ProductResponseDto로 변환
   */
  private mapToProductResponse(product: Product): ProductResponseDto {
    return new ProductResponseDto({
      id: Number(product.id),
      name: product.name,
      price: product.price,
      stockQuantity: product.stockQuantity,
      status: product.status as ProductStatus,
      description: product.description,
      createdAt: product.createdAt.getTime(),
      updatedAt: product.updatedAt.getTime(),
    });
  }

  /**
   * Product 엔티티를 ProductSummaryDto로 변환
   */
  private mapToProductSummary(product: Product): ProductSummaryDto {
    return new ProductSummaryDto({
      id: Number(product.id),
      name: product.name,
      price: product.price,
      stockQuantity: product.stockQuantity,
      status: product.status as ProductStatus,
      createdAt: product.createdAt.getTime(),
    });
  }
}
