import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProjectIdeaRoleDto {
  @ApiProperty({ example: 'Mentor' })
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  name: string;
}
