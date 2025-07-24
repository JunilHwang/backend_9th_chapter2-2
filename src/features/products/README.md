# 상품 조회 API 사용 가이드

## 🎉 구현 완료!

상품 조회 API가 성공적으로 구현되었습니다! 

## 📋 API 엔드포인트

### 1. 상품 목록 조회
```
GET /api/v1/products
```

**쿼리 파라미터:**
- `page` (optional): 페이지 번호 (기본값: 1)
- `size` (optional): 페이지 크기 (기본값: 20, 최대: 100)
- `status` (optional): 상품 상태 (`ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`)
- `sortBy` (optional): 정렬 기준 (`name`, `price`, `createdAt`)
- `sortOrder` (optional): 정렬 순서 (`ASC`, `DESC`)

**예시 요청:**
```bash
# 기본 조회
curl -X GET "http://localhost:3000/api/v1/products"

# 필터링 및 정렬
curl -X GET "http://localhost:3000/api/v1/products?page=1&size=10&status=ACTIVE&sortBy=price&sortOrder=ASC"
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "무선 마우스",
        "price": 25000,
        "stockQuantity": 50,
        "status": "ACTIVE",
        "createdAt": 1721211600000
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 8,
      "totalPages": 1,
      "hasNext": false,
      "hasPrevious": false
    }
  },
  "timestamp": 1721211600000
}
```

### 2. 상품 상세 조회
```
GET /api/v1/products/:id
```

**예시 요청:**
```bash
curl -X GET "http://localhost:3000/api/v1/products/1"
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "무선 마우스",
    "price": 25000,
    "stockQuantity": 50,
    "status": "ACTIVE",
    "description": "고성능 무선 게이밍 마우스",
    "createdAt": 1721211600000,
    "updatedAt": 1721211600000
  },
  "timestamp": 1721211600000
}
```

### 3. 활성 상품 목록 조회
```
GET /api/v1/products/active
```

**예시 요청:**
```bash
curl -X GET "http://localhost:3000/api/v1/products/active"
```

## 🧪 테스트 방법

### 1. 데이터베이스 시딩
먼저 테스트용 더미 데이터를 생성하세요:

```bash
# 시드 스크립트 실행
npx ts-node src/infrastructure/database/seeds/products.seed.ts
```

### 2. 서버 실행
```bash
npm run start:dev
```

### 3. API 테스트

**Postman이나 cURL을 사용하여 테스트:**

1. **기본 상품 목록 조회**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/products"
   ```

2. **페이징 테스트**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/products?page=1&size=5"
   ```

3. **정렬 테스트**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/products?sortBy=price&sortOrder=DESC"
   ```

4. **상태 필터링**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/products?status=ACTIVE"
   ```

5. **상품 상세 조회**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/products/1"
   ```

6. **존재하지 않는 상품 조회 (에러 테스트)**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/products/999"
   ```

## 🛡️ 에러 처리 테스트

### 1. 존재하지 않는 상품 조회
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "상품을 찾을 수 없습니다.",
    "details": {
      "productId": 999
    }
  },
  "timestamp": 1721211600000
}
```

### 2. 비활성화된 상품 조회
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_INACTIVE",
    "message": "비활성화된 상품입니다.",
    "details": {
      "productId": 9
    }
  },
  "timestamp": 1721211600000
}
```

### 3. 잘못된 파라미터
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "잘못된 파라미터입니다.",
    "details": {
      "field": "size",
      "value": 150,
      "message": "size must not be greater than 100"
    }
  },
  "timestamp": 1721211600000
}
```

## 📁 생성된 파일 구조

```
src/features/products/
├── Products.module.ts           # 모듈 설정
├── products.controller.ts       # HTTP 컨트롤러
├── products.service.ts          # 비즈니스 로직
├── products.repository.ts       # 데이터 액세스
├── products.dto.ts              # 데이터 전송 객체
└── index.ts                     # 내보내기
```

## 🎯 다음 단계

상품 조회 API가 완성되었으니, 이제 다음 기능을 구현할 수 있습니다:

1. **잔액 충전/조회 API** - 주문의 전제조건
2. **주문/결제 API** - 핵심 비즈니스 로직
3. **선착순 쿠폰 API** - 동시성 제어가 중요한 기능
4. **인기 상품 조회 API** - 통계 및 캐싱

어떤 기능을 다음으로 구현하고 싶으신가요? 🚀
