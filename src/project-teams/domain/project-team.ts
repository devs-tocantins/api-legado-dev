import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from './project-role.enum';
import { ProjectTeamStatus } from './project-team-status.enum';
import { ProjectUserSummary } from './project-user-summary';

export class ProjectTeamVacancy {
  @ApiProperty({ enum: ProjectRole })
  role: ProjectRole;

  @ApiProperty({ type: Number })
  quantity: number;

  @ApiProperty({ type: Number, description: 'Vagas já preenchidas' })
  filled: number;
}

export class ProjectTeamMember {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: Number })
  userId: number;

  @ApiProperty({ type: () => ProjectUserSummary, nullable: true })
  user?: ProjectUserSummary | null;

  @ApiProperty({ enum: ProjectRole })
  role: ProjectRole;

  @ApiProperty()
  createdAt: Date;
}

export class ProjectTeam {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  ideaId: string;

  @ApiProperty({ type: String })
  ideaTitle: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ enum: ProjectTeamStatus })
  status: ProjectTeamStatus;

  @ApiProperty({ type: String, nullable: true })
  repoUrl: string | null;

  @ApiProperty({ type: Number })
  ownerId: number;

  @ApiProperty({ type: () => ProjectUserSummary, nullable: true })
  owner?: ProjectUserSummary | null;

  @ApiProperty({ type: () => [ProjectTeamVacancy] })
  vacancies: ProjectTeamVacancy[];

  @ApiProperty({ type: () => [ProjectTeamMember] })
  members: ProjectTeamMember[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
