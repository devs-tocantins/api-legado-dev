import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from './event-status.enum';
import { EventCategory } from './event-category.enum';
import { EventModality } from './event-modality.enum';
import { FileType } from '../../files/domain/file';

export class Event {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ enum: EventCategory, example: EventCategory.MEETUP })
  category: EventCategory;

  @ApiProperty({ enum: EventModality, example: EventModality.ONLINE })
  modality: EventModality;

  @ApiProperty()
  startAt: Date;

  @ApiProperty({ nullable: true })
  endAt: Date | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Endereço/local físico (PRESENCIAL ou HIBRIDO)',
  })
  location: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Link da transmissão/reunião (ONLINE ou HIBRIDO)',
  })
  onlineUrl: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Página oficial ou link de inscrição do evento',
  })
  externalUrl: string | null;

  @ApiProperty({
    enum: EventStatus,
    description: 'Status de moderação do evento',
    example: EventStatus.PENDING,
  })
  status: EventStatus;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Motivo da rejeição, informado pelo moderador',
  })
  rejectionReason: string | null;

  @ApiProperty({
    type: Number,
    description: 'ID do User que criou/organiza o evento',
  })
  organizerId: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'ID do User (admin/moderator) que revisou o evento',
  })
  reviewerId: number | null;

  @ApiProperty({ nullable: true })
  reviewedAt: Date | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'UUID do arquivo de capa do evento',
  })
  coverImageId: string | null;

  @ApiProperty({ type: () => FileType, nullable: true })
  coverImage?: FileType | null;

  @ApiProperty({
    type: String,
    description:
      'Link pronto para adicionar o evento ao Google Calendar (sem OAuth)',
  })
  googleCalendarUrl: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
