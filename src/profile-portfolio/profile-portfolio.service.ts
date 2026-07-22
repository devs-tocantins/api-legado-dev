import { Injectable } from '@nestjs/common';
import { TrackItemCompletionsService } from '../track-item-completions/track-item-completions.service';
import { TrackItemCompletionStatus } from '../track-item-completions/domain/track-item-completion-status.enum';
import { TrackItemsService } from '../track-items/track-items.service';
import { TrackItemType } from '../track-items/domain/track-item-type.enum';
import { TrackSectionsService } from '../track-sections/track-sections.service';
import { LearningTracksService } from '../learning-tracks/learning-tracks.service';
import { ProofPortfolioItem } from './domain/proof-portfolio-item';

@Injectable()
export class ProfilePortfolioService {
  constructor(
    private readonly trackItemCompletionsService: TrackItemCompletionsService,
    private readonly trackItemsService: TrackItemsService,
    private readonly trackSectionsService: TrackSectionsService,
    private readonly learningTracksService: LearningTracksService,
  ) {}

  // Provas reais aprovadas (marcos do tipo PROOF concluídos) de um perfil,
  // com título/etapa/trilha já resolvidos — usado pelo "Portfólio de provas"
  // do perfil público.
  async getProofPortfolio(profileId: string): Promise<ProofPortfolioItem[]> {
    const completions =
      await this.trackItemCompletionsService.findByProfileId(profileId);
    const relevant = completions.filter(
      (c) => c.status === TrackItemCompletionStatus.COMPLETED,
    );
    if (relevant.length === 0) return [];

    const items = await this.trackItemsService.findByIds(
      relevant.map((c) => c.itemId),
    );
    const proofItems = items.filter((i) => i.type === TrackItemType.PROOF);
    if (proofItems.length === 0) return [];

    const proofItemsById = new Map(proofItems.map((i) => [i.id, i]));

    const [sections, tracks] = await Promise.all([
      this.trackSectionsService.findByIds(proofItems.map((i) => i.sectionId)),
      this.learningTracksService.findByIds([
        ...new Set(proofItems.map((i) => i.trackId)),
      ]),
    ]);
    const sectionsById = new Map(sections.map((s) => [s.id, s]));
    const tracksById = new Map(tracks.map((t) => [t.id, t]));

    const portfolio: ProofPortfolioItem[] = [];
    for (const completion of relevant) {
      const item = proofItemsById.get(completion.itemId);
      if (!item) continue;
      const section = sectionsById.get(item.sectionId);
      const track = tracksById.get(item.trackId);
      if (!section || !track) continue;

      portfolio.push({
        itemId: item.id,
        itemTitle: item.title,
        trackId: track.id,
        trackTitle: track.title,
        trackTier: track.tier,
        sectionId: section.id,
        sectionTitle: section.title,
        isTestOut:
          completion.status === TrackItemCompletionStatus.SKIPPED_TESTOUT,
        completedAt: completion.completedAt,
      });
    }

    return portfolio.sort(
      (a, b) => b.completedAt.getTime() - a.completedAt.getTime(),
    );
  }
}
