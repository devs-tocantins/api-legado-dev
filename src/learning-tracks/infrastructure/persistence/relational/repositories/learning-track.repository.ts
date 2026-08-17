import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LearningTrackEntity } from '../entities/learning-track.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { LearningTrack } from '../../../../domain/learning-track';
import { LearningTrackRepository } from '../../learning-track.repository';
import { LearningTrackMapper } from '../mappers/learning-track.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class LearningTrackRelationalRepository
  implements LearningTrackRepository
{
  constructor(
    @InjectRepository(LearningTrackEntity)
    private readonly learningTrackRepository: Repository<LearningTrackEntity>,
  ) {}

  async create(data: LearningTrack): Promise<LearningTrack> {
    const persistenceModel = LearningTrackMapper.toPersistence(data);
    const newEntity = await this.learningTrackRepository.save(
      this.learningTrackRepository.create(persistenceModel),
    );
    return LearningTrackMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<LearningTrack[]> {
    const entities = await this.learningTrackRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => LearningTrackMapper.toDomain(entity));
  }

  async findById(
    id: LearningTrack['id'],
  ): Promise<NullableType<LearningTrack>> {
    const entity = await this.learningTrackRepository.findOne({
      where: { id },
    });

    return entity ? LearningTrackMapper.toDomain(entity) : null;
  }

  async findByIds(ids: LearningTrack['id'][]): Promise<LearningTrack[]> {
    const entities = await this.learningTrackRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => LearningTrackMapper.toDomain(entity));
  }

  async findBySlug(
    slug: LearningTrack['slug'],
  ): Promise<NullableType<LearningTrack>> {
    const entity = await this.learningTrackRepository.findOne({
      where: { slug },
    });

    return entity ? LearningTrackMapper.toDomain(entity) : null;
  }

  async update(
    id: LearningTrack['id'],
    payload: Partial<LearningTrack>,
  ): Promise<LearningTrack> {
    const entity = await this.learningTrackRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.learningTrackRepository.save(
      this.learningTrackRepository.create(
        LearningTrackMapper.toPersistence({
          ...LearningTrackMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return LearningTrackMapper.toDomain(updatedEntity);
  }

  async remove(id: LearningTrack['id']): Promise<void> {
    await this.learningTrackRepository.delete(id);
  }
}
