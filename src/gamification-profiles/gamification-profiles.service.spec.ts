import { Test, TestingModule } from '@nestjs/testing';
import { GamificationProfilesService } from './gamification-profiles.service';
import { GamificationProfileRepository } from './infrastructure/persistence/gamification-profile.repository';
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
  gratitudeTokens: 0,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockRepository: Partial<
  Record<keyof GamificationProfileRepository, jest.Mock>
> = {
  create: jest.fn().mockResolvedValue(mockGamificationProfile),
  findById: jest.fn().mockResolvedValue(mockGamificationProfile),
  findByIds: jest.fn().mockResolvedValue([mockGamificationProfile]),
  findAllWithPagination: jest.fn().mockResolvedValue([mockGamificationProfile]),
  update: jest.fn().mockResolvedValue(mockGamificationProfile),
  remove: jest.fn().mockResolvedValue(undefined),
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
        totalXp: 0,
        currentMonthlyXp: 0,
        currentYearlyXp: 0,
        gratitudeTokens: 0,
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

  describe('remove', () => {
    it('should remove a gamification profile', async () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

      await service.remove(id);

      expect(repository.remove).toHaveBeenCalledWith(id);
    });
  });
});
