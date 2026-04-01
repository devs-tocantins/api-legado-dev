import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual } from 'typeorm';
import { SubmissionEntity } from '../entities/submission.entity';
import { SubmissionStatus } from '../../../../domain/submission-status.enum';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Submission } from '../../../../domain/submission';
import { SubmissionRepository } from '../../submission.repository';
import { SubmissionMapper } from '../mappers/submission.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class SubmissionRelationalRepository implements SubmissionRepository {
  constructor(
    @InjectRepository(SubmissionEntity)
    private readonly submissionRepository: Repository<SubmissionEntity>,
  ) {}

  async create(data: Submission): Promise<Submission> {
    const persistenceModel = SubmissionMapper.toPersistence(data);
    const newEntity = await this.submissionRepository.save(
      this.submissionRepository.create(persistenceModel),
    );
    return SubmissionMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Submission[]> {
    const entities = await this.submissionRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => SubmissionMapper.toDomain(entity));
  }

  async findById(id: Submission['id']): Promise<NullableType<Submission>> {
    const entity = await this.submissionRepository.findOne({
      where: { id },
    });

    return entity ? SubmissionMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Submission['id'][]): Promise<Submission[]> {
    const entities = await this.submissionRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => SubmissionMapper.toDomain(entity));
  }

  async update(
    id: Submission['id'],
    payload: Partial<Submission>,
  ): Promise<Submission> {
    const entity = await this.submissionRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.submissionRepository.save(
      this.submissionRepository.create(
        SubmissionMapper.toPersistence({
          ...SubmissionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return SubmissionMapper.toDomain(updatedEntity);
  }

  async remove(id: Submission['id']): Promise<void> {
    await this.submissionRepository.delete(id);
  }

  async findByProfileId(
    profileId: Submission['profileId'],
    paginationOptions: IPaginationOptions,
  ): Promise<Submission[]> {
    const entities = await this.submissionRepository.find({
      where: { profileId },
      order: { createdAt: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => SubmissionMapper.toDomain(entity));
  }

  async findApprovedByProfileId(
    profileId: Submission['profileId'],
    paginationOptions: IPaginationOptions,
  ): Promise<Submission[]> {
    const entities = await this.submissionRepository.find({
      where: { profileId, status: SubmissionStatus.APPROVED },
      order: { createdAt: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => SubmissionMapper.toDomain(entity));
  }

  async findPending(
    paginationOptions: IPaginationOptions,
  ): Promise<Submission[]> {
    const entities = await this.submissionRepository.find({
      where: { status: SubmissionStatus.PENDING },
      order: { createdAt: 'ASC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => SubmissionMapper.toDomain(entity));
  }

  async findRecentByProfileAndActivity(
    profileId: Submission['profileId'],
    activityId: Submission['activityId'],
    since: Date,
  ): Promise<Submission[]> {
    const entities = await this.submissionRepository.find({
      where: {
        profileId,
        activityId,
        createdAt: MoreThanOrEqual(since),
      },
    });

    return entities.map((entity) => SubmissionMapper.toDomain(entity));
  }
}
