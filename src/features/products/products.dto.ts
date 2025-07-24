import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '../../common';

/**
 * 상품 상태 enum
 */
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

/**
 * 상품 목록 조회 쿼리 DTO
 */
export class GetProductsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsEnum(['name', 'price', 'createdAt'])
  sortBy?: 'name' | 'price' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  size?: number = 20;
}

/**
 * 상품 상세 응답 DTO
 */
export class ProductResponseDto {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  status: ProductStatus;
  description?: string;
  createdAt: number;
  updatedAt: number;

  constructor(partial: Partial<ProductResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * 상품 목록 응답 DTO (요약 정보)
 */
export class ProductSummaryDto {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  status: ProductStatus;
  createdAt: number;

  constructor(partial: Partial<ProductSummaryDto>) {
    Object.assign(this, partial);
  }
}

/**
 * 상품 생성 DTO (향후 확장용)
 */
export class CreateProductDto {
  name: string;
  price: number;
  stockQuantity: number;
  description?: string;
}

/**
 * 상품 수정 DTO (향후 확장용)
 */
export class UpdateProductDto {
  name?: string;
  price?: number;
  stockQuantity?: number;
  status?: ProductStatus;
  description?: string;
}