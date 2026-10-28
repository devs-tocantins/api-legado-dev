import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ProjectTeamStatus } from '../domain/project-team-status.enum';

export class FindProjectsDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    enum: ProjectTeamStatus,
    description: 'Filtro de status (apenas na listagem de times)',
  })
  @IsOptional()
  @IsEnum(ProjectTeamStatus)
  status?: ProjectTeamStatus;
}
