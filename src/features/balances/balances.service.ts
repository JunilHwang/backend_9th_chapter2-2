import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Balance, BalanceTransaction, User } from '@prisma/client';
import { PrismaService } from '../../infrastructure';
import { BusinessExceptions } from '../../common';
import { BalancesRepository } from './balances.repository';
import {
  ChargeBalanceRequestDto,
  ChargeBalanceResponseDto,
  GetBalanceResponseDto,
  BalanceValidationDto,
  BalanceUpdateResultDto,
  TransactionType,
} from './balances.dto';

/**
 * 잔액 서비스
 */
@Injectable()
export class BalancesService {
  private readonly logger = new Logger(BalancesService.name);

  // 비즈니스 상수
  private readonly DAILY_CHARGE_LIMIT = 1_000_000; // 일일 충전 한도: 100만원
  private readonly MAX_BALANCE_LIMIT = 10_000_000; // 최대 보유 한도: 1000만원

  constructor(
    private readonly balancesRepository: BalancesRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 잔액 충전
   */
  async chargeBalance(request: ChargeBalanceRequestDto): Promise<ChargeBalanceResponseDto> {
    const { userId, amount } = request;

    this.logger.log(`잔액 충전 요청: userId=${userId}, amount=${amount.toLocaleString()}원`);

    // 사용자 존재 여부 확인
    await this.validateUserExists(userId);

    // 잔액 유효성 검증
    const validation = await this.validateChargeRequest(userId, amount);
    if (!validation.isValid) {
      throw BusinessExceptions.dailyChargeLimitExceeded(validation.details);
    }

    // 트랜잭션 처리
    const result = await this.executeChargeTransaction(userId, amount);

    this.logger.log(`잔액 충전 완료: userId=${userId}, 충전 후 잔액=${result.balanceAfter.toLocaleString()}원`);

    return new ChargeBalanceResponseDto({
      userId: result.userId,
      chargedAmount: result.amount,
      currentBalance: result.balanceAfter,
      chargedAt: result.timestamp,
    });
  }

  /**
   * 잔액 조회
   */
  async getBalance(userId: number): Promise<GetBalanceResponseDto> {
    this.logger.log(`잔액 조회 요청: userId=${userId}`);

    // 사용자 존재 여부 확인
    await this.validateUserExists(userId);

    const balance = await this.balancesRepository.findByUserId(userId);

    if (!balance) {
      // 잔액 계정이 없으면 생성
      const newBalance = await this.balancesRepository.create({
        user: { connect: { id: userId } },
        currentBalance: 0,
        dailyChargeAmount: 0,
        lastUpdatedAt: new Date(),
      });

      return new GetBalanceResponseDto({
        userId: userId,
        currentBalance: newBalance.currentBalance,
        dailyChargedAmount: newBalance.dailyChargeAmount,
        lastUpdatedAt: newBalance.lastUpdatedAt.getTime(),
      });
    }

    this.logger.log(`잔액 조회 완료: userId=${userId}, 잔액=${balance.currentBalance.toLocaleString()}원`);

    return new GetBalanceResponseDto({
      userId: userId,
      currentBalance: balance.currentBalance,
      dailyChargedAmount: balance.dailyChargeAmount,
      lastUpdatedAt: balance.lastUpdatedAt.getTime(),
    });
  }

  /**
   * 잔액 사용 (주문 결제 시 사용)
   */
  async useBalance(
    userId: number,
    amount: number,
    description: string = '상품 결제',
    tx?: Prisma.TransactionClient
  ): Promise<BalanceUpdateResultDto> {
    this.logger.log(`잔액 사용 요청: userId=${userId}, amount=${amount.toLocaleString()}원`);

    const balance = await this.balancesRepository.findByUserId(userId);

    if (!balance) {
      throw BusinessExceptions.userNotFound(userId);
    }

    if (balance.currentBalance < amount) {
      throw BusinessExceptions.insufficientBalance({
        currentBalance: balance.currentBalance,
        requiredAmount: amount,
        shortfall: amount - balance.currentBalance,
      });
    }

    // 트랜잭션 내에서 실행
    if (tx) {
      return this.executeBalanceUpdate(userId, amount, TransactionType.USE, description, tx);
    }

    return this.prisma.$transaction(async (transaction) => {
      return this.executeBalanceUpdate(userId, amount, TransactionType.USE, description, transaction);
    });
  }

  /**
   * 잔액 환불 (주문 취소 시 사용)
   */
  async refundBalance(
    userId: number,
    amount: number,
    description: string = '주문 취소 환불',
    tx?: Prisma.TransactionClient
  ): Promise<BalanceUpdateResultDto> {
    this.logger.log(`잔액 환불 요청: userId=${userId}, amount=${amount.toLocaleString()}원`);

    // 트랜잭션 내에서 실행
    if (tx) {
      return this.executeBalanceUpdate(userId, amount, TransactionType.REFUND, description, tx);
    }

    return this.prisma.$transaction(async (transaction) => {
      return this.executeBalanceUpdate(userId, amount, TransactionType.REFUND, description, transaction);
    });
  }

  /**
   * 사용자 존재 여부 검증
   */
  private async validateUserExists(userId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw BusinessExceptions.userNotFound(userId);
    }

    if (user.status !== 'ACTIVE') {
      throw BusinessExceptions.invalidParameter({
        field: 'userId',
        value: userId,
        reason: '비활성화된 사용자입니다.',
      });
    }

    return user;
  }

  /**
   * 충전 요청 유효성 검증
   */
  private async validateChargeRequest(userId: number, amount: number): Promise<BalanceValidationDto> {
    const balance = await this.balancesRepository.findByUserId(userId);
    const currentBalance = balance?.currentBalance || 0;
    const dailyChargedAmount = balance?.dailyChargeAmount || 0;

    // 일일 충전 한도 확인
    if (dailyChargedAmount + amount > this.DAILY_CHARGE_LIMIT) {
      return new BalanceValidationDto({
        isValid: false,
        currentBalance,
        dailyChargedAmount,
        errorCode: 'DAILY_CHARGE_LIMIT_EXCEEDED',
        errorMessage: '일일 충전 한도를 초과했습니다.',
        details: {
          dailyLimit: this.DAILY_CHARGE_LIMIT,
          currentDailyCharged: dailyChargedAmount,
          attemptedAmount: amount,
        },
      });
    }

    // 최대 보유 한도 확인
    if (currentBalance + amount > this.MAX_BALANCE_LIMIT) {
      return new BalanceValidationDto({
        isValid: false,
        currentBalance,
        dailyChargedAmount,
        errorCode: 'MAX_BALANCE_LIMIT_EXCEEDED',
        errorMessage: '최대 보유 한도를 초과했습니다.',
        details: {
          maxBalanceLimit: this.MAX_BALANCE_LIMIT,
          currentBalance,
          attemptedAmount: amount,
        },
      });
    }

    return new BalanceValidationDto({
      isValid: true,
      currentBalance,
      dailyChargedAmount,
    });
  }

  /**
   * 충전 트랜잭션 실행
   */
  private async executeChargeTransaction(userId: number, amount: number): Promise<BalanceUpdateResultDto> {
    return this.prisma.$transaction(async (transaction) => {
      // 1. 잔액 계정 확인/생성
      let balance = await this.balancesRepository.findByUserId(userId);
      if (!balance) {
        balance = await this.balancesRepository.create({
          user: { connect: { id: userId } },
          currentBalance: 0,
          dailyChargeAmount: 0,
          lastUpdatedAt: new Date(),
        });
      }

      const balanceBefore = balance.currentBalance;

      // 2. 잔액 증가
      const updatedBalance = await this.balancesRepository.updateBalance(
        userId,
        amount,
        'increment',
        transaction
      );

      // 3. 일일 충전 금액 증가
      await this.balancesRepository.updateDailyChargeAmount(
        userId,
        amount,
        'increment',
        transaction
      );

      // 4. 거래 이력 생성
      const transactionRecord = await this.balancesRepository.createTransaction(
        {
          user: { connect: { id: userId } },
          transactionType: TransactionType.CHARGE,
          amount,
          balanceBefore,
          balanceAfter: updatedBalance.currentBalance,
          description: '잔액 충전',
        },
        transaction
      );

      return new BalanceUpdateResultDto({
        userId: userId,
        transactionId: Number(transactionRecord.id),
        balanceBefore,
        balanceAfter: updatedBalance.currentBalance,
        amount,
        transactionType: TransactionType.CHARGE,
        timestamp: Date.now(),
      });
    });
  }

  /**
   * 잔액 업데이트 실행 (사용/환불)
   */
  private async executeBalanceUpdate(
    userId: number,
    amount: number,
    transactionType: TransactionType,
    description: string,
    tx: Prisma.TransactionClient
  ): Promise<BalanceUpdateResultDto> {
    const balance = await this.balancesRepository.findByUserId(userId);
    const balanceBefore = balance?.currentBalance || 0;

    const operation = transactionType === TransactionType.USE ? 'decrement' : 'increment';

    // 잔액 업데이트
    const updatedBalance = await this.balancesRepository.updateBalance(
      userId,
      amount,
      operation,
      tx
    );

    // 거래 이력 생성
    const transactionRecord = await this.balancesRepository.createTransaction(
      {
        user: { connect: { id: userId } },
        transactionType,
        amount,
        balanceBefore,
        balanceAfter: updatedBalance.currentBalance,
        description,
      },
      tx
    );

    return new BalanceUpdateResultDto({
      userId: userId,
      transactionId: Number(transactionRecord.id),
      balanceBefore,
      balanceAfter: updatedBalance.currentBalance,
      amount,
      transactionType,
      timestamp: Date.now(),
    });
  }
}
