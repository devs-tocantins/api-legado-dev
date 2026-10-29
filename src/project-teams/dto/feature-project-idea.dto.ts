import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class FeatureProjectIdeaDto {
  @ApiProperty({
    type: Boolean,
    description: 'true marca como projeto da vez; false remove o destaque',
  })
  @IsBoolean()
  featured: boolean;
}
