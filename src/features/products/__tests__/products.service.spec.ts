import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../products.service';
import { ProductsRepository } from '../products.repository';
import { GetProductsQueryDto, ProductStatus } from '../products.dto';
import { BusinessExceptions } from '../../../common';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: ProductsRepository;

  const mockProduct = {
    id: BigInt(1),
    name: '무선 마우스',
    price: 25000,
    stockQuantity: 50,
    status: ProductStatus.ACTIVE,
    description: '고성능 무선 게이밍 마우스',
    createdAt: new Date('2024-07-17T10:00:00Z'),
    updatedAt: new Date('2024-07-17T10:00:00Z'),
  };

  const mockInactiveProduct = {
    ...mockProduct,
    id: BigInt(2),
    status: ProductStatus.INACTIVE,
  };

  const mockProductsRepository = {
    findById: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findActiveProducts: jest.fn(),
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductById', () => {
    it('ID로 상품을 성공적으로 조회해야 한다', async () => {
      mockProductsRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getProductById(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('무선 마우스');
      expect(result.status).toBe(ProductStatus.ACTIVE);
    });

    it('존재하지 않는 상품 조회 시 PRODUCT_NOT_FOUND 예외를 발생시켜야 한다', async () => {
      mockProductsRepository.findById.mockResolvedValue(null);

      await expect(service.getProductById(999)).rejects.toThrow();
      expect(repository.findById).toHaveBeenCalledWith(999);
    });

    it('비활성화된 상품 조회 시 PRODUCT_INACTIVE 예외를 발생시켜야 한다', async () => {
      mockProductsRepository.findById.mockResolvedValue(mockInactiveProduct);

      await expect(service.getProductById(2)).rejects.toThrow();
      expect(repository.findById).toHaveBeenCalledWith(2);
    });
  });

  describe('getProducts', () => {
    it('기본 쿼리로 상품 목록을 페이징 조회해야 한다', async () => {
      const query: GetProductsQueryDto = {};
      const mockProducts = [mockProduct];
      const mockTotal = 1;

      mockProductsRepository.findMany.mockResolvedValue(mockProducts);
      mockProductsRepository.count.mockResolvedValue(mockTotal);

      const result = await service.getProducts(query);

      expect(repository.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        where: { status: { not: ProductStatus.INACTIVE } },
        orderBy: { createdAt: 'desc' },
      });
      expect(repository.count).toHaveBeenCalledWith({ status: { not: ProductStatus.INACTIVE } });
      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('상태 필터가 있는 경우 해당 상태로 필터링해야 한다', async () => {
      const query: GetProductsQueryDto = { status: ProductStatus.ACTIVE };
      const mockProducts = [mockProduct];
      const mockTotal = 1;

      mockProductsRepository.findMany.mockResolvedValue(mockProducts);
      mockProductsRepository.count.mockResolvedValue(mockTotal);

      const result = await service.getProducts(query);

      expect(repository.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        where: { status: ProductStatus.ACTIVE },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('정렬 옵션이 있는 경우 해당 옵션으로 정렬해야 한다', async () => {
      const query: GetProductsQueryDto = { 
        sortBy: 'price', 
        sortOrder: 'ASC',
      };
      const mockProducts = [mockProduct];
      const mockTotal = 1;

      mockProductsRepository.findMany.mockResolvedValue(mockProducts);
      mockProductsRepository.count.mockResolvedValue(mockTotal);

      await service.getProducts(query);

      expect(repository.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        where: { status: { not: ProductStatus.INACTIVE } },
        orderBy: { price: 'asc' },
      });
    });

    it('페이징 파라미터가 있는 경우 해당 페이지를 조회해야 한다', async () => {
      const query: GetProductsQueryDto = { 
        page: 2, 
        size: 10,
      };
      const mockProducts = [mockProduct];
      const mockTotal = 25;

      mockProductsRepository.findMany.mockResolvedValue(mockProducts);
      mockProductsRepository.count.mockResolvedValue(mockTotal);

      const result = await service.getProducts(query);

      expect(repository.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        where: { status: { not: ProductStatus.INACTIVE } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.size).toBe(10);
    });
  });

  describe('getActiveProducts', () => {
    it('활성 상품 목록을 조회해야 한다', async () => {
      const mockActiveProducts = [mockProduct];
      mockProductsRepository.findActiveProducts.mockResolvedValue(mockActiveProducts);

      const result = await service.getActiveProducts();

      expect(repository.findActiveProducts).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].status).toBe(ProductStatus.ACTIVE);
    });

    it('활성 상품이 없는 경우 빈 배열을 반환해야 한다', async () => {
      mockProductsRepository.findActiveProducts.mockResolvedValue([]);

      const result = await service.getActiveProducts();

      expect(result).toEqual([]);
    });
  });

  describe('getProductsByIds', () => {
    it('여러 상품 ID로 상품들을 조회해야 한다', async () => {
      const ids = [1, 2];
      const mockProducts = [
        mockProduct,
        { ...mockProduct, id: BigInt(2), name: '키보드' },
      ];
      mockProductsRepository.findByIds.mockResolvedValue(mockProducts);

      const result = await service.getProductsByIds(ids);

      expect(repository.findByIds).toHaveBeenCalledWith(ids);
      expect(result).toHaveLength(2);
    });

    it('존재하지 않는 상품 ID가 있는 경우 예외를 발생시켜야 한다', async () => {
      const ids = [1, 999];
      const mockProducts = [mockProduct];
      mockProductsRepository.findByIds.mockResolvedValue(mockProducts);

      await expect(service.getProductsByIds(ids)).rejects.toThrow();
      expect(repository.findByIds).toHaveBeenCalledWith(ids);
    });
  });

  describe('checkStock', () => {
    it('재고가 충분한 경우 true를 반환해야 한다', async () => {
      mockProductsRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.checkStock(1, 10);

      expect(result).toBe(true);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('재고가 부족한 경우 false를 반환해야 한다', async () => {
      mockProductsRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.checkStock(1, 100);

      expect(result).toBe(false);
    });

    it('존재하지 않는 상품의 재고 확인 시 예외를 발생시켜야 한다', async () => {
      mockProductsRepository.findById.mockResolvedValue(null);

      await expect(service.checkStock(999, 10)).rejects.toThrow();
    });

    it('비활성화된 상품의 재고 확인 시 예외를 발생시켜야 한다', async () => {
      mockProductsRepository.findById.mockResolvedValue(mockInactiveProduct);

      await expect(service.checkStock(2, 10)).rejects.toThrow();
    });
  });

  describe('existsById', () => {
    it('상품이 존재하는 경우 true를 반환해야 한다', async () => {
      mockProductsRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.existsById(1);

      expect(result).toBe(true);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('상품이 존재하지 않는 경우 false를 반환해야 한다', async () => {
      mockProductsRepository.findById.mockResolvedValue(null);

      const result = await service.existsById(999);

      expect(result).toBe(false);
    });
  });
});