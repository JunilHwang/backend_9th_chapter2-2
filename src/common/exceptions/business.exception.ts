import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorMessages } from '../types/error.type';

/**
 * 비즈니스 로직 예외 클래스
 */
export class BusinessException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    public readonly details?: any,
    message?: string,
    statusCode?: HttpStatus,
  ) {
    const errorMessage = message || ErrorMessages[errorCode];
    const httpStatus = statusCode || BusinessException.getHttpStatus(errorCode);
    
    super(
      {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          details,
        },
        timestamp: Date.now(),
      },
      httpStatus,
    );
  }

  /**
   * 에러 코드에 따른 HTTP 상태 코드 매핑
   */
  private static getHttpStatus(errorCode: ErrorCode): HttpStatus {
    switch (errorCode) {
      // 404 NOT_FOUND
      case ErrorCode.USER_NOT_FOUND:
      case ErrorCode.PRODUCT_NOT_FOUND:
      case ErrorCode.ORDER_NOT_FOUND:
      case ErrorCode.COUPON_NOT_FOUND:
      case ErrorCode.COUPON_EVENT_NOT_FOUND:
        return HttpStatus.NOT_FOUND;

      // 409 CONFLICT
      case ErrorCode.COUPON_EXHAUSTED:
      case ErrorCode.OPTIMISTIC_LOCK_ERROR:
      case ErrorCode.CONCURRENT_MODIFICATION:
      case ErrorCode.DUPLICATE_COUPON_ISSUE:
        return HttpStatus.CONFLICT;

      // 400 BAD_REQUEST (기본)
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }
}

/**
 * 편의 메서드들
 */
export class BusinessExceptions {
  // 잔액 관련
  static insufficientBalance(details?: any) {
    return new BusinessException(ErrorCode.INSUFFICIENT_BALANCE, details);
  }

  static dailyChargeLimitExceeded(details?: any) {
    return new BusinessException(ErrorCode.DAILY_CHARGE_LIMIT_EXCEEDED, details);
  }

  static maxBalanceLimitExceeded(details?: any) {
    return new BusinessException(ErrorCode.MAX_BALANCE_LIMIT_EXCEEDED, details);
  }

  // 상품 관련
  static productNotFound(productId: number) {
    return new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, { productId });
  }

  static outOfStock(details?: any) {
    return new BusinessException(ErrorCode.OUT_OF_STOCK, details);
  }

  static productInactive(productId: number) {
    return new BusinessException(ErrorCode.PRODUCT_INACTIVE, { productId });
  }

  // 주문 관련
  static orderNotFound(orderId: number) {
    return new BusinessException(ErrorCode.ORDER_NOT_FOUND, { orderId });
  }

  static orderAlreadyPaid(orderId: number) {
    return new BusinessException(ErrorCode.ORDER_ALREADY_PAID, { orderId });
  }

  static emptyOrderItems() {
    return new BusinessException(ErrorCode.EMPTY_ORDER_ITEMS);
  }

  // 쿠폰 관련
  static couponNotFound(couponId: number) {
    return new BusinessException(ErrorCode.COUPON_NOT_FOUND, { couponId });
  }

  static couponExhausted(details?: any) {
    return new BusinessException(ErrorCode.COUPON_EXHAUSTED, details);
  }

  static couponExpired(couponId: number) {
    return new BusinessException(ErrorCode.COUPON_EXPIRED, { couponId });
  }

  static couponAlreadyUsed(couponId: number) {
    return new BusinessException(ErrorCode.COUPON_ALREADY_USED, { couponId });
  }

  static minimumOrderAmountNotMet(details?: any) {
    return new BusinessException(ErrorCode.MINIMUM_ORDER_AMOUNT_NOT_MET, details);
  }

  // 공통
  static userNotFound(userId: number) {
    return new BusinessException(ErrorCode.USER_NOT_FOUND, { userId });
  }

  static invalidParameter(details?: any) {
    return new BusinessException(ErrorCode.INVALID_PARAMETER, details);
  }

  // 동시성 관련
  static optimisticLockError() {
    return new BusinessException(ErrorCode.OPTIMISTIC_LOCK_ERROR);
  }

  static concurrentModification() {
    return new BusinessException(ErrorCode.CONCURRENT_MODIFICATION);
  }
}
