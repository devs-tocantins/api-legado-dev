import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ActivityEntity } from '../entities/activity.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Activity } from '../../../../domain/activity';
import { ActivityRepository } from '../../activity.repository';
import { ActivityMapper } from '../mappers/activity.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class ActivityRelationalRepository implements ActivityRepository {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
  ) {}

  async create(data: Activity): Promise<Activity> {
    const persistenceModel = ActivityMapper.toPersistence(data);
    const newEntity = await this.activityRepository.save(
      this.activityRepository.create(persistenceModel),
    );
    return ActivityMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Activity[]> {
    const entities = await this.activityRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => ActivityMapper.toDomain(entity));
  }

  async findById(id: Activity['id']): Promise<NullableType<Activity>> {
    const entity = await this.activityRepository.findOne({
      where: { id },
    });

    return entity ? ActivityMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Activity['id'][]): Promise<Activity[]> {
    const entities = await this.activityRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => ActivityMapper.toDomain(entity));
  }

  async update(
    id: Activity['id'],
    payload: Partial<Activity>,
  ): Promise<Activity> {
    const entity = await this.activityRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.activityRepository.save(
      this.activityRepository.create(
        ActivityMapper.toPersistence({
          ...ActivityMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return ActivityMapper.toDomain(updatedEntity);
  }

  async remove(id: Activity['id']): Promise<void> {
    await this.activityRepository.delete(id);
  }

  async findPublicWithPagination({
    paginationOptions,
    search,
    view,
  }: {
    paginationOptions: IPaginationOptions;
    search?: string;
    view?: 'card' | 'list';
  }): Promise<Activity[]> {
    const query = this.activityRepository.createQueryBuilder('activity');

    query.andWhere('activity.isHidden = :isHidden', { isHidden: false });

    if (search) {
      query.andWhere(
        '(activity.title ILIKE :search OR activity.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query.skip((paginationOptions.page - 1) * paginationOptions.limit);
    query.take(paginationOptions.limit);
    query.orderBy('activity.createdAt', 'DESC');

    const entities = await query.getMany();
    const mapped = entities.map((entity) => ActivityMapper.toDomain(entity));

    if (view === 'card') {
      return mapped.map(
        (a) =>
          ({
            id: a.id,
            title: a.title,
            fixedReward: a.fixedReward,
            createdAt: a.createdAt,
          }) as Activity,
      );
    }
    return mapped;
  }

  async findBySecretCode(
    secretCode: Activity['secretCode'],
  ): Promise<NullableType<Activity>> {
    if (!secretCode) return null;

    const entity = await this.activityRepository.findOne({
      where: { secretCode, isHidden: true },
    });

    return entity ? ActivityMapper.toDomain(entity) : null;
  }
}
