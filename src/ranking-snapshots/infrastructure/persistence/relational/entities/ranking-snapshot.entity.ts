import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { RankingPeriodType } from '../../../../domain/ranking-period-type.enum';

@Entity({
  name: 'ranking_snapshot',
})
@Unique(['profileId', 'periodType', 'periodKey'])
@Index(['periodType', 'periodKey'])
@Index(['profileId'])
export class RankingSnapshotEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @Column({
    type: 'varchar',
  })
  periodType: RankingPeriodType;

  @Column({ type: 'varchar' })
  periodKey: string;

  @Column({ type: 'int' })
  position: number;

  @Column({ type: 'int' })
  xpAtSnapshot: number;

  @CreateDateColumn()
  createdAt: Date;
}
