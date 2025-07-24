import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../products.controller';
import { ProductsService } from '../products.service';
import { GetProductsQueryDto, ProductResponseDto, ProductSummaryDto, ProductStatus } from '../products.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    getProducts: jest.fn(),
    getProductById: jest.fn(),
    getActiveProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('상품 목록을 페이징으로 조회해야 한다', async () => {
      const query: GetProductsQueryDto = {
        page: 1,
        size: 10,
        status: ProductStatus.ACTIVE,
        sortBy: 'name',
        sortOrder: 'ASC',
      };

      const mockResponse = {
        items: [
          {
            id: 1,
            name: '무선 마우스',
            price: 25000,
            stockQuantity: 50,
            status: ProductStatus.ACTIVE,
            createdAt: 1721211600000,
          },
        ],
        pagination: {
          page: 1,
          size: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      mockProductsService.getProducts.mockResolvedValue(mockResponse);

      const result = await controller.getProducts(query);

      expect(service.getProducts).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });

    it('기본 쿼리 파라미터로 상품 목록을 조회해야 한다', async () => {
      const query: GetProductsQueryDto = {};
      const mockResponse = {
        items: [],
        pagination: {
          page: 1,
          size: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };

      mockProductsService.getProducts.mockResolvedValue(mockResponse);

      const result = await controller.getProducts(query);

      expect(service.getProducts).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getProduct', () => {
    it('ID로 상품 상세 정보를 조회해야 한다', async () => {
      const productId = 1;
      const mockProduct = new ProductResponseDto({
        id: 1,
        name: '무선 마우스',
        price: 25000,
        stockQuantity: 50,
        status: ProductStatus.ACTIVE,
        description: '고성능 무선 게이밍 마우스',
        createdAt: 1721211600000,
        updatedAt: 1721211600000,
      });

      mockProductsService.getProductById.mockResolvedValue(mockProduct);

      const result = await controller.getProduct(productId);

      expect(service.getProductById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });

    it('존재하지 않는 상품 조회 시 서비스 에러를 전파해야 한다', async () => {
      const productId = 999;
      const error = new Error('상품을 찾을 수 없습니다.');

      mockProductsService.getProductById.mockRejectedValue(error);

      await expect(controller.getProduct(productId)).rejects.toThrow(error);
      expect(service.getProductById).toHaveBeenCalledWith(productId);
    });
  });

  describe('getActiveProducts', () => {
    it('활성 상품 목록을 조회해야 한다', async () => {
      const mockActiveProducts = [
        new ProductSummaryDto({
          id: 1,
          name: '무선 마우스',
          price: 25000,
          stockQuantity: 50,
          status: ProductStatus.ACTIVE,
          createdAt: 1721211600000,
        }),
        new ProductSummaryDto({
          id: 2,
          name: '기계식 키보드',
          price: 89000,
          stockQuantity: 30,
          status: ProductStatus.ACTIVE,
          createdAt: 1721211700000,
        }),
      ];

      mockProductsService.getActiveProducts.mockResolvedValue(mockActiveProducts);

      const result = await controller.getActiveProducts();

      expect(service.getActiveProducts).toHaveBeenCalled();
      expect(result).toEqual(mockActiveProducts);
      expect(result).toHaveLength(2);
    });

    it('활성 상품이 없는 경우 빈 배열을 반환해야 한다', async () => {
      mockProductsService.getActiveProducts.mockResolvedValue([]);

      const result = await controller.getActiveProducts();

      expect(service.getActiveProducts).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});