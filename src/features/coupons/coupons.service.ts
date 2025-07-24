import { Injectable } from '@nestjs/common';
import { CouponsRepository } from './coupons.repository';

@Injectable()
export class CouponsService {
  constructor(private readonly couponsRepository: CouponsRepository) {}
}
