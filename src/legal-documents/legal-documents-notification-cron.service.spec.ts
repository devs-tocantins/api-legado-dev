import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { LegalDocumentsNotificationCronService } from './legal-documents-notification-cron.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/domain/notification-type.enum';
import { MailService } from '../mail/mail.service';
import { CURRENT_LEGAL_DOCUMENTS_VERSION } from './legal-documents.constants';

describe('LegalDocumentsNotificationCronService', () => {
  let service: LegalDocumentsNotificationCronService;

  let mockUserRepository: { find: jest.Mock; update: jest.Mock };
  let mockNotificationsService: Partial<
    Record<keyof NotificationsService, jest.Mock>
  >;
  let mockMailService: Partial<Record<keyof MailService, jest.Mock>>;

  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue([{ locked: true }]),
    release: jest.fn().mockResolvedValue(undefined),
  };

  const mockDataSource = {
    getRepository: jest.fn(),
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockUserRepository = {
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue(undefined),
    };
    mockDataSource.getRepository.mockReturnValue(mockUserRepository);

    mockNotificationsService = {
      create: jest.fn().mockResolvedValue(undefined),
    };
    mockMailService = {
      legalDocumentUpdated: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalDocumentsNotificationCronService,
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<LegalDocumentsNotificationCronService>(
      LegalDocumentsNotificationCronService,
    );
  });

  it('should do nothing when there are no pending users', async () => {
    mockUserRepository.find.mockResolvedValue([]);

    await service.notifyPendingUsers();

    expect(mockNotificationsService.create).not.toHaveBeenCalled();
    expect(mockMailService.legalDocumentUpdated).not.toHaveBeenCalled();
  });

  it('should query at most 100 users behind the current legal version', async () => {
    await service.notifyPendingUsers();

    expect(mockUserRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it('should notify each pending user in-app, by email, and mark them as up to date', async () => {
    mockUserRepository.find.mockResolvedValue([
      { id: 1, email: 'a@example.com', lastNotifiedLegalVersion: 0 },
      { id: 2, email: 'b@example.com', lastNotifiedLegalVersion: 0 },
    ]);

    await service.notifyPendingUsers();

    expect(mockNotificationsService.create).toHaveBeenCalledTimes(2);
    expect(mockNotificationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        type: NotificationType.LEGAL_DOCUMENT_UPDATED,
      }),
    );
    expect(mockMailService.legalDocumentUpdated).toHaveBeenCalledTimes(2);
    expect(mockMailService.legalDocumentUpdated).toHaveBeenCalledWith({
      to: 'a@example.com',
      data: {},
    });
    expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
      lastNotifiedLegalVersion: CURRENT_LEGAL_DOCUMENTS_VERSION,
    });
    expect(mockUserRepository.update).toHaveBeenCalledWith(2, {
      lastNotifiedLegalVersion: CURRENT_LEGAL_DOCUMENTS_VERSION,
    });
  });

  it('should skip sending email when the user has no email, but still mark as notified', async () => {
    mockUserRepository.find.mockResolvedValue([
      { id: 3, email: null, lastNotifiedLegalVersion: 0 },
    ]);

    await service.notifyPendingUsers();

    expect(mockNotificationsService.create).toHaveBeenCalledTimes(1);
    expect(mockMailService.legalDocumentUpdated).not.toHaveBeenCalled();
    expect(mockUserRepository.update).toHaveBeenCalledWith(3, {
      lastNotifiedLegalVersion: CURRENT_LEGAL_DOCUMENTS_VERSION,
    });
  });

  it('should continue processing remaining users when one fails', async () => {
    mockUserRepository.find.mockResolvedValue([
      { id: 1, email: 'a@example.com', lastNotifiedLegalVersion: 0 },
      { id: 2, email: 'b@example.com', lastNotifiedLegalVersion: 0 },
    ]);
    (mockNotificationsService.create as jest.Mock).mockRejectedValueOnce(
      new Error('boom'),
    );

    await service.notifyPendingUsers();

    expect(mockNotificationsService.create).toHaveBeenCalledTimes(2);
    expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.update).toHaveBeenCalledWith(2, {
      lastNotifiedLegalVersion: CURRENT_LEGAL_DOCUMENTS_VERSION,
    });
  });
});
