import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CourseReviewsService } from './course-reviews.service';
import { CourseReviewRepository } from './infrastructure/persistence/course-review.repository';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { TrackItemsService } from '../track-items/track-items.service';
import { TrackItemCompletionsService } from '../track-item-completions/track-item-completions.service';
import { CoursesService } from '../courses/courses.service';
import { TrackItemType } from '../track-items/domain/track-item-type.enum';
import { TrackItemStatus } from '../track-items/domain/track-item-status.enum';
import { TrackItemCompletionStatus } from '../track-item-completions/domain/track-item-completion-status.enum';
import { CourseReview } from './domain/course-review';
import { TrackItem } from '../track-items/domain/track-item';
import { GamificationProfile } from '../gamification-profiles/domain/gamification-profile';
import { Course } from '../courses/domain/course';
import { CourseStatus } from '../courses/domain/course-status.enum';

const mockProfile: GamificationProfile = {
  id: 'profile-1',
  userId: 1,
  username: 'johndoe',
  totalXp: 0,
  currentMonthlyXp: 0,
  currentYearlyXp: 0,
  gratitudeTokens: 0,
  gratitudeTokensReceived: 0,
  journeyXp: 0,
  isBanned: false,
  showFullName: false,
  bannerPreset: 'default',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockCourse: Course = {
  id: 'course-1',
  title: 'Curso X',
  provider: null,
  url: 'https://example.com',
  isFree: true,
  price: null,
  language: 'pt-BR',
  submittedByProfileId: null,
  status: CourseStatus.VERIFIED,
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
  communityXpReward: 0,
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
    findByCourseId: jest.fn().mockResolvedValue([mockReview]),
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

const mockCoursesService: Partial<Record<keyof CoursesService, jest.Mock>> = {
  findById: jest.fn().mockResolvedValue(mockCourse),
};

const mockEntityManager = {
  create: jest.fn((_entity, data) => data),
  save: jest.fn().mockImplementation((entity) => {
    if (entity && entity.name === 'CourseReviewEntity') {
      return Promise.resolve(mockReview);
    }
    return Promise.resolve({ ...mockReview });
  }),
  increment: jest.fn().mockResolvedValue(undefined),
};

const mockQueryRunner = {
  connect: jest.fn().mockResolvedValue(undefined),
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  release: jest.fn().mockResolvedValue(undefined),
  manager: mockEntityManager,
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

describe('CourseReviewsService', () => {
  let service: CourseReviewsService;

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
        { provide: CoursesService, useValue: mockCoursesService },
        { provide: getDataSourceToken(), useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<CourseReviewsService>(CourseReviewsService);

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
    (mockCoursesService.findById as jest.Mock).mockResolvedValue(mockCourse);
    mockEntityManager.save.mockResolvedValue(mockReview);
    mockQueryRunner.commitTransaction.mockResolvedValue(undefined);
    mockQueryRunner.rollbackTransaction.mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create the review, mark provenCompletion true and grant XP when completion is proven', async () => {
      const result = await service.create(
        { courseId: 'course-1', rating: 5, comment: 'Ótimo curso' },
        1,
      );

      expect(mockGamificationProfilesService.findByUserId).toHaveBeenCalledWith(
        1,
      );
      expect(mockEntityManager.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          courseId: 'course-1',
          profileId: 'profile-1',
          rating: 5,
          provenCompletion: true,
        }),
      );
      expect(mockEntityManager.increment).toHaveBeenCalledWith(
        expect.anything(),
        { id: 'profile-1' },
        'totalXp',
        expect.any(Number),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(mockReview);
    });

    it('should create the review with provenCompletion false when there is no proof, without blocking', async () => {
      (
        mockTrackItemCompletionsService.findByItemAndProfile as jest.Mock
      ).mockResolvedValue(null);

      await service.create({ courseId: 'course-1', rating: 4 }, 1);

      expect(mockEntityManager.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ provenCompletion: false }),
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw when the user has no gamification profile', async () => {
      (
        mockGamificationProfilesService.findByUserId as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        service.create({ courseId: 'course-1', rating: 5 }, 999),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(mockQueryRunner.connect).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the course does not exist', async () => {
      (mockCoursesService.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create({ courseId: 'missing', rating: 5 }, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when the course is not verified', async () => {
      (mockCoursesService.findById as jest.Mock).mockResolvedValue({
        ...mockCourse,
        status: CourseStatus.PENDING,
      });

      await expect(
        service.create({ courseId: 'course-1', rating: 5 }, 1),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(mockQueryRunner.connect).not.toHaveBeenCalled();
    });
  });
});
