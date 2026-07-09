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
      'Configuração do avatar gerado (JSON serializado com estilo/opções). Envie null para remover.',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(20000)
  avatarConfig?: string | null;

  @ApiProperty({
    description:
      'SVG do avatar gerado, pronto para exibição. Envie null para remover.',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(50000)
  avatarSvg?: string | null;
}
