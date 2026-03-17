import { Module } from '@nestjs/common';
import { GamificationProfileRepository } from '../gamification-profile.repository';
import { GamificationProfileRelationalRepository } from './repositories/gamification-profile.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationProfileEntity } from './entities/gamification-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GamificationProfileEntity])],
  providers: [
    {
      provide: GamificationProfileRepository,
      useClass: GamificationProfileRelationalRepository,
    },
  ],
  exports: [GamificationProfileRepository],
})
export class RelationalGamificationProfilePersistenceModule {}
