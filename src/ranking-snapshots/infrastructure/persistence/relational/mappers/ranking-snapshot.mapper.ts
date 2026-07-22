import { RankingSnapshot } from '../../../../domain/ranking-snapshot';
import { RankingSnapshotEntity } from '../entities/ranking-snapshot.entity';

export class RankingSnapshotMapper {
  static toDomain(raw: RankingSnapshotEntity): RankingSnapshot {
    const domainEntity = new RankingSnapshot();
    domainEntity.id = raw.id;
    domainEntity.profileId = raw.profileId;
    domainEntity.periodType = raw.periodType;
    domainEntity.periodKey = raw.periodKey;
    domainEntity.position = raw.position;
    domainEntity.xpAtSnapshot = raw.xpAtSnapshot;
    domainEntity.createdAt = raw.createdAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: RankingSnapshot): RankingSnapshotEntity {
    const persistenceEntity = new RankingSnapshotEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.profileId = domainEntity.profileId;
    persistenceEntity.periodType = domainEntity.periodType;
    persistenceEntity.periodKey = domainEntity.periodKey;
    persistenceEntity.position = domainEntity.position;
    persistenceEntity.xpAtSnapshot = domainEntity.xpAtSnapshot;
    persistenceEntity.createdAt = domainEntity.createdAt;
    return persistenceEntity;
  }
}
