import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Activity } from './domain/activity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { FindAllActivitiesDto } from './dto/find-all-activities.dto';

const mockActivity: Activity = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'Artigo Publicado',
  description: 'Publicou um artigo técnico em blog reconhecido',
  fixedReward: 100,
  isHidden: false,
  secretCode: null,
  requiresProof: true,
  requiresDescription: false,
  cooldownHours: 24,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockService: Partial<Record<keyof ActivitiesService, jest.Mock>> = {
  create: jest.fn().mockResolvedValue(mockActivity),
  findAllWithPagination: jest.fn().mockResolvedValue([mockActivity]),
  findPublicWithPagination: jest.fn().mockResolvedValue([mockActivity]),
  findById: jest.fn().mockResolvedValue(mockActivity),
  update: jest.fn().mockResolvedValue(mockActivity),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('ActivitiesController', () => {
  let controller: ActivitiesController;
  let service: ActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        {
          provide: ActivitiesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
    service = module.get<ActivitiesService>(ActivitiesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an activity and return it', async () => {
      const dto: CreateActivityDto = {
        title: 'Artigo Publicado',
        description: 'Publicou um artigo técnico em blog reconhecido',
        fixedReward: 100,
        isHidden: false,
        secretCode: null,
        requiresProof: true,
        cooldownHours: 24,
      };

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockActivity);
    });
  });

  describe('findAll', () => {
    it('should return only public (non-hidden) activities with default page and limit', async () => {
      (mockService.findPublicWithPagination as jest.Mock).mockResolvedValue([
        mockActivity,
      ]);

      const query: FindAllActivitiesDto = {};
      const result = await controller.findAll(query);

      expect(service.findPublicWithPagination).toHaveBeenCalledWith({
        paginationOptions: { page: 1, limit: 10 },
      });
      expect(result.data).toEqual([mockActivity]);
    });

    it('should cap limit at 50 when a higher value is provided', async () => {
      (mockService.findPublicWithPagination as jest.Mock).mockResolvedValue([]);

      const query: FindAllActivitiesDto = { page: 1, limit: 200 };
      await controller.findAll(query);

      expect(service.findPublicWithPagination).toHaveBeenCalledWith({
        paginationOptions: { page: 1, limit: 50 },
      });
    });
  });

  describe('findById', () => {
    it('should return a single activity by id', async () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

      const result = await controller.findById(id);

      expect(service.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockActivity);
    });
  });

  describe('update', () => {
    it('should update an activity and return updated data', async () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const dto: UpdateActivityDto = { fixedReward: 150, cooldownHours: 48 };

      const result = await controller.update(id, dto);

      expect(service.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(mockActivity);
    });
  });

  describe('remove', () => {
    it('should remove an activity by id', async () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
