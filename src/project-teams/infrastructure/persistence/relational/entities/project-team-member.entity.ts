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
import { ProjectTeamEntity } from './project-team.entity';

@Entity({ name: 'project_team_member' })
@Index(['teamId', 'userId'], { unique: true })
export class ProjectTeamMemberEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  teamId: string;

  @ManyToOne(() => ProjectTeamEntity, (team) => team.members, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teamId' })
  team: ProjectTeamEntity;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'enum', enum: ProjectRole, enumName: 'project_role_enum' })
  role: ProjectRole;

  @CreateDateColumn()
  createdAt: Date;
}
