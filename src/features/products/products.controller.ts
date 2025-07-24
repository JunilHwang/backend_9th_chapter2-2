import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { 
  PaginatedResponse
} from '../../common';
import { ProductsService } from './products.service';
import { 
  GetProductsQueryDto, 
  ProductResponseDto, 
  ProductSummaryDto 
} from './products.dto';

/**
 * 상품 컨트롤러
 */
@Controller('api/v1/products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  /**
   * 상품 목록 조회
   * GET /api/v1/products
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getProducts(
    @Query() query: GetProductsQueryDto
  ): Promise<PaginatedResponse<ProductSummaryDto>> {
    this.logger.log(`상품 목록 조회 요청: ${JSON.stringify(query)}`);
    
    const result = await this.productsService.getProducts(query);
    
    this.logger.log(`상품 목록 조회 완료: ${result.items.length}개 상품, 전체 ${result.pagination.total}개`);
    
    return result;
  }

  /**
   * 상품 상세 조회
   * GET /api/v1/products/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getProduct(
    @Param('id', ParseIntPipe) id: number
  ): Promise<ProductResponseDto> {
    this.logger.log(`상품 상세 조회 요청: productId=${id}`);
    
    const result = await this.productsService.getProductById(id);
    
    this.logger.log(`상품 상세 조회 완료: ${result.name} (재고: ${result.stockQuantity})`);
    
    return result;
  }

  /**
   * 활성 상품 목록 조회 (간편 API)
   * GET /api/v1/products/active
   */
  @Get('active')
  @HttpCode(HttpStatus.OK)
  async getActiveProducts(): Promise<ProductSummaryDto[]> {
    this.logger.log('활성 상품 목록 조회 요청');
    
    const result = await this.productsService.getActiveProducts();
    
    this.logger.log(`활성 상품 목록 조회 완료: ${result.length}개 상품`);
    
    return result;
  }
}