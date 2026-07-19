import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ReviewCourseDto } from './dto/review-course.dto';
import { CourseRepository } from './infrastructure/persistence/course.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Course } from './domain/course';
import { CourseStatus } from './domain/course-status.enum';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly gamificationProfilesService: GamificationProfilesService,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const course = await this.courseRepository.create({
      title: createCourseDto.title,
      provider: createCourseDto.provider ?? null,
      url: createCourseDto.url,
      isFree: createCourseDto.isFree,
      price: createCourseDto.price ?? null,
      language: createCourseDto.language ?? null,
      submittedByProfileId: createCourseDto.submittedByProfileId ?? null,
      status: CourseStatus.PENDING,
    });

    if (createCourseDto.trackItemId) {
      await this.courseRepository.linkToTrackItem({
        trackItemId: createCourseDto.trackItemId,
        courseId: course.id,
        submittedByProfileId: createCourseDto.submittedByProfileId ?? null,
      });
    }

    return course;
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.courseRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findVerifiedWithPagination({
    trackItemId,
    paginationOptions,
  }: {
    trackItemId?: string;
    paginationOptions: IPaginationOptions;
  }) {
    return this.courseRepository.findByStatusWithPagination({
      status: CourseStatus.VERIFIED,
      trackItemId,
      paginationOptions,
    });
  }

  findPendingWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.courseRepository.findByStatusWithPagination({
      status: CourseStatus.PENDING,
      paginationOptions,
    });
  }

  async review(
    id: Course['id'],
    reviewCourseDto: ReviewCourseDto,
    reviewerUserId: number,
  ) {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException('Curso não encontrado.');
    }

    const reviewerProfile =
      await this.gamificationProfilesService.findByUserId(reviewerUserId);
    if (
      reviewerProfile &&
      course.submittedByProfileId &&
      reviewerProfile.id === course.submittedByProfileId
    ) {
      throw new ForbiddenException(
        'Você não pode revisar um curso que você mesmo sugeriu.',
      );
    }

    return this.courseRepository.update(id, {
      status: reviewCourseDto.status,
    });
  }

  findById(id: Course['id']) {
    return this.courseRepository.findById(id);
  }

  findByIds(ids: Course['id'][]) {
    return this.courseRepository.findByIds(ids);
  }

  update(id: Course['id'], updateCourseDto: UpdateCourseDto) {
    return this.courseRepository.update(id, {
      ...(updateCourseDto.title !== undefined && {
        title: updateCourseDto.title,
      }),
      ...(updateCourseDto.provider !== undefined && {
        provider: updateCourseDto.provider,
      }),
      ...(updateCourseDto.url !== undefined && { url: updateCourseDto.url }),
      ...(updateCourseDto.isFree !== undefined && {
        isFree: updateCourseDto.isFree,
      }),
      ...(updateCourseDto.price !== undefined && {
        price: updateCourseDto.price,
      }),
      ...(updateCourseDto.language !== undefined && {
        language: updateCourseDto.language,
      }),
    });
  }

  remove(id: Course['id']) {
    return this.courseRepository.remove(id);
  }
}
