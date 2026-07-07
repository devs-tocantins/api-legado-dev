import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { MissionEntity } from './infrastructure/persistence/relational/entities/mission.entity';
import { MissionSubmissionEntity } from './infrastructure/persistence/relational/entities/mission-submission.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MissionEntity, MissionSubmissionEntity]),
    NotificationsModule,
    WhatsappModule,
  ],
  controllers: [MissionsController],
  providers: [MissionsService],
  exports: [MissionsService],
})
export class MissionsModule {}
