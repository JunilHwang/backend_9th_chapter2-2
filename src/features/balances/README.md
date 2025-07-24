# 💰 잔액 관리 API 가이드

## 개요

사용자의 충전식 잔액을 관리하는 API 모듈입니다. 상품 주문 시 결제 수단으로 사용되며, 일일 충전 한도와 최대 보유 한도를 통해 안전하게 관리됩니다.

## 🎯 주요 기능

- **잔액 충전**: 사용자 잔액 충전 (한도 검증 포함)
- **잔액 조회**: 현재 잔액 및 일일 충전 금액 조회
- **잔액 사용**: 주문 결제 시 잔액 차감 (다른 모듈에서 사용)
- **잔액 환불**: 주문 취소 시 잔액 복구 (다른 모듈에서 사용)
- **거래 이력**: 모든 잔액 변동 이력 추적

## 📋 비즈니스 정책

### 한도 관리
- **일일 충전 한도**: 1,000,000원 (100만원)
- **최대 보유 한도**: 10,000,000원 (1,000만원)
- **최소 충전 금액**: 1원

### 사용자 제한
- **활성 사용자만** 잔액 관리 가능
- **비활성/정지 사용자** 접근 차단

## 🚀 API 엔드포인트

### 1. 잔액 조회
```bash
GET /api/v1/balances/{userId}
```

**응답 예시**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "currentBalance": 250000,
    "dailyChargedAmount": 100000,
    "lastUpdatedAt": 1721211600000
  },
  "timestamp": 1721211600000
}
```

### 2. 잔액 충전
```bash
POST /api/v1/balances/charge
Content-Type: application/json

{
  "userId": 1,
  "amount": 50000
}
```

**응답 예시**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "chargedAmount": 50000,
    "currentBalance": 300000,
    "chargedAt": 1721211600000
  },
  "timestamp": 1721211600000
}
```

## ❌ 오류 처리

### 일일 충전 한도 초과
```json
{
  "success": false,
  "error": {
    "code": "DAILY_CHARGE_LIMIT_EXCEEDED",
    "message": "일일 충전 한도를 초과했습니다.",
    "details": {
      "dailyLimit": 1000000,
      "currentDailyCharged": 950000,
      "attemptedAmount": 100000
    }
  },
  "timestamp": 1721211600000
}
```

### 최대 보유 한도 초과
```json
{
  "success": false,
  "error": {
    "code": "MAX_BALANCE_LIMIT_EXCEEDED",
    "message": "최대 보유 한도를 초과했습니다.",
    "details": {
      "maxBalanceLimit": 10000000,
      "currentBalance": 9900000,
      "attemptedAmount": 200000
    }
  },
  "timestamp": 1721211600000
}
```

### 잔액 부족 (결제 시)
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "잔액이 부족합니다.",
    "details": {
      "currentBalance": 50000,
      "requiredAmount": 85500,
      "shortfall": 35500
    }
  },
  "timestamp": 1721211600000
}
```

## 🔧 다른 모듈에서 사용하기

### 의존성 주입
```typescript
import { BalancesService } from '../balances';

@Injectable()
export class OrdersService {
  constructor(
    private readonly balancesService: BalancesService,
  ) {}
}
```

### 결제 처리
```typescript
// 주문 결제 시 잔액 차감
const paymentResult = await this.balancesService.useBalance(
  userId,
  orderAmount,
  `주문 결제 - 주문번호: ${orderId}`,
  transaction // 트랜잭션 컨텍스트
);

console.log(`결제 완료: ${paymentResult.balanceAfter}원 잔액`);
```

### 환불 처리
```typescript
// 주문 취소 시 잔액 환불
const refundResult = await this.balancesService.refundBalance(
  userId,
  refundAmount,
  `주문 취소 환불 - 주문번호: ${orderId}`,
  transaction // 트랜잭션 컨텍스트
);

console.log(`환불 완료: ${refundResult.balanceAfter}원 잔액`);
```

## 🎯 실제 사용 시나리오

### 시나리오 1: 기본 잔액 충전
```bash
# 1. 현재 잔액 확인
curl "http://localhost:3000/api/v1/balances/1"
# → 현재 잔액: 100,000원

# 2. 50,000원 충전
curl -X POST "http://localhost:3000/api/v1/balances/charge" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 50000}'
# → 충전 후 잔액: 150,000원

# 3. 충전 후 잔액 재확인
curl "http://localhost:3000/api/v1/balances/1"
# → 현재 잔액: 150,000원
```

### 시나리오 2: 한도 초과 상황
```bash
# 일일 충전 한도 테스트 (현재 900,000원 충전한 상태에서)
curl -X POST "http://localhost:3000/api/v1/balances/charge" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 200000}'
# → 400 BAD_REQUEST: 일일 충전 한도 초과
```

## 🛠️ 트랜잭션 안전성

모든 잔액 변경 작업은 트랜잭션으로 보호됩니다:

1. **잔액 충전**: 잔액 증가 + 일일 충전 금액 증가 + 거래 이력 생성
2. **잔액 사용**: 잔액 감소 + 거래 이력 생성
3. **잔액 환불**: 잔액 증가 + 거래 이력 생성

중간에 오류가 발생하면 모든 변경사항이 롤백되어 데이터 일관성을 보장합니다.

## 📊 테스트 데이터

현재 시스템에 등록된 테스트 사용자:

| 사용자 | 이메일 | 현재 잔액 | 일일 충전 | 상태 |
|--------|--------|-----------|-----------|------|
| 김철수 | kim.cheolsu@example.com | 250,000원 | 100,000원 | 활성 |
| 이영희 | lee.younghee@example.com | 150,000원 | 100,000원 | 활성 |
| 박민수 | park.minsu@example.com | 150,000원 | 300,000원 | 활성 |
| 최지연 | choi.jiyeon@example.com | 100,000원 | 0원 | 활성 |
| 정태현 | jung.taehyun@example.com | 250,000원 | 300,000원 | 활성 |

## 🔍 로깅

상세한 로그를 통해 모든 잔액 변동을 추적할 수 있습니다:

```
[BalancesController] 잔액 충전 API 호출: userId=1, amount=50,000원
[BalancesService] 잔액 충전 요청: userId=1, amount=50,000원
[BalancesService] 잔액 충전 완료: userId=1, 충전 후 잔액=300,000원
[BalancesController] 잔액 충전 API 완료: userId=1, 현재 잔액=300,000원
```

## 🚀 향후 확장 계획

- 💳 **다양한 결제 수단**: 신용카드, 간편결제 연동
- 🎁 **포인트 시스템**: 구매 금액에 따른 포인트 적립
- 📈 **잔액 분석**: 사용자별 충전/소비 패턴 분석
- 🔔 **알림 기능**: 잔액 부족, 충전 완료 알림
- 💸 **자동 충전**: 잔액 부족 시 자동 충전 기능

---

💡 **문의사항이나 버그 신고는 개발팀에 문의해주세요!**
