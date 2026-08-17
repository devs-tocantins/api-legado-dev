import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LearningTrackDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
