import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityRepository } from './infrastructure/persistence/activity.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Activity } from './domain/activity';

@Injectable()
export class ActivitiesService {
  constructor(
    // Dependencies here
    private readonly activityRepository: ActivityRepository,
  ) {}

  async create(createActivityDto: CreateActivityDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.activityRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      title: createActivityDto.title,
      description: createActivityDto.description,
      fixedReward: createActivityDto.fixedReward,
      isHidden: createActivityDto.isHidden ?? false,
      secretCode: createActivityDto.secretCode ?? null,
      requiresProof: createActivityDto.requiresProof ?? false,
      requiresDescription: createActivityDto.requiresDescription ?? false,
      cooldownHours: createActivityDto.cooldownHours ?? 0,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.activityRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Activity['id']) {
    return this.activityRepository.findById(id);
  }

  findByIds(ids: Activity['id'][]) {
    return this.activityRepository.findByIds(ids);
  }

  async update(id: Activity['id'], updateActivityDto: UpdateActivityDto) {
    // Do not remove comment below.
    // <updating-property />

    return this.activityRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      ...(updateActivityDto.title !== undefined && {
        title: updateActivityDto.title,
      }),
      ...(updateActivityDto.description !== undefined && {
        description: updateActivityDto.description,
      }),
      ...(updateActivityDto.fixedReward !== undefined && {
        fixedReward: updateActivityDto.fixedReward,
      }),
      ...(updateActivityDto.isHidden !== undefined && {
        isHidden: updateActivityDto.isHidden,
      }),
      ...(updateActivityDto.secretCode !== undefined && {
        secretCode: updateActivityDto.secretCode,
      }),
      ...(updateActivityDto.requiresProof !== undefined && {
        requiresProof: updateActivityDto.requiresProof,
      }),
      ...(updateActivityDto.cooldownHours !== undefined && {
        cooldownHours: updateActivityDto.cooldownHours,
      }),
    });
  }

  remove(id: Activity['id']) {
    return this.activityRepository.remove(id);
  }

  findPublicWithPagination({
    paginationOptions,
    search,
    view,
  }: {
    paginationOptions: IPaginationOptions;
    search?: string;
    view?: 'card' | 'list';
  }) {
    return this.activityRepository.findPublicWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      search,
      view,
    });
  }

  findBySecretCode(secretCode: Activity['secretCode']) {
    return this.activityRepository.findBySecretCode(secretCode);
  }
}
