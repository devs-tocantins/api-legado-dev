import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CourseEntity } from '../entities/course.entity';
import { TrackItemCourseEntity } from '../entities/track-item-course.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Course } from '../../../../domain/course';
import { CourseRepository } from '../../course.repository';
import { CourseMapper } from '../mappers/course.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { CourseStatus } from '../../../../domain/course-status.enum';

@Injectable()
export class CourseRelationalRepository implements CourseRepository {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(TrackItemCourseEntity)
    private readonly trackItemCourseRepository: Repository<TrackItemCourseEntity>,
  ) {}

  async create(data: Course): Promise<Course> {
    const persistenceModel = CourseMapper.toPersistence(data);
    const newEntity = await this.courseRepository.save(
      this.courseRepository.create(persistenceModel),
    );
    return CourseMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Course[]> {
    const entities = await this.courseRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => CourseMapper.toDomain(entity));
  }

  async findByStatusWithPagination({
    status,
    trackItemId,
    paginationOptions,
  }: {
    status: CourseStatus;
    trackItemId?: string;
    paginationOptions: IPaginationOptions;
  }): Promise<Course[]> {
    const qb = this.courseRepository
      .createQueryBuilder('course')
      .where('course.status = :status', { status })
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .orderBy('course.createdAt', 'DESC');

    if (trackItemId) {
      qb.innerJoin(
        'track_item_course',
        'tic',
        'tic."courseId" = course.id AND tic."trackItemId" = :trackItemId',
        { trackItemId },
      );
    }

    const entities = await qb.getMany();

    return entities.map((entity) => CourseMapper.toDomain(entity));
  }

  async findById(id: Course['id']): Promise<NullableType<Course>> {
    const entity = await this.courseRepository.findOne({
      where: { id },
    });

    return entity ? CourseMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Course['id'][]): Promise<Course[]> {
    const entities = await this.courseRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => CourseMapper.toDomain(entity));
  }

  async update(id: Course['id'], payload: Partial<Course>): Promise<Course> {
    const entity = await this.courseRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.courseRepository.save(
      this.courseRepository.create(
        CourseMapper.toPersistence({
          ...CourseMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return CourseMapper.toDomain(updatedEntity);
  }

  async remove(id: Course['id']): Promise<void> {
    await this.courseRepository.delete(id);
  }

  async linkToTrackItem(data: {
    trackItemId: string;
    courseId: string;
    submittedByProfileId: string | null;
  }): Promise<void> {
    const existing = await this.trackItemCourseRepository.findOne({
      where: { trackItemId: data.trackItemId, courseId: data.courseId },
    });
    if (existing) return;

    await this.trackItemCourseRepository.save(
      this.trackItemCourseRepository.create({
        trackItemId: data.trackItemId,
        courseId: data.courseId,
        submittedByProfileId: data.submittedByProfileId,
      }),
    );
  }
}
