import { Module } from '@nestjs/common';
import { TrackEnrollmentRepository } from '../track-enrollment.repository';
import { TrackEnrollmentRelationalRepository } from './repositories/track-enrollment.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackEnrollmentEntity } from './entities/track-enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrackEnrollmentEntity])],
  providers: [
    {
      provide: TrackEnrollmentRepository,
      useClass: TrackEnrollmentRelationalRepository,
    },
  ],
  exports: [TrackEnrollmentRepository],
})
export class RelationalTrackEnrollmentPersistenceModule {}
