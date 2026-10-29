import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ProjectIdeaStatus } from '../../../../domain/project-idea-status.enum';

@Entity({ name: 'project_idea' })
@Index(['status', 'createdAt'])
export class ProjectIdeaEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', array: true, default: () => `'{}'` })
  tags: string[];

  @Column({
    type: 'enum',
    enum: ProjectIdeaStatus,
    default: ProjectIdeaStatus.PENDING,
  })
  status: ProjectIdeaStatus;

  @Column({ type: 'text', nullable: true, default: null })
  rejectionReason: string | null;

  @Column({ type: 'int' })
  authorId: number;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @Column({ type: 'int', nullable: true, default: null })
  reviewerId: number | null;

  @ManyToOne(() => UserEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: UserEntity | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  reviewedAt: Date | null;

  /** Preenchido enquanto este for o "projeto da vez" (só um por vez). */
  @Column({ type: 'timestamp', nullable: true, default: null })
  featuredAt: Date | null;

  @Column({ type: 'varchar', length: 300, nullable: true, default: null })
  groupLink: string | null;

  /** Quando quem propôs chamou os interessados pela primeira vez. */
  @Column({ type: 'timestamp', nullable: true, default: null })
  calledAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
