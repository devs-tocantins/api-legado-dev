import {
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ProjectIdea } from './domain/project-idea';
import { ProjectIdeaStatus } from './domain/project-idea-status.enum';
import { ProjectIdeasService } from './project-ideas.service';

const AUTHOR = 1;

function makeIdea(overrides: Partial<ProjectIdea> = {}): ProjectIdea {
  return {
    id: 'idea-1',
    title: 'Gestão de doadores',
    description: 'desc',
    tags: [],
    status: ProjectIdeaStatus.APPROVED,
    authorId: AUTHOR,
    featuredAt: null,
    calledAt: null,
    ...overrides,
  } as ProjectIdea;
}

function setup(idea: ProjectIdea, interestedIds: number[]) {
  const ideaRepository = {
    findById: jest.fn().mockResolvedValue(idea),
    findInterests: jest
      .fn()
      .mockResolvedValue(interestedIds.map((userId) => ({ userId }))),
    findUserInterests: jest.fn().mockResolvedValue([]),
    findGroupLink: jest.fn().mockResolvedValue('https://chat.example/abc'),
    clearFeatured: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockImplementation((_id, payload) => ({
      ...idea,
      ...payload,
    })),
  };
  const notificationsService = {
    create: jest.fn().mockResolvedValue(undefined),
  };
  const rewardsService = { grant: jest.fn().mockResolvedValue(undefined) };
  const service = new ProjectIdeasService(
    ideaRepository as never,
    notificationsService as never,
    rewardsService as never,
  );
  return { service, ideaRepository, notificationsService, rewardsService };
}

describe('ProjectIdeasService - projeto da vez e chamada', () => {
  describe('feature', () => {
    it('should desmarcar os outros, marcar este e avisar os interessados', async () => {
      const { service, ideaRepository, notificationsService } = setup(
        makeIdea(),
        [AUTHOR, 2, 3],
      );

      await service.feature('idea-1', true);

      expect(ideaRepository.clearFeatured).toHaveBeenCalled();
      expect(ideaRepository.update).toHaveBeenCalledWith('idea-1', {
        featuredAt: expect.any(Date),
      });
      // autor não é avisado do próprio projeto
      expect(notificationsService.create).toHaveBeenCalledTimes(2);
    });

    it('should não repetir nada se já é o projeto da vez', async () => {
      const { service, ideaRepository } = setup(
        makeIdea({ featuredAt: new Date() }),
        [2],
      );

      await service.feature('idea-1', true);

      expect(ideaRepository.clearFeatured).not.toHaveBeenCalled();
      expect(ideaRepository.update).not.toHaveBeenCalled();
    });

    it('should remover o destaque', async () => {
      const { service, ideaRepository } = setup(
        makeIdea({ featuredAt: new Date() }),
        [2],
      );

      await service.feature('idea-1', false);

      expect(ideaRepository.update).toHaveBeenCalledWith('idea-1', {
        featuredAt: null,
      });
    });
  });

  describe('callInterested', () => {
    const dto = { groupLink: 'https://chat.whatsapp.com/abc' };

    it('should chamar os interessados e dar XP na primeira chamada', async () => {
      const { service, notificationsService, rewardsService } = setup(
        makeIdea(),
        [2, 2, 3],
      );

      const result = await service.callInterested('idea-1', dto, AUTHOR, false);

      expect(result.notified).toBe(2);
      expect(notificationsService.create).toHaveBeenCalledTimes(2);
      const rewards = rewardsService.grant.mock.calls[0][0];
      expect(rewards.map((r: { userId: number }) => r.userId)).toEqual([
        AUTHOR,
        2,
        3,
      ]);
    });

    it('should não dar XP de novo em chamadas seguintes', async () => {
      const { service, rewardsService } = setup(
        makeIdea({ calledAt: new Date() }),
        [2],
      );

      await service.callInterested('idea-1', dto, AUTHOR, false);

      expect(rewardsService.grant).not.toHaveBeenCalled();
    });

    it('should recusar quem não propôs o projeto', async () => {
      const { service } = setup(makeIdea(), [2]);

      await expect(
        service.callInterested('idea-1', dto, 99, false),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should recusar quando não há interessados', async () => {
      const { service } = setup(makeIdea(), [AUTHOR]);

      await expect(
        service.callInterested('idea-1', dto, AUTHOR, false),
      ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });

  describe('getGroup', () => {
    it('should negar o link a quem não tem interesse', async () => {
      const { service } = setup(makeIdea({ calledAt: new Date() }), [2]);

      await expect(
        service.getGroup('idea-1', 99, false),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should entregar o link à pessoa que propôs', async () => {
      const { service } = setup(makeIdea({ calledAt: new Date() }), [2]);

      const result = await service.getGroup('idea-1', AUTHOR, false);

      expect(result.groupLink).toBe('https://chat.example/abc');
    });

    it('should não entregar link antes da chamada', async () => {
      const { service } = setup(makeIdea(), [2]);

      const result = await service.getGroup('idea-1', AUTHOR, false);

      expect(result.groupLink).toBeNull();
    });
  });
});
