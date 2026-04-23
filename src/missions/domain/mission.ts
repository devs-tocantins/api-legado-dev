import { ApiProperty } from '@nestjs/swagger';
import { MissionStatus } from './mission-status.enum';

export class Mission {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Requisitos detalhados para o admin avaliar a submissão',
  })
  requirements: string | null;

  @ApiProperty({ type: Number })
  xpReward: number;

  @ApiProperty({ enum: MissionStatus })
  status: MissionStatus;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'profileId do vencedor após aprovação',
  })
  winnerId: string | null;

  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Se true, não aparece na lista pública',
  })
  isSecret: boolean;

  @ApiProperty({ type: Boolean, default: false })
  requiresProof: boolean;

  @ApiProperty({ type: Boolean, default: false })
  requiresDescription: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
