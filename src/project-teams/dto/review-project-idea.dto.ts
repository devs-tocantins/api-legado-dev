import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectIdeaStatus } from '../domain/project-idea-status.enum';

const allowedStatuses = [
  ProjectIdeaStatus.APPROVED,
  ProjectIdeaStatus.REJECTED,
];

export class ReviewProjectIdeaDto {
  @ApiProperty({
    enum: allowedStatuses,
    description: 'Decisão do moderador: APPROVED ou REJECTED',
  })
  @IsEnum(allowedStatuses, {
    message: 'status deve ser APPROVED ou REJECTED',
  })
  status: ProjectIdeaStatus.APPROVED | ProjectIdeaStatus.REJECTED;

  @ApiPropertyOptional({
    type: String,
    description: 'Motivo obrigatório em caso de rejeição',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
