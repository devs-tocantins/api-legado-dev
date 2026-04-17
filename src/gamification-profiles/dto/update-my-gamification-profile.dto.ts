import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
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
}
