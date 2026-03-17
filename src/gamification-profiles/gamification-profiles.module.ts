import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { GamificationProfilesService } from './gamification-profiles.service';
import { GamificationProfilesController } from './gamification-profiles.controller';
import { RelationalGamificationProfilePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalGamificationProfilePersistenceModule,
  ],
  controllers: [GamificationProfilesController],
  providers: [GamificationProfilesService],
  exports: [
    GamificationProfilesService,
    RelationalGamificationProfilePersistenceModule,
  ],
})
export class GamificationProfilesModule {}
