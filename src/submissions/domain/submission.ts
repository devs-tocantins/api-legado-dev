import { ApiProperty } from '@nestjs/swagger';
import { SubmissionStatus } from './submission-status.enum';
import { SubmissionContributionKind } from './submission-contribution-kind.enum';
import { EffortLevel } from '../../activities/domain/effort-level.enum';
import { GithubRepoTarget } from '../../github-issues/domain/github-repo-target.enum';
import { GithubIssueCategory } from '../../github-issues/domain/github-issue-category.enum';

export class Submission {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'UUID do GamificationProfile do usuário que submeteu',
  })
  profileId: string;

  @ApiProperty({
    type: String,
    description: 'UUID da Activity relacionada',
  })
  activityId: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'UUID do marco de trilha (track_item) provado por esta submissão',
  })
  trackItemId: string | null;

  @ApiProperty({
    type: Boolean,
    description:
      'Se esta submissão é um test-out (prova direta pulando o conteúdo do marco)',
    default: false,
  })
  isTestOut: boolean;

  @ApiProperty({
    enum: SubmissionContributionKind,
    description:
      'Se é uma contribuição real à comunidade (COMMUNITY_ACTIVITY) ou progresso pessoal de trilha (TRACK_PROGRESS)',
  })
  contributionKind: SubmissionContributionKind;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'URL do comprovante (print, certificado, etc)',
  })
  proofUrl: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Descrição/contexto da submissão fornecido pelo usuário',
  })
  description: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Título informado pelo usuário para atividades livres (isFreeform)',
  })
  customTitle: string | null;

  @ApiProperty({
    enum: EffortLevel,
    nullable: true,
    description: 'Faixa de esforço autodeclarada pelo usuário',
  })
  declaredEffort: EffortLevel | null;

  @ApiProperty({
    enum: SubmissionStatus,
    description: 'Status da submissão',
    example: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Feedback do moderador sobre a decisão',
  })
  feedback: string | null;

  @ApiProperty({
    type: Number,
    description: 'XP concedido (herda fixedReward ou valor curinga)',
    example: 0,
  })
  awardedXp: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'ID do User moderador que revisou',
  })
  reviewerId: number | null;

  @ApiProperty({
    nullable: true,
    description: 'Data e hora da revisão',
  })
  reviewedAt: Date | null;

  @ApiProperty({
    nullable: true,
    description: 'Data em que a atividade foi realizada',
  })
  activityDate: Date | null;

  @ApiProperty({
    enum: GithubRepoTarget,
    nullable: true,
    description: 'Repositório onde a issue deve ser criada, se aplicável',
  })
  githubRepo: GithubRepoTarget | null;

  @ApiProperty({
    enum: GithubIssueCategory,
    nullable: true,
    description: 'Classificação da issue (bug, melhoria, dúvida, outro)',
  })
  issueCategory: GithubIssueCategory | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'URL da issue criada no GitHub após aprovação',
  })
  githubIssueUrl: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
