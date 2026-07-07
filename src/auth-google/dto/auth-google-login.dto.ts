import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class AuthGoogleLoginDto {
  @ApiProperty({ example: 'abc', required: false })
  @IsOptional()
  @IsString()
  idToken?: string;

  @ApiProperty({ example: 'abc', required: false })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.idToken)
  accessToken?: string;
}
