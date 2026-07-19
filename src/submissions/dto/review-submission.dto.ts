import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { SubmissionStatus } from '../domain/submission-status.enum';
import { EffortLevel } from '../../activities/domain/effort-level.enum';

const allowedStatuses = [SubmissionStatus.APPROVED, SubmissionStatus.REJECTED];

export class ReviewSubmissionDto {
  @ApiProperty({
    enum: allowedStatuses,
    description: 'Decisão do moderador: APPROVED ou REJECTED',
    example: SubmissionStatus.APPROVED,
  })
  @IsEnum(allowedStatuses, {
    message: 'status deve ser APPROVED ou REJECTED',
  })
  status: SubmissionStatus.APPROVED | SubmissionStatus.REJECTED;

  @ApiPropertyOptional({
    type: String,
    description:
      'Feedback obrigatório em caso de rejeição ou opcional ao aprovar',
    example: 'Comprovante inválido, envie o certificado oficial.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  feedback?: string;

  @ApiPropertyOptional({
    enum: EffortLevel,
    description:
      'Override do moderador para a faixa de esforço, ao aprovar. Se ausente, usa a faixa declarada pelo usuário.',
  })
  @IsOptional()
  @IsEnum(EffortLevel)
  effortLevel?: EffortLevel;
}
