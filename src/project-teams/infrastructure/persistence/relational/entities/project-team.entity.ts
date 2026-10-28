import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ProjectTeamStatus } from '../../../../domain/project-team-status.enum';
import { ProjectIdeaEntity } from './project-idea.entity';
import { ProjectTeamVacancyEntity } from './project-team-vacancy.entity';
import { ProjectTeamMemberEntity } from './project-team-member.entity';

@Entity({ name: 'project_team' })
export class ProjectTeamEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  ideaId: string;

  @OneToOne(() => ProjectIdeaEntity, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ideaId' })
  idea: ProjectIdeaEntity;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ProjectTeamStatus,
    default: ProjectTeamStatus.RECRUITING,
  })
  status: ProjectTeamStatus;

  @Column({ type: 'varchar', nullable: true, default: null })
  repoUrl: string | null;

  @Column({ type: 'int' })
  ownerId: number;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity;

  @OneToMany(() => ProjectTeamVacancyEntity, (vacancy) => vacancy.team)
  vacancies: ProjectTeamVacancyEntity[];

  @OneToMany(() => ProjectTeamMemberEntity, (member) => member.team)
  members: ProjectTeamMemberEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
