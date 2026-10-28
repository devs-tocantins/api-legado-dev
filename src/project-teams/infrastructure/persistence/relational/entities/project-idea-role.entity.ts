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
import { ProjectIdeaEntity } from './project-idea.entity';

@Entity({ name: 'project_idea_role' })
@Index(['ideaId', 'name'], { unique: true })
export class ProjectIdeaRoleEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ideaId: string;

  @ManyToOne(() => ProjectIdeaEntity, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ideaId' })
  idea: ProjectIdeaEntity;

  @Column({ type: 'varchar', length: 40 })
  name: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  @CreateDateColumn()
  createdAt: Date;
}
