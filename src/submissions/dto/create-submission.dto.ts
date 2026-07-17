import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

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
  @MaxLength(500)
  @Transform(({ value }) => value?.trim() ?? null)
  proofUrl?: string | null;

  @ApiPropertyOptional({
    example: 'Participei do evento e aprendi sobre...',
    description:
      'Descrição/contexto da submissão. Obrigatório se a atividade exigir descrição.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim() ?? null)
  description?: string | null;
}
