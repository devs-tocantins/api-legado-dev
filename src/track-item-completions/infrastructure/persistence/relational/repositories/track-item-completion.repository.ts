import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TrackItemCompletionEntity } from '../entities/track-item-completion.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TrackItemCompletion } from '../../../../domain/track-item-completion';
import { TrackItemCompletionRepository } from '../../track-item-completion.repository';
import { TrackItemCompletionMapper } from '../mappers/track-item-completion.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class TrackItemCompletionRelationalRepository
  implements TrackItemCompletionRepository
{
  constructor(
    @InjectRepository(TrackItemCompletionEntity)
    private readonly trackItemCompletionRepository: Repository<TrackItemCompletionEntity>,
  ) {}

  async create(data: TrackItemCompletion): Promise<TrackItemCompletion> {
    const persistenceModel = TrackItemCompletionMapper.toPersistence(data);
    const newEntity = await this.trackItemCompletionRepository.save(
      this.trackItemCompletionRepository.create(persistenceModel),
    );
    return TrackItemCompletionMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<TrackItemCompletion[]> {
    const entities = await this.trackItemCompletionRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => TrackItemCompletionMapper.toDomain(entity));
  }

  async findById(
    id: TrackItemCompletion['id'],
  ): Promise<NullableType<TrackItemCompletion>> {
    const entity = await this.trackItemCompletionRepository.findOne({
      where: { id },
    });

    return entity ? TrackItemCompletionMapper.toDomain(entity) : null;
  }

  async findByIds(
    ids: TrackItemCompletion['id'][],
  ): Promise<TrackItemCompletion[]> {
    const entities = await this.trackItemCompletionRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => TrackItemCompletionMapper.toDomain(entity));
  }

  async findByProfileId(
    profileId: TrackItemCompletion['profileId'],
  ): Promise<TrackItemCompletion[]> {
    const entities = await this.trackItemCompletionRepository.find({
      where: { profileId },
    });

    return entities.map((entity) => TrackItemCompletionMapper.toDomain(entity));
  }

  async findByItemAndProfile(
    itemId: TrackItemCompletion['itemId'],
    profileId: TrackItemCompletion['profileId'],
  ): Promise<NullableType<TrackItemCompletion>> {
    const entity = await this.trackItemCompletionRepository.findOne({
      where: { itemId, profileId },
    });

    return entity ? TrackItemCompletionMapper.toDomain(entity) : null;
  }

  async update(
    id: TrackItemCompletion['id'],
    payload: Partial<TrackItemCompletion>,
  ): Promise<TrackItemCompletion> {
    const entity = await this.trackItemCompletionRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.trackItemCompletionRepository.save(
      this.trackItemCompletionRepository.create(
        TrackItemCompletionMapper.toPersistence({
          ...TrackItemCompletionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return TrackItemCompletionMapper.toDomain(updatedEntity);
  }

  async remove(id: TrackItemCompletion['id']): Promise<void> {
    await this.trackItemCompletionRepository.delete(id);
  }
}
