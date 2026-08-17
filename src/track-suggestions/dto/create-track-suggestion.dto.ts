import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTrackSuggestionDto {
  @ApiPropertyOptional({
    description:
      'Trilha existente que a sugestão quer melhorar. Deixe em branco para sugerir uma trilha nova.',
  })
  @IsOptional()
  @IsUUID()
  trackId?: string;

  @ApiPropertyOptional({
    description:
      'Nome sugerido para a trilha nova (quando trackId não é informado).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message: string;
}
