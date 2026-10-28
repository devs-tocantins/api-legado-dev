import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProjectRole } from '../domain/project-role.enum';

export class SetProjectInterestDto {
  @ApiProperty({
    enum: ProjectRole,
    example: ProjectRole.FRONTEND,
    description: 'Cargo em que a pessoa gostaria de atuar',
  })
  @IsEnum(ProjectRole)
  role: ProjectRole;

  @ApiPropertyOptional({
    example: 'Tenho 2 anos de React e tempo nos fins de semana.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
