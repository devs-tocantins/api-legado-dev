import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { MissionStatus } from '../../../../domain/mission-status.enum';

@Entity({ name: 'mission' })
export class MissionEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  requirements: string | null;

  @Column({ type: 'int' })
  xpReward: number;

  @Column({ type: 'int', default: 50 })
  participationReward: number;

  @Column({ type: 'int', default: 20 })
  auditorReward: number;

  @Column({ type: 'enum', enum: MissionStatus, default: MissionStatus.OPEN })
  status: MissionStatus;

  @Column({ type: 'uuid', nullable: true, default: null })
  winnerId: string | null;

  @Column({ type: 'boolean', default: false })
  isSecret: boolean;

  @Column({ type: 'boolean', default: false })
  requiresProof: boolean;

  @Column({ type: 'boolean', default: false })
  requiresDescription: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
