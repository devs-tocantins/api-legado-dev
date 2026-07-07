import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { BadgeEvaluatorService } from './badge-evaluator.service';
import { RankingCronService } from './ranking-cron.service';
import { BadgeEntity } from './infrastructure/persistence/relational/entities/badge.entity';
import { GamificationProfileBadgeEntity } from './infrastructure/persistence/relational/entities/gamification-profile-badge.entity';
import { BadgeRepository } from './infrastructure/persistence/badge.repository';
import { BadgeRelationalRepository } from './infrastructure/persistence/relational/repositories/badge.repository';
import { GamificationProfileBadgeRepository } from './infrastructure/persistence/gamification-profile-badge.repository';
import { GamificationProfileBadgeRelationalRepository } from './infrastructure/persistence/relational/repositories/gamification-profile-badge.repository';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([BadgeEntity, GamificationProfileBadgeEntity]),
  ],
  controllers: [BadgesController],
  providers: [
    BadgesService,
    BadgeEvaluatorService,
    RankingCronService,
    { provide: BadgeRepository, useClass: BadgeRelationalRepository },
    {
      provide: GamificationProfileBadgeRepository,
      useClass: GamificationProfileBadgeRelationalRepository,
    },
  ],
  exports: [
    BadgesService,
    BadgeEvaluatorService,
    GamificationProfileBadgeRepository,
  ],
})
export class BadgesModule {}
