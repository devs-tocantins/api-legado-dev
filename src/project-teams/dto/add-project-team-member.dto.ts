import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt } from 'class-validator';
import { ProjectRole } from '../domain/project-role.enum';

export class AddProjectTeamMemberDto {
  @ApiProperty({ example: 12, description: 'Usuário que demonstrou interesse' })
  @IsInt()
  userId: number;

  @ApiProperty({ enum: ProjectRole })
  @IsEnum(ProjectRole)
  role: ProjectRole;
}
