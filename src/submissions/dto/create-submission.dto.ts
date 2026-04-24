import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'uuid-da-activity' })
  @IsUUID()
  activityId: string;

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
}
