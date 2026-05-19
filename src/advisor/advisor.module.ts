import { Module } from '@nestjs/common';
import { AdvisorController } from './advisor.controller';
import { AdvisorService } from './advisor.service';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [AnalyticsModule],
  controllers: [AdvisorController],
  providers: [AdvisorService],
  exports: [AdvisorService], // Lo exportamos por si lo necesitas en el futuro
})
export class AdvisorModule {}
