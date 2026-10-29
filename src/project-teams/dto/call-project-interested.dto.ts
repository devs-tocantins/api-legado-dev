import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CallProjectInterestedDto {
  @ApiProperty({
    example: 'https://chat.whatsapp.com/abc123',
    description: 'Link do grupo (WhatsApp, Discord, Telegram...)',
  })
  @IsUrl(
    { protocols: ['https'], require_protocol: true },
    { message: 'Informe um link https válido para o grupo.' },
  )
  @MaxLength(300)
  groupLink: string;

  @ApiPropertyOptional({
    example: 'Vamos começar sábado às 9h.',
    description: 'Recado opcional enviado junto da notificação',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  message?: string;
}
