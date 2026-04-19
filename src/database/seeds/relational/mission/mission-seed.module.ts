import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionSeedService } from './mission-seed.service';
import { MissionEntity } from '../../../../missions/infrastructure/persistence/relational/entities/mission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MissionEntity])],
  providers: [MissionSeedService],
  exports: [MissionSeedService],
})
export class MissionSeedModule {}
