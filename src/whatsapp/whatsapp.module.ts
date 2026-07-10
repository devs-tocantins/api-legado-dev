import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';

@Module({
  imports: [ConfigModule],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
