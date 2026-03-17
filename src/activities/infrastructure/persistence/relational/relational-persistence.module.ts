import { Module } from '@nestjs/common';
import { ActivityRepository } from '../activity.repository';
import { ActivityRelationalRepository } from './repositories/activity.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from './entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityEntity])],
  providers: [
    {
      provide: ActivityRepository,
      useClass: ActivityRelationalRepository,
    },
  ],
  exports: [ActivityRepository],
})
export class RelationalActivityPersistenceModule {}
