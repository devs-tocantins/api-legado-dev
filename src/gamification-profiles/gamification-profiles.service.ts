import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateGamificationProfileDto } from './dto/create-gamification-profile.dto';
import { UpdateGamificationProfileDto } from './dto/update-gamification-profile.dto';
import { TransferTokensDto } from './dto/transfer-tokens.dto';
import { ApplyPenaltyDto } from './dto/apply-penalty.dto';
import { BadgeEvaluatorService } from '../badges/badge-evaluator.service';
import { GamificationProfileRepository } from './infrastructure/persistence/gamification-profile.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { GamificationProfile } from './domain/gamification-profile';
import { GamificationProfileEntity } from './infrastructure/persistence/relational/entities/gamification-profile.entity';
import { TransactionEntity } from '../transactions/infrastructure/persistence/relational/entities/transaction.entity';
import { TransactionCategoryEnum } from '../transactions/domain/transaction-category.enum';

@Injectable()
export class GamificationProfilesService {
  constructor(
    private readonly gamificationProfileRepository: GamificationProfileRepository,
    private readonly badgeEvaluatorService: BadgeEvaluatorService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(createGamificationProfileDto: CreateGamificationProfileDto) {
    return this.gamificationProfileRepository.create({
      userId: createGamificationProfileDto.userId,
      username: createGamificationProfileDto.username,
      totalXp: 0,
      currentMonthlyXp: 0,
      currentYearlyXp: 0,
      gratitudeTokens: 0,
      isBanned: false,
    });
  }

  findAllWithPagination({
    paginationOptions,
    sort,
    search,
  }: {
    paginationOptions: IPaginationOptions;
    sort?: Array<{ orderBy: string; order: 'ASC' | 'DESC' }>;
    search?: string;
  }) {
    return this.gamificationProfileRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      sort,
      search,
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

  findByUserId(userId: GamificationProfile['userId']) {
    return this.gamificationProfileRepository.findByUserId(userId);
  }

  findByUsername(username: GamificationProfile['username']) {
    return this.gamificationProfileRepository.findByUsername(username);
  }

  async updateMyProfile(
    userId: number,
    newUsername: string,
    githubUsername?: string | null,
  ): Promise<GamificationProfile> {
    const profile =
      await this.gamificationProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado.');
    }

    if (newUsername !== profile.username) {
      const existing =
        await this.gamificationProfileRepository.findByUsername(newUsername);
      if (existing) {
        throw new ConflictException('Este username já está em uso.');
      }
    }

    return this.gamificationProfileRepository.update(profile.id, {
      username: newUsername,
      ...(githubUsername !== undefined && { githubUsername }),
    }) as Promise<GamificationProfile>;
  }

  resetMonthlyXpAndTokens(defaultTokens: number) {
    return this.gamificationProfileRepository.resetMonthlyXpAndTokens(
      defaultTokens,
    );
  }

  resetYearlyXp() {
    return this.gamificationProfileRepository.resetYearlyXp();
  }

  async applyPenalty(
    profileId: GamificationProfile['id'],
    dto: ApplyPenaltyDto,
    adminUserId: number,
  ): Promise<GamificationProfile> {
    const profile =
      await this.gamificationProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundException('Perfil de gamificação não encontrado.');
    }

    const newTotal = Math.max(0, profile.totalXp - dto.amount);
    const newMonthly = Math.max(0, profile.currentMonthlyXp - dto.amount);
    const newYearly = Math.max(0, profile.currentYearlyXp - dto.amount);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        GamificationProfileEntity,
        { id: profileId },
        {
          totalXp: newTotal,
          currentMonthlyXp: newMonthly,
          currentYearlyXp: newYearly,
        },
      );

      await queryRunner.manager.save(TransactionEntity, {
        profile: { id: profileId },
        category: TransactionCategoryEnum.PENALTY,
        amount: -dto.amount,
        description: `[Admin #${adminUserId}] ${dto.reason}`,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return (await this.gamificationProfileRepository.findById(
      profileId,
    )) as GamificationProfile;
  }

  async transferTokens(senderUserId: number, dto: TransferTokensDto) {
    const senderProfile =
      await this.gamificationProfileRepository.findByUserId(senderUserId);
    if (!senderProfile) {
      throw new UnprocessableEntityException(
        'Perfil de gamificação do remetente não encontrado.',
      );
    }

    if (senderProfile.isBanned) {
      throw new ForbiddenException(
        'Sua conta está banida e não pode transferir tokens.',
      );
    }

    if (senderProfile.id === dto.recipientProfileId) {
      throw new BadRequestException(
        'Você não pode transferir tokens para si mesmo.',
      );
    }

    if (senderProfile.gratitudeTokens < dto.amount) {
      throw new BadRequestException(
        `Saldo insuficiente. Você possui apenas ${senderProfile.gratitudeTokens} Token(s) de Gratidão.`,
      );
    }

    const recipientProfile = await this.gamificationProfileRepository.findById(
      dto.recipientProfileId,
    );
    if (!recipientProfile) {
      throw new NotFoundException('Perfil destinatário não encontrado.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.decrement(
        GamificationProfileEntity,
        { id: senderProfile.id },
        'gratitudeTokens',
        dto.amount,
      );

      await queryRunner.manager.increment(
        GamificationProfileEntity,
        { id: recipientProfile.id },
        'totalXp',
        dto.amount,
      );
      await queryRunner.manager.increment(
        GamificationProfileEntity,
        { id: recipientProfile.id },
        'currentMonthlyXp',
        dto.amount,
      );
      await queryRunner.manager.increment(
        GamificationProfileEntity,
        { id: recipientProfile.id },
        'currentYearlyXp',
        dto.amount,
      );

      await queryRunner.manager.save(TransactionEntity, {
        profile: { id: senderProfile.id },
        category: TransactionCategoryEnum.TOKEN_TRANSFER,
        amount: -dto.amount,
        description:
          dto.message ??
          `Tokens de Gratidão enviados para @${recipientProfile.username}`,
      });

      await queryRunner.manager.save(TransactionEntity, {
        profile: { id: recipientProfile.id },
        category: TransactionCategoryEnum.TOKEN_REWARD,
        amount: dto.amount,
        description:
          dto.message ??
          `Tokens de Gratidão recebidos de @${senderProfile.username}`,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    void this.badgeEvaluatorService.evaluate(senderProfile.id);

    return this.gamificationProfileRepository.findById(senderProfile.id);
  }
}
