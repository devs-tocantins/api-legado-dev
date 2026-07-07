import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeSeedService } from './badge-seed.service';
import { BadgeEntity } from '../../../../badges/infrastructure/persistence/relational/entities/badge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BadgeEntity])],
  providers: [BadgeSeedService],
  exports: [BadgeSeedService],
})
export class BadgeSeedModule {}
