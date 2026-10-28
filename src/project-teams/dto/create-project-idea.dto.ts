import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProjectIdeaDto {
  @ApiProperty({ example: 'Plataforma de doação de alimentos' })
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  title: string;

  @ApiProperty({
    example: 'Conectar mercados e ONGs para reduzir o desperdício de comida.',
  })
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['nestjs', 'react'],
    description: 'Tecnologias/temas do projeto (máx. 8)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? Array.from(
          new Set(
            value
              .filter((tag) => typeof tag === 'string')
              .map((tag: string) => tag.trim().toLowerCase())
              .filter(Boolean),
          ),
        )
      : value,
  )
  tags?: string[];
}
