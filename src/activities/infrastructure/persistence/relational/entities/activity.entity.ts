import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'activity',
})
export class ActivityEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  fixedReward: number;

  @Column({ type: 'boolean', default: false })
  isHidden: boolean;

  @Column({ type: 'varchar', nullable: true, default: null })
  secretCode: string | null;

  @Column({ type: 'boolean', default: false })
  requiresProof: boolean;

  @Column({ type: 'boolean', default: false })
  requiresDescription: boolean;

  @Column({ type: 'int', default: 0 })
  cooldownHours: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
