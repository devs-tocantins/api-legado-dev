import { ApiProperty } from '@nestjs/swagger';
import { TrackItemType } from './track-item-type.enum';
import { TrackItemStatus } from './track-item-status.enum';
import { TrackItemProofFormat } from './track-item-proof-format.enum';

export class TrackItem {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  trackId: string;

  @ApiProperty({ type: String })
  sectionId: string;

  @ApiProperty({ enum: TrackItemType })
  type: TrackItemType;

  @ApiProperty({ type: String, example: 'Suba uma API REST em produção' })
  title: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Instrução/texto inline do marco',
  })
  body: string | null;

  @ApiProperty({
    type: Number,
    description: 'Índice fracionário de ordenação dentro da etapa',
  })
  position: number;

  @ApiProperty({ enum: TrackItemStatus })
  status: TrackItemStatus;

  @ApiProperty({ enum: TrackItemProofFormat })
  proofFormat: TrackItemProofFormat;

  @ApiProperty({ type: Boolean, default: false })
  isOptional: boolean;

  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Permite test-out (provar e pular)',
  })
  allowsTestOut: boolean;

  @ApiProperty({
    type: Number,
    default: 0,
    description: 'XP de Jornada concedido ao concluir este marco',
  })
  journeyXp: number;

  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Se true, concluir este marco também credita XP de Comunidade',
  })
  grantsCommunityXp: boolean;

  @ApiProperty({
    type: Number,
    default: 0,
    description:
      'XP de Comunidade concedido quando grantsCommunityXp é true (usado na atividade exclusiva criada para marcos PROOF)',
  })
  communityXpReward: number;

  @ApiProperty({ type: String, nullable: true })
  activityId: string | null;

  @ApiProperty({ type: String, nullable: true })
  missionId: string | null;

  @ApiProperty({ type: String, nullable: true })
  courseId: string | null;

  @ApiProperty({
    type: Object,
    nullable: true,
    description:
      'Configuração específica do tipo do marco (ex.: critérios de aceitação, perguntas do quiz, URL do recurso)',
  })
  config: Record<string, unknown> | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
