import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { MySqlContainer } from '@testcontainers/mysql';
import { execSync } from 'child_process';

const init = async () => {
  await Promise.all([initMysql()]);
};

const initMysql = async () => {
  const mysql = await new MySqlContainer('mysql:8')
    .withDatabase('dbname')
    .withUser('root')
    .withRootPassword('pw')
    .start();

  global.mysql = mysql;

  const databaseUrl = `mysql://root:pw@${mysql.getHost()}:${mysql.getPort()}/dbname`;
  process.env.DATABASE_URL = databaseUrl;
  process.env.DB_HOST = mysql.getHost();
  process.env.DB_PORT = mysql.getPort().toString();
  process.env.DB_USERNAME = mysql.getUsername();
  process.env.DB_PASSWORD = mysql.getUserPassword();
  process.env.DB_DATABASE = mysql.getDatabase();

  // Prisma 마이그레이션 실행
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }

  // 테스트 데이터 삽입
  await insertTestData();
};

const insertTestData = async () => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    await prisma.$connect();

    // 기존 데이터 정리
    await prisma.salesStatistics.deleteMany();
    await prisma.dataTransfer.deleteMany();
    await prisma.couponEvent.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderProduct.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.balanceTransaction.deleteMany();
    await prisma.balance.deleteMany();
    await prisma.user.deleteMany();

    // 테스트 데이터 생성
    const user = await prisma.user.create({
      data: {
        id: 1n,
        name: 'Test User',
        email: 'test@example.com',
        status: 'ACTIVE',
      },
    });

    await prisma.balance.create({
      data: {
        userId: user.id,
        amount: 100000,
        version: 1,
      },
    });

    await prisma.product.createMany({
      data: [
        {
          id: 101n,
          name: 'Test Product 1',
          description: 'Test Product 1 Description',
          price: 10000,
          stock: 100,
          status: 'AVAILABLE',
        },
        {
          id: 102n,
          name: 'Test Product 2',
          description: 'Test Product 2 Description',
          price: 20000,
          stock: 50,
          status: 'AVAILABLE',
        },
      ],
    });

    const order = await prisma.order.create({
      data: {
        id: 1001n,
        userId: user.id,
        totalAmount: 30000,
        discountAmount: 0,
        finalAmount: 30000,
        status: 'PENDING',
      },
    });

    await prisma.orderProduct.createMany({
      data: [
        {
          orderId: order.id,
          productId: 101n,
          quantity: 1,
          unitPrice: 10000,
          totalPrice: 10000,
        },
        {
          orderId: order.id,
          productId: 102n,
          quantity: 1,
          unitPrice: 20000,
          totalPrice: 20000,
        },
      ],
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: 30000,
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    await prisma.couponEvent.create({
      data: {
        id: 501n,
        name: 'Test Coupon Event',
        description: 'Test Coupon Event Description',
        couponCount: 100,
        issuedCount: 10,
        status: 'ACTIVE',
        eventDate: new Date(),
      },
    });

    // 쿠폰 이벤트 502는 소진된 상태로 생성
    await prisma.couponEvent.create({
      data: {
        id: 502n,
        name: 'Exhausted Coupon Event',
        description: 'Exhausted Coupon Event Description',
        couponCount: 100,
        issuedCount: 100, // 모두 발급되어 소진된 상태
        status: 'ACTIVE',
        eventDate: new Date(),
      },
    });

    await prisma.coupon.create({
      data: {
        id: 3001n,
        name: 'Test Coupon',
        code: 'TEST10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minimumAmount: 10000,
        usageLimit: 100,
        usedCount: 0,
        status: 'ACTIVE',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
      },
    });

    console.log('Test data inserted successfully');
  } catch (error) {
    console.error('Failed to insert test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export default init;
