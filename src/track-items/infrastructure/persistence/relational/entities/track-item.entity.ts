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
import { TrackSectionEntity } from '../../../../../track-sections/infrastructure/persistence/relational/entities/track-section.entity';
import { ActivityEntity } from '../../../../../activities/infrastructure/persistence/relational/entities/activity.entity';
import { MissionEntity } from '../../../../../missions/infrastructure/persistence/relational/entities/mission.entity';
import { CourseEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/course.entity';
import { TrackItemType } from '../../../../domain/track-item-type.enum';
import { TrackItemStatus } from '../../../../domain/track-item-status.enum';
import { TrackItemProofFormat } from '../../../../domain/track-item-proof-format.enum';

@Entity({
  name: 'track_item',
})
export class TrackItemEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  trackId: string;

  @ManyToOne(() => LearningTrackEntity, { eager: false })
  @JoinColumn({ name: 'trackId' })
  track: LearningTrackEntity;

  @Column({ type: 'uuid' })
  sectionId: string;

  @ManyToOne(() => TrackSectionEntity, { eager: false })
  @JoinColumn({ name: 'sectionId' })
  section: TrackSectionEntity;

  @Column({
    type: 'enum',
    enum: TrackItemType,
  })
  type: TrackItemType;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true, default: null })
  body: string | null;

  @Column({ type: 'double precision' })
  position: number;

  @Column({
    type: 'enum',
    enum: TrackItemStatus,
    default: TrackItemStatus.ACTIVE,
  })
  status: TrackItemStatus;

  @Column({
    type: 'enum',
    enum: TrackItemProofFormat,
    default: TrackItemProofFormat.EITHER,
  })
  proofFormat: TrackItemProofFormat;

  @Column({ type: 'boolean', default: false })
  isOptional: boolean;

  @Column({ type: 'boolean', default: false })
  allowsTestOut: boolean;

  @Column({ type: 'int', default: 0 })
  journeyXp: number;

  @Column({ type: 'boolean', default: false })
  grantsCommunityXp: boolean;

  @Column({ type: 'int', default: 0 })
  communityXpReward: number;

  @Column({ type: 'uuid', nullable: true, default: null })
  activityId: string | null;

  @ManyToOne(() => ActivityEntity, { eager: false, nullable: true })
  @JoinColumn({ name: 'activityId' })
  activity: ActivityEntity | null;

  @Column({ type: 'uuid', nullable: true, default: null })
  missionId: string | null;

  @ManyToOne(() => MissionEntity, { eager: false, nullable: true })
  @JoinColumn({ name: 'missionId' })
  mission: MissionEntity | null;

  @Column({ type: 'uuid', nullable: true, default: null })
  courseId: string | null;

  @ManyToOne(() => CourseEntity, { eager: false, nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity | null;

  @Column({ type: 'jsonb', nullable: true, default: null })
  config: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
