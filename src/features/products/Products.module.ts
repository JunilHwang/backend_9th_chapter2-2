import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';

/**
 * 상품 모듈
 */
@Module({
  imports: [
    PrismaModule, // Prisma 모듈 임포트
  ],
  controllers: [
    ProductsController,
  ],
  providers: [
    ProductsService,
    ProductsRepository,
  ],
  exports: [
    ProductsService, // 다른 모듈에서 사용할 수 있도록 export
    ProductsRepository,
  ],
})
export class ProductsModule {}
