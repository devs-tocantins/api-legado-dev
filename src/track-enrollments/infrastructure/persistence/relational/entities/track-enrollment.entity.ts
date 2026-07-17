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
import { LearningTrackEntity } from '../../../../../learning-tracks/infrastructure/persistence/relational/entities/learning-track.entity';
import { GamificationProfileEntity } from '../../../../../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { TrackEnrollmentStatus } from '../../../../domain/track-enrollment-status.enum';

@Entity({
  name: 'track_enrollment',
})
@Unique(['trackId', 'profileId'])
export class TrackEnrollmentEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  trackId: string;

  @ManyToOne(() => LearningTrackEntity, { eager: false })
  @JoinColumn({ name: 'trackId' })
  track: LearningTrackEntity;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => GamificationProfileEntity, { eager: false })
  @JoinColumn({ name: 'profileId' })
  profile: GamificationProfileEntity;

  @Column({
    type: 'enum',
    enum: TrackEnrollmentStatus,
    default: TrackEnrollmentStatus.ACTIVE,
  })
  status: TrackEnrollmentStatus;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
