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
import { LearningTrackEntity } from '../../../../../learning-tracks/infrastructure/persistence/relational/entities/learning-track.entity';
import { BadgeEntity } from '../../../../../badges/infrastructure/persistence/relational/entities/badge.entity';
import { TrackSectionStatus } from '../../../../domain/track-section-status.enum';

@Entity({
  name: 'track_section',
})
export class TrackSectionEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  trackId: string;

  @ManyToOne(() => LearningTrackEntity, { eager: false })
  @JoinColumn({ name: 'trackId' })
  track: LearningTrackEntity;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  @Column({ type: 'double precision' })
  position: number;

  @Column({
    type: 'enum',
    enum: TrackSectionStatus,
    default: TrackSectionStatus.ACTIVE,
  })
  status: TrackSectionStatus;

  @Column({ type: 'uuid', nullable: true, default: null })
  badgeId: string | null;

  @ManyToOne(() => BadgeEntity, { eager: false, nullable: true })
  @JoinColumn({ name: 'badgeId' })
  badge: BadgeEntity | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
