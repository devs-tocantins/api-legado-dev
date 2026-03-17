import { Module } from '@nestjs/common';
import { SubmissionRepository } from '../submission.repository';
import { SubmissionRelationalRepository } from './repositories/submission.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionEntity } from './entities/submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubmissionEntity])],
  providers: [
    {
      provide: SubmissionRepository,
      useClass: SubmissionRelationalRepository,
    },
  ],
  exports: [SubmissionRepository],
})
export class RelationalSubmissionPersistenceModule {}
