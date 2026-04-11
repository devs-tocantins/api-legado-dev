import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BadgeCriteriaTypeEnum } from './badge-criteria-type.enum';

export class Badge {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String, example: 'Primeira Missão' })
  name: string;

  @ApiProperty({ type: String, example: 'Primeira submissão aprovada' })
  description: string;

  @ApiPropertyOptional({
    type: String,
    example: 'https://cdn.example.com/badge.png',
  })
  imageUrl?: string | null;

  @ApiProperty({ enum: BadgeCriteriaTypeEnum })
  criteriaType: BadgeCriteriaTypeEnum;

  @ApiPropertyOptional({
    type: Object,
    example: { type: 'submissions_approved', threshold: 1 },
    description:
      'Configuração do critério automático. Null para badges manuais.',
  })
  criteriaConfig?: Record<string, unknown> | null;

  @ApiProperty({ type: Boolean, default: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
