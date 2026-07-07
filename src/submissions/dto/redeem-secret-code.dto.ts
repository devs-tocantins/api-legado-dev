import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RedeemSecretCodeDto {
  @ApiProperty({
    example: 'EVENTO2024',
    description: 'Código secreto da atividade',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  secretCode: string;
}
