import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ProjectTeamStatus } from '../domain/project-team-status.enum';
import { ProjectVacancyDto } from './create-project-team.dto';

export class UpdateProjectTeamDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Link do repositório. Envie null para remover.',
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUrl()
  repoUrl?: string | null;

  @ApiPropertyOptional({ enum: ProjectTeamStatus })
  @IsOptional()
  @IsEnum(ProjectTeamStatus)
  status?: ProjectTeamStatus;

  @ApiPropertyOptional({
    type: () => [ProjectVacancyDto],
    description: 'Substitui todas as vagas do time',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(9)
  @ValidateNested({ each: true })
  @Type(() => ProjectVacancyDto)
  vacancies?: ProjectVacancyDto[];
}
