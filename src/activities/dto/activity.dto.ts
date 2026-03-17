import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ActivityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
