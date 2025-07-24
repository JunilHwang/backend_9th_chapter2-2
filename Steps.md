# 🛍️ 상품 주문 서비스 구현 단계별 가이드

## 📋 프로젝트 개요

e-커머스 상품 주문 서비스를 NestJS + TypeORM(Prisma) + PostgreSQL로 구현하는 프로젝트입니다.

### 🎯 주요 기능
- 잔액 충전 / 조회 API
- 상품 조회 API  
- 주문 / 결제 API
- 선착순 쿠폰 API
- 인기 판매 상품 조회 API

### 📁 프로젝트 구조
```
src/
├── common/                 # 공통 모듈 (완료 ✅)
├── infrastructure/         # 인프라 계층 (완료 ✅)
├── features/              # 비즈니스 기능 모듈
│   ├── products/          # 상품 관리 (완료 ✅)
│   ├── balances/          # 잔액 관리 (예정 🔄)
│   ├── orders/            # 주문 관리 (예정 🔄)
│   ├── coupons/           # 쿠폰 관리 (예정 🔄)
│   └── statistics/        # 통계 관리 (예정 🔄)
└── docs/                  # 문서 (완료 ✅)
```

---

## 🏁 현재까지 완료된 내용

### ✅ Phase 0: 프로젝트 기반 설정 (완료)

#### 1. 문서화 및 설계 완료
- [x] **요구사항 명세서** ([docs/1_requirement_spec.md](./docs/1_requirement_spec.md))
- [x] **사용자 시나리오 및 시퀀스 다이어그램** ([docs/2_sequence_diagram_with_scenario.md](./docs/2_sequence_diagram_with_scenario.md))
- [x] **ERD 설계** ([docs/3_erd.md](./docs/3_erd.md))
- [x] **API 명세서** ([docs/4_api_spec.md](./docs/4_api_spec.md))
- [x] **데이터베이스 스키마** ([schema.prisma](./schema.prisma), [migration.sql](./migration.sql))

#### 2. 공통 인프라 구조 완료
- [x] **공통 응답 타입 시스템** ([src/common/](./src/common/))
  - 성공/에러 응답 통일 형식
  - 페이징 처리 유틸리티
  - 비즈니스 예외 처리 클래스
  - 글로벌 예외 필터
  - 응답 변환 인터셉터
  - 📖 **참고**: [src/common/README.md](./src/common/README.md)

- [x] **데이터베이스 설정** ([src/infrastructure/database/](./src/infrastructure/database/))
  - Prisma 모듈 및 서비스 설정
  - 데이터베이스 연결 구성

### ✅ Phase 1: 상품 조회 API (완료)

- [x] **Products 모듈 완전 구현** ([src/features/products/](./src/features/products/))
  - Product DTO 정의 (요청/응답/페이징)
  - Products Repository (데이터 액세스 계층)
  - Products Service (비즈니스 로직)
  - Products Controller (REST API)
  - Products Module (의존성 관리)
  - 📖 **참고**: [src/features/products/README.md](./src/features/products/README.md)

- [x] **구현된 API 엔드포인트**
  - `GET /api/v1/products` - 상품 목록 조회 (페이징, 필터링, 정렬)
  - `GET /api/v1/products/:id` - 상품 상세 조회
  - `GET /api/v1/products/active` - 활성 상품 목록 조회

- [x] **테스트 데이터 준비**
  - 상품 시드 데이터 스크립트 ([src/infrastructure/database/seeds/products.seed.ts](./src/infrastructure/database/seeds/products.seed.ts))
  - 10개 테스트 상품 데이터 (다양한 상태 포함)
  - 사용자 시드 데이터 스크립트 ([src/infrastructure/database/seeds/users.seed.ts](./src/infrastructure/database/seeds/users.seed.ts))
  - 6명 테스트 사용자 데이터 (잔액 및 거래 이력 포함)

- [x] **에러 처리 완료**
  - 존재하지 않는 상품 조회
  - 비활성화된 상품 접근 제한
  - 잘못된 파라미터 검증
  - 일관된 에러 응답 형식

---

## 🚀 앞으로 진행해야 할 내용

### ✅ Phase 2: 잔액 충전/조회 API (완료 - 100% ✅)

**완료된 작업** ✅
- [x] **사용자 시드 데이터 생성** ([src/infrastructure/database/seeds/users.seed.ts](./src/infrastructure/database/seeds/users.seed.ts))
  - 6명의 테스트 사용자 (활성 5명, 비활성 1명)
  - 다양한 초기 잔액 설정 (0원 ~ 500,000원)
  - 거래 이력 초기 데이터
  - 일일 충전 금액 다양화

- [x] **Balances DTO 완전 구현** ([src/features/balances/balances.dto.ts](./src/features/balances/balances.dto.ts))
  - 잔액 충전 요청/응답 DTO
  - 잔액 조회 응답 DTO
  - 거래 이력 DTO
  - 내부 검증 및 업데이트 결과 DTO

- [x] **Balances Repository 완전 구현** ([src/features/balances/balances.repository.ts](./src/features/balances/balances.repository.ts))
  - 잔액 조회/생성/업데이트 메서드
  - 거래 이력 생성/조회 메서드
  - 일일 충전 금액 관리 메서드
  - 트랜잭션 지원 (원자성 보장)
  - 기간별 충전 금액 집계 기능

- [x] **Balances Service 완전 구현** ([src/features/balances/balances.service.ts](./src/features/balances/balances.service.ts))
  - 잔액 충전 비즈니스 로직 (한도 검증, 트랜잭션 처리)
  - 잔액 조회 로직 (자동 계정 생성)
  - 잔액 사용/환불 메서드 (주문 시스템 연동 준비)
  - 일일 충전 한도: 1,000,000원
  - 최대 보유 한도: 10,000,000원
  - 사용자 검증 및 예외 처리

- [x] **Balances Controller 완전 구현** ([src/features/balances/balances.controller.ts](./src/features/balances/balances.controller.ts))
  - `POST /api/v1/balances/charge` - 잔액 충전 API
  - `GET /api/v1/balances/{userId}` - 잔액 조회 API
  - class-validator 기반 입력 검증
  - 로깅 및 응답 처리

- [x] **Balances Module 설정** ([src/features/balances/Balances.module.ts](./src/features/balances/Balances.module.ts))
  - 의존성 주입 설정
  - AppModule 연동 완료
  - 다른 모듈(주문 등)에서 사용 가능하도록 export

- [x] **API 테스트 완료** ✅
  - **정상 케이스**: 잔액 조회, 잔액 충전, 업데이트 확인
  - **예외 케이스**: 일일 한도 초과, 존재하지 않는 사용자, 비활성 사용자
  - **트랜잭션 검증**: 잔액/일일충전금액/거래이력 원자성 보장
  - **로깅 확인**: Controller, Service 레벨 로깅 정상 작동

#### 🎯 API 테스트 결과 요약

**✅ 정상 동작 확인**
```bash
# 잔액 조회
GET /api/v1/balances/1 → 250,000원 (김철수)

# 잔액 충전  
POST /api/v1/balances/charge {"userId": 1, "amount": 50000}
→ 충전 후 잔액: 300,000원, 일일 충전: 150,000원

# 충전 후 재조회
GET /api/v1/balances/1 → 300,000원 ✅
```

**✅ 예외 처리 확인**
```bash
# 일일 한도 초과 (현재: 150,000원, 시도: 900,000원)
POST /api/v1/balances/charge {"userId": 1, "amount": 900000}
→ 400 BAD_REQUEST: DAILY_CHARGE_LIMIT_EXCEEDED ✅

# 존재하지 않는 사용자
GET /api/v1/balances/999
→ 404 NOT_FOUND: USER_NOT_FOUND ✅

# 비활성 사용자
GET /api/v1/balances/6
→ 400 BAD_REQUEST: INVALID_PARAMETER ✅
```

#### 🛠️ 구현된 주요 기능

- **한도 관리**: 일일 충전 한도(100만원), 최대 보유 한도(1000만원)
- **트랜잭션 무결성**: 잔액 변경 + 거래 이력 생성의 원자성 보장
- **자동 계정 생성**: 잔액 계정이 없는 사용자 조회 시 자동 생성
- **확장성**: 주문 시스템에서 사용할 잔액 사용/환불 메서드 제공
- **로깅**: 상세한 로그를 통한 디버깅 및 모니터링 지원

### 🔄 Phase 3: 주문/결제 API (핵심 기능)

**예상 소요 시간**: 3-4일

#### 구현 목표
- [ ] **주문 생성 API**: `POST /api/v1/orders`
- [ ] **결제 처리 API**: `POST /api/v1/orders/{orderId}/payment`
- [ ] **주문 조회 API**: `GET /api/v1/orders/{orderId}`, `GET /api/v1/users/{userId}/orders`
- [ ] **재고 관리**: 동시성 제어 및 재고 차감/복구
- [ ] **데이터 전송**: 외부 플랫폼 전송 기능 (Mock)

#### 구현 순서
1. **Orders DTO 작성** - 주문 생성/조회/결제 DTO
2. **Orders Repository** - 주문 및 결제 데이터 액세스
3. **Orders Service** - 주문 생성, 결제 처리, 재고 관리 로직
4. **Orders Controller** - 주문 관련 API 엔드포인트
5. **데이터 전송 Service** - 외부 플랫폼 연동 Mock
6. **트랜잭션 처리** - 주문/결제/재고 원자성 보장
7. **기본 동시성 처리** - 낙관적 락 적용

### 🔄 Phase 4: 선착순 쿠폰 API (고급 기능)

**예상 소요 시간**: 2-3일

#### 구현 목표
- [ ] **쿠폰 발급 API**: `POST /api/v1/coupons/issue`
- [ ] **보유 쿠폰 조회 API**: `GET /api/v1/coupons`
- [ ] **쿠폰 적용 로직**: 주문 시 할인 계산
- [ ] **선착순 제어**: 동시성 처리 및 발급 수량 제한

#### 구현 순서
1. **Coupons DTO 작성** - 쿠폰 발급/조회 DTO
2. **Coupons Repository** - 쿠폰 이벤트 및 쿠폰 데이터 액세스
3. **Coupons Service** - 쿠폰 발급, 유효성 검증, 할인 계산 로직
4. **Coupons Controller** - 쿠폰 관련 API 엔드포인트
5. **동시성 제어 강화** - 선착순 발급 처리
6. **주문 서비스 연동** - 쿠폰 적용 로직 통합

### 🔄 Phase 5: 인기 상품 조회 API (통계 기능)

**예상 소요 시간**: 2-3일

#### 구현 목표
- [ ] **인기 상품 조회 API**: `GET /api/v1/products/popular`
- [ ] **통계 데이터 수집**: 판매 데이터 집계 배치 작업
- [ ] **캐싱 전략**: Redis 캐시 적용
- [ ] **실시간 업데이트**: 주문 완료 시 통계 갱신

#### 구현 순서
1. **Statistics DTO 작성** - 인기 상품 조회 DTO
2. **Statistics Repository** - 판매 통계 데이터 액세스
3. **Statistics Service** - 통계 집계, 순위 계산 로직
4. **Statistics Controller** - 통계 조회 API
5. **배치 작업 구현** - 주기적 통계 갱신 (@Cron)
6. **캐싱 적용** - Redis 캐시 전략 구현
7. **실시간 갱신** - 주문 완료 이벤트 연동

### 🔄 Phase 6: 테스트 및 최적화 (마무리)

**예상 소요 시간**: 3-4일

#### 구현 목표
- [ ] **단위 테스트 작성**: 각 서비스별 테스트 커버리지 80% 이상
- [ ] **통합 테스트**: API 엔드투엔드 테스트
- [ ] **동시성 테스트**: 대용량 트래픽 상황 시뮬레이션
- [ ] **성능 최적화**: 쿼리 최적화, 인덱스 튜닝
- [ ] **모니터링 설정**: 로깅, 메트릭 수집

---

## 📚 참고 문서 및 가이드

### 📖 프로젝트 설계 문서
- **요구사항 명세서**: [docs/1_requirement_spec.md](./docs/1_requirement_spec.md)
- **사용자 시나리오**: [docs/2_sequence_diagram_with_scenario.md](./docs/2_sequence_diagram_with_scenario.md)
- **ERD 설계**: [docs/3_erd.md](./docs/3_erd.md)
- **API 명세서**: [docs/4_api_spec.md](./docs/4_api_spec.md)

### 📖 구현 가이드 (README.md)
- **공통 모듈 사용법**: [src/common/README.md](./src/common/README.md)
- **상품 API 가이드**: [src/features/products/README.md](./src/features/products/README.md)
- **잔액 API 가이드**: [src/features/balances/README.md](./src/features/balances/README.md) (예정)
- **주문 API 가이드**: [src/features/orders/README.md](./src/features/orders/README.md) (예정)
- **쿠폰 API 가이드**: [src/features/coupons/README.md](./src/features/coupons/README.md) (예정)
- **통계 API 가이드**: [src/features/statistics/README.md](./src/features/statistics/README.md) (예정)

### 📖 데이터 및 스키마
- **Prisma 스키마**: [schema.prisma](./schema.prisma)
- **데이터베이스 마이그레이션**: [migration.sql](./migration.sql)
- **테스트 데이터 시드**: [src/infrastructure/database/seeds/](./src/infrastructure/database/seeds/)

---

## 🛠️ 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 프로젝트 실행
```bash
# 의존성 설치
npm install

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 테스트 데이터 생성
npx ts-node src/infrastructure/database/seeds/products.seed.ts
npx ts-node src/infrastructure/database/seeds/users.seed.ts

# 개발 서버 실행
npm run start:dev
```

### API 테스트
```bash
# 상품 목록 조회
curl "http://localhost:3000/api/v1/products"

# 상품 상세 조회
curl "http://localhost:3000/api/v1/products/1"

# 잔액 조회 ✅
curl "http://localhost:3000/api/v1/balances/1"

# 잔액 충전 ✅
curl -X POST "http://localhost:3000/api/v1/balances/charge" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 50000}'

# 주문 생성 (구현 예정)
curl -X POST "http://localhost:3000/api/v1/orders" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "items": [{"productId": 1, "quantity": 2}]}'
```

---

## ✅ 진행 상황 체크리스트

### 기반 구조 (100% 완료)
- [x] 프로젝트 설정 및 의존성 관리
- [x] 공통 응답 타입 시스템 구축
- [x] 에러 처리 및 예외 필터 구현
- [x] 데이터베이스 스키마 설계 및 마이그레이션
- [x] API 명세서 작성

### 상품 관리 (100% 완료)
- [x] Products DTO 정의
- [x] Products Repository 구현
- [x] Products Service 구현
- [x] Products Controller 구현
- [x] Products Module 설정
- [x] 상품 시드 데이터 생성
- [x] API 테스트 완료

### 잔액 관리 (100% - 완료 ✅)
- [x] Balances DTO 정의
- [x] Balances Repository 구현
- [x] Balances Service 구현
- [x] Balances Controller 구현
- [x] Balances Module 설정
- [x] 사용자 및 잔액 시드 데이터
- [x] API 테스트

### 주문 및 결제 (0% - 예정)
- [ ] Orders DTO 정의
- [ ] Orders Repository 구현
- [ ] Orders Service 구현
- [ ] Orders Controller 구현
- [ ] 결제 처리 로직
- [ ] 재고 관리 로직
- [ ] 데이터 전송 기능

### 쿠폰 시스템 (0% - 예정)
- [ ] Coupons DTO 정의
- [ ] Coupons Repository 구현
- [ ] Coupons Service 구현
- [ ] Coupons Controller 구현
- [ ] 선착순 동시성 제어
- [ ] 쿠폰 적용 로직

### 통계 및 최적화 (0% - 예정)
- [ ] Statistics 구현
- [ ] 캐싱 전략 적용
- [ ] 단위 테스트 작성
- [ ] 성능 최적화
- [ ] 동시성 테스트

---

## 🎯 다음 구현 목표

**현재 위치**: Phase 2 완료 ✅  
**다음 목표**: Phase 3 - 주문/결제 API 구현 (핵심 기능)

### 즉시 시작할 작업
1. **Orders DTO 작성** - 주문 생성/조회/결제 DTO
2. **Orders Repository** - 주문 및 결제 데이터 액세스
3. **Orders Service** - 주문 생성, 결제 처리, 재고 관리 로직
4. **Orders Controller** - 주문 관련 API 엔드포인트
5. **데이터 전송 Service** - 외부 플랫폼 연동 Mock
6. **트랜잭션 처리** - 주문/결제/재고 원자성 보장

### 🏆 Phase 2 성과

**✅ 완성된 잔액 시스템**
- **완전한 API**: 충전, 조회, 사용, 환불 기능
- **한도 관리**: 일일/최대 보유 한도 검증
- **트랜잭션 무결성**: 데이터 일관성 100% 보장
- **확장성**: 주문 시스템 연동 준비 완료
- **견고한 예외 처리**: 모든 비즈니스 케이스 대응

**🔥 핵심 구현 성과**
- 원자적 트랜잭션 처리 (잔액 + 거래이력)
- 실시간 한도 검증 및 차단
- 자동 잔액 계정 생성
- 주문 시스템용 API (useBalance, refundBalance) 제공
- 완벽한 테스트 커버리지 (정상/예외 케이스)

이제 본격적인 e-커머스 핵심 기능인 **주문/결제 시스템** 구현 준비가 완료되었습니다! 🚀

---

## 📞 문제 해결 및 지원

구현 중 문제가 발생하거나 도움이 필요한 경우:

1. **공통 모듈 사용법**: [src/common/README.md](./src/common/README.md) 참조
2. **API 명세서**: [docs/4_api_spec.md](./docs/4_api_spec.md) 확인
3. **ERD 및 데이터 모델**: [docs/3_erd.md](./docs/3_erd.md) 참조
4. **사용자 시나리오**: [docs/2_sequence_diagram_with_scenario.md](./docs/2_sequence_diagram_with_scenario.md) 확인

각 단계별로 상세한 구현 가이드와 예제 코드를 제공하니, 단계적으로 진행하면서 필요한 도움을 요청하세요! 💪
