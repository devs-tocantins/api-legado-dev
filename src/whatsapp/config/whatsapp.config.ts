import { registerAs } from '@nestjs/config';

import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { WhatsappConfig } from './whatsapp-config.type';

class EnvironmentVariablesValidator {
  @IsBoolean()
  @IsOptional()
  WHATSAPP_ENABLED: boolean;

  @IsString()
  @IsOptional()
  WHATSAPP_SESSION_PATH: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  WHATSAPP_SEND_MIN_DELAY_MS: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  WHATSAPP_SEND_MAX_DELAY_MS: number;
}

export default registerAs<WhatsappConfig>('whatsapp', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    enabled: process.env.WHATSAPP_ENABLED === 'true',
    sessionPath:
      process.env.WHATSAPP_SESSION_PATH ?? '/usr/src/app/whatsapp-session',
    sendMinDelayMs: process.env.WHATSAPP_SEND_MIN_DELAY_MS
      ? parseInt(process.env.WHATSAPP_SEND_MIN_DELAY_MS, 10)
      : 3000,
    sendMaxDelayMs: process.env.WHATSAPP_SEND_MAX_DELAY_MS
      ? parseInt(process.env.WHATSAPP_SEND_MAX_DELAY_MS, 10)
      : 8000,
  };
});
