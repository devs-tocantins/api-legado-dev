import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { CourseEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/course.entity';
import { GamificationProfileEntity } from '../../../../../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';

@Entity({
  name: 'course_review',
})
@Unique(['courseId', 'profileId'])
export class CourseReviewEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  courseId: string;

  @ManyToOne(() => CourseEntity, { eager: false })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => GamificationProfileEntity, { eager: false })
  @JoinColumn({ name: 'profileId' })
  profile: GamificationProfileEntity;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true, default: null })
  comment: string | null;

  @Column({ type: 'boolean', default: false })
  provenCompletion: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
