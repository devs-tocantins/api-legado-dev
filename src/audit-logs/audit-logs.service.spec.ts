import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogRepository } from './infrastructure/persistence/audit-log.repository';
import { AuditActionEnum } from './domain/audit-action.enum';
import { Logger } from '@nestjs/common';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let repository: AuditLogRepository;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        {
          provide: AuditLogRepository,
          useValue: {
            create: jest.fn(),
            findAllWithPagination: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
    repository = module.get<AuditLogRepository>(AuditLogRepository);
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('record', () => {
    it('should successfully record an audit log', async () => {
      const data = {
        action: AuditActionEnum.USER_BANNED,
        entityType: 'user',
        entityId: '123',
      };

      await service.record(data);
      expect(repository.create).toHaveBeenCalledWith(data);
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should not throw if repository.create fails, but should log error', async () => {
      const data = {
        action: AuditActionEnum.USER_BANNED,
        entityType: 'user',
        entityId: '123',
      };
      const error = new Error('DB connection failed');
      jest.spyOn(repository, 'create').mockRejectedValue(error);

      await expect(service.record(data)).resolves.not.toThrow();
      expect(repository.create).toHaveBeenCalledWith(data);
      expect(loggerErrorSpy).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should pass correct params to repository.findAllWithPagination', async () => {
      const options = { page: 1, limit: 10 };
      const filters = { action: AuditActionEnum.USER_BANNED };

      await service.findAll(options, filters);

      expect(repository.findAllWithPagination).toHaveBeenCalledWith(
        options,
        filters,
      );
    });
  });
});
