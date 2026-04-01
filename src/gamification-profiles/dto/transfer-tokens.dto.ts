import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

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
  message?: string;
}
