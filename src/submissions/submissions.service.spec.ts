import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionRepository } from './infrastructure/persistence/submission.repository';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { ActivitiesService } from '../activities/activities.service';
import { BadgeEvaluatorService } from '../badges/badge-evaluator.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TrackItemsService } from '../track-items/track-items.service';
import { TrackItemCompletionsService } from '../track-item-completions/track-item-completions.service';
import { LearningTracksService } from '../learning-tracks/learning-tracks.service';
import { Submission } from './domain/submission';
import { SubmissionStatus } from './domain/submission-status.enum';
import { GamificationProfile } from '../gamification-profiles/domain/gamification-profile';
import { Activity } from '../activities/domain/activity';
import { EffortLevel } from '../activities/domain/effort-level.enum';
import { EffortTier } from '../activities/domain/effort-tier';
import { TrackItem } from '../track-items/domain/track-item';
import { TrackItemType } from '../track-items/domain/track-item-type.enum';
import { TrackItemStatus } from '../track-items/domain/track-item-status.enum';

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

const mockActivity: Activity = {
  id: 'activity-1',
  title: 'Prova de trilha',
  description: 'desc',
  fixedReward: 50,
  isHidden: false,
  secretCode: null,
  requiresProof: false,
  requiresDescription: false,
  cooldownHours: 0,
  effortTiers: null,
  isFreeform: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const effortTiers: EffortTier[] = [
  { level: EffortLevel.P, label: 'Pequeno', example: 'exemplo P', xp: 40 },
  { level: EffortLevel.M, label: 'Médio', example: 'exemplo M', xp: 120 },
  { level: EffortLevel.G, label: 'Grande', example: 'exemplo G', xp: 250 },
  { level: EffortLevel.EPICO, label: 'Épico', example: 'exemplo E', xp: 400 },
];

const mockFreeformActivity: Activity = {
  ...mockActivity,
  id: 'activity-freeform',
  isFreeform: true,
  effortTiers,
};

const mockProofItem: TrackItem = {
  id: 'item-1',
  trackId: 'track-1',
  sectionId: 'section-1',
  type: TrackItemType.PROOF,
  title: 'Prove seu trabalho',
  body: null,
  position: 20,
  status: TrackItemStatus.ACTIVE,
  isOptional: false,
  allowsTestOut: false,
  journeyXp: 40,
  grantsCommunityXp: false,
  communityXpReward: 0,
  activityId: 'activity-1',
  missionId: null,
  courseId: null,
  config: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function makeSubmission(overrides: Partial<Submission> = {}): Submission {
  return {
    id: 'submission-1',
    profileId: 'profile-1',
    activityId: 'activity-1',
    trackItemId: null,
    isTestOut: false,
    proofUrl: null,
    description: null,
    customTitle: null,
    declaredEffort: null,
    status: SubmissionStatus.PENDING,
    feedback: null,
    awardedXp: 0,
    reviewerId: null,
    reviewedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('SubmissionsService', () => {
  let service: SubmissionsService;

  let mockSubmissionRepository: Partial<
    Record<keyof SubmissionRepository, jest.Mock>
  >;
  let mockGamificationProfilesService: Partial<
    Record<keyof GamificationProfilesService, jest.Mock>
  >;
  let mockActivitiesService: Partial<
    Record<keyof ActivitiesService, jest.Mock>
  >;
  let mockTrackItemsService: Partial<
    Record<keyof TrackItemsService, jest.Mock>
  >;
  let mockTrackItemCompletionsService: Partial<
    Record<keyof TrackItemCompletionsService, jest.Mock>
  >;
  let mockLearningTracksService: Partial<
    Record<keyof LearningTracksService, jest.Mock>
  >;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      update: jest.fn(),
      increment: jest.fn(),
      save: jest.fn(),
      create: jest.fn((_entity, data) => data),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockProfile),
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockSubmissionRepository = {
      create: jest.fn().mockResolvedValue(makeSubmission()),
      findById: jest.fn().mockResolvedValue(makeSubmission()),
      findRecentByProfileAndActivity: jest.fn().mockResolvedValue([]),
    };
    mockGamificationProfilesService = {
      findByUserId: jest
        .fn()
        .mockImplementation((userId: number) =>
          Promise.resolve(
            userId === 1
              ? mockProfile
              : { ...mockProfile, id: 'moderator-profile', userId },
          ),
        ),
    };
    mockActivitiesService = {
      findById: jest.fn().mockResolvedValue(mockActivity),
    };
    mockTrackItemsService = {
      findById: jest.fn().mockResolvedValue(mockProofItem),
      evaluateSectionCompletion: jest.fn().mockResolvedValue(undefined),
    };
    mockTrackItemCompletionsService = {
      findByItemAndProfile: jest.fn().mockResolvedValue(null),
    };
    mockLearningTracksService = {
      isSectionReachable: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: SubmissionRepository, useValue: mockSubmissionRepository },
        {
          provide: GamificationProfilesService,
          useValue: mockGamificationProfilesService,
        },
        { provide: ActivitiesService, useValue: mockActivitiesService },
        {
          provide: BadgeEvaluatorService,
          useValue: { evaluate: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: TrackItemsService, useValue: mockTrackItemsService },
        {
          provide: TrackItemCompletionsService,
          useValue: mockTrackItemCompletionsService,
        },
        { provide: LearningTracksService, useValue: mockLearningTracksService },
        { provide: getDataSourceToken(), useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
  });

  describe('create — marco de trilha (trackItemId)', () => {
    it('should create a submission for a PROOF track item, deriving activityId from it', async () => {
      await service.create({ trackItemId: 'item-1' }, 1);

      expect(mockSubmissionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          trackItemId: 'item-1',
          activityId: 'activity-1',
          isTestOut: false,
        }),
      );
    });

    it('should reject a non-PROOF item when isTestOut is not set', async () => {
      mockTrackItemsService.findById!.mockResolvedValue({
        ...mockProofItem,
        type: TrackItemType.RESOURCE,
      });

      await expect(
        service.create({ trackItemId: 'item-1' }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when the item was already completed', async () => {
      mockTrackItemCompletionsService.findByItemAndProfile!.mockResolvedValue({
        id: 'completion-1',
      });

      await expect(
        service.create({ trackItemId: 'item-1' }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when the track item does not exist', async () => {
      mockTrackItemsService.findById!.mockResolvedValue(null);

      await expect(
        service.create({ trackItemId: 'missing-item' }, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create — test-out', () => {
    it('should allow test-out on an item with allowsTestOut when the section is reachable', async () => {
      mockTrackItemsService.findById!.mockResolvedValue({
        ...mockProofItem,
        type: TrackItemType.CHECKPOINT,
        allowsTestOut: true,
      });

      await service.create({ trackItemId: 'item-1', isTestOut: true }, 1);

      expect(mockSubmissionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isTestOut: true }),
      );
    });

    it('should not require proofUrl/description on test-out even when the activity requires them', async () => {
      mockTrackItemsService.findById!.mockResolvedValue({
        ...mockProofItem,
        type: TrackItemType.CHECKPOINT,
        allowsTestOut: true,
      });
      mockActivitiesService.findById!.mockResolvedValue({
        ...mockActivity,
        requiresProof: true,
        requiresDescription: true,
      });

      await service.create({ trackItemId: 'item-1', isTestOut: true }, 1);

      expect(mockSubmissionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isTestOut: true,
          proofUrl: null,
          description: null,
        }),
      );
    });

    it('should reject test-out on an item without allowsTestOut', async () => {
      mockTrackItemsService.findById!.mockResolvedValue({
        ...mockProofItem,
        type: TrackItemType.CHECKPOINT,
        allowsTestOut: false,
      });

      await expect(
        service.create({ trackItemId: 'item-1', isTestOut: true }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject test-out when the section is not yet reachable', async () => {
      mockTrackItemsService.findById!.mockResolvedValue({
        ...mockProofItem,
        allowsTestOut: true,
      });
      mockLearningTracksService.isSectionReachable!.mockResolvedValue(false);

      await expect(
        service.create({ trackItemId: 'item-1', isTestOut: true }, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create — atividade livre e faixas de esforço', () => {
    it('should throw BadRequestException when isFreeform and customTitle is missing', async () => {
      mockActivitiesService.findById!.mockResolvedValue(mockFreeformActivity);

      await expect(
        service.create(
          { activityId: 'activity-freeform', effortLevel: EffortLevel.P },
          1,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create the submission with customTitle and declaredEffort when valid', async () => {
      mockActivitiesService.findById!.mockResolvedValue(mockFreeformActivity);

      await service.create(
        {
          activityId: 'activity-freeform',
          customTitle: 'Ajudei a organizar o meetup',
          effortLevel: EffortLevel.M,
        },
        1,
      );

      expect(mockSubmissionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customTitle: 'Ajudei a organizar o meetup',
          declaredEffort: EffortLevel.M,
        }),
      );
    });

    it('should throw BadRequestException when the activity has effortTiers and effortLevel is missing', async () => {
      mockActivitiesService.findById!.mockResolvedValue({
        ...mockActivity,
        effortTiers,
      });

      await expect(
        service.create({ activityId: 'activity-1' }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when effortLevel does not match any tier', async () => {
      mockActivitiesService.findById!.mockResolvedValue({
        ...mockActivity,
        effortTiers: [effortTiers[0]],
      });

      await expect(
        service.create(
          { activityId: 'activity-1', effortLevel: EffortLevel.EPICO },
          1,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('review — aprovação de marco de trilha', () => {
    it('should create a track_item_completion and credit journeyXp on approval', async () => {
      mockSubmissionRepository.findById!.mockResolvedValue(
        makeSubmission({ trackItemId: 'item-1' }),
      );

      await service.review(
        'submission-1',
        { status: SubmissionStatus.APPROVED },
        2,
      );

      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          itemId: 'item-1',
          profileId: 'profile-1',
          awardedJourneyXp: 40,
        }),
      );
      expect(mockQueryRunner.manager.increment).toHaveBeenCalledWith(
        expect.anything(),
        { id: 'profile-1' },
        'journeyXp',
        40,
      );
    });

    it('should NOT credit community XP when grantsCommunityXp is false', async () => {
      mockSubmissionRepository.findById!.mockResolvedValue(
        makeSubmission({ trackItemId: 'item-1' }),
      );

      await service.review(
        'submission-1',
        { status: SubmissionStatus.APPROVED },
        2,
      );

      expect(mockQueryRunner.manager.increment).not.toHaveBeenCalledWith(
        expect.anything(),
        { id: 'profile-1' },
        'totalXp',
        expect.anything(),
      );
    });

    it('should credit community XP when grantsCommunityXp is true', async () => {
      mockTrackItemsService.findById!.mockResolvedValue({
        ...mockProofItem,
        grantsCommunityXp: true,
      });
      mockSubmissionRepository.findById!.mockResolvedValue(
        makeSubmission({ trackItemId: 'item-1' }),
      );

      await service.review(
        'submission-1',
        { status: SubmissionStatus.APPROVED },
        2,
      );

      expect(mockQueryRunner.manager.increment).toHaveBeenCalledWith(
        expect.anything(),
        { id: 'profile-1' },
        'totalXp',
        mockActivity.fixedReward,
      );
    });

    it('should not duplicate the completion if one already exists for this item/profile', async () => {
      mockSubmissionRepository.findById!.mockResolvedValue(
        makeSubmission({ trackItemId: 'item-1' }),
      );
      mockTrackItemCompletionsService.findByItemAndProfile!.mockResolvedValue({
        id: 'existing-completion',
      });

      await service.review(
        'submission-1',
        { status: SubmissionStatus.APPROVED },
        2,
      );

      expect(mockQueryRunner.manager.save).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ itemId: 'item-1' }),
      );
    });
  });

  describe('review — resolução de XP por faixa de esforço', () => {
    it('should award the tier xp matching the declared effort when there is no moderator override', async () => {
      mockActivitiesService.findById!.mockResolvedValue(mockFreeformActivity);
      mockSubmissionRepository.findById!.mockResolvedValue(
        makeSubmission({
          activityId: 'activity-freeform',
          declaredEffort: EffortLevel.M,
        }),
      );

      await service.review(
        'submission-1',
        { status: SubmissionStatus.APPROVED },
        2,
      );

      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        expect.anything(),
        'submission-1',
        expect.objectContaining({ awardedXp: 120 }),
      );
    });

    it("should let the moderator's effortLevel override the declared effort", async () => {
      mockActivitiesService.findById!.mockResolvedValue(mockFreeformActivity);
      mockSubmissionRepository.findById!.mockResolvedValue(
        makeSubmission({
          activityId: 'activity-freeform',
          declaredEffort: EffortLevel.P,
        }),
      );

      await service.review(
        'submission-1',
        { status: SubmissionStatus.APPROVED, effortLevel: EffortLevel.G },
        2,
      );

      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        expect.anything(),
        'submission-1',
        expect.objectContaining({ awardedXp: 250 }),
      );
    });

    it('should fall back to fixedReward when the activity has no effortTiers', async () => {
      mockSubmissionRepository.findById!.mockResolvedValue(makeSubmission());

      await service.review(
        'submission-1',
        { status: SubmissionStatus.APPROVED },
        2,
      );

      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        expect.anything(),
        'submission-1',
        expect.objectContaining({ awardedXp: mockActivity.fixedReward }),
      );
    });
  });
});
