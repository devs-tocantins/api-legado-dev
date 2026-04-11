import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadgeEntity } from '../entities/badge.entity';
import { BadgeRepository } from '../../badge.repository';
import { BadgeMapper } from '../mappers/badge.mapper';
import { Badge } from '../../../../domain/badge';
import { NullableType } from '../../../../../utils/types/nullable.type';

@Injectable()
export class BadgeRelationalRepository implements BadgeRepository {
  constructor(
    @InjectRepository(BadgeEntity)
    private readonly repo: Repository<BadgeEntity>,
  ) {}

  async create(
    data: Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Badge> {
    const entity = this.repo.create(BadgeMapper.toPersistence(data as Badge));
    const saved = await this.repo.save(entity);
    return BadgeMapper.toDomain(saved);
  }

  async findAll(): Promise<Badge[]> {
    const entities = await this.repo.find({ order: { createdAt: 'DESC' } });
    return entities.map(BadgeMapper.toDomain);
  }

  async findAllActive(): Promise<Badge[]> {
    const entities = await this.repo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
    return entities.map(BadgeMapper.toDomain);
  }

  async findById(id: string): Promise<NullableType<Badge>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? BadgeMapper.toDomain(entity) : null;
  }

  async update(id: string, payload: Partial<Badge>): Promise<Badge> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error('Badge not found');
    Object.assign(entity, payload);
    const saved = await this.repo.save(entity);
    return BadgeMapper.toDomain(saved);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
