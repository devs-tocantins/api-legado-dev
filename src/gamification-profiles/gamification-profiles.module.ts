import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GamificationProfilesService } from './gamification-profiles.service';
import { GamificationProfilesCronService } from './gamification-profiles-cron.service';
import { GamificationProfilesController } from './gamification-profiles.controller';
import { RelationalGamificationProfilePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalGamificationProfilePersistenceModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [GamificationProfilesController],
  providers: [GamificationProfilesService, GamificationProfilesCronService],
  exports: [
    GamificationProfilesService,
    RelationalGamificationProfilePersistenceModule,
  ],
})
export class GamificationProfilesModule {}
