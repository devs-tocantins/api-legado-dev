import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EventStatus } from '../domain/event-status.enum';

const allowedStatuses = [EventStatus.APPROVED, EventStatus.REJECTED];

export class ReviewEventDto {
  @ApiProperty({
    enum: allowedStatuses,
    description: 'Decisão do moderador: APPROVED ou REJECTED',
    example: EventStatus.APPROVED,
  })
  @IsEnum(allowedStatuses, {
    message: 'status deve ser APPROVED ou REJECTED',
  })
  status: EventStatus.APPROVED | EventStatus.REJECTED;

  @ApiPropertyOptional({
    type: String,
    description: 'Motivo obrigatório em caso de rejeição',
    example: 'Evento fora do foco de TI da plataforma.',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
