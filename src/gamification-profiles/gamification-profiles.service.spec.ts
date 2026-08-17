import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { GamificationProfilesService } from './gamification-profiles.service';
import { GamificationProfileRepository } from './infrastructure/persistence/gamification-profile.repository';
import { BadgeEvaluatorService } from '../badges/badge-evaluator.service';
import { GamificationProfile } from './domain/gamification-profile';
import { CreateGamificationProfileDto } from './dto/create-gamification-profile.dto';
import { UpdateGamificationProfileDto } from './dto/update-gamification-profile.dto';

const mockGamificationProfile: GamificationProfile = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  userId: 1,
  username: 'johndoe',
  totalXp: 0,
  currentMonthlyXp: 0,
  currentYearlyXp: 0,
  gratitudeTokens: 5,
  gratitudeTokensReceived: 0,
  journeyXp: 0,
  isBanned: false,
  showFullName: false,
  bannerPreset: 'default',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockRecipientProfile: GamificationProfile = {
  id: 'recipient-profile-id',
  userId: 2,
  username: 'janedoe',
  totalXp: 100,
  currentMonthlyXp: 50,
  currentYearlyXp: 100,
  gratitudeTokens: 5,
  gratitudeTokensReceived: 2,
  journeyXp: 0,
  isBanned: false,
  showFullName: false,
  bannerPreset: 'default',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    decrement: jest.fn(),
    increment: jest.fn(),
    save: jest.fn(),
  },
};

const mockRepository: Partial<
  Record<keyof GamificationProfileRepository, jest.Mock>
> = {
  create: jest.fn().mockResolvedValue(mockGamificationProfile),
  findById: jest.fn().mockImplementation((id: string) => {
    if (id === mockGamificationProfile.id)
      return Promise.resolve(mockGamificationProfile);
    if (id === mockRecipientProfile.id)
      return Promise.resolve(mockRecipientProfile);
    return Promise.resolve(null);
  }),
  findByIds: jest.fn().mockResolvedValue([mockGamificationProfile]),
  findAllWithPagination: jest.fn().mockResolvedValue([mockGamificationProfile]),
  update: jest.fn().mockResolvedValue(mockGamificationProfile),
  remove: jest.fn().mockResolvedValue(undefined),
  findByUserId: jest.fn().mockImplementation((userId: number) => {
    if (userId === 1) return Promise.resolve(mockGamificationProfile);
    if (userId === 2) return Promise.resolve(mockRecipientProfile);
    return Promise.resolve(null);
  }),
  findByUsername: jest.fn().mockResolvedValue(mockGamificationProfile),
  resetMonthlyXpAndTokens: jest.fn().mockResolvedValue(undefined),
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

describe('GamificationProfilesService', () => {
  let service: GamificationProfilesService;
  let repository: GamificationProfileRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationProfilesService,
        {
          provide: GamificationProfileRepository,
          useValue: mockRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
        {
          provide: BadgeEvaluatorService,
          useValue: { evaluate: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<GamificationProfilesService>(
      GamificationProfilesService,
    );
    repository = module.get<GamificationProfileRepository>(
      GamificationProfileRepository,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a gamification profile with default XP values', async () => {
      const dto: CreateGamificationProfileDto = {
        userId: 1,
        username: 'johndoe',
      };

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        userId: 1,
        username: 'johndoe',
        bannerPreset: 'default',
        totalXp: 0,
        currentMonthlyXp: 0,
        currentYearlyXp: 0,
        gratitudeTokens: 0,
        gratitudeTokensReceived: 0,
        journeyXp: 0,
        isBanned: false,
        showFullName: false,
      });
      expect(result).toEqual(mockGamificationProfile);
    });
  });

  describe('findById', () => {
    it('should return a gamification profile by id', async () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

      const result = await service.findById(id);

      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockGamificationProfile);
    });
  });

  describe('findAllWithPagination', () => {
    it('should return paginated gamification profiles', async () => {
      const paginationOptions = { page: 1, limit: 10 };

      const result = await service.findAllWithPagination({
        paginationOptions,
      });

      expect(repository.findAllWithPagination).toHaveBeenCalledWith({
        paginationOptions: { page: 1, limit: 10 },
      });
      expect(result).toEqual([mockGamificationProfile]);
    });
  });

  describe('update', () => {
    it('should update a gamification profile username', async () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const dto: UpdateGamificationProfileDto = {
        username: 'newhandle',
      };

      const result = await service.update(id, dto);

      expect(repository.update).toHaveBeenCalledWith(id, {
        username: 'newhandle',
      });
      expect(result).toEqual(mockGamificationProfile);
    });
  });

  describe('updateMyProfile', () => {
    it('should update showFullName preference when passed', async () => {
      (repository.findByUserId as jest.Mock).mockImplementation((userId) => {
        if (userId === 1) return Promise.resolve(mockGamificationProfile);
        return Promise.resolve(null);
      });
      (repository.findByUsername as jest.Mock).mockResolvedValue(null);

      await service.updateMyProfile(
        1,
        'johndoe',
        undefined,
        undefined,
        undefined,
        true,
      );

      expect(repository.update).toHaveBeenCalledWith(
        mockGamificationProfile.id,
        {
          username: 'johndoe',
          showFullName: true,
        },
      );
    });
  });

  describe('remove', () => {
    it('should remove a gamification profile', async () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

      await service.remove(id);

      expect(repository.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('transferTokens', () => {
    it('should successfully transfer tokens and increment gratitudeTokensReceived of recipient', async () => {
      const dto = {
        recipientProfileId: mockRecipientProfile.id,
        amount: 2,
        message: 'Obrigado pela ajuda!',
      };

      await service.transferTokens(1, dto);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.decrement).toHaveBeenCalledWith(
        expect.anything(),
        { id: mockGamificationProfile.id },
        'gratitudeTokens',
        2,
      );
      expect(mockQueryRunner.manager.increment).toHaveBeenCalledWith(
        expect.anything(),
        { id: mockRecipientProfile.id },
        'totalXp',
        2,
      );
      expect(mockQueryRunner.manager.increment).toHaveBeenCalledWith(
        expect.anything(),
        { id: mockRecipientProfile.id },
        'currentMonthlyXp',
        2,
      );
      expect(mockQueryRunner.manager.increment).toHaveBeenCalledWith(
        expect.anything(),
        { id: mockRecipientProfile.id },
        'currentYearlyXp',
        2,
      );
      expect(mockQueryRunner.manager.increment).toHaveBeenCalledWith(
        expect.anything(),
        { id: mockRecipientProfile.id },
        'gratitudeTokensReceived',
        2,
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
