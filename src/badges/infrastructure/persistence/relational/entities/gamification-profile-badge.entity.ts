import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { BadgeEntity } from './badge.entity';
import { GamificationProfileEntity } from '../../../../../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';

@Entity({ name: 'gamification_profile_badge' })
@Unique(['profileId', 'badgeId'])
export class GamificationProfileBadgeEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => GamificationProfileEntity)
  @JoinColumn({ name: 'profileId' })
  profile: GamificationProfileEntity;

  @Column({ type: 'uuid' })
  badgeId: string;

  @ManyToOne(() => BadgeEntity, { eager: true })
  @JoinColumn({ name: 'badgeId' })
  badge: BadgeEntity;

  @CreateDateColumn()
  unlockedAt: Date;

  @Column({ type: 'int', nullable: true })
  grantedBy?: number | null;
}
