import { NullableType } from '../../../utils/types/nullable.type';
import { Badge } from '../../domain/badge';

export abstract class BadgeRepository {
  abstract create(
    data: Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Badge>;
  abstract findAll(): Promise<Badge[]>;
  abstract findAllActive(): Promise<Badge[]>;
  abstract findById(id: Badge['id']): Promise<NullableType<Badge>>;
  abstract update(id: Badge['id'], payload: Partial<Badge>): Promise<Badge>;
  abstract remove(id: Badge['id']): Promise<void>;
}
