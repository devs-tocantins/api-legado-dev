import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TrackEnrollmentEntity } from '../entities/track-enrollment.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TrackEnrollment } from '../../../../domain/track-enrollment';
import { TrackEnrollmentRepository } from '../../track-enrollment.repository';
import { TrackEnrollmentMapper } from '../mappers/track-enrollment.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class TrackEnrollmentRelationalRepository
  implements TrackEnrollmentRepository
{
  constructor(
    @InjectRepository(TrackEnrollmentEntity)
    private readonly trackEnrollmentRepository: Repository<TrackEnrollmentEntity>,
  ) {}

  async create(data: TrackEnrollment): Promise<TrackEnrollment> {
    const persistenceModel = TrackEnrollmentMapper.toPersistence(data);
    const newEntity = await this.trackEnrollmentRepository.save(
      this.trackEnrollmentRepository.create(persistenceModel),
    );
    return TrackEnrollmentMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<TrackEnrollment[]> {
    const entities = await this.trackEnrollmentRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => TrackEnrollmentMapper.toDomain(entity));
  }

  async findById(
    id: TrackEnrollment['id'],
  ): Promise<NullableType<TrackEnrollment>> {
    const entity = await this.trackEnrollmentRepository.findOne({
      where: { id },
    });

    return entity ? TrackEnrollmentMapper.toDomain(entity) : null;
  }

  async findByIds(ids: TrackEnrollment['id'][]): Promise<TrackEnrollment[]> {
    const entities = await this.trackEnrollmentRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => TrackEnrollmentMapper.toDomain(entity));
  }

  async findByTrackAndProfile(
    trackId: TrackEnrollment['trackId'],
    profileId: TrackEnrollment['profileId'],
  ): Promise<NullableType<TrackEnrollment>> {
    const entity = await this.trackEnrollmentRepository.findOne({
      where: { trackId, profileId },
    });

    return entity ? TrackEnrollmentMapper.toDomain(entity) : null;
  }

  async update(
    id: TrackEnrollment['id'],
    payload: Partial<TrackEnrollment>,
  ): Promise<TrackEnrollment> {
    const entity = await this.trackEnrollmentRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.trackEnrollmentRepository.save(
      this.trackEnrollmentRepository.create(
        TrackEnrollmentMapper.toPersistence({
          ...TrackEnrollmentMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return TrackEnrollmentMapper.toDomain(updatedEntity);
  }

  async remove(id: TrackEnrollment['id']): Promise<void> {
    await this.trackEnrollmentRepository.delete(id);
  }
}
