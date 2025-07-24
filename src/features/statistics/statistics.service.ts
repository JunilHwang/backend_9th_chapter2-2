import { Injectable } from '@nestjs/common';
import { StatisticsRepository } from './statistics.repository';

@Injectable()
export class StatisticsService {
  constructor(private readonly statisticsRepository: StatisticsRepository) {}
}
