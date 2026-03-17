import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GamificationProfileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
