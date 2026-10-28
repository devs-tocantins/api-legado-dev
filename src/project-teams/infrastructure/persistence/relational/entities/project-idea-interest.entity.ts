import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ProjectRole } from '../../../../domain/project-role.enum';
import { ProjectIdeaEntity } from './project-idea.entity';

@Entity({ name: 'project_idea_interest' })
@Index(['ideaId', 'userId'], { unique: true })
export class ProjectIdeaInterestEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ideaId: string;

  @ManyToOne(() => ProjectIdeaEntity, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ideaId' })
  idea: ProjectIdeaEntity;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'enum', enum: ProjectRole, enumName: 'project_role_enum' })
  role: ProjectRole;

  @Column({ type: 'text', nullable: true, default: null })
  message: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
