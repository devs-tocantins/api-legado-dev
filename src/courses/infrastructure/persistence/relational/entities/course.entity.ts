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
import { GamificationProfileEntity } from '../../../../../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { CourseStatus } from '../../../../domain/course-status.enum';

@Entity({
  name: 'course',
})
export class CourseEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  provider: string | null;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'boolean', default: true })
  isFree: boolean;

  @Column({ type: 'numeric', nullable: true, default: null })
  price: number | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  language: string | null;

  @Column({ type: 'uuid', nullable: true, default: null })
  submittedByProfileId: string | null;

  @ManyToOne(() => GamificationProfileEntity, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'submittedByProfileId' })
  submittedByProfile: GamificationProfileEntity | null;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.PENDING,
  })
  status: CourseStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
