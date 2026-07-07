import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { Submission } from './domain/submission';
import { SubmissionStatus } from './domain/submission-status.enum';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { FindAllSubmissionsDto } from './dto/find-all-submissions.dto';

const mockUserId = 42;
const mockReq = { user: { id: mockUserId } };

const mockSubmission: Submission = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  profileId: 'profile-uuid-0001',
  activityId: 'activity-uuid-0001',
  proofUrl: null,
  description: null,
  status: SubmissionStatus.PENDING,
  feedback: null,
  awardedXp: 0,
  reviewerId: null,
  reviewedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockService: Partial<Record<keyof SubmissionsService, jest.Mock>> = {
  create: jest.fn().mockResolvedValue(mockSubmission),
  findAllWithPagination: jest.fn().mockResolvedValue([mockSubmission]),
  findMySubmissions: jest.fn().mockResolvedValue([mockSubmission]),
  findPending: jest.fn().mockResolvedValue([mockSubmission]),
  findById: jest.fn().mockResolvedValue(mockSubmission),
  update: jest.fn().mockResolvedValue(mockSubmission),
  review: jest.fn().mockResolvedValue(mockSubmission),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let service: SubmissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [
        {
          provide: SubmissionsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
    service = module.get<SubmissionsService>(SubmissionsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a submission using userId from JWT and return it', async () => {
      const dto: CreateSubmissionDto = {
        activityId: 'activity-uuid-0001',
      };

      const result = await controller.create(dto, mockReq as any);

      expect(service.create).toHaveBeenCalledWith(dto, mockUserId);
      expect(result).toEqual(mockSubmission);
      expect(result.status).toBe(SubmissionStatus.PENDING);
    });

    it('should create a submission with proofUrl when provided', async () => {
      const dto: CreateSubmissionDto = {
        activityId: 'activity-uuid-0001',
        proofUrl: 'https://s3.amazonaws.com/bucket/prova.png',
      };

      const submissionWithProof: Submission = {
        ...mockSubmission,
        proofUrl: 'https://s3.amazonaws.com/bucket/prova.png',
      };
      (mockService.create as jest.Mock).mockResolvedValueOnce(
        submissionWithProof,
      );

      const result = await controller.create(dto, mockReq as any);

      expect(service.create).toHaveBeenCalledWith(dto, mockUserId);
      expect(result.proofUrl).toBe('https://s3.amazonaws.com/bucket/prova.png');
    });
  });

  describe('findAll', () => {
    it('should return paginated submissions with default page and limit', async () => {
      (mockService.findAllWithPagination as jest.Mock).mockResolvedValue([
        mockSubmission,
      ]);

      const query: FindAllSubmissionsDto = {};
      const result = await controller.findAll(query);

      expect(service.findAllWithPagination).toHaveBeenCalledWith({
        paginationOptions: { page: 1, limit: 10 },
      });
      expect(result.data).toEqual([mockSubmission]);
    });

    it('should cap limit at 50 when a higher value is provided', async () => {
      (mockService.findAllWithPagination as jest.Mock).mockResolvedValue([]);

      const query: FindAllSubmissionsDto = { page: 2, limit: 999 };
      await controller.findAll(query);

      expect(service.findAllWithPagination).toHaveBeenCalledWith({
        paginationOptions: { page: 2, limit: 50 },
      });
    });
  });

  describe('findMine', () => {
    it('should return paginated submissions for the authenticated user', async () => {
      (mockService.findMySubmissions as jest.Mock).mockResolvedValue([
        mockSubmission,
      ]);

      const query: FindAllSubmissionsDto = {};
      const result = await controller.findMine(query, mockReq as any);

      expect(service.findMySubmissions).toHaveBeenCalledWith(mockUserId, {
        page: 1,
        limit: 10,
      });
      expect(result.data).toEqual([mockSubmission]);
    });
  });

  describe('findPending', () => {
    it('should return paginated pending submissions', async () => {
      (mockService.findPending as jest.Mock).mockResolvedValue([
        mockSubmission,
      ]);

      const query: FindAllSubmissionsDto = {};
      const result = await controller.findPending(query);

      expect(service.findPending).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result.data).toEqual([mockSubmission]);
    });
  });

  describe('findById', () => {
    it('should return a single submission by id', async () => {
      const id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

      const result = await controller.findById(id);

      expect(service.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockSubmission);
    });
  });

  describe('update', () => {
    it('should update a submission and return updated data', async () => {
      const id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
      const dto: UpdateSubmissionDto = {
        proofUrl: 'https://s3.amazonaws.com/bucket/novo-comprovante.png',
      };

      const result = await controller.update(id, dto);

      expect(service.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(mockSubmission);
    });
  });

  describe('remove', () => {
    it('should remove a submission by id', async () => {
      const id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
