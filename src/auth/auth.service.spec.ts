import { UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SessionService } from '../session/session.service';
import { MailService } from '../mail/mail.service';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { FilesService } from '../files/files.service';
import { AuthProvidersEnum } from './auth-providers.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { User } from '../users/domain/user';

const buildUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    email: 'user@example.com',
    password: 'hashed-password',
    provider: AuthProvidersEnum.email,
    role: { id: 2 },
    status: { id: StatusEnum.active },
    ...overrides,
  }) as User;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let sessionService: Partial<Record<keyof SessionService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;
  let configService: Partial<Record<keyof ConfigService, jest.Mock>>;
  let mailService: Partial<Record<keyof MailService, jest.Mock>>;
  let gamificationProfilesService: Partial<
    Record<keyof GamificationProfilesService, jest.Mock>
  >;
  let filesService: Partial<Record<keyof FilesService, jest.Mock>>;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
    };
    sessionService = {
      create: jest.fn().mockResolvedValue({ id: 'session-id' }),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
    };
    configService = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'auth.expires') return '15m';
        if (key === 'auth.refreshExpires') return '7d';
        return 'secret';
      }),
    };
    mailService = {};
    gamificationProfilesService = {
      findByUserId: jest.fn().mockResolvedValue({ id: 'profile-1' }),
      create: jest.fn().mockResolvedValue({ id: 'profile-1' }),
    };
    filesService = {
      remove: jest.fn(),
    };

    service = new AuthService(
      jwtService as unknown as JwtService,
      usersService as unknown as UsersService,
      sessionService as unknown as SessionService,
      mailService as unknown as MailService,
      configService as unknown as ConfigService,
      gamificationProfilesService as unknown as GamificationProfilesService,
      filesService as unknown as FilesService,
    );

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
  });

  describe('validateLogin', () => {
    it('should throw notFound when the email does not exist', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(
        service.validateLogin({ email: 'missing@example.com', password: 'x' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw incorrectPassword when the password is wrong', async () => {
      usersService.findByEmail!.mockResolvedValue(buildUser());
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.validateLogin({ email: 'user@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should reject login for a user with inactive status (email not confirmed)', async () => {
      usersService.findByEmail!.mockResolvedValue(
        buildUser({ status: { id: StatusEnum.inactive } }),
      );

      await expect(
        service.validateLogin({
          email: 'user@example.com',
          password: 'correct',
        }),
      ).rejects.toMatchObject({
        response: { errors: { user: 'inactive' } },
      });
    });

    it('should allow login for a user with active status', async () => {
      usersService.findByEmail!.mockResolvedValue(
        buildUser({ status: { id: StatusEnum.active } }),
      );

      const result = await service.validateLogin({
        email: 'user@example.com',
        password: 'correct',
      });

      expect(result.token).toBe('signed-token');
      expect(sessionService.create).toHaveBeenCalled();
    });

    it('should create a gamification profile on email login when the user does not have one yet', async () => {
      usersService.findByEmail!.mockResolvedValue(
        buildUser({
          id: 42,
          firstName: 'Jane',
          lastName: 'Doe',
          status: { id: StatusEnum.active },
        }),
      );
      gamificationProfilesService.findByUserId!.mockResolvedValue(null);

      await service.validateLogin({
        email: 'user@example.com',
        password: 'correct',
      });

      expect(gamificationProfilesService.findByUserId).toHaveBeenCalledWith(42);
      expect(gamificationProfilesService.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 42 }),
      );
    });

    it('should not create a gamification profile on email login when one already exists', async () => {
      usersService.findByEmail!.mockResolvedValue(
        buildUser({ status: { id: StatusEnum.active } }),
      );

      await service.validateLogin({
        email: 'user@example.com',
        password: 'correct',
      });

      expect(gamificationProfilesService.create).not.toHaveBeenCalled();
    });
  });
});
