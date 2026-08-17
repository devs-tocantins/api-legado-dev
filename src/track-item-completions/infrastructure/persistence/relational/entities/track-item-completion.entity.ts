import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { TrackItemEntity } from '../../../../../track-items/infrastructure/persistence/relational/entities/track-item.entity';
import { GamificationProfileEntity } from '../../../../../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { SubmissionEntity } from '../../../../../submissions/infrastructure/persistence/relational/entities/submission.entity';
import { TrackItemCompletionStatus } from '../../../../domain/track-item-completion-status.enum';

@Entity({
  name: 'track_item_completion',
})
@Unique(['itemId', 'profileId'])
export class TrackItemCompletionEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  itemId: string;

  @ManyToOne(() => TrackItemEntity, { eager: false })
  @JoinColumn({ name: 'itemId' })
  item: TrackItemEntity;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => GamificationProfileEntity, { eager: false })
  @JoinColumn({ name: 'profileId' })
  profile: GamificationProfileEntity;

  @Column({
    type: 'enum',
    enum: TrackItemCompletionStatus,
    default: TrackItemCompletionStatus.COMPLETED,
  })
  status: TrackItemCompletionStatus;

  @Column({ type: 'uuid', nullable: true, default: null })
  submissionId: string | null;

  @ManyToOne(() => SubmissionEntity, { eager: false, nullable: true })
  @JoinColumn({ name: 'submissionId' })
  submission: SubmissionEntity | null;

  @Column({ type: 'int', default: 0 })
  awardedJourneyXp: number;

  @Column({ type: 'timestamp' })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
