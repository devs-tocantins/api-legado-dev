import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionRepository } from './infrastructure/persistence/submission.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Submission } from './domain/submission';
import { SubmissionStatus } from './domain/submission-status.enum';

@Injectable()
export class SubmissionsService {
  constructor(
    // Dependencies here
    private readonly submissionRepository: SubmissionRepository,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.submissionRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      profileId: createSubmissionDto.profileId,
      activityId: createSubmissionDto.activityId,
      proofUrl: createSubmissionDto.proofUrl ?? null,
      status: SubmissionStatus.PENDING,
      feedback: null,
      awardedXp: 0,
      reviewerId: null,
      reviewedAt: null,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.submissionRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Submission['id']) {
    return this.submissionRepository.findById(id);
  }

  findByIds(ids: Submission['id'][]) {
    return this.submissionRepository.findByIds(ids);
  }

  async update(id: Submission['id'], updateSubmissionDto: UpdateSubmissionDto) {
    // Do not remove comment below.
    // <updating-property />

    return this.submissionRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      ...(updateSubmissionDto.proofUrl !== undefined && {
        proofUrl: updateSubmissionDto.proofUrl,
      }),
    });
  }

  remove(id: Submission['id']) {
    return this.submissionRepository.remove(id);
  }
}
