import { DatabaseModule } from '../../../src/database/database.module';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../src/database/prisma.service';

describe('Prisma Integration Test', () => {
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();
    moduleRef.useLogger(new Logger());

    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  it('Should connect to database and fetch users', async () => {
    // given - setup data exists from global setup

    // when
    const users = await prismaService.user.findMany();

    // then
    expect(users).toBeDefined();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('name');
    expect(users[0]).toHaveProperty('email');
  });

  it('Should create and fetch a new user', async () => {
    // given
    const userData = {
      name: 'Integration Test User',
      email: 'integration@test.com',
      status: 'ACTIVE' as const,
    };

    // when
    const createdUser = await prismaService.user.create({
      data: userData,
    });
    const fetchedUser = await prismaService.user.findUnique({
      where: { id: createdUser.id },
    });

    // then
    expect(createdUser).toBeDefined();
    expect(createdUser.name).toBe(userData.name);
    expect(createdUser.email).toBe(userData.email);
    expect(fetchedUser).toBeDefined();
    expect(fetchedUser.id).toBe(createdUser.id);
  });

  it('Should create balance transaction', async () => {
    // given
    const users = await prismaService.user.findMany();
    const user = users[0];

    // when
    const transaction = await prismaService.balanceTransaction.create({
      data: {
        userId: user.id,
        transactionType: 'CHARGE',
        amount: 50000,
        description: 'Test charge',
      },
    });

    // then
    expect(transaction).toBeDefined();
    expect(transaction.userId).toBe(user.id);
    expect(transaction.amount).toBe(50000);
    expect(transaction.transactionType).toBe('CHARGE');
  });
});
