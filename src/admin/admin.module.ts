import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [ConfigModule, MailerModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
