import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateGamificationProfileDto } from './dto/create-gamification-profile.dto';
import { UpdateGamificationProfileDto } from './dto/update-gamification-profile.dto';
import { GamificationProfileRepository } from './infrastructure/persistence/gamification-profile.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { GamificationProfile } from './domain/gamification-profile';

@Injectable()
export class GamificationProfilesService {
  constructor(
    private readonly gamificationProfileRepository: GamificationProfileRepository,
  ) {}

  async create(createGamificationProfileDto: CreateGamificationProfileDto) {
    return this.gamificationProfileRepository.create({
      userId: createGamificationProfileDto.userId,
      username: createGamificationProfileDto.username,
      totalXp: 0,
      currentMonthlyXp: 0,
      currentYearlyXp: 0,
      gratitudeTokens: 0,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.gamificationProfileRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: GamificationProfile['id']) {
    return this.gamificationProfileRepository.findById(id);
  }

  findByIds(ids: GamificationProfile['id'][]) {
    return this.gamificationProfileRepository.findByIds(ids);
  }

  async update(
    id: GamificationProfile['id'],
    updateGamificationProfileDto: UpdateGamificationProfileDto,
  ) {
    return this.gamificationProfileRepository.update(id, {
      ...(updateGamificationProfileDto.username && {
        username: updateGamificationProfileDto.username,
      }),
    });
  }

  remove(id: GamificationProfile['id']) {
    return this.gamificationProfileRepository.remove(id);
  }
}
