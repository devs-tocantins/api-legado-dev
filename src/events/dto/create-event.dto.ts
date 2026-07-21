import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { EventCategory } from '../domain/event-category.enum';
import { EventModality } from '../domain/event-modality.enum';

export class CreateEventDto {
  @ApiProperty({ example: 'Meetup de TypeScript em Fortaleza' })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiProperty({ example: 'Uma noite de talks sobre TypeScript e NestJS.' })
  @IsString()
  description: string;

  @ApiProperty({ enum: EventCategory, example: EventCategory.MEETUP })
  @IsEnum(EventCategory)
  category: EventCategory;

  @ApiProperty({ enum: EventModality, example: EventModality.PRESENCIAL })
  @IsEnum(EventModality)
  modality: EventModality;

  @ApiProperty({ example: '2026-08-15T19:00:00.000Z' })
  @IsDateString()
  startAt: string;

  @ApiPropertyOptional({ example: '2026-08-15T21:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({ example: 'Rua Exemplo, 123 - Fortaleza/CE' })
  @ValidateIf((o) => o.modality !== EventModality.ONLINE)
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: 'https://maps.app.goo.gl/xyz123',
    description: 'Link do Google Maps para o local do evento',
  })
  @IsOptional()
  @IsUrl()
  locationMapUrl?: string;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij' })
  @ValidateIf((o) => o.modality !== EventModality.PRESENCIAL)
  @IsUrl()
  onlineUrl?: string;

  @ApiPropertyOptional({ example: 'https://exemplo.com/inscricoes' })
  @IsOptional()
  @IsUrl()
  externalUrl?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'UUID do arquivo de capa, já enviado via /files/upload',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  coverImageId?: string;
}
