import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitySeedService } from './activity-seed.service';
import { ActivityEntity } from '../../../../activities/infrastructure/persistence/relational/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityEntity])],
  providers: [ActivitySeedService],
  exports: [ActivitySeedService],
})
export class ActivitySeedModule {}
