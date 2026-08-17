import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditActionEnum } from '../../../../domain/audit-action.enum';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({ name: 'audit_log' })
@Index(['entityType', 'entityId'])
export class AuditLogEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'int', nullable: true })
  actorUserId: number | null;

  @Column({ type: 'varchar', length: 100 })
  action: AuditActionEnum;

  @Column({ type: 'varchar', length: 100 })
  entityType: string;

  @Column({ type: 'varchar', length: 100 })
  entityId: string;

  @Column({ type: 'int', nullable: true })
  targetUserId: number | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any | null;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
