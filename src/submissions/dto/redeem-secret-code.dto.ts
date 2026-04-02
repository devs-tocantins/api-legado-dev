import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RedeemSecretCodeDto {
  @ApiProperty({
    example: 'EVENTO2024',
    description: 'Código secreto da atividade',
  })
  @IsString()
  @MinLength(1)
  secretCode: string;
}
