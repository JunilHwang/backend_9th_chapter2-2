import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { BalancesService } from './balances.service';
import {
  ChargeBalanceRequestDto,
  ChargeBalanceResponseDto,
  GetBalanceResponseDto,
} from './balances.dto';

/**
 * 잔액 컨트롤러
 */
@Controller('api/v1/balances')
export class BalancesController {
  private readonly logger = new Logger(BalancesController.name);

  constructor(private readonly balancesService: BalancesService) {}

  /**
   * 잔액 충전
   * POST /api/v1/balances/charge
   */
  @Post('charge')
  @HttpCode(HttpStatus.OK)
  async chargeBalance(
    @Body(ValidationPipe) request: ChargeBalanceRequestDto
  ): Promise<ChargeBalanceResponseDto> {
    this.logger.log(`잔액 충전 API 호출: userId=${request.userId}, amount=${request.amount.toLocaleString()}원`);
    
    const result = await this.balancesService.chargeBalance(request);
    
    this.logger.log(`잔액 충전 API 완료: userId=${result.userId}, 현재 잔액=${result.currentBalance.toLocaleString()}원`);
    
    return result;
  }

  /**
   * 잔액 조회
   * GET /api/v1/balances/:userId
   */
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  async getBalance(
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<GetBalanceResponseDto> {
    this.logger.log(`잔액 조회 API 호출: userId=${userId}`);
    
    const result = await this.balancesService.getBalance(userId);
    
    this.logger.log(`잔액 조회 API 완료: userId=${userId}, 잔액=${result.currentBalance.toLocaleString()}원`);
    
    return result;
  }
}
