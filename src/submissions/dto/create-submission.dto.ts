import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

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
  proofUrl?: string | null;
}
