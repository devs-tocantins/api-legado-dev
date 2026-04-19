import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class TransferTokensDto {
  @ApiProperty({
    example: 'uuid-do-perfil-destinatario',
    description: 'UUID do GamificationProfile do destinatário',
  })
  @IsUUID()
  recipientProfileId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantidade de Tokens de Gratidão a transferir (mín. 1)',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({
    example: 'Valeu pela ajuda com o bug do GraphQL!',
    description: 'Mensagem opcional de agradecimento',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) => value?.trim())
  message?: string;
}
