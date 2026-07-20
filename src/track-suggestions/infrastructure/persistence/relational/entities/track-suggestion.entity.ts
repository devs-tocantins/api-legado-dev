import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { GamificationProfileEntity } from '../../../../../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { LearningTrackEntity } from '../../../../../learning-tracks/infrastructure/persistence/relational/entities/learning-track.entity';
import { TrackSuggestionStatusEnum } from '../../../../domain/track-suggestion-status.enum';

@Entity({
  name: 'track_suggestion',
})
export class TrackSuggestionEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => GamificationProfileEntity, { eager: false })
  @JoinColumn({ name: 'profileId' })
  profile: GamificationProfileEntity;

  @Column({ type: 'uuid', nullable: true, default: null })
  trackId: string | null;

  @ManyToOne(() => LearningTrackEntity, { eager: false, nullable: true })
  @JoinColumn({ name: 'trackId' })
  track: LearningTrackEntity | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  title: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: TrackSuggestionStatusEnum,
    default: TrackSuggestionStatusEnum.PENDING,
  })
  status: TrackSuggestionStatusEnum;

  @Column({ type: 'uuid', nullable: true, default: null })
  reviewedByProfileId: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  reviewedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
