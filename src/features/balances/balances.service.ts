import { Injectable } from '@nestjs/common';
import { BalancesRepository } from './balances.repository';

@Injectable()
export class BalancesService {
  constructor(private readonly balancesRepository: BalancesRepository) {}
}
