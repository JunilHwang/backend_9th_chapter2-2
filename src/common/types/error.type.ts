/**
 * 비즈니스 에러 코드 정의
 */

export enum ErrorCode {
  // 잔액 관련
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  DAILY_CHARGE_LIMIT_EXCEEDED = 'DAILY_CHARGE_LIMIT_EXCEEDED',
  MAX_BALANCE_LIMIT_EXCEEDED = 'MAX_BALANCE_LIMIT_EXCEEDED',
  
  // 상품 관련
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PRODUCT_INACTIVE = 'PRODUCT_INACTIVE',
  
  // 주문 관련
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_ALREADY_PAID = 'ORDER_ALREADY_PAID',
  ORDER_AMOUNT_MISMATCH = 'ORDER_AMOUNT_MISMATCH',
  EMPTY_ORDER_ITEMS = 'EMPTY_ORDER_ITEMS',
  
  // 쿠폰 관련
  COUPON_NOT_FOUND = 'COUPON_NOT_FOUND',
  COUPON_EXHAUSTED = 'COUPON_EXHAUSTED',
  COUPON_EXPIRED = 'COUPON_EXPIRED',
  COUPON_ALREADY_USED = 'COUPON_ALREADY_USED',
  MINIMUM_ORDER_AMOUNT_NOT_MET = 'MINIMUM_ORDER_AMOUNT_NOT_MET',
  COUPON_EVENT_NOT_FOUND = 'COUPON_EVENT_NOT_FOUND',
  COUPON_EVENT_NOT_ACTIVE = 'COUPON_EVENT_NOT_ACTIVE',
  DUPLICATE_COUPON_ISSUE = 'DUPLICATE_COUPON_ISSUE',
  
  // 공통
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  
  // 동시성 관련
  OPTIMISTIC_LOCK_ERROR = 'OPTIMISTIC_LOCK_ERROR',
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',
}

/**
 * 에러 메시지 매핑
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // 잔액 관련
  [ErrorCode.INSUFFICIENT_BALANCE]: '잔액이 부족합니다.',
  [ErrorCode.DAILY_CHARGE_LIMIT_EXCEEDED]: '일일 충전 한도를 초과했습니다.',
  [ErrorCode.MAX_BALANCE_LIMIT_EXCEEDED]: '최대 보유 한도를 초과했습니다.',
  
  // 상품 관련
  [ErrorCode.PRODUCT_NOT_FOUND]: '상품을 찾을 수 없습니다.',
  [ErrorCode.OUT_OF_STOCK]: '재고가 부족합니다.',
  [ErrorCode.PRODUCT_INACTIVE]: '비활성화된 상품입니다.',
  
  // 주문 관련
  [ErrorCode.ORDER_NOT_FOUND]: '주문을 찾을 수 없습니다.',
  [ErrorCode.ORDER_ALREADY_PAID]: '이미 결제된 주문입니다.',
  [ErrorCode.ORDER_AMOUNT_MISMATCH]: '주문 금액이 일치하지 않습니다.',
  [ErrorCode.EMPTY_ORDER_ITEMS]: '주문 상품이 없습니다.',
  
  // 쿠폰 관련
  [ErrorCode.COUPON_NOT_FOUND]: '쿠폰을 찾을 수 없습니다.',
  [ErrorCode.COUPON_EXHAUSTED]: '선착순 쿠폰이 모두 소진되었습니다.',
  [ErrorCode.COUPON_EXPIRED]: '만료된 쿠폰입니다.',
  [ErrorCode.COUPON_ALREADY_USED]: '이미 사용된 쿠폰입니다.',
  [ErrorCode.MINIMUM_ORDER_AMOUNT_NOT_MET]: '최소 주문 금액을 충족하지 않습니다.',
  [ErrorCode.COUPON_EVENT_NOT_FOUND]: '쿠폰 이벤트를 찾을 수 없습니다.',
  [ErrorCode.COUPON_EVENT_NOT_ACTIVE]: '활성화되지 않은 쿠폰 이벤트입니다.',
  [ErrorCode.DUPLICATE_COUPON_ISSUE]: '이미 발급받은 쿠폰입니다.',
  
  // 공통
  [ErrorCode.USER_NOT_FOUND]: '사용자를 찾을 수 없습니다.',
  [ErrorCode.INVALID_PARAMETER]: '잘못된 파라미터입니다.',
  [ErrorCode.INTERNAL_SERVER_ERROR]: '서버 내부 오류가 발생했습니다.',
  
  // 동시성 관련
  [ErrorCode.OPTIMISTIC_LOCK_ERROR]: '데이터가 다른 사용자에 의해 수정되었습니다. 다시 시도해주세요.',
  [ErrorCode.CONCURRENT_MODIFICATION]: '동시 수정으로 인한 충돌이 발생했습니다. 다시 시도해주세요.',
};
