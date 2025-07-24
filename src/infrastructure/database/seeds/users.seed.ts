import { PrismaClient, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 사용자 및 잔액 테스트 데이터 시드
 */
export async function seedUsers() {
  console.log('🌱 사용자 및 잔액 데이터 시딩 시작...');

  // 기존 데이터 삭제 (외래키 관계 고려)
  await prisma.balanceTransaction.deleteMany();
  await prisma.balance.deleteMany();
  await prisma.user.deleteMany();

  // 테스트 사용자 데이터
  const users = [
    {
      name: '김철수',
      email: 'kim.cheolsu@example.com',
      phone: '010-1234-5678',
      status: UserStatus.ACTIVE,
    },
    {
      name: '이영희',
      email: 'lee.younghee@example.com', 
      phone: '010-2345-6789',
      status: UserStatus.ACTIVE,
    },
    {
      name: '박민수',
      email: 'park.minsu@example.com',
      phone: '010-3456-7890',
      status: UserStatus.ACTIVE,
    },
    {
      name: '최지연',
      email: 'choi.jiyeon@example.com',
      phone: '010-4567-8901',
      status: UserStatus.ACTIVE,
    },
    {
      name: '정태현',
      email: 'jung.taehyun@example.com',
      phone: '010-5678-9012',
      status: UserStatus.ACTIVE,
    },
    {
      name: '비활성 사용자',
      email: 'inactive.user@example.com',
      phone: '010-9999-9999',
      status: UserStatus.INACTIVE,
    },
  ];

  // 사용자 생성
  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData,
    });
    createdUsers.push(user);
  }

  console.log(`✅ ${createdUsers.length}명의 사용자가 생성되었습니다.`);

  // 활성 사용자들에게 잔액 설정
  const activeUsers = createdUsers.filter(user => user.status === UserStatus.ACTIVE);
  
  for (const user of activeUsers) {
    const initialBalance = getRandomBalance();
    const dailyCharged = getRandomDailyCharged();

    // 잔액 계정 생성
    await prisma.balance.create({
      data: {
        userId: user.id,
        currentBalance: initialBalance,
        dailyChargeAmount: dailyCharged,
        lastUpdatedAt: new Date(),
      },
    });

    // 초기 충전 이력 생성 (잔액이 0보다 클 경우)
    if (initialBalance > 0) {
      await prisma.balanceTransaction.create({
        data: {
          userId: user.id,
          transactionType: 'CHARGE',
          amount: initialBalance,
          balanceBefore: 0,
          balanceAfter: initialBalance,
          description: '계정 개설 시 초기 충전',
        },
      });
    }
  }

  console.log(`✅ ${activeUsers.length}명의 사용자 잔액이 설정되었습니다.`);
  
  // 생성된 데이터 요약 출력
  await printUserSummary();
}

/**
 * 랜덤 초기 잔액 생성 (0원 ~ 500,000원)
 */
function getRandomBalance(): number {
  const balances = [0, 50000, 100000, 150000, 250000, 500000];
  return balances[Math.floor(Math.random() * balances.length)];
}

/**
 * 랜덤 일일 충전 금액 생성 (0원 ~ 300,000원)
 */
function getRandomDailyCharged(): number {
  const amounts = [0, 50000, 100000, 200000, 300000];
  return amounts[Math.floor(Math.random() * amounts.length)];
}

/**
 * 생성된 사용자 데이터 요약 출력
 */
async function printUserSummary() {
  const users = await prisma.user.findMany({
    include: {
      balances: true,
      transactions: true,
    },
  });

  console.log('\n📊 생성된 사용자 데이터 요약:');
  console.log('==========================================');
  
  for (const user of users) {
    const balance = user.balances?.currentBalance ?? 0;
    const dailyCharged = user.balances?.dailyChargeAmount ?? 0;
    const transactionCount = user.transactions.length;
    
    console.log(`👤 ${user.name} (${user.email})`);
    console.log(`   잔액: ${balance.toLocaleString()}원`);
    console.log(`   금일 충전: ${dailyCharged.toLocaleString()}원`);
    console.log(`   거래 건수: ${transactionCount}건`);
    console.log(`   상태: ${user.status}`);
    console.log('------------------------------------------');
  }
}

/**
 * 메인 시드 함수
 */
async function main() {
  try {
    await seedUsers();
    console.log('🎉 사용자 및 잔액 시딩 완료!');
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
