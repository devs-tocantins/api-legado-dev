import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { TransactionRepository } from './infrastructure/persistence/transaction.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionCategoryEnum } from './domain/transaction-category.enum';
import { GamificationProfile } from '../gamification-profiles/domain/gamification-profile';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: TransactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TransactionRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get<TransactionRepository>(TransactionRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a transaction', async () => {
      const profile = new GamificationProfile();
      profile.id = 'profile-1';

      const createDto: CreateTransactionDto = {
        profile,
        category: TransactionCategoryEnum.XP_REWARD,
        amount: 100,
        description: 'Test transaction',
      };

      const expectedResult = {
        id: 'uuid-1234',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'create').mockResolvedValue(expectedResult as any);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
