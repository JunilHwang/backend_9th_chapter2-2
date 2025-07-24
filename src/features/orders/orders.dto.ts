import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';

// ===============================
// Request DTOs
// ===============================

/**
 * 주문 상품 항목 DTO
 */
export class OrderItemDto {
  @ApiProperty({ description: '상품 ID', example: 101 })
  @IsNumber({}, { message: '상품 ID는 숫자여야 합니다.' })
  @IsPositive({ message: '상품 ID는 양수여야 합니다.' })
  productId: number;

  @ApiProperty({ description: '주문 수량', example: 2, minimum: 1 })
  @IsNumber({}, { message: '수량은 숫자여야 합니다.' })
  @Min(1, { message: '수량은 1개 이상이어야 합니다.' })
  quantity: number;
}

/**
 * 주문 생성 요청 DTO
 */
export class CreateOrderRequest {
  @ApiProperty({ description: '사용자 ID', example: 1 })
  @IsNumber({}, { message: '사용자 ID는 숫자여야 합니다.' })
  @IsPositive({ message: '사용자 ID는 양수여야 합니다.' })
  userId: number;

  @ApiProperty({
    description: '주문 상품 목록',
    type: [OrderItemDto],
    example: [
      { productId: 101, quantity: 2 },
      { productId: 102, quantity: 1 },
    ],
  })
  @IsArray({ message: '주문 상품 목록은 배열이어야 합니다.' })
  @IsNotEmpty({ message: '주문 상품 목록은 비어있을 수 없습니다.' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ description: '쿠폰 ID', example: 3001 })
  @IsOptional()
  @IsNumber({}, { message: '쿠폰 ID는 숫자여야 합니다.' })
  @IsPositive({ message: '쿠폰 ID는 양수여야 합니다.' })
  couponId?: number;
}

/**
 * 결제 처리 요청 DTO
 */
export class ProcessPaymentRequest {
  @ApiProperty({ description: '사용자 ID', example: 1 })
  @IsNumber({}, { message: '사용자 ID는 숫자여야 합니다.' })
  @IsPositive({ message: '사용자 ID는 양수여야 합니다.' })
  userId: number;
}

/**
 * 사용자 주문 목록 조회 쿼리 DTO
 */
export class GetUserOrdersQuery extends PaginationDto {
  @ApiPropertyOptional({
    description: '주문 상태 필터',
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    example: 'COMPLETED',
  })
  @IsOptional()
  @IsString()
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';

  @ApiPropertyOptional({
    description: '정렬 기준',
    enum: ['createdAt', 'finalAmount'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'finalAmount';

  @ApiPropertyOptional({
    description: '정렬 순서',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

// ===============================
// Response DTOs
// ===============================

/**
 * 주문 상품 상세 정보 DTO
 */
export class OrderItemDetailDto {
  @ApiProperty({ description: '상품 ID', example: 101 })
  productId: number;

  @ApiProperty({ description: '상품명', example: '무선 마우스' })
  productName: string;

  @ApiProperty({ description: '주문 시점 단가', example: 25000 })
  unitPrice: number;

  @ApiProperty({ description: '주문 수량', example: 2 })
  quantity: number;

  @ApiProperty({ description: '상품별 총 금액', example: 50000 })
  totalPrice: number;
}

/**
 * 적용된 쿠폰 정보 DTO
 */
export class AppliedCouponDto {
  @ApiProperty({ description: '쿠폰 ID', example: 3001 })
  couponId: number;

  @ApiProperty({ description: '쿠폰 코드', example: 'SALE10-ABC123' })
  couponCode: string;

  @ApiProperty({
    description: '할인 타입',
    enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
    example: 'PERCENTAGE',
  })
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @ApiProperty({ description: '할인값', example: 10 })
  discountValue: number;

  @ApiProperty({ description: '실제 할인 금액', example: 9500 })
  discountAmount: number;
}

/**
 * 결제 정보 DTO
 */
export class PaymentInfoDto {
  @ApiProperty({ description: '결제 ID', example: 2001 })
  paymentId: number;

  @ApiProperty({
    description: '결제 상태',
    enum: ['SUCCESS', 'FAILED'],
    example: 'SUCCESS',
  })
  status: 'SUCCESS' | 'FAILED';

  @ApiProperty({ description: '결제 일시', example: 1721211650000 })
  paidAt?: number;

  @ApiPropertyOptional({ description: '실패 사유' })
  failureReason?: string;
}

/**
 * 주문 생성 응답 DTO
 */
export class CreateOrderResponse {
  @ApiProperty({ description: '주문 ID', example: 1001 })
  orderId: number;

  @ApiProperty({
    description: '주문 상태',
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    example: 'PENDING',
  })
  status: 'PENDING' | 'COMPLETED' | 'FAILED';

  @ApiProperty({ description: '상품 총 금액', example: 95000 })
  totalAmount: number;

  @ApiProperty({ description: '할인 금액', example: 9500 })
  discountAmount: number;

  @ApiProperty({ description: '최종 결제 금액', example: 85500 })
  finalAmount: number;

  @ApiProperty({
    description: '주문 상품 목록',
    type: [OrderItemDetailDto],
  })
  items: OrderItemDetailDto[];

  @ApiPropertyOptional({ description: '적용된 쿠폰 정보' })
  coupon?: AppliedCouponDto;

  @ApiProperty({ description: '주문 생성 일시', example: 1721211600000 })
  createdAt: number;
}

/**
 * 결제 처리 응답 DTO
 */
export class ProcessPaymentResponse {
  @ApiProperty({ description: '결제 ID', example: 2001 })
  paymentId: number;

  @ApiProperty({ description: '주문 ID', example: 1001 })
  orderId: number;

  @ApiProperty({
    description: '결제 상태',
    enum: ['SUCCESS', 'FAILED'],
    example: 'SUCCESS',
  })
  status: 'SUCCESS' | 'FAILED';

  @ApiProperty({ description: '결제 금액', example: 85500 })
  amount: number;

  @ApiProperty({ description: '결제 전 잔액', example: 100000 })
  balanceBefore: number;

  @ApiProperty({ description: '결제 후 잔액', example: 14500 })
  balanceAfter: number;

  @ApiPropertyOptional({ description: '실패 사유' })
  failureReason?: string;

  @ApiProperty({ description: '결제 일시', example: 1721211650000 })
  paidAt: number;
}

/**
 * 주문 상세 조회 응답 DTO
 */
export class GetOrderResponse {
  @ApiProperty({ description: '주문 ID', example: 1001 })
  orderId: number;

  @ApiProperty({ description: '사용자 ID', example: 1 })
  userId: number;

  @ApiProperty({
    description: '주문 상태',
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    example: 'COMPLETED',
  })
  status: 'PENDING' | 'COMPLETED' | 'FAILED';

  @ApiProperty({ description: '상품 총 금액', example: 95000 })
  totalAmount: number;

  @ApiProperty({ description: '할인 금액', example: 9500 })
  discountAmount: number;

  @ApiProperty({ description: '최종 결제 금액', example: 85500 })
  finalAmount: number;

  @ApiProperty({
    description: '주문 상품 목록',
    type: [OrderItemDetailDto],
  })
  items: OrderItemDetailDto[];

  @ApiPropertyOptional({ description: '적용된 쿠폰 정보' })
  coupon?: AppliedCouponDto;

  @ApiPropertyOptional({ description: '결제 정보' })
  payment?: PaymentInfoDto;

  @ApiProperty({ description: '주문 생성 일시', example: 1721211600000 })
  createdAt: number;

  @ApiProperty({ description: '주문 수정 일시', example: 1721211650000 })
  updatedAt: number;
}

/**
 * 주문 요약 정보 DTO (목록 조회용)
 */
export class OrderSummaryDto {
  @ApiProperty({ description: '주문 ID', example: 1001 })
  orderId: number;

  @ApiProperty({
    description: '주문 상태',
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    example: 'COMPLETED',
  })
  status: 'PENDING' | 'COMPLETED' | 'FAILED';

  @ApiProperty({ description: '상품 총 금액', example: 95000 })
  totalAmount: number;

  @ApiProperty({ description: '할인 금액', example: 9500 })
  discountAmount: number;

  @ApiProperty({ description: '최종 결제 금액', example: 85500 })
  finalAmount: number;

  @ApiProperty({ description: '주문 상품 종류 수', example: 2 })
  itemCount: number;

  @ApiProperty({ description: '주문 생성 일시', example: 1721211600000 })
  createdAt: number;
}

/**
 * 사용자 주문 목록 응답 DTO
 */
export class GetUserOrdersResponse extends PaginationResponseDto<OrderSummaryDto> {
  @ApiProperty({
    description: '주문 목록',
    type: [OrderSummaryDto],
  })
  items: OrderSummaryDto[];
}

// ===============================
// Internal DTOs (Service Layer)
// ===============================

/**
 * 주문 금액 계산 결과 (내부 사용)
 */
export interface OrderAmountCalculation {
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  appliedCoupon?: AppliedCouponDto;
}

/**
 * 재고 차감 요청 (내부 사용)
 */
export interface StockDeductionRequest {
  productId: number;
  productName: string;
  requestedQuantity: number;
  currentStock: number;
  unitPrice: number;
}

/**
 * 주문 생성 내부 결과 (내부 사용)
 */
export interface OrderCreationResult {
  orderId: number;
  finalAmount: number;
  appliedCoupon?: AppliedCouponDto;
  stockDeductions: StockDeductionRequest[];
}
