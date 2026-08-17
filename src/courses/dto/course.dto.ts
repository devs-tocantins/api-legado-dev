import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CourseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
