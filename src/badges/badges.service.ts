import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BadgeRepository } from './infrastructure/persistence/badge.repository';
import { GamificationProfileBadgeRepository } from './infrastructure/persistence/gamification-profile-badge.repository';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { GrantBadgeDto } from './dto/grant-badge.dto';
import { Badge } from './domain/badge';
import { GamificationProfileBadge } from './domain/gamification-profile-badge';
import { BadgeCriteriaTypeEnum } from './domain/badge-criteria-type.enum';

@Injectable()
export class BadgesService {
  constructor(
    private readonly badgeRepository: BadgeRepository,
    private readonly profileBadgeRepository: GamificationProfileBadgeRepository,
  ) {}

  async create(dto: CreateBadgeDto): Promise<Badge> {
    return this.badgeRepository.create({
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl ?? null,
      criteriaType: dto.criteriaType,
      criteriaConfig: dto.criteriaConfig ?? null,
      isActive: true,
    });
  }

  findAll(): Promise<Badge[]> {
    return this.badgeRepository.findAll();
  }

  findAllActive(): Promise<Badge[]> {
    return this.badgeRepository.findAllActive();
  }

  async findById(id: string): Promise<Badge> {
    const badge = await this.badgeRepository.findById(id);
    if (!badge) throw new NotFoundException('Badge não encontrado.');
    return badge;
  }

  async update(id: string, dto: UpdateBadgeDto): Promise<Badge> {
    await this.findById(id);
    return this.badgeRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.badgeRepository.remove(id);
  }

  findBadgesByProfileId(
    profileId: string,
  ): Promise<GamificationProfileBadge[]> {
    return this.profileBadgeRepository.findByProfileId(profileId);
  }

  async grantManual(
    dto: GrantBadgeDto,
    adminUserId: number,
  ): Promise<GamificationProfileBadge> {
    const badge = await this.badgeRepository.findById(dto.badgeId);
    if (!badge) throw new NotFoundException('Badge não encontrado.');
    if (badge.criteriaType !== BadgeCriteriaTypeEnum.MANUAL) {
      throw new BadRequestException(
        'Apenas badges com criteriaType MANUAL podem ser concedidos manualmente.',
      );
    }

    const existing = await this.profileBadgeRepository.findByProfileAndBadge(
      dto.profileId,
      dto.badgeId,
    );
    if (existing) {
      throw new ConflictException('Este perfil já possui este badge.');
    }

    return this.profileBadgeRepository.create({
      profileId: dto.profileId,
      badgeId: dto.badgeId,
      grantedBy: adminUserId,
    });
  }
}
