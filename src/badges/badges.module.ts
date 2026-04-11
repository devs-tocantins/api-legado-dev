import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { BadgeEntity } from './infrastructure/persistence/relational/entities/badge.entity';
import { GamificationProfileBadgeEntity } from './infrastructure/persistence/relational/entities/gamification-profile-badge.entity';
import { BadgeRepository } from './infrastructure/persistence/badge.repository';
import { BadgeRelationalRepository } from './infrastructure/persistence/relational/repositories/badge.repository';
import { GamificationProfileBadgeRepository } from './infrastructure/persistence/gamification-profile-badge.repository';
import { GamificationProfileBadgeRelationalRepository } from './infrastructure/persistence/relational/repositories/gamification-profile-badge.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([BadgeEntity, GamificationProfileBadgeEntity]),
  ],
  controllers: [BadgesController],
  providers: [
    BadgesService,
    { provide: BadgeRepository, useClass: BadgeRelationalRepository },
    {
      provide: GamificationProfileBadgeRepository,
      useClass: GamificationProfileBadgeRelationalRepository,
    },
  ],
  exports: [BadgesService, GamificationProfileBadgeRepository],
})
export class BadgesModule {}
