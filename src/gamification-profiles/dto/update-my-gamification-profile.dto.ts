import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateMyGamificationProfileDto {
  @ApiProperty({
    description:
      'Novo @handle único (3–30 chars, apenas letras, números e underscore)',
    example: 'joao_dev',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_-]+$/, {
    message:
      'username deve conter apenas letras minúsculas, números, underscore e hífen',
  })
  username: string;

  @ApiProperty({
    description: 'Username do GitHub para exibir o avatar',
    example: 'leo-nardo',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(39)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() || null : value,
  )
  githubUsername?: string | null;

  @ApiProperty({
    description: 'Preset de banner do perfil público',
    example: 'emerald',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bannerPreset?: string;

  @ApiProperty({
    description:
      'Número de WhatsApp em formato E.164 sem o "+" (com DDI, ex: 5511999999999). Só pode ser definido uma vez; envie null para desvincular.',
    example: '5511999999999',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Matches(/^\d{10,15}$/, {
    message: 'whatsappNumber deve ter entre 10 e 15 dígitos (com DDI)',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  whatsappNumber?: string | null;
}
