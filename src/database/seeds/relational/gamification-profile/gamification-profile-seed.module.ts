import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationProfileSeedService } from './gamification-profile-seed.service';
import { GamificationProfileEntity } from '../../../../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GamificationProfileEntity, UserEntity])],
  providers: [GamificationProfileSeedService],
  exports: [GamificationProfileSeedService],
})
export class GamificationProfileSeedModule {}
