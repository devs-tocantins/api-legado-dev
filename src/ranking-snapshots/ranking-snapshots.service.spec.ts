import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { RankingSnapshotsService } from './ranking-snapshots.service';
import { RankingSnapshotRepository } from './infrastructure/persistence/ranking-snapshot.repository';
import { GamificationProfileRepository } from '../gamification-profiles/infrastructure/persistence/gamification-profile.repository';
import { RankingPeriodType } from './domain/ranking-period-type.enum';

const mockProfile1 = {
  id: 'profile-uuid-1',
  userId: 1,
  username: 'user1',
  bannerPreset: 'default',
  avatarConfig: null,
  photo: null,
  totalXp: 500,
  currentMonthlyXp: 200,
  currentYearlyXp: 1000,
  gratitudeTokens: 5,
  journeyXp: 100,
  isBanned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProfile2 = {
  id: 'profile-uuid-2',
  userId: 2,
  username: 'user2',
  bannerPreset: 'preset2',
  avatarConfig: null,
  photo: null,
  totalXp: 300,
  currentMonthlyXp: 350,
  currentYearlyXp: 800,
  gratitudeTokens: 5,
  journeyXp: 50,
  isBanned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProfile3ZeroXp = {
  id: 'profile-uuid-3',
  userId: 3,
  username: 'user3',
  bannerPreset: 'default',
  avatarConfig: null,
  photo: null,
  totalXp: 0,
  currentMonthlyXp: 0,
  currentYearlyXp: 0,
  gratitudeTokens: 5,
  journeyXp: 0,
  isBanned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSnapshotRepository: Partial<
  Record<keyof RankingSnapshotRepository, jest.Mock>
> = {
  createMany: jest.fn().mockResolvedValue(undefined),
  findChampion: jest.fn(),
  findByProfileId: jest.fn(),
  findByProfileAndPeriod: jest.fn(),
};

const mockGamificationProfileRepository: Partial<
  Record<keyof GamificationProfileRepository, jest.Mock>
> = {
  findById: jest.fn(),
};

describe('RankingSnapshotsService', () => {
  let service: RankingSnapshotsService;
  let mockFindEntity: jest.Mock;

  beforeEach(async () => {
    mockFindEntity = jest.fn();

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        find: mockFindEntity,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingSnapshotsService,
        {
          provide: RankingSnapshotRepository,
          useValue: mockSnapshotRepository,
        },
        {
          provide: GamificationProfileRepository,
          useValue: mockGamificationProfileRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<RankingSnapshotsService>(RankingSnapshotsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('snapshotPeriod', () => {
    it('should create monthly snapshots ordered by monthly XP for profiles with XP > 0', async () => {
      // Returned ordered by currentMonthlyXp DESC: profile2 (350), profile1 (200), profile3ZeroXp (0)
      mockFindEntity.mockResolvedValue([
        mockProfile2,
        mockProfile1,
        mockProfile3ZeroXp,
      ]);

      await service.snapshotPeriod('monthly', '2026-07');

      expect(mockSnapshotRepository.createMany).toHaveBeenCalledWith([
        {
          profileId: 'profile-uuid-2',
          periodType: RankingPeriodType.MONTHLY,
          periodKey: '2026-07',
          position: 1,
          xpAtSnapshot: 350,
        },
        {
          profileId: 'profile-uuid-1',
          periodType: RankingPeriodType.MONTHLY,
          periodKey: '2026-07',
          position: 2,
          xpAtSnapshot: 200,
        },
      ]);
    });

    it('should create annual snapshots ordered by annual XP for profiles with XP > 0', async () => {
      // Returned ordered by currentYearlyXp DESC: profile1 (1000), profile2 (800), profile3ZeroXp (0)
      mockFindEntity.mockResolvedValue([
        mockProfile1,
        mockProfile2,
        mockProfile3ZeroXp,
      ]);

      await service.snapshotPeriod('annual', '2026');

      expect(mockSnapshotRepository.createMany).toHaveBeenCalledWith([
        {
          profileId: 'profile-uuid-1',
          periodType: RankingPeriodType.ANNUAL,
          periodKey: '2026',
          position: 1,
          xpAtSnapshot: 1000,
        },
        {
          profileId: 'profile-uuid-2',
          periodType: RankingPeriodType.ANNUAL,
          periodKey: '2026',
          position: 2,
          xpAtSnapshot: 800,
        },
      ]);
    });

    it('should not call createMany if all profiles have 0 XP', async () => {
      mockFindEntity.mockResolvedValue([mockProfile3ZeroXp]);

      await service.snapshotPeriod('monthly', '2026-07');

      expect(mockSnapshotRepository.createMany).not.toHaveBeenCalled();
    });
  });

  describe('getChampion', () => {
    it('should return the champion snapshot with populated profile details', async () => {
      const championSnapshot = {
        id: 'snapshot-1',
        profileId: 'profile-uuid-1',
        periodType: RankingPeriodType.MONTHLY,
        periodKey: '2026-06',
        position: 1,
        xpAtSnapshot: 500,
        createdAt: new Date(),
      };

      (mockSnapshotRepository.findChampion as jest.Mock).mockResolvedValue(
        championSnapshot,
      );
      (
        mockGamificationProfileRepository.findById as jest.Mock
      ).mockResolvedValue(mockProfile1);

      const result = await service.getChampion('monthly');

      expect(mockSnapshotRepository.findChampion).toHaveBeenCalledWith(
        RankingPeriodType.MONTHLY,
      );
      expect(mockGamificationProfileRepository.findById).toHaveBeenCalledWith(
        'profile-uuid-1',
      );
      expect(result).toEqual({
        ...championSnapshot,
        profile: mockProfile1,
      });
    });

    it('should return null if no champion snapshot exists', async () => {
      (mockSnapshotRepository.findChampion as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await service.getChampion('monthly');

      expect(result).toBeNull();
    });
  });

  describe('getProfileHistory', () => {
    it('should return all snapshots for a profile ordered by periodKey DESC', async () => {
      const snapshots = [
        {
          id: 'snap-2',
          profileId: 'profile-uuid-1',
          periodType: RankingPeriodType.MONTHLY,
          periodKey: '2026-07',
          position: 2,
          xpAtSnapshot: 200,
          createdAt: new Date(),
        },
        {
          id: 'snap-1',
          profileId: 'profile-uuid-1',
          periodType: RankingPeriodType.MONTHLY,
          periodKey: '2026-06',
          position: 1,
          xpAtSnapshot: 300,
          createdAt: new Date(),
        },
      ];

      (mockSnapshotRepository.findByProfileId as jest.Mock).mockResolvedValue(
        snapshots,
      );

      const result = await service.getProfileHistory('profile-uuid-1');

      expect(mockSnapshotRepository.findByProfileId).toHaveBeenCalledWith(
        'profile-uuid-1',
      );
      expect(result).toEqual(snapshots);
    });
  });
});
