import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GamificationProfileRelationalRepository } from './gamification-profile.repository';
import { GamificationProfileEntity } from '../entities/gamification-profile.entity';
import { RoleEnum } from '../../../../../roles/roles.enum';

describe('GamificationProfileRelationalRepository', () => {
  let repository: GamificationProfileRelationalRepository;
  let mockQueryBuilder: any;
  let mockTypeOrmRepository: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ id: 'profile-user-id' }]),
    };

    mockTypeOrmRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      find: jest.fn().mockResolvedValue([
        {
          id: 'profile-user-id',
          userId: 2,
          username: 'user_regular',
          totalXp: 100,
          currentMonthlyXp: 50,
          currentYearlyXp: 100,
          gratitudeTokens: 10,
          journeyXp: 0,
          isBanned: false,
          showFullName: false,
          bannerPreset: 'default',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 2,
            role: { id: RoleEnum.user, name: 'User' },
          },
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationProfileRelationalRepository,
        {
          provide: getRepositoryToken(GamificationProfileEntity),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<GamificationProfileRelationalRepository>(
      GamificationProfileRelationalRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAllWithPagination', () => {
    it('should exclude admin users (roleId = 1) from leaderboard results', async () => {
      const result = await repository.findAllWithPagination({
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith(
        'gp',
      );
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('gp.user', 'u');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('u.isBanned = false');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'u."roleId" != :adminRoleId',
        { adminRoleId: RoleEnum.admin },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'gp.totalXp',
        'DESC',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'gp.gratitudeTokens',
        'DESC',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'u.createdAt',
        'ASC',
      );
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('user_regular');
    });

    it('should apply custom primary sort followed by tie-breaker sorting', async () => {
      await repository.findAllWithPagination({
        paginationOptions: { page: 1, limit: 10 },
        sort: [{ orderBy: 'currentMonthlyXp', order: 'DESC' }],
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'gp.currentMonthlyXp',
        'DESC',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenNthCalledWith(
        1,
        'gp.gratitudeTokens',
        'DESC',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenNthCalledWith(
        2,
        'u.createdAt',
        'ASC',
      );
    });
  });
});
