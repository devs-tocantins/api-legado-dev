import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'Full Stack Open' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'University of Helsinki' })
  @IsOptional()
  @IsString()
  provider?: string | null;

  @ApiProperty({ example: 'https://fullstackopen.com' })
  @IsUrl()
  url: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  isFree: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number | null;

  @ApiPropertyOptional({ example: 'pt-BR' })
  @IsOptional()
  @IsString()
  language?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  submittedByProfileId?: string | null;
}
