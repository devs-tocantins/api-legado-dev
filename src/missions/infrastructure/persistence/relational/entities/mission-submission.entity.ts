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
import { MissionSubmissionStatus } from '../../../../domain/mission-submission-status.enum';
import { MissionEntity } from './mission.entity';
import { GamificationProfileEntity } from '../../../../../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Entity({ name: 'mission_submission' })
export class MissionSubmissionEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  missionId: string;

  @ManyToOne(() => MissionEntity, { eager: false })
  @JoinColumn({ name: 'missionId' })
  mission: MissionEntity;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => GamificationProfileEntity, { eager: false })
  @JoinColumn({ name: 'profileId' })
  profile: GamificationProfileEntity;

  @Column({ type: 'varchar', nullable: true, default: null })
  proofUrl: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  @Column({
    type: 'enum',
    enum: MissionSubmissionStatus,
    default: MissionSubmissionStatus.PENDING,
  })
  status: MissionSubmissionStatus;

  @Column({ type: 'text', nullable: true, default: null })
  feedback: string | null;

  @Column({ type: 'int', default: 0 })
  awardedXp: number;

  @Column({ type: 'int', nullable: true, default: null })
  reviewerId: number | null;

  @ManyToOne(() => UserEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: UserEntity | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  reviewedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
