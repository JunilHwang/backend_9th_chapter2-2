import { IsNumber, IsPositive, Min, IsOptional, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * 거래 유형 enum
 */
export enum TransactionType {
  CHARGE = 'CHARGE',
  USE = 'USE', 
  REFUND = 'REFUND',
}

/**
 * 잔액 충전 요청 DTO
 */
export class ChargeBalanceRequestDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  userId: number;

  @IsNumber()
  @IsPositive()
  @Min(1, { message: '충전 금액은 1원 이상이어야 합니다.' })
  @Type(() => Number)
  amount: number;
}

/**
 * 잔액 충전 응답 DTO
 */
export class ChargeBalanceResponseDto {
  userId: number;
  chargedAmount: number;
  currentBalance: number;
  chargedAt: number; // timestamp

  constructor(partial: Partial<ChargeBalanceResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * 잔액 조회 응답 DTO
 */
export class GetBalanceResponseDto {
  userId: number;
  currentBalance: number;
  dailyChargedAmount: number;
  lastUpdatedAt: number; // timestamp

  constructor(partial: Partial<GetBalanceResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * 거래 이력 응답 DTO
 */
export class BalanceTransactionDto {
  id: number;
  userId: number;
  transactionType: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  createdAt: number; // timestamp

  constructor(partial: Partial<BalanceTransactionDto>) {
    Object.assign(this, partial);
  }
}

/**
 * 잔액 검증 결과 DTO (내부 사용)
 */
export class BalanceValidationDto {
  isValid: boolean;
  currentBalance: number;
  dailyChargedAmount: number;
  errorCode?: string;
  errorMessage?: string;
  details?: {
    dailyLimit?: number;
    maxBalanceLimit?: number;
    attemptedAmount?: number;
    currentDailyCharged?: number;
    currentBalance?: number;
  };

  constructor(partial: Partial<BalanceValidationDto>) {
    Object.assign(this, partial);
  }
}

/**
 * 잔액 업데이트 결과 DTO (내부 사용)
 */
export class BalanceUpdateResultDto {
  userId: number;
  transactionId: number;
  balanceBefore: number;
  balanceAfter: number;
  amount: number;
  transactionType: TransactionType;
  timestamp: number;

  constructor(partial: Partial<BalanceUpdateResultDto>) {
    Object.assign(this, partial);
  }
}
