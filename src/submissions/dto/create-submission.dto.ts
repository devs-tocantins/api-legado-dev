import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'uuid-do-gamification-profile' })
  @IsUUID()
  profileId: string;

  @ApiProperty({ example: 'uuid-da-activity' })
  @IsUUID()
  activityId: string;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/comprovante.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  proofUrl?: string | null;
}
