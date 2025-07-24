import { PaginationInfo, PaginatedResponse } from '../types/response.type';

/**
 * 응답 생성 유틸리티
 */
export class ResponseUtil {
  /**
   * 페이징 정보 생성
   */
  static createPaginationInfo(
    page: number,
    size: number,
    total: number,
  ): PaginationInfo {
    const totalPages = Math.ceil(total / size);
    
    return {
      page,
      size,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * 페이징된 응답 생성
   */
  static createPaginatedResponse<T>(
    items: T[],
    page: number,
    size: number,
    total: number,
  ): PaginatedResponse<T> {
    return {
      items,
      pagination: this.createPaginationInfo(page, size, total),
    };
  }

  /**
   * 페이징 파라미터 검증 및 정규화
   */
  static normalizePagination(page?: number, size?: number) {
    const normalizedPage = Math.max(1, page || 1);
    const normalizedSize = Math.min(100, Math.max(1, size || 20));
    
    return {
      page: normalizedPage,
      size: normalizedSize,
      skip: (normalizedPage - 1) * normalizedSize,
      take: normalizedSize,
    };
  }
}

/**
 * 정렬 유틸리티
 */
export class SortUtil {
  /**
   * 정렬 조건 검증 및 정규화
   */
  static normalizeSortOrder(
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    allowedFields: string[] = [],
  ) {
    const normalizedSortBy = allowedFields.includes(sortBy) ? sortBy : allowedFields[0];
    const normalizedSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    
    return {
      [normalizedSortBy]: normalizedSortOrder,
    };
  }
}
