import { Transaction } from '../../../../domain/transaction';
import { TransactionEntity } from '../entities/transaction.entity';
import { GamificationProfileMapper } from '../../../../../gamification-profiles/infrastructure/persistence/relational/mappers/gamification-profile.mapper';

export class TransactionMapper {
  static toDomain(raw: TransactionEntity): Transaction {
    const domainEntity = new Transaction();
    domainEntity.id = raw.id;
    if (raw.profile) {
      domainEntity.profile = GamificationProfileMapper.toDomain(raw.profile);
    }
    domainEntity.category = raw.category;
    domainEntity.amount = raw.amount;
    domainEntity.description = raw.description;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Transaction): TransactionEntity {
    const persistenceEntity = new TransactionEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    if (domainEntity.profile) {
      persistenceEntity.profile = GamificationProfileMapper.toPersistence(
        domainEntity.profile,
      );
    }
    persistenceEntity.category = domainEntity.category;
    persistenceEntity.amount = domainEntity.amount;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
