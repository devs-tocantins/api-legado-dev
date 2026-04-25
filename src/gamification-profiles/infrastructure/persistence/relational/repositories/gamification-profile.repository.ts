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

  // Campos de ordenação permitidos (whitelist contra injeção)
  private readonly ALLOWED_SORT_FIELDS = new Set([
    'totalXp',
    'currentMonthlyXp',
    'currentYearlyXp',
    'gratitudeTokens',
    'createdAt',
  ]);

  async findAllWithPagination({
    paginationOptions,
    sort,
    search,
  }: {
    paginationOptions: IPaginationOptions;
    sort?: Array<{ orderBy: string; order: 'ASC' | 'DESC' }>;
    search?: string;
  }): Promise<GamificationProfile[]> {
    // Passo 1 — busca IDs paginados/ordenados sem leftJoinAndSelect.
    // Usar leftJoinAndSelect + skip/take dispara o bug do TypeORM ao montar
    // a subquery DISTINCT (Cannot read properties of undefined 'databaseName').
    // Com leftJoin (sem select) o TypeORM usa query simples de paginação.
    const idsQb = this.gamificationProfileRepository
      .createQueryBuilder('gp')
      .select('gp.id', 'id')
      .leftJoin('gp.user', 'u')
      .leftJoin('u.role', 'role')
      .where('u.isBanned = false')
      .andWhere('role.id != :adminRole', { adminRole: 1 });

    if (search) {
      idsQb.andWhere(
        '(gp.username ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const safeSorts = (sort ?? []).filter((s) =>
      this.ALLOWED_SORT_FIELDS.has(s.orderBy),
    );

    if (safeSorts.length) {
      safeSorts.forEach((s, idx) => {
        if (idx === 0) idsQb.orderBy(`gp.${s.orderBy}`, s.order);
        else idsQb.addOrderBy(`gp.${s.orderBy}`, s.order);
      });
    } else {
      idsQb.orderBy('gp.totalXp', 'DESC');
    }

    idsQb
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit);

    const rawIds: { id: string }[] = await idsQb.getRawMany();
    const ids = rawIds.map((r) => r.id);

    if (!ids.length) return [];

    // Passo 2 — carrega entidades completas (com relação user) pelos IDs.
    // find() sem skip/take não usa a query de dois passos, então sem bug.
    const entityMap = new Map<string, GamificationProfileEntity>();
    const entities = await this.gamificationProfileRepository.find({
      where: { id: In(ids) },
      relations: { user: { photo: true } },
    });
    entities.forEach((e) => entityMap.set(e.id, e));

    // Restaura a ordem original do passo 1
    return ids
      .map((id) => entityMap.get(id))
      .filter((e): e is GamificationProfileEntity => !!e)
      .map((entity) => GamificationProfileMapper.toDomain(entity));
  }

  async findById(
    id: GamificationProfile['id'],
  ): Promise<NullableType<GamificationProfile>> {
    const entity = await this.gamificationProfileRepository.findOne({
      where: { id },
      relations: { user: { photo: true, role: true } },
    });

    if (!entity) return null;
    if (entity.user?.role?.id === 1) return null;
    return GamificationProfileMapper.toDomain(entity);
  }

  async findByIds(
    ids: GamificationProfile['id'][],
  ): Promise<GamificationProfile[]> {
    const entities = await this.gamificationProfileRepository.find({
      where: { id: In(ids) },
      relations: { user: { photo: true } },
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
      relations: { user: { photo: true } },
    });

    return entity ? GamificationProfileMapper.toDomain(entity) : null;
  }

  async findByUsername(
    username: GamificationProfile['username'],
  ): Promise<NullableType<GamificationProfile>> {
    const entity = await this.gamificationProfileRepository.findOne({
      where: { username },
      relations: { user: { photo: true, role: true } },
    });

    if (!entity) return null;
    if (entity.user?.role?.id === 1) return null;
    return GamificationProfileMapper.toDomain(entity);
  }

  async resetMonthlyXpAndTokens(defaultTokens: number): Promise<void> {
    await this.gamificationProfileRepository.update(
      {},
      { currentMonthlyXp: 0, gratitudeTokens: defaultTokens },
    );
  }

  async replenishDailyTokens(defaultTokens: number): Promise<void> {
    await this.gamificationProfileRepository.update(
      {},
      { gratitudeTokens: defaultTokens },
    );
  }

  async resetYearlyXp(): Promise<void> {
    await this.gamificationProfileRepository.update({}, { currentYearlyXp: 0 });
  }
}
