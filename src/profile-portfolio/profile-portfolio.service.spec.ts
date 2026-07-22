import { Test, TestingModule } from '@nestjs/testing';
import { ProfilePortfolioService } from './profile-portfolio.service';
import { TrackItemCompletionsService } from '../track-item-completions/track-item-completions.service';
import { TrackItemsService } from '../track-items/track-items.service';
import { TrackSectionsService } from '../track-sections/track-sections.service';
import { LearningTracksService } from '../learning-tracks/learning-tracks.service';
import { TrackItemCompletionStatus } from '../track-item-completions/domain/track-item-completion-status.enum';
import { TrackItem } from '../track-items/domain/track-item';
import { TrackItemType } from '../track-items/domain/track-item-type.enum';
import { TrackItemStatus } from '../track-items/domain/track-item-status.enum';
import { TrackSection } from '../track-sections/domain/track-section';
import { TrackSectionStatus } from '../track-sections/domain/track-section-status.enum';
import { LearningTrack } from '../learning-tracks/domain/learning-track';
import { LearningTrackTier } from '../learning-tracks/domain/learning-track-tier.enum';
import { LearningTrackStatus } from '../learning-tracks/domain/learning-track-status.enum';
import { TrackItemCompletion } from '../track-item-completions/domain/track-item-completion';

function makeItem(overrides: Partial<TrackItem> = {}): TrackItem {
  return {
    id: 'item-1',
    trackId: 'track-1',
    sectionId: 'section-1',
    type: TrackItemType.PROOF,
    title: 'Suba uma API em produção',
    body: null,
    position: 10,
    status: TrackItemStatus.ACTIVE,
    isOptional: false,
    allowsTestOut: false,
    journeyXp: 10,
    grantsCommunityXp: false,
    communityXpReward: 0,
    activityId: 'activity-1',
    missionId: null,
    courseId: null,
    config: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function makeCompletion(
  overrides: Partial<TrackItemCompletion> = {},
): TrackItemCompletion {
  return {
    id: 'completion-1',
    itemId: 'item-1',
    profileId: 'profile-1',
    status: TrackItemCompletionStatus.COMPLETED,
    submissionId: 'submission-1',
    awardedJourneyXp: 10,
    completedAt: new Date('2026-02-01'),
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
    ...overrides,
  };
}

const mockSection: TrackSection = {
  id: 'section-1',
  trackId: 'track-1',
  title: 'Etapa 1',
  description: null,
  position: 10,
  status: TrackSectionStatus.ACTIVE,
  badgeId: 'badge-1',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockTrack: LearningTrack = {
  id: 'track-1',
  slug: 'backend-inicial',
  title: 'Backend inicial',
  description: null,
  area: 'backend',
  tier: LearningTrackTier.ALICERCE,
  status: LearningTrackStatus.PUBLISHED,
  requiresTrackId: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('ProfilePortfolioService', () => {
  let service: ProfilePortfolioService;
  let trackItemCompletionsService: Partial<
    Record<keyof TrackItemCompletionsService, jest.Mock>
  >;
  let trackItemsService: Partial<Record<keyof TrackItemsService, jest.Mock>>;
  let trackSectionsService: Partial<
    Record<keyof TrackSectionsService, jest.Mock>
  >;
  let learningTracksService: Partial<
    Record<keyof LearningTracksService, jest.Mock>
  >;

  beforeEach(async () => {
    trackItemCompletionsService = { findByProfileId: jest.fn() };
    trackItemsService = { findByIds: jest.fn() };
    trackSectionsService = { findByIds: jest.fn() };
    learningTracksService = { findByIds: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilePortfolioService,
        {
          provide: TrackItemCompletionsService,
          useValue: trackItemCompletionsService,
        },
        { provide: TrackItemsService, useValue: trackItemsService },
        { provide: TrackSectionsService, useValue: trackSectionsService },
        { provide: LearningTracksService, useValue: learningTracksService },
      ],
    }).compile();

    service = module.get<ProfilePortfolioService>(ProfilePortfolioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an empty array when the profile has no completions', async () => {
    trackItemCompletionsService.findByProfileId!.mockResolvedValue([]);

    const result = await service.getProofPortfolio('profile-1');

    expect(result).toEqual([]);
    expect(trackItemsService.findByIds).not.toHaveBeenCalled();
  });

  it('should exclude IN_REVIEW and SKIPPED_TESTOUT completions and non-PROOF items', async () => {
    trackItemCompletionsService.findByProfileId!.mockResolvedValue([
      makeCompletion({ status: TrackItemCompletionStatus.IN_REVIEW }),
      makeCompletion({ status: TrackItemCompletionStatus.SKIPPED_TESTOUT }),
      makeCompletion({ id: 'completion-2', itemId: 'item-2' }),
    ]);
    trackItemsService.findByIds!.mockResolvedValue([
      makeItem({ id: 'item-2', type: TrackItemType.RESOURCE }),
    ]);

    const result = await service.getProofPortfolio('profile-1');

    expect(result).toEqual([]);
  });

  it('should join completions with item/section/track', async () => {
    trackItemCompletionsService.findByProfileId!.mockResolvedValue([
      makeCompletion({ status: TrackItemCompletionStatus.COMPLETED }),
    ]);
    trackItemsService.findByIds!.mockResolvedValue([makeItem()]);
    trackSectionsService.findByIds!.mockResolvedValue([mockSection]);
    learningTracksService.findByIds!.mockResolvedValue([mockTrack]);

    const result = await service.getProofPortfolio('profile-1');

    expect(result).toEqual([
      {
        itemId: 'item-1',
        itemTitle: 'Suba uma API em produção',
        trackId: 'track-1',
        trackTitle: 'Backend inicial',
        trackTier: LearningTrackTier.ALICERCE,
        sectionId: 'section-1',
        sectionTitle: 'Etapa 1',
        isTestOut: false,
        completedAt: new Date('2026-02-01'),
      },
    ]);
  });

  it('should sort results by completedAt descending', async () => {
    trackItemCompletionsService.findByProfileId!.mockResolvedValue([
      makeCompletion({
        id: 'completion-old',
        itemId: 'item-1',
        completedAt: new Date('2026-01-10'),
      }),
      makeCompletion({
        id: 'completion-new',
        itemId: 'item-2',
        completedAt: new Date('2026-03-10'),
      }),
    ]);
    trackItemsService.findByIds!.mockResolvedValue([
      makeItem(),
      makeItem({ id: 'item-2', sectionId: 'section-1', title: 'Item 2' }),
    ]);
    trackSectionsService.findByIds!.mockResolvedValue([mockSection]);
    learningTracksService.findByIds!.mockResolvedValue([mockTrack]);

    const result = await service.getProofPortfolio('profile-1');

    expect(result.map((r) => r.itemId)).toEqual(['item-2', 'item-1']);
  });
});
