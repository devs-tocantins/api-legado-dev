import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateMyGamificationProfileDto {
  @ApiProperty({
    description:
      'Novo @handle único (3–30 chars, apenas letras, números e underscore)',
    example: 'joao_dev',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_]+$/, {
    message:
      'username deve conter apenas letras minúsculas, números e underscore',
  })
  username: string;
}
