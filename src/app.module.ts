import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter, ResponseTransformInterceptor } from './common';
import { PrismaModule } from './infrastructure';

// Features
import { BalancesModule } from './features/balances/Balances.module';
import { ProductsModule } from './features/products/Products.module';
import { OrdersModule } from './features/orders/Orders.module';
import { CouponsModule } from './features/coupons/Coupons.module';
import { StatisticsModule } from './features/statistics/Statistics.module';

@Module({
  imports: [
    // Infrastructure
    PrismaModule,

    // Feature modules
    BalancesModule,
    ProductsModule,
    OrdersModule,
    CouponsModule,
    StatisticsModule,
  ],
  providers: [
    // 글로벌 예외 필터 등록
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // 글로벌 응답 변환 인터셉터 등록
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class AppModule {}
