import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';
import { BalancesRepository } from './balances.repository';

/**
 * 잔액 모듈
 */
@Module({
  imports: [
    PrismaModule, // Prisma 모듈 임포트
  ],
  controllers: [
    BalancesController,
  ],
  providers: [
    BalancesService,
    BalancesRepository,
  ],
  exports: [
    BalancesService, // 다른 모듈(주문 등)에서 사용할 수 있도록 export
    BalancesRepository,
  ],
})
export class BalancesModule {}
