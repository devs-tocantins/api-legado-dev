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
import { LearningTrackStatus } from '../../../../domain/learning-track-status.enum';
import { LearningTrackTier } from '../../../../domain/learning-track-tier.enum';

@Entity({
  name: 'learning_track',
})
export class LearningTrackEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  @Column({ type: 'varchar' })
  area: string;

  @Column({
    type: 'enum',
    enum: LearningTrackTier,
  })
  tier: LearningTrackTier;

  @Column({
    type: 'enum',
    enum: LearningTrackStatus,
    default: LearningTrackStatus.DRAFT,
  })
  status: LearningTrackStatus;

  @Column({ type: 'uuid', nullable: true, default: null })
  requiresTrackId: string | null;

  @ManyToOne(() => LearningTrackEntity, { eager: false, nullable: true })
  @JoinColumn({ name: 'requiresTrackId' })
  requiresTrack: LearningTrackEntity | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
