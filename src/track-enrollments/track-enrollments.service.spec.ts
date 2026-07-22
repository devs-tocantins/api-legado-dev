import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { TrackEnrollmentsService } from './track-enrollments.service';
import { TrackEnrollmentRepository } from './infrastructure/persistence/track-enrollment.repository';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { TrackEnrollment } from './domain/track-enrollment';
import { TrackEnrollmentStatus } from './domain/track-enrollment-status.enum';
import { GamificationProfile } from '../gamification-profiles/domain/gamification-profile';

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
  showFullName: false,
  bannerPreset: 'default',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockEnrollment: TrackEnrollment = {
  id: 'enrollment-1',
  trackId: 'track-1',
  profileId: 'profile-1',
  status: TrackEnrollmentStatus.ACTIVE,
  startedAt: new Date('2026-01-01'),
  completedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockRepository: Partial<
  Record<keyof TrackEnrollmentRepository, jest.Mock>
> = {
  create: jest.fn().mockResolvedValue(mockEnrollment),
  findByTrackAndProfile: jest.fn().mockResolvedValue(null),
  update: jest.fn().mockResolvedValue(mockEnrollment),
  remove: jest.fn().mockResolvedValue(undefined),
};

const mockGamificationProfilesService: Partial<
  Record<keyof GamificationProfilesService, jest.Mock>
> = {
  findByUserId: jest.fn().mockResolvedValue(mockProfile),
};

describe('TrackEnrollmentsService', () => {
  let service: TrackEnrollmentsService;
  let repository: TrackEnrollmentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackEnrollmentsService,
        { provide: TrackEnrollmentRepository, useValue: mockRepository },
        {
          provide: GamificationProfilesService,
          useValue: mockGamificationProfilesService,
        },
      ],
    }).compile();

    service = module.get<TrackEnrollmentsService>(TrackEnrollmentsService);
    repository = module.get<TrackEnrollmentRepository>(
      TrackEnrollmentRepository,
    );

    jest.clearAllMocks();
    (
      mockGamificationProfilesService.findByUserId as jest.Mock
    ).mockResolvedValue(mockProfile);
    (mockRepository.findByTrackAndProfile as jest.Mock).mockResolvedValue(null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new active enrollment when none exists yet', async () => {
      const result = await service.create({ trackId: 'track-1' }, 1);

      expect(repository.findByTrackAndProfile).toHaveBeenCalledWith(
        'track-1',
        'profile-1',
      );
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          trackId: 'track-1',
          profileId: 'profile-1',
          status: TrackEnrollmentStatus.ACTIVE,
          completedAt: null,
        }),
      );
      expect(result).toEqual(mockEnrollment);
    });

    it('should be idempotent: returns the existing enrollment instead of creating a duplicate', async () => {
      (mockRepository.findByTrackAndProfile as jest.Mock).mockResolvedValue(
        mockEnrollment,
      );

      const result = await service.create({ trackId: 'track-1' }, 1);

      expect(repository.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockEnrollment);
    });

    it('should throw when the user has no gamification profile', async () => {
      (
        mockGamificationProfilesService.findByUserId as jest.Mock
      ).mockResolvedValue(null);

      await expect(service.create({ trackId: 'track-1' }, 999)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('markCompleted', () => {
    it('should set status to completed and stamp completedAt', async () => {
      await service.markCompleted('enrollment-1');

      expect(repository.update).toHaveBeenCalledWith(
        'enrollment-1',
        expect.objectContaining({ status: TrackEnrollmentStatus.COMPLETED }),
      );
      const payload = (repository.update as jest.Mock).mock.calls[0][1];
      expect(payload.completedAt).toBeInstanceOf(Date);
    });
  });
});
