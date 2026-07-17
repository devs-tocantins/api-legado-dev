import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TrackItemEntity } from '../entities/track-item.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TrackItem } from '../../../../domain/track-item';
import { TrackItemRepository } from '../../track-item.repository';
import { TrackItemMapper } from '../mappers/track-item.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class TrackItemRelationalRepository implements TrackItemRepository {
  constructor(
    @InjectRepository(TrackItemEntity)
    private readonly trackItemRepository: Repository<TrackItemEntity>,
  ) {}

  async create(data: TrackItem): Promise<TrackItem> {
    const persistenceModel = TrackItemMapper.toPersistence(data);
    const newEntity = await this.trackItemRepository.save(
      this.trackItemRepository.create(persistenceModel),
    );
    return TrackItemMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<TrackItem[]> {
    const entities = await this.trackItemRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => TrackItemMapper.toDomain(entity));
  }

  async findById(id: TrackItem['id']): Promise<NullableType<TrackItem>> {
    const entity = await this.trackItemRepository.findOne({
      where: { id },
    });

    return entity ? TrackItemMapper.toDomain(entity) : null;
  }

  async findByIds(ids: TrackItem['id'][]): Promise<TrackItem[]> {
    const entities = await this.trackItemRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => TrackItemMapper.toDomain(entity));
  }

  async findBySectionId(
    sectionId: TrackItem['sectionId'],
  ): Promise<TrackItem[]> {
    const entities = await this.trackItemRepository.find({
      where: { sectionId },
      order: { position: 'ASC' },
    });

    return entities.map((entity) => TrackItemMapper.toDomain(entity));
  }

  async findByTrackId(trackId: TrackItem['trackId']): Promise<TrackItem[]> {
    const entities = await this.trackItemRepository.find({
      where: { trackId },
      order: { position: 'ASC' },
    });

    return entities.map((entity) => TrackItemMapper.toDomain(entity));
  }

  async findByCourseId(
    courseId: NonNullable<TrackItem['courseId']>,
  ): Promise<TrackItem[]> {
    const entities = await this.trackItemRepository.find({
      where: { courseId },
    });

    return entities.map((entity) => TrackItemMapper.toDomain(entity));
  }

  async update(
    id: TrackItem['id'],
    payload: Partial<TrackItem>,
  ): Promise<TrackItem> {
    const entity = await this.trackItemRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.trackItemRepository.save(
      this.trackItemRepository.create(
        TrackItemMapper.toPersistence({
          ...TrackItemMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return TrackItemMapper.toDomain(updatedEntity);
  }

  async remove(id: TrackItem['id']): Promise<void> {
    await this.trackItemRepository.delete(id);
  }
}
