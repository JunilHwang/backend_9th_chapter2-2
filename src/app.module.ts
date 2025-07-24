import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './infrastructure';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
}
