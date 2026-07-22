import { Module } from '@nestjs/common';
import { RelationalRankingSnapshotPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { RankingSnapshotsService } from './ranking-snapshots.service';
import { RankingSnapshotsController } from './ranking-snapshots.controller';
import { GamificationProfilesModule } from '../gamification-profiles/gamification-profiles.module';

@Module({
  imports: [
    RelationalRankingSnapshotPersistenceModule,
    GamificationProfilesModule,
  ],
  controllers: [RankingSnapshotsController],
  providers: [RankingSnapshotsService],
  exports: [
    RankingSnapshotsService,
    RelationalRankingSnapshotPersistenceModule,
  ],
})
export class RankingSnapshotsModule {}
