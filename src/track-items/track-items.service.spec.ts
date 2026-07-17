import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { TrackItemsService } from './track-items.service';
import { TrackItemRepository } from './infrastructure/persistence/track-item.repository';
import { TrackItemCompletionsService } from '../track-item-completions/track-item-completions.service';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { TrackSectionsService } from '../track-sections/track-sections.service';
import { BadgesService } from '../badges/badges.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TrackItem } from './domain/track-item';
import { TrackItemType } from './domain/track-item-type.enum';
import { TrackItemStatus } from './domain/track-item-status.enum';
import { TrackSection } from '../track-sections/domain/track-section';
import { TrackSectionStatus } from '../track-sections/domain/track-section-status.enum';
import { TrackItemCompletionStatus } from '../track-item-completions/domain/track-item-completion-status.enum';
import { GamificationProfile } from '../gamification-profiles/domain/gamification-profile';

function makeItem(overrides: Partial<TrackItem> = {}): TrackItem {
  return {
    id: 'item-1',
    trackId: 'track-1',
    sectionId: 'section-1',
    type: TrackItemType.RESOURCE,
    title: 'Item',
    body: null,
    position: 10,
    status: TrackItemStatus.ACTIVE,
    isOptional: false,
    allowsTestOut: false,
    journeyXp: 10,
    grantsCommunityXp: false,
    activityId: null,
    missionId: null,
    courseId: null,
    config: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
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

const mockProfile: GamificationProfile = {
  id: 'profile-1',
  userId: 1,
  username: 'johndoe',
  totalXp: 0,
  currentMonthlyXp: 0,
  currentYearlyXp: 0,
  gratitudeTokens: 0,
  journeyXp: 0,
  isBanned: false,
  bannerPreset: 'default',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('TrackItemsService — evaluateSectionCompletion', () => {
  let service: TrackItemsService;
  let mockTrackItemRepository: Partial<
    Record<keyof TrackItemRepository, jest.Mock>
  >;
  let mockTrackItemCompletionsService: Partial<
    Record<keyof TrackItemCompletionsService, jest.Mock>
  >;
  let mockTrackSectionsService: Partial<
    Record<keyof TrackSectionsService, jest.Mock>
  >;
  let mockBadgesService: Partial<Record<keyof BadgesService, jest.Mock>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockTrackItemRepository = {
      findBySectionId: jest
        .fn()
        .mockResolvedValue([
          makeItem({ id: 'item-1' }),
          makeItem({ id: 'item-2' }),
        ]),
    };
    mockTrackItemCompletionsService = {
      findByProfileId: jest.fn().mockResolvedValue([
        {
          id: 'completion-1',
          itemId: 'item-1',
          profileId: 'profile-1',
          status: TrackItemCompletionStatus.COMPLETED,
          submissionId: null,
          awardedJourneyXp: 10,
          completedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'completion-2',
          itemId: 'item-2',
          profileId: 'profile-1',
          status: TrackItemCompletionStatus.COMPLETED,
          submissionId: null,
          awardedJourneyXp: 10,
          completedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    };
    mockTrackSectionsService = {
      findById: jest.fn().mockResolvedValue(mockSection),
    };
    mockBadgesService = {
      grantByBadgeId: jest.fn().mockResolvedValue({ id: 'grant-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackItemsService,
        { provide: TrackItemRepository, useValue: mockTrackItemRepository },
        {
          provide: TrackItemCompletionsService,
          useValue: mockTrackItemCompletionsService,
        },
        {
          provide: GamificationProfilesService,
          useValue: { findById: jest.fn().mockResolvedValue(mockProfile) },
        },
        { provide: TrackSectionsService, useValue: mockTrackSectionsService },
        { provide: BadgesService, useValue: mockBadgesService },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: getDataSourceToken(),
          useValue: { createQueryRunner: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TrackItemsService>(TrackItemsService);
  });

  it('should grant the section badge when all required items are completed', async () => {
    await service.evaluateSectionCompletion('section-1', 'profile-1');

    expect(mockBadgesService.grantByBadgeId).toHaveBeenCalledWith(
      'profile-1',
      'badge-1',
    );
  });

  it('should not grant a badge when the section has no badgeId', async () => {
    mockTrackSectionsService.findById!.mockResolvedValue({
      ...mockSection,
      badgeId: null,
    });

    await service.evaluateSectionCompletion('section-1', 'profile-1');

    expect(mockBadgesService.grantByBadgeId).not.toHaveBeenCalled();
  });

  it('should not grant a badge when not all required items are completed', async () => {
    mockTrackItemCompletionsService.findByProfileId!.mockResolvedValue([
      {
        id: 'completion-1',
        itemId: 'item-1',
        profileId: 'profile-1',
        status: TrackItemCompletionStatus.COMPLETED,
        submissionId: null,
        awardedJourneyXp: 10,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await service.evaluateSectionCompletion('section-1', 'profile-1');

    expect(mockBadgesService.grantByBadgeId).not.toHaveBeenCalled();
  });

  it('should ignore optional items when checking section completion', async () => {
    mockTrackItemRepository.findBySectionId!.mockResolvedValue([
      makeItem({ id: 'item-1' }),
      makeItem({ id: 'item-2', isOptional: true }),
    ]);
    mockTrackItemCompletionsService.findByProfileId!.mockResolvedValue([
      {
        id: 'completion-1',
        itemId: 'item-1',
        profileId: 'profile-1',
        status: TrackItemCompletionStatus.COMPLETED,
        submissionId: null,
        awardedJourneyXp: 10,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await service.evaluateSectionCompletion('section-1', 'profile-1');

    expect(mockBadgesService.grantByBadgeId).toHaveBeenCalledWith(
      'profile-1',
      'badge-1',
    );
  });
});
