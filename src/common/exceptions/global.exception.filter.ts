import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../types/response.type';
import { ErrorCode, ErrorMessages } from '../types/error.type';
import { BusinessException } from './business.exception';

/**
 * 전역 예외 필터
 * 모든 예외를 공통 응답 형식으로 변환
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let errorResponse: ErrorResponse;
    let statusCode: HttpStatus;

    if (exception instanceof BusinessException) {
      // 비즈니스 예외 처리
      statusCode = exception.getStatus();
      errorResponse = exception.getResponse() as ErrorResponse;
    } else if (exception instanceof HttpException) {
      // HTTP 예외 처리
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        errorResponse = {
          success: false,
          error: {
            code: ErrorCode.INVALID_PARAMETER,
            message: Array.isArray(exceptionResponse.message) 
              ? exceptionResponse.message.join(', ')
              : exceptionResponse.message,
            details: exceptionResponse,
          },
          timestamp: Date.now(),
        };
      } else {
        errorResponse = {
          success: false,
          error: {
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: exception.message,
          },
          timestamp: Date.now(),
        };
      }
    } else {
      // 알 수 없는 예외 처리
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessages[ErrorCode.INTERNAL_SERVER_ERROR],
          details: exception.message,
        },
        timestamp: Date.now(),
      };
    }

    // 로그 기록
    this.logger.error(
      `${request.method} ${request.url}`,
      exception.stack,
      'GlobalExceptionFilter',
    );

    response.status(statusCode).json(errorResponse);
  }
}
