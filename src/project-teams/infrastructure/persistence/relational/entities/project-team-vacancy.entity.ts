import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { ProjectRole } from '../../../../domain/project-role.enum';
import { ProjectTeamEntity } from './project-team.entity';

@Entity({ name: 'project_team_vacancy' })
@Index(['teamId', 'role'], { unique: true })
export class ProjectTeamVacancyEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  teamId: string;

  @ManyToOne(() => ProjectTeamEntity, (team) => team.vacancies, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teamId' })
  team: ProjectTeamEntity;

  @Column({ type: 'enum', enum: ProjectRole, enumName: 'project_role_enum' })
  role: ProjectRole;

  @Column({ type: 'int' })
  quantity: number;
}
