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
import { CourseEntity } from './course.entity';
import { GamificationProfileEntity } from '../../../../../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';

@Entity({
  name: 'track_item_course',
})
@Unique(['trackItemId', 'courseId'])
export class TrackItemCourseEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  trackItemId: string;

  @Column({ type: 'uuid' })
  courseId: string;

  @ManyToOne(() => CourseEntity, { eager: false })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @Column({ type: 'uuid', nullable: true, default: null })
  submittedByProfileId: string | null;

  @ManyToOne(() => GamificationProfileEntity, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'submittedByProfileId' })
  submittedByProfile: GamificationProfileEntity | null;

  @CreateDateColumn()
  createdAt: Date;
}
