import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackSuggestionEntity } from '../entities/track-suggestion.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TrackSuggestion } from '../../../../domain/track-suggestion';
import { TrackSuggestionStatusEnum } from '../../../../domain/track-suggestion-status.enum';
import { TrackSuggestionRepository } from '../../track-suggestion.repository';
import { TrackSuggestionMapper } from '../mappers/track-suggestion.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class TrackSuggestionRelationalRepository
  implements TrackSuggestionRepository
{
  constructor(
    @InjectRepository(TrackSuggestionEntity)
    private readonly trackSuggestionRepository: Repository<TrackSuggestionEntity>,
  ) {}

  async create(data: TrackSuggestion): Promise<TrackSuggestion> {
    const persistenceModel = TrackSuggestionMapper.toPersistence(data);
    const newEntity = await this.trackSuggestionRepository.save(
      this.trackSuggestionRepository.create(persistenceModel),
    );
    return TrackSuggestionMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    status,
    paginationOptions,
  }: {
    status?: TrackSuggestionStatusEnum;
    paginationOptions: IPaginationOptions;
  }): Promise<TrackSuggestion[]> {
    const entities = await this.trackSuggestionRepository.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => TrackSuggestionMapper.toDomain(entity));
  }

  async findById(
    id: TrackSuggestion['id'],
  ): Promise<NullableType<TrackSuggestion>> {
    const entity = await this.trackSuggestionRepository.findOne({
      where: { id },
    });

    return entity ? TrackSuggestionMapper.toDomain(entity) : null;
  }

  async update(
    id: TrackSuggestion['id'],
    payload: Partial<TrackSuggestion>,
  ): Promise<TrackSuggestion> {
    const entity = await this.trackSuggestionRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.trackSuggestionRepository.save(
      this.trackSuggestionRepository.create(
        TrackSuggestionMapper.toPersistence({
          ...TrackSuggestionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return TrackSuggestionMapper.toDomain(updatedEntity);
  }
}
