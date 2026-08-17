import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { RelationalCoursePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { GamificationProfilesModule } from '../gamification-profiles/gamification-profiles.module';

@Module({
  imports: [RelationalCoursePersistenceModule, GamificationProfilesModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService, RelationalCoursePersistenceModule],
})
export class CoursesModule {}
