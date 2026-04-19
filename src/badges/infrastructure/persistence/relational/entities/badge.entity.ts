import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { BadgeCriteriaTypeEnum } from '../../../../domain/badge-criteria-type.enum';
import { BadgeCategoryEnum } from '../../../../domain/badge-category.enum';

@Entity({ name: 'badge' })
export class BadgeEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string | null;

  @Column({
    type: 'enum',
    enum: BadgeCategoryEnum,
    default: BadgeCategoryEnum.SPECIAL,
  })
  category: BadgeCategoryEnum;

  @Column({ type: 'enum', enum: BadgeCriteriaTypeEnum })
  criteriaType: BadgeCriteriaTypeEnum;

  @Column({ type: 'jsonb', nullable: true })
  criteriaConfig?: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
