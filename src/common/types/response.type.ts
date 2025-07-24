/**
 * API 공통 응답 타입 정의
 */

// 기본 응답 인터페이스
export interface BaseResponse {
  success: boolean;
  timestamp: number;
}

// 성공 응답
export interface SuccessResponse<T = any> extends BaseResponse {
  success: true;
  data: T;
}

// 에러 응답
export interface ErrorResponse extends BaseResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// 페이징 정보
export interface PaginationInfo {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 페이징된 응답
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// 페이징 요청 DTO 기본 클래스
export class PaginationDto {
  page?: number = 1;
  size?: number = 20;
}
