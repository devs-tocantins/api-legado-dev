import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SetProjectInterestDto {
  @ApiProperty({
    example: 'Front-end',
    description: 'Cargo da ideia em que a pessoa quer atuar',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  role: string;

  @ApiPropertyOptional({
    example: 'Tenho 2 anos de React e tempo nos fins de semana.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
