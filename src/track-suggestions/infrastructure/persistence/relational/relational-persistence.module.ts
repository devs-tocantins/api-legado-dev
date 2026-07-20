import { Module } from '@nestjs/common';
import { TrackSuggestionRepository } from '../track-suggestion.repository';
import { TrackSuggestionRelationalRepository } from './repositories/track-suggestion.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackSuggestionEntity } from './entities/track-suggestion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrackSuggestionEntity])],
  providers: [
    {
      provide: TrackSuggestionRepository,
      useClass: TrackSuggestionRelationalRepository,
    },
  ],
  exports: [TrackSuggestionRepository],
})
export class RelationalTrackSuggestionPersistenceModule {}
