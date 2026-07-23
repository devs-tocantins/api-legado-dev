import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CourseReviewEntity } from '../entities/course-review.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { CourseReview } from '../../../../domain/course-review';
import { CourseReviewRepository } from '../../course-review.repository';
import { CourseReviewMapper } from '../mappers/course-review.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class CourseReviewRelationalRepository
  implements CourseReviewRepository
{
  constructor(
    @InjectRepository(CourseReviewEntity)
    private readonly courseReviewRepository: Repository<CourseReviewEntity>,
  ) {}

  async create(data: CourseReview): Promise<CourseReview> {
    const persistenceModel = CourseReviewMapper.toPersistence(data);
    const newEntity = await this.courseReviewRepository.save(
      this.courseReviewRepository.create(persistenceModel),
    );
    return CourseReviewMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<CourseReview[]> {
    const entities = await this.courseReviewRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => CourseReviewMapper.toDomain(entity));
  }

  async findById(id: CourseReview['id']): Promise<NullableType<CourseReview>> {
    const entity = await this.courseReviewRepository.findOne({
      where: { id },
    });

    return entity ? CourseReviewMapper.toDomain(entity) : null;
  }

  async findByIds(ids: CourseReview['id'][]): Promise<CourseReview[]> {
    const entities = await this.courseReviewRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => CourseReviewMapper.toDomain(entity));
  }

  async findByCourseId(
    courseId: CourseReview['courseId'],
  ): Promise<CourseReview[]> {
    const entities = await this.courseReviewRepository.find({
      where: { courseId },
      relations: ['profile', 'profile.user', 'profile.user.photo'],
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => CourseReviewMapper.toDomain(entity));
  }

  async findByCourseAndProfileId(
    courseId: string,
    profileId: string,
  ): Promise<NullableType<CourseReview>> {
    const entity = await this.courseReviewRepository.findOne({
      where: { courseId, profileId },
    });
    return entity ? CourseReviewMapper.toDomain(entity) : null;
  }

  async update(
    id: CourseReview['id'],
    payload: Partial<CourseReview>,
  ): Promise<CourseReview> {
    const entity = await this.courseReviewRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.courseReviewRepository.save(
      this.courseReviewRepository.create(
        CourseReviewMapper.toPersistence({
          ...CourseReviewMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return CourseReviewMapper.toDomain(updatedEntity);
  }

  async remove(id: CourseReview['id']): Promise<void> {
    await this.courseReviewRepository.delete(id);
  }
}
