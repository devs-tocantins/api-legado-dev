import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TrackSectionEntity } from '../entities/track-section.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TrackSection } from '../../../../domain/track-section';
import { TrackSectionRepository } from '../../track-section.repository';
import { TrackSectionMapper } from '../mappers/track-section.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class TrackSectionRelationalRepository
  implements TrackSectionRepository
{
  constructor(
    @InjectRepository(TrackSectionEntity)
    private readonly trackSectionRepository: Repository<TrackSectionEntity>,
  ) {}

  async create(data: TrackSection): Promise<TrackSection> {
    const persistenceModel = TrackSectionMapper.toPersistence(data);
    const newEntity = await this.trackSectionRepository.save(
      this.trackSectionRepository.create(persistenceModel),
    );
    return TrackSectionMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<TrackSection[]> {
    const entities = await this.trackSectionRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => TrackSectionMapper.toDomain(entity));
  }

  async findById(id: TrackSection['id']): Promise<NullableType<TrackSection>> {
    const entity = await this.trackSectionRepository.findOne({
      where: { id },
    });

    return entity ? TrackSectionMapper.toDomain(entity) : null;
  }

  async findByIds(ids: TrackSection['id'][]): Promise<TrackSection[]> {
    const entities = await this.trackSectionRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => TrackSectionMapper.toDomain(entity));
  }

  async findByTrackId(
    trackId: TrackSection['trackId'],
  ): Promise<TrackSection[]> {
    const entities = await this.trackSectionRepository.find({
      where: { trackId },
      order: { position: 'ASC' },
    });

    return entities.map((entity) => TrackSectionMapper.toDomain(entity));
  }

  async update(
    id: TrackSection['id'],
    payload: Partial<TrackSection>,
  ): Promise<TrackSection> {
    const entity = await this.trackSectionRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.trackSectionRepository.save(
      this.trackSectionRepository.create(
        TrackSectionMapper.toPersistence({
          ...TrackSectionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return TrackSectionMapper.toDomain(updatedEntity);
  }

  async remove(id: TrackSection['id']): Promise<void> {
    await this.trackSectionRepository.delete(id);
  }
}
