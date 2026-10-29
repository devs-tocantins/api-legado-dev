import { ApiProperty } from '@nestjs/swagger';
import { ProjectIdeaStatus } from './project-idea-status.enum';
import { ProjectRole } from './project-role.enum';
import { ProjectUserSummary } from './project-user-summary';

export class ProjectIdea {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: [String], example: ['nestjs', 'react'] })
  tags: string[];

  @ApiProperty({ enum: ProjectIdeaStatus })
  status: ProjectIdeaStatus;

  @ApiProperty({ type: String, nullable: true })
  rejectionReason: string | null;

  @ApiProperty({ type: Number })
  authorId: number;

  @ApiProperty({ type: () => ProjectUserSummary, nullable: true })
  author?: ProjectUserSummary | null;

  @ApiProperty({ type: Number, nullable: true })
  reviewerId: number | null;

  @ApiProperty({ nullable: true })
  reviewedAt: Date | null;

  @ApiProperty({
    nullable: true,
    description: 'Preenchido quando o projeto é o "projeto da vez"',
  })
  featuredAt: Date | null;

  @ApiProperty({
    nullable: true,
    description: 'Quando os interessados foram chamados para o grupo',
  })
  calledAt: Date | null;

  @ApiProperty({
    type: Number,
    description: 'Quantidade de pessoas que demonstraram interesse',
  })
  interestCount: number;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'ID do time criado a partir da ideia, se já existir',
  })
  teamId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ProjectIdeaInterest {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  ideaId: string;

  @ApiProperty({ type: Number })
  userId: number;

  @ApiProperty({ type: () => ProjectUserSummary, nullable: true })
  user?: ProjectUserSummary | null;

  @ApiProperty({ type: String, description: 'Nome do cargo na ideia' })
  role: string;

  @ApiProperty({ type: String, nullable: true })
  message: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class SuggestedVacancy {
  @ApiProperty({ enum: ProjectRole })
  role: ProjectRole;

  @ApiProperty({ type: Number })
  quantity: number;

  @ApiProperty({ type: Number })
  interestedCount: number;

  @ApiProperty({ type: String })
  reason: string;
}

export class ProjectIdeaRole {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  ideaId: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: Number })
  position: number;
}
