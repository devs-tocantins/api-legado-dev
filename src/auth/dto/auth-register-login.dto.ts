import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class AuthRegisterLoginDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty()
  @MinLength(6)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiPropertyOptional({
    example: 'joao_dev',
    description:
      '@handle único (3–30 chars, apenas letras minúsculas, números e underscore)',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_-]+$/, {
    message:
      'username deve conter apenas letras minúsculas, números, underscore e hífen',
  })
  @Transform(({ value }) => value?.trim().toLowerCase())
  username?: string;
}
