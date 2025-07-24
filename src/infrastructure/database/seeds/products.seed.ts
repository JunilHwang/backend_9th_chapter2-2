import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 상품 테스트 데이터 시드
 */
export async function seedProducts() {
  console.log('🌱 상품 데이터 시딩 시작...');

  // 기존 데이터 삭제
  await prisma.product.deleteMany();

  // 테스트 상품 데이터
  const products = [
    {
      name: '무선 마우스',
      price: 25000,
      stockQuantity: 50,
      status: ProductStatus.ACTIVE,
      description: '고성능 무선 게이밍 마우스',
    },
    {
      name: '블루투스 키보드',
      price: 45000,
      stockQuantity: 30,
      status: ProductStatus.ACTIVE,
      description: '기계식 블루투스 키보드',
    },
    {
      name: '게이밍 마우스',
      price: 65000,
      stockQuantity: 25,
      status: ProductStatus.ACTIVE,
      description: '프로게이머용 고성능 게이밍 마우스',
    },
    {
      name: '모니터',
      price: 120000,
      stockQuantity: 15,
      status: ProductStatus.ACTIVE,
      description: '27인치 4K 모니터',
    },
    {
      name: '웹캠',
      price: 30000,
      stockQuantity: 40,
      status: ProductStatus.ACTIVE,
      description: 'HD 웹캠',
    },
    {
      name: '이어폰',
      price: 15000,
      stockQuantity: 100,
      status: ProductStatus.ACTIVE,
      description: '노이즈 캔슬링 이어폰',
    },
    {
      name: '마우스패드',
      price: 8000,
      stockQuantity: 80,
      status: ProductStatus.ACTIVE,
      description: '대형 게이밍 마우스패드',
    },
    {
      name: 'USB 허브',
      price: 20000,
      stockQuantity: 35,
      status: ProductStatus.ACTIVE,
      description: '7포트 USB 3.0 허브',
    },
    {
      name: '구형 프린터',
      price: 50000,
      stockQuantity: 5,
      status: ProductStatus.INACTIVE,
      description: '단종된 구형 프린터',
    },
    {
      name: '품절 상품',
      price: 10000,
      stockQuantity: 0,
      status: ProductStatus.OUT_OF_STOCK,
      description: '현재 품절된 상품',
    },
  ];

  // 배치로 삽입
  const createdProducts = await prisma.product.createMany({
    data: products,
  });

  console.log(`✅ ${createdProducts.count}개의 상품 데이터가 생성되었습니다.`);
}

/**
 * 메인 시드 함수
 */
async function main() {
  try {
    await seedProducts();
    console.log('🎉 시딩 완료!');
  } catch (error) {
    console.error('❌ 시딩 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 직접 실행 시
if (require.main === module) {
  main();
}
