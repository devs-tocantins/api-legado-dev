import { ApiProperty } from '@nestjs/swagger';
import { TrackSectionStatus } from './track-section-status.enum';

export class TrackSection {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  trackId: string;

  @ApiProperty({ type: String, example: 'Fundamentos' })
  title: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({
    type: Number,
    description: 'Índice fracionário de ordenação dentro da trilha',
  })
  position: number;

  @ApiProperty({ enum: TrackSectionStatus })
  status: TrackSectionStatus;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Selo/badge concedido ao concluir esta etapa',
  })
  badgeId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
