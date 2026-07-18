import { Module } from '@nestjs/common';
import { CourseRepository } from '../course.repository';
import { CourseRelationalRepository } from './repositories/course.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { TrackItemCourseEntity } from './entities/track-item-course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, TrackItemCourseEntity])],
  providers: [
    {
      provide: CourseRepository,
      useClass: CourseRelationalRepository,
    },
  ],
  exports: [CourseRepository],
})
export class RelationalCoursePersistenceModule {}
