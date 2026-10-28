import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ProjectRole } from '../domain/project-role.enum';

export class ProjectVacancyDto {
  @ApiProperty({ enum: ProjectRole, example: ProjectRole.FRONTEND })
  @IsEnum(ProjectRole)
  role: ProjectRole;

  @ApiProperty({ example: 2, minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;
}

export class ProjectInitialMemberDto {
  @ApiProperty({ example: 12, description: 'Usuário que demonstrou interesse' })
  @IsInt()
  userId: number;

  @ApiProperty({ enum: ProjectRole, example: ProjectRole.BACKEND })
  @IsEnum(ProjectRole)
  role: ProjectRole;
}

export class CreateProjectTeamDto {
  @ApiProperty({ type: String, description: 'Ideia aprovada de origem' })
  @IsUUID()
  ideaId: string;

  @ApiProperty({ example: 'Time Doação Digital' })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: 'Vamos construir o MVP em 3 meses.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'https://github.com/devs-tocantins/doacao' })
  @IsOptional()
  @IsUrl()
  repoUrl?: string;

  @ApiProperty({
    type: () => [ProjectVacancyDto],
    description: 'Cargos e quantidade de vagas do time',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(9)
  @ValidateNested({ each: true })
  @Type(() => ProjectVacancyDto)
  vacancies: ProjectVacancyDto[];

  @ApiPropertyOptional({
    type: () => [ProjectInitialMemberDto],
    description:
      'Interessados já escolhidos para o time, com o cargo de cada um',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ProjectInitialMemberDto)
  members?: ProjectInitialMemberDto[];
}
