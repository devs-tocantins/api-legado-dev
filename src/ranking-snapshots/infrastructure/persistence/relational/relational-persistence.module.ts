import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingSnapshotEntity } from './entities/ranking-snapshot.entity';
import { RankingSnapshotRepository } from '../ranking-snapshot.repository';
import { RankingSnapshotRelationalRepository } from './repositories/ranking-snapshot.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RankingSnapshotEntity])],
  providers: [
    {
      provide: RankingSnapshotRepository,
      useClass: RankingSnapshotRelationalRepository,
    },
  ],
  exports: [RankingSnapshotRepository],
})
export class RelationalRankingSnapshotPersistenceModule {}
