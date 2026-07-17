import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseRepository } from './infrastructure/persistence/course.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Course } from './domain/course';
import { CourseStatus } from './domain/course-status.enum';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

  create(createCourseDto: CreateCourseDto) {
    return this.courseRepository.create({
      title: createCourseDto.title,
      provider: createCourseDto.provider ?? null,
      url: createCourseDto.url,
      isFree: createCourseDto.isFree,
      price: createCourseDto.price ?? null,
      language: createCourseDto.language ?? null,
      submittedByProfileId: createCourseDto.submittedByProfileId ?? null,
      status: CourseStatus.PENDING,
    });
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
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.courseRepository.findByStatusWithPagination({
      status: CourseStatus.VERIFIED,
      paginationOptions,
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
