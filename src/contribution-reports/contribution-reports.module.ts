import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionReportsService } from './contribution-reports.service';
import { ContributionReportsController } from './contribution-reports.controller';
import { ContributionReportEntity } from './infrastructure/persistence/relational/entities/contribution-report.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContributionReportEntity]),
    NotificationsModule,
  ],
  controllers: [ContributionReportsController],
  providers: [ContributionReportsService],
  exports: [ContributionReportsService],
})
export class ContributionReportsModule {}
