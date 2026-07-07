import { ApiProperty } from '@nestjs/swagger';
import { SubmissionStatus } from './submission-status.enum';

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

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
