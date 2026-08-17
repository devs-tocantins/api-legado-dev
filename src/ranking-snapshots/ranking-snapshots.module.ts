import { Module } from '@nestjs/common';
import { RelationalRankingSnapshotPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { RankingSnapshotsService } from './ranking-snapshots.service';
import { RankingSnapshotsController } from './ranking-snapshots.controller';
import { RelationalGamificationProfilePersistenceModule } from '../gamification-profiles/infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    RelationalRankingSnapshotPersistenceModule,
    RelationalGamificationProfilePersistenceModule,
  ],
  controllers: [RankingSnapshotsController],
  providers: [RankingSnapshotsService],
  exports: [
    RankingSnapshotsService,
    RelationalRankingSnapshotPersistenceModule,
  ],
})
export class RankingSnapshotsModule {}
