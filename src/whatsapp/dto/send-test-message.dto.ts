import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SendTestMessageDto {
  @ApiProperty({
    description:
      'Numero de telefone com DDD, com ou sem o 55 do Brasil (ex: 63984403559)',
    example: '63984403559',
  })
  @IsString()
  @Matches(/^\d{10,13}$/, {
    message: 'phone deve conter apenas digitos (DDD + numero, 10 a 13 digitos)',
  })
  phone: string;

  @ApiProperty({ example: 'Teste de integracao do legado.dev' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message: string;
}
