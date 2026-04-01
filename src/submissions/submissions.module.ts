import {
  // do not remove this comment
  Module,
  forwardRef,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { RelationalSubmissionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { GamificationProfilesModule } from '../gamification-profiles/gamification-profiles.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalSubmissionPersistenceModule,
    forwardRef(() => GamificationProfilesModule),
    ActivitiesModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService, RelationalSubmissionPersistenceModule],
})
export class SubmissionsModule {}
