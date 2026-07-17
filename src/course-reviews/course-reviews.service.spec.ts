import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { CourseReviewsService } from './course-reviews.service';
import { CourseReviewRepository } from './infrastructure/persistence/course-review.repository';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { TrackItemsService } from '../track-items/track-items.service';
import { TrackItemCompletionsService } from '../track-item-completions/track-item-completions.service';
import { TrackItemType } from '../track-items/domain/track-item-type.enum';
import { TrackItemStatus } from '../track-items/domain/track-item-status.enum';
import { TrackItemCompletionStatus } from '../track-item-completions/domain/track-item-completion-status.enum';
import { CourseReview } from './domain/course-review';
import { TrackItem } from '../track-items/domain/track-item';
import { GamificationProfile } from '../gamification-profiles/domain/gamification-profile';

const mockProfile: GamificationProfile = {
  id: 'profile-1',
  userId: 1,
  username: 'johndoe',
  totalXp: 0,
  currentMonthlyXp: 0,
  currentYearlyXp: 0,
  gratitudeTokens: 0,
  isBanned: false,
  bannerPreset: 'default',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockCourseCompletionItem: TrackItem = {
  id: 'item-1',
  trackId: 'track-1',
  sectionId: 'section-1',
  type: TrackItemType.COURSE_COMPLETION,
  title: 'Conclua o curso X',
  body: null,
  position: 10,
  status: TrackItemStatus.ACTIVE,
  isOptional: false,
  allowsTestOut: false,
  journeyXp: 20,
  grantsCommunityXp: false,
  activityId: null,
  missionId: null,
  courseId: 'course-1',
  config: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockReview: CourseReview = {
  id: 'review-1',
  courseId: 'course-1',
  profileId: 'profile-1',
  rating: 5,
  comment: 'Ótimo curso',
  provenCompletion: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockRepository: Partial<Record<keyof CourseReviewRepository, jest.Mock>> =
  {
    create: jest.fn().mockResolvedValue(mockReview),
  };

const mockGamificationProfilesService: Partial<
  Record<keyof GamificationProfilesService, jest.Mock>
> = {
  findByUserId: jest.fn().mockResolvedValue(mockProfile),
};

const mockTrackItemsService: Partial<
  Record<keyof TrackItemsService, jest.Mock>
> = {
  findByCourseId: jest.fn().mockResolvedValue([mockCourseCompletionItem]),
};

const mockTrackItemCompletionsService: Partial<
  Record<keyof TrackItemCompletionsService, jest.Mock>
> = {
  findByItemAndProfile: jest.fn().mockResolvedValue({
    id: 'completion-1',
    itemId: 'item-1',
    profileId: 'profile-1',
    status: TrackItemCompletionStatus.COMPLETED,
    submissionId: null,
    awardedJourneyXp: 20,
    completedAt: new Date('2026-01-01'),
  }),
};

describe('CourseReviewsService', () => {
  let service: CourseReviewsService;
  let repository: CourseReviewRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseReviewsService,
        { provide: CourseReviewRepository, useValue: mockRepository },
        {
          provide: GamificationProfilesService,
          useValue: mockGamificationProfilesService,
        },
        { provide: TrackItemsService, useValue: mockTrackItemsService },
        {
          provide: TrackItemCompletionsService,
          useValue: mockTrackItemCompletionsService,
        },
      ],
    }).compile();

    service = module.get<CourseReviewsService>(CourseReviewsService);
    repository = module.get<CourseReviewRepository>(CourseReviewRepository);

    jest.clearAllMocks();
    (
      mockGamificationProfilesService.findByUserId as jest.Mock
    ).mockResolvedValue(mockProfile);
    (mockTrackItemsService.findByCourseId as jest.Mock).mockResolvedValue([
      mockCourseCompletionItem,
    ]);
    (
      mockTrackItemCompletionsService.findByItemAndProfile as jest.Mock
    ).mockResolvedValue({
      id: 'completion-1',
      itemId: 'item-1',
      profileId: 'profile-1',
      status: TrackItemCompletionStatus.COMPLETED,
      submissionId: null,
      awardedJourneyXp: 20,
      completedAt: new Date('2026-01-01'),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should resolve the profile from the authenticated userId and create the review when completion is proven', async () => {
      const result = await service.create(
        { courseId: 'course-1', rating: 5, comment: 'Ótimo curso' },
        1,
      );

      expect(mockGamificationProfilesService.findByUserId).toHaveBeenCalledWith(
        1,
      );
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId: 'course-1',
          profileId: 'profile-1',
          rating: 5,
          provenCompletion: true,
        }),
      );
      expect(result).toEqual(mockReview);
    });

    it('should throw when the user has no gamification profile', async () => {
      (
        mockGamificationProfilesService.findByUserId as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        service.create({ courseId: 'course-1', rating: 5 }, 999),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw when the profile has not proven completion of the course', async () => {
      (
        mockTrackItemCompletionsService.findByItemAndProfile as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        service.create({ courseId: 'course-1', rating: 5 }, 1),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });
});
