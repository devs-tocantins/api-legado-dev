import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GamificationProfileEntity } from '../entities/gamification-profile.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { GamificationProfile } from '../../../../domain/gamification-profile';
import { GamificationProfileRepository } from '../../gamification-profile.repository';
import { GamificationProfileMapper } from '../mappers/gamification-profile.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class GamificationProfileRelationalRepository
  implements GamificationProfileRepository
{
  constructor(
    @InjectRepository(GamificationProfileEntity)
    private readonly gamificationProfileRepository: Repository<GamificationProfileEntity>,
  ) {}

  async create(data: GamificationProfile): Promise<GamificationProfile> {
    const persistenceModel = GamificationProfileMapper.toPersistence(data);
    const newEntity = await this.gamificationProfileRepository.save(
      this.gamificationProfileRepository.create(persistenceModel),
    );
    return GamificationProfileMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
    sort,
    search,
  }: {
    paginationOptions: IPaginationOptions;
    sort?: Array<{ orderBy: string; order: 'ASC' | 'DESC' }>;
    search?: string;
  }): Promise<GamificationProfile[]> {
    const qb = this.gamificationProfileRepository
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.user', 'u')
      .where('u.isBanned = false');

    if (search) {
      qb.andWhere('gp.username ILIKE :search', { search: `%${search}%` });
    }

    if (sort?.length) {
      for (const s of sort) {
        qb.addOrderBy(`gp.${s.orderBy}`, s.order);
      }
    } else {
      qb.orderBy('gp.totalXp', 'DESC');
    }

    qb.skip((paginationOptions.page - 1) * paginationOptions.limit).take(
      paginationOptions.limit,
    );

    const entities = await qb.getMany();
    return entities.map((entity) => GamificationProfileMapper.toDomain(entity));
  }

  async findById(
    id: GamificationProfile['id'],
  ): Promise<NullableType<GamificationProfile>> {
    const entity = await this.gamificationProfileRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    return entity ? GamificationProfileMapper.toDomain(entity) : null;
  }

  async findByIds(
    ids: GamificationProfile['id'][],
  ): Promise<GamificationProfile[]> {
    const entities = await this.gamificationProfileRepository.find({
      where: { id: In(ids) },
      relations: { user: true },
    });

    return entities.map((entity) => GamificationProfileMapper.toDomain(entity));
  }

  async update(
    id: GamificationProfile['id'],
    payload: Partial<GamificationProfile>,
  ): Promise<GamificationProfile> {
    const entity = await this.gamificationProfileRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.gamificationProfileRepository.save(
      this.gamificationProfileRepository.create(
        GamificationProfileMapper.toPersistence({
          ...GamificationProfileMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return GamificationProfileMapper.toDomain(updatedEntity);
  }

  async remove(id: GamificationProfile['id']): Promise<void> {
    await this.gamificationProfileRepository.delete(id);
  }

  async findByUserId(
    userId: GamificationProfile['userId'],
  ): Promise<NullableType<GamificationProfile>> {
    const entity = await this.gamificationProfileRepository.findOne({
      where: { userId },
      relations: { user: true },
    });

    return entity ? GamificationProfileMapper.toDomain(entity) : null;
  }

  async findByUsername(
    username: GamificationProfile['username'],
  ): Promise<NullableType<GamificationProfile>> {
    const entity = await this.gamificationProfileRepository.findOne({
      where: { username },
      relations: { user: true },
    });

    return entity ? GamificationProfileMapper.toDomain(entity) : null;
  }

  async resetMonthlyXpAndTokens(defaultTokens: number): Promise<void> {
    await this.gamificationProfileRepository.update(
      {},
      { currentMonthlyXp: 0, gratitudeTokens: defaultTokens },
    );
  }

  async resetYearlyXp(): Promise<void> {
    await this.gamificationProfileRepository.update({}, { currentYearlyXp: 0 });
  }
}
