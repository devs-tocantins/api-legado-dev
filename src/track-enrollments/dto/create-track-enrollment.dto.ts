import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateTrackEnrollmentDto {
  @ApiProperty()
  @IsUUID()
  trackId: string;
}
