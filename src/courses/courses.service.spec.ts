import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CourseRepository } from './infrastructure/persistence/course.repository';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { Course } from './domain/course';
import { CourseStatus } from './domain/course-status.enum';

const mockCourse: Course = {
  id: 'course-1',
  title: 'Curso X',
  provider: null,
  url: 'https://example.com',
  isFree: true,
  price: null,
  language: null,
  submittedByProfileId: 'profile-author',
  status: CourseStatus.PENDING,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockCourseRepository: Partial<Record<keyof CourseRepository, jest.Mock>> =
  {
    findById: jest.fn().mockResolvedValue(mockCourse),
    update: jest
      .fn()
      .mockImplementation((id, payload) =>
        Promise.resolve({ ...mockCourse, ...payload }),
      ),
    linkToTrackItem: jest.fn(),
  };

const mockGamificationProfilesService: Partial<
  Record<keyof GamificationProfilesService, jest.Mock>
> = {
  findByUserId: jest.fn(),
};

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: CourseRepository, useValue: mockCourseRepository },
        {
          provide: GamificationProfilesService,
          useValue: mockGamificationProfilesService,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);

    jest.clearAllMocks();
    mockCourseRepository.findById!.mockResolvedValue(mockCourse);
    mockCourseRepository.update!.mockImplementation((id, payload) =>
      Promise.resolve({ ...mockCourse, ...payload }),
    );
  });

  describe('review', () => {
    it('should throw NotFoundException when the course does not exist', async () => {
      mockCourseRepository.findById!.mockResolvedValue(null);

      await expect(
        service.review('missing', { status: CourseStatus.VERIFIED }, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when the reviewer submitted the course themself', async () => {
      mockGamificationProfilesService.findByUserId!.mockResolvedValue({
        id: 'profile-author',
      });

      await expect(
        service.review('course-1', { status: CourseStatus.VERIFIED }, 1),
      ).rejects.toThrow(ForbiddenException);
      expect(mockCourseRepository.update).not.toHaveBeenCalled();
    });

    it('should allow a different moderator to review the course', async () => {
      mockGamificationProfilesService.findByUserId!.mockResolvedValue({
        id: 'profile-moderator',
      });

      const result = await service.review(
        'course-1',
        { status: CourseStatus.VERIFIED },
        2,
      );

      expect(mockCourseRepository.update).toHaveBeenCalledWith('course-1', {
        status: CourseStatus.VERIFIED,
      });
      expect(result?.status).toBe(CourseStatus.VERIFIED);
    });

    it('should allow review when the reviewer has no gamification profile', async () => {
      mockGamificationProfilesService.findByUserId!.mockResolvedValue(null);

      await service.review('course-1', { status: CourseStatus.VERIFIED }, 3);

      expect(mockCourseRepository.update).toHaveBeenCalled();
    });
  });
});
