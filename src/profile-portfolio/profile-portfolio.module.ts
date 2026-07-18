import { Module } from '@nestjs/common';
import { ProfilePortfolioService } from './profile-portfolio.service';
import { ProfilePortfolioController } from './profile-portfolio.controller';
import { TrackItemCompletionsModule } from '../track-item-completions/track-item-completions.module';
import { TrackItemsModule } from '../track-items/track-items.module';
import { TrackSectionsModule } from '../track-sections/track-sections.module';
import { LearningTracksModule } from '../learning-tracks/learning-tracks.module';

@Module({
  imports: [
    TrackItemCompletionsModule,
    TrackItemsModule,
    TrackSectionsModule,
    LearningTracksModule,
  ],
  controllers: [ProfilePortfolioController],
  providers: [ProfilePortfolioService],
})
export class ProfilePortfolioModule {}
