import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EffortLevel } from '../../activities/domain/effort-level.enum';
import { GithubRepoTarget } from '../../github-issues/domain/github-repo-target.enum';
import { GithubIssueCategory } from '../../github-issues/domain/github-issue-category.enum';

export class CreateSubmissionDto {
  @ApiPropertyOptional({
    example: 'uuid-da-activity',
    description:
      'Obrigatório para submissões de atividade comum. Para marcos de trilha (trackItemId), é derivado do marco automaticamente.',
  })
  @IsOptional()
  @IsUUID()
  activityId?: string;

  @ApiPropertyOptional({
    example: 'uuid-do-marco',
    description:
      'UUID do marco de trilha (track_item) sendo provado, se aplicável.',
  })
  @IsOptional()
  @IsUUID()
  trackItemId?: string;

  @ApiPropertyOptional({
    default: false,
    description:
      'Test-out: prova direta pulando o conteúdo do marco (exige track_item.allowsTestOut = true).',
  })
  @IsOptional()
  @IsBoolean()
  isTestOut?: boolean;

  @ApiPropertyOptional({
    example: 'https://bucket.s3.amazonaws.com/comprovante.png',
    description: 'URL do comprovante. Obrigatório se a atividade exigir prova.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Transform(({ value }) => value?.trim() ?? null)
  proofUrl?: string | null;

  @ApiPropertyOptional({
    example: 'Participei do evento e aprendi sobre...',
    description:
      'Descrição/contexto da submissão. Obrigatório se a atividade exigir descrição.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => value?.trim() ?? null)
  description?: string | null;

  @ApiPropertyOptional({
    example: 'Ajudei a organizar a lista de presença do meetup',
    description:
      'Título livre da contribuição. Obrigatório quando a atividade é isFreeform.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim() ?? null)
  customTitle?: string | null;

  @ApiPropertyOptional({
    enum: EffortLevel,
    description:
      'Faixa de esforço autodeclarada. Obrigatória quando a atividade tem effortTiers.',
  })
  @IsOptional()
  @IsEnum(EffortLevel)
  effortLevel?: EffortLevel;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description:
      'Data em que a atividade foi realizada (ISO 8601). Obrigatório se a atividade exigir data.',
  })
  @IsOptional()
  @IsDateString()
  activityDate?: string | null;

  @ApiPropertyOptional({
    enum: GithubRepoTarget,
    description:
      'Repositório onde a issue deve ser criada. Obrigatório quando a atividade tem createsGithubIssue.',
  })
  @IsOptional()
  @IsEnum(GithubRepoTarget)
  githubRepo?: GithubRepoTarget;

  @ApiPropertyOptional({
    enum: GithubIssueCategory,
    description:
      'Classificação da issue. Obrigatória quando a atividade tem createsGithubIssue.',
  })
  @IsOptional()
  @IsEnum(GithubIssueCategory)
  issueCategory?: GithubIssueCategory;
}
