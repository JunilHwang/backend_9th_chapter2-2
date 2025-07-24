import { Injectable } from '@nestjs/common';
import { 
  Prisma, 
  Balance, 
  BalanceTransaction, 
  TransactionType as PrismaTransactionType 
} from '@prisma/client';
import { PrismaService } from '../../infrastructure';
import { TransactionType } from './balances.dto';

/**
 * 잔액 조회 옵션 인터페이스
 */
export interface FindBalanceOptions {
  includeUser?: boolean;
  includeTransactions?: boolean;
}

/**
 * 거래 이력 조회 옵션 인터페이스
 */
export interface FindTransactionsOptions {
  userId?: number;
  transactionType?: TransactionType;
  skip?: number;
  take?: number;
  orderBy?: Prisma.BalanceTransactionOrderByWithRelationInput;
}

/**
 * 잔액 Repository
 */
@Injectable()
export class BalancesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 사용자 ID로 잔액 조회
   */
  async findByUserId(
    userId: number, 
    options: FindBalanceOptions = {}
  ): Promise<Balance | null> {
    const { includeUser = false, includeTransactions = false } = options;

    return this.prisma.balance.findUnique({
      where: { userId },
      include: {
        user: includeUser,
        ...(includeTransactions && {
          user: {
            include: {
              transactions: {
                orderBy: { createdAt: 'desc' },
                take: 10, // 최근 10건만
              },
            },
          },
        }),
      },
    });
  }

  /**
   * 잔액 생성
   */
  async create(data: Prisma.BalanceCreateInput): Promise<Balance> {
    return this.prisma.balance.create({ data });
  }

  /**
   * 잔액 업데이트 (트랜잭션 내에서 사용)
   */
  async updateBalance(
    userId: number,
    amount: number,
    operation: 'increment' | 'decrement',
    tx?: Prisma.TransactionClient
  ): Promise<Balance> {
    const client = tx || this.prisma;

    return client.balance.update({
      where: { userId },
      data: {
        currentBalance: {
          [operation]: Math.abs(amount),
        },
        lastUpdatedAt: new Date(),
      },
    });
  }

  /**
   * 일일 충전 금액 업데이트
   */
  async updateDailyChargeAmount(
    userId: number,
    amount: number,
    operation: 'increment' | 'decrement' = 'increment',
    tx?: Prisma.TransactionClient
  ): Promise<Balance> {
    const client = tx || this.prisma;

    return client.balance.update({
      where: { userId },
      data: {
        dailyChargeAmount: {
          [operation]: Math.abs(amount),
        },
        lastUpdatedAt: new Date(),
      },
    });
  }

  /**
   * 일일 충전 금액 초기화 (매일 자정 실행용)
   */
  async resetDailyChargeAmount(
    userId?: number,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const client = tx || this.prisma;

    const updateData = {
      dailyChargeAmount: 0,
      lastUpdatedAt: new Date(),
    };

    if (userId) {
      // 특정 사용자만 초기화
      await client.balance.update({
        where: { userId },
        data: updateData,
      });
    } else {
      // 모든 사용자 초기화
      await client.balance.updateMany({
        data: updateData,
      });
    }
  }

  /**
   * 거래 이력 생성
   */
  async createTransaction(
    data: Prisma.BalanceTransactionCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<BalanceTransaction> {
    const client = tx || this.prisma;
    
    return client.balanceTransaction.create({ data });
  }

  /**
   * 사용자별 거래 이력 조회
   */
  async findTransactionsByUserId(
    userId: number,
    options: FindTransactionsOptions = {}
  ): Promise<BalanceTransaction[]> {
    const { 
      transactionType, 
      skip = 0, 
      take = 20, 
      orderBy = { createdAt: 'desc' } 
    } = options;

    return this.prisma.balanceTransaction.findMany({
      where: {
        userId,
        ...(transactionType && { 
          transactionType: transactionType as PrismaTransactionType 
        }),
      },
      orderBy,
      skip,
      take,
    });
  }

  /**
   * 거래 이력 총 개수 조회
   */
  async countTransactionsByUserId(
    userId: number,
    transactionType?: TransactionType
  ): Promise<number> {
    return this.prisma.balanceTransaction.count({
      where: {
        userId,
        ...(transactionType && { 
          transactionType: transactionType as PrismaTransactionType 
        }),
      },
    });
  }

  /**
   * 특정 기간 동안의 충전 금액 합계 조회
   */
  async getTotalChargeAmountByPeriod(
    userId: number,
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<number> {
    const result = await this.prisma.balanceTransaction.aggregate({
      where: {
        userId,
        transactionType: PrismaTransactionType.CHARGE,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }

  /**
   * 금일 충전 금액 조회
   */
  async getTodayChargeAmount(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getTotalChargeAmountByPeriod(userId, today, tomorrow);
  }
}
