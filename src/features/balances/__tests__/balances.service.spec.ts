import { Test, TestingModule } from '@nestjs/testing';
import { BalancesService } from '../balances.service';
import { BalancesRepository } from '../balances.repository';
import { PrismaService } from '../../../infrastructure';
import { ChargeBalanceRequestDto, TransactionType, } from '../balances.dto';

describe('BalancesService', () => {
  let service: BalancesService;
  let balancesRepository: BalancesRepository;
  let prismaService: PrismaService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: '테스트 사용자',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBalance = {
    id: BigInt(1),
    userId: 1,
    currentBalance: 100000,
    dailyChargeAmount: 50000,
    lastUpdatedAt: new Date(),
  };

  const mockBalancesRepository = {
    findByUserId: jest.fn(),
    create: jest.fn(),
    updateBalance: jest.fn(),
    updateDailyChargeAmount: jest.fn(),
    createTransaction: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalancesService,
        {
          provide: BalancesRepository,
          useValue: mockBalancesRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BalancesService>(BalancesService);
    balancesRepository = module.get<BalancesRepository>(BalancesRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('chargeBalance', () => {
    const validChargeRequest: ChargeBalanceRequestDto = {
      userId: 1,
      amount: 50000,
    };

    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBalancesRepository.findByUserId.mockResolvedValue(mockBalance);
      mockPrismaService.$transaction.mockImplementation((callback) => {
        return callback({});
      });
    });

    it('정상적으로 잔액을 충전해야 한다', async () => {
      const mockUpdatedBalance = { ...mockBalance, currentBalance: 150000 };
      const mockTransaction = {
        id: BigInt(1),
        userId: 1,
        transactionType: TransactionType.CHARGE,
        amount: 50000,
        balanceBefore: 100000,
        balanceAfter: 150000,
        description: '잔액 충전',
        createdAt: new Date(),
      };

      mockBalancesRepository.updateBalance.mockResolvedValue(mockUpdatedBalance);
      mockBalancesRepository.createTransaction.mockResolvedValue(mockTransaction);

      const result = await service.chargeBalance(validChargeRequest);

      expect(result.userId).toBe(1);
      expect(result.chargedAmount).toBe(50000);
      expect(result.currentBalance).toBe(150000);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('존재하지 않는 사용자일 경우 예외를 발생시켜야 한다', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.chargeBalance(validChargeRequest)).rejects.toThrow();
    });

    it('비활성화된 사용자일 경우 예외를 발생시켜야 한다', async () => {
      const inactiveUser = { ...mockUser, status: 'INACTIVE' };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      await expect(service.chargeBalance(validChargeRequest)).rejects.toThrow();
    });

    it('일일 충전 한도를 초과할 경우 예외를 발생시켜야 한다', async () => {
      const highDailyChargeBalance = {
        ...mockBalance,
        dailyChargeAmount: 980000, // 현재 98만원 충전
      };
      mockBalancesRepository.findByUserId.mockResolvedValue(highDailyChargeBalance);

      const largeChargeRequest = { userId: 1, amount: 50000 }; // 5만원 추가 충전 시도 (총 103만원)

      await expect(service.chargeBalance(largeChargeRequest)).rejects.toThrow();
    });

    it('최대 보유 한도를 초과할 경우 예외를 발생시켜야 한다', async () => {
      const highBalanceAccount = {
        ...mockBalance,
        currentBalance: 9950000, // 현재 995만원 보유
        dailyChargeAmount: 0,
      };
      mockBalancesRepository.findByUserId.mockResolvedValue(highBalanceAccount);

      const largeChargeRequest = { userId: 1, amount: 100000 }; // 10만원 충전 시도 (총 1005만원)

      await expect(service.chargeBalance(largeChargeRequest)).rejects.toThrow();
    });

    it('잔액 계정이 없는 경우 새로 생성해야 한다', async () => {
      mockBalancesRepository.findByUserId.mockResolvedValue(null);
      const newBalance = {
        id: BigInt(1),
        userId: 1,
        currentBalance: 0,
        dailyChargeAmount: 0,
        lastUpdatedAt: new Date(),
      };
      mockBalancesRepository.create.mockResolvedValue(newBalance);

      const mockUpdatedBalance = { ...newBalance, currentBalance: 50000 };
      mockBalancesRepository.updateBalance.mockResolvedValue(mockUpdatedBalance);

      const mockTransaction = {
        id: BigInt(1),
        userId: 1,
        transactionType: TransactionType.CHARGE,
        amount: 50000,
        balanceBefore: 0,
        balanceAfter: 50000,
        description: '잔액 충전',
        createdAt: new Date(),
      };
      mockBalancesRepository.createTransaction.mockResolvedValue(mockTransaction);

      const result = await service.chargeBalance(validChargeRequest);

      expect(result.currentBalance).toBe(50000);
      expect(mockBalancesRepository.create).toHaveBeenCalled();
    });
  });

  describe('getBalance', () => {
    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
    });

    it('기존 잔액을 정상적으로 조회해야 한다', async () => {
      mockBalancesRepository.findByUserId.mockResolvedValue(mockBalance);

      const result = await service.getBalance(1);

      expect(result.userId).toBe(1);
      expect(result.currentBalance).toBe(100000);
      expect(result.dailyChargedAmount).toBe(50000);
      expect(balancesRepository.findByUserId).toHaveBeenCalledWith(1);
    });

    it('잔액 계정이 없는 경우 새로 생성하고 반환해야 한다', async () => {
      mockBalancesRepository.findByUserId.mockResolvedValue(null);
      const newBalance = {
        id: BigInt(1),
        userId: 1,
        currentBalance: 0,
        dailyChargeAmount: 0,
        lastUpdatedAt: new Date(),
      };
      mockBalancesRepository.create.mockResolvedValue(newBalance);

      const result = await service.getBalance(1);

      expect(result.userId).toBe(1);
      expect(result.currentBalance).toBe(0);
      expect(result.dailyChargedAmount).toBe(0);
      expect(balancesRepository.create).toHaveBeenCalled();
    });

    it('존재하지 않는 사용자일 경우 예외를 발생시켜야 한다', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getBalance(999)).rejects.toThrow();
    });
  });

  describe('useBalance', () => {
    beforeEach(() => {
      mockBalancesRepository.findByUserId.mockResolvedValue(mockBalance);
      mockPrismaService.$transaction.mockImplementation((callback) => {
        return callback({});
      });
    });

    it('정상적으로 잔액을 사용해야 한다', async () => {
      const useAmount = 30000;
      const mockUpdatedBalance = { ...mockBalance, currentBalance: 70000 };
      const mockTransaction = {
        id: BigInt(1),
        userId: 1,
        transactionType: TransactionType.USE,
        amount: useAmount,
        balanceBefore: 100000,
        balanceAfter: 70000,
        description: '상품 결제',
        createdAt: new Date(),
      };

      mockBalancesRepository.updateBalance.mockResolvedValue(mockUpdatedBalance);
      mockBalancesRepository.createTransaction.mockResolvedValue(mockTransaction);

      const result = await service.useBalance(1, useAmount);

      expect(result.userId).toBe(1);
      expect(result.amount).toBe(useAmount);
      expect(result.balanceBefore).toBe(100000);
      expect(result.balanceAfter).toBe(70000);
      expect(result.transactionType).toBe(TransactionType.USE);
    });

    it('잔액이 부족한 경우 예외를 발생시켜야 한다', async () => {
      const insufficientAmount = 150000; // 현재 잔액(100,000)보다 큰 금액

      await expect(service.useBalance(1, insufficientAmount)).rejects.toThrow();
      expect(balancesRepository.findByUserId).toHaveBeenCalledWith(1);
    });

    it('잔액 계정이 없는 경우 예외를 발생시켜야 한다', async () => {
      mockBalancesRepository.findByUserId.mockResolvedValue(null);

      await expect(service.useBalance(1, 10000)).rejects.toThrow();
    });

    it('트랜잭션 컨텍스트가 제공된 경우 해당 트랜잭션에서 실행해야 한다', async () => {
      const mockTx = {} as any;
      const useAmount = 30000;
      const mockUpdatedBalance = { ...mockBalance, currentBalance: 70000 };
      const mockTransaction = {
        id: BigInt(1),
        userId: 1,
        transactionType: TransactionType.USE,
        amount: useAmount,
        balanceBefore: 100000,
        balanceAfter: 70000,
        description: '상품 결제',
        createdAt: new Date(),
      };

      mockBalancesRepository.updateBalance.mockResolvedValue(mockUpdatedBalance);
      mockBalancesRepository.createTransaction.mockResolvedValue(mockTransaction);

      const result = await service.useBalance(1, useAmount, '상품 결제', mockTx);

      expect(result.transactionType).toBe(TransactionType.USE);
      expect(mockBalancesRepository.updateBalance).toHaveBeenCalledWith(1, useAmount, 'decrement', mockTx);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('refundBalance', () => {
    beforeEach(() => {
      mockPrismaService.$transaction.mockImplementation((callback) => {
        return callback({});
      });
    });

    it('정상적으로 잔액을 환불해야 한다', async () => {
      const refundAmount = 20000;
      const mockUpdatedBalance = { ...mockBalance, currentBalance: 120000 };
      const mockTransaction = {
        id: BigInt(1),
        userId: 1,
        transactionType: TransactionType.REFUND,
        amount: refundAmount,
        balanceBefore: 100000,
        balanceAfter: 120000,
        description: '주문 취소 환불',
        createdAt: new Date(),
      };

      mockBalancesRepository.findByUserId.mockResolvedValue(mockBalance);
      mockBalancesRepository.updateBalance.mockResolvedValue(mockUpdatedBalance);
      mockBalancesRepository.createTransaction.mockResolvedValue(mockTransaction);

      const result = await service.refundBalance(1, refundAmount);

      expect(result.userId).toBe(1);
      expect(result.amount).toBe(refundAmount);
      expect(result.balanceBefore).toBe(100000);
      expect(result.balanceAfter).toBe(120000);
      expect(result.transactionType).toBe(TransactionType.REFUND);
    });

    it('트랜잭션 컨텍스트가 제공된 경우 해당 트랜잭션에서 실행해야 한다', async () => {
      const mockTx = {} as any;
      const refundAmount = 20000;
      const mockUpdatedBalance = { ...mockBalance, currentBalance: 120000 };
      const mockTransaction = {
        id: BigInt(1),
        userId: 1,
        transactionType: TransactionType.REFUND,
        amount: refundAmount,
        balanceBefore: 100000,
        balanceAfter: 120000,
        description: '주문 취소 환불',
        createdAt: new Date(),
      };

      mockBalancesRepository.findByUserId.mockResolvedValue(mockBalance);
      mockBalancesRepository.updateBalance.mockResolvedValue(mockUpdatedBalance);
      mockBalancesRepository.createTransaction.mockResolvedValue(mockTransaction);

      const result = await service.refundBalance(1, refundAmount, '주문 취소 환불', mockTx);

      expect(result.transactionType).toBe(TransactionType.REFUND);
      expect(mockBalancesRepository.updateBalance).toHaveBeenCalledWith(1, refundAmount, 'increment', mockTx);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('잔액 계정이 없는 경우에도 환불을 처리해야 한다', async () => {
      const refundAmount = 20000;
      const mockUpdatedBalance = {
        id: BigInt(1),
        userId: 1,
        currentBalance: 20000,
        dailyChargeAmount: 0,
        lastUpdatedAt: new Date(),
      };
      const mockTransaction = {
        id: BigInt(1),
        userId: 1,
        transactionType: TransactionType.REFUND,
        amount: refundAmount,
        balanceBefore: 0,
        balanceAfter: 20000,
        description: '주문 취소 환불',
        createdAt: new Date(),
      };

      mockBalancesRepository.findByUserId.mockResolvedValue(null);
      mockBalancesRepository.updateBalance.mockResolvedValue(mockUpdatedBalance);
      mockBalancesRepository.createTransaction.mockResolvedValue(mockTransaction);

      const result = await service.refundBalance(1, refundAmount);

      expect(result.userId).toBe(1);
      expect(result.balanceBefore).toBe(0);
      expect(result.balanceAfter).toBe(20000);
      expect(result.transactionType).toBe(TransactionType.REFUND);
    });
  });

  describe('validateChargeRequest (private method behavior)', () => {
    it('일일 충전 한도 내에서 정상 검증되어야 한다', async () => {
      const normalBalance = {
        ...mockBalance,
        dailyChargeAmount: 500000, // 50만원 이미 충전
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBalancesRepository.findByUserId.mockResolvedValue(normalBalance);

      mockPrismaService.$transaction.mockImplementation((callback) => {
        return callback({});
      });

      const mockUpdatedBalance = { ...normalBalance, currentBalance: 150000 };
      mockBalancesRepository.updateBalance.mockResolvedValue(mockUpdatedBalance);
      mockBalancesRepository.createTransaction.mockResolvedValue({
        id: BigInt(1),
        userId: 1,
        transactionType: TransactionType.CHARGE,
        amount: 50000,
        balanceBefore: 100000,
        balanceAfter: 150000,
        description: '잔액 충전',
        createdAt: new Date(),
      });

      const result = await service.chargeBalance({ userId: 1, amount: 400000 }); // 40만원 추가 충전 (총 90만원, 한도 내)

      expect(result.chargedAmount).toBe(400000);
    });

    it('최대 보유 한도 내에서 정상 검증되어야 한다', async () => {
      // 모든 mocks를 명시적으로 초기화
      jest.clearAllMocks();

      const normalBalance = {
        ...mockBalance,
        currentBalance: 5000000, // 500만원 보유
        dailyChargeAmount: 0,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBalancesRepository.findByUserId.mockResolvedValue(normalBalance);

      mockPrismaService.$transaction.mockImplementation((callback) => {
        return callback({});
      });

      const mockUpdatedBalance = { ...normalBalance, currentBalance: 5500000 };
      mockBalancesRepository.updateBalance.mockResolvedValue(mockUpdatedBalance);
      mockBalancesRepository.updateDailyChargeAmount.mockResolvedValue(normalBalance);
      mockBalancesRepository.createTransaction.mockResolvedValue({
        id: BigInt(1),
        userId: 1,
        transactionType: TransactionType.CHARGE,
        amount: 500000,
        balanceBefore: 5000000,
        balanceAfter: 5500000,
        description: '잔액 충전',
        createdAt: new Date(),
      });

      const result = await service.chargeBalance({ userId: 1, amount: 500000 }); // 50만원 충전 (일일 한도 100만원 내)

      expect(result.currentBalance).toBe(5500000);
    });
  });
});
