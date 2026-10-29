import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { TransactionCategoryEnum } from '../transactions/domain/transaction-category.enum';
import { TransactionEntity } from '../transactions/infrastructure/persistence/relational/entities/transaction.entity';

/** XP de quem propôs a ideia quando chama os interessados. */
export const PROJECT_AUTHOR_XP = 20;
/** XP de cada pessoa interessada que foi chamada para o grupo. */
export const PROJECT_PARTICIPANT_XP = 5;

@Injectable()
export class ProjectRewardsService {
  private readonly logger = new Logger(ProjectRewardsService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Dá XP a cada usuário da lista. Falhar na recompensa nunca deve impedir
   * a chamada, então os erros só são registrados.
   */
  async grant(
    rewards: { userId: number; amount: number; description: string }[],
  ): Promise<void> {
    for (const reward of rewards) {
      try {
        await this.dataSource.transaction((manager) =>
          this.grantOne(manager, reward),
        );
      } catch (error) {
        this.logger.error(
          `Falha ao dar XP ao usuário ${reward.userId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  private async grantOne(
    manager: EntityManager,
    reward: { userId: number; amount: number; description: string },
  ): Promise<void> {
    const profile = await manager.findOne(GamificationProfileEntity, {
      where: { userId: reward.userId },
      select: { id: true },
    });
    if (!profile) {
      return;
    }
    for (const column of [
      'totalXp',
      'currentMonthlyXp',
      'currentYearlyXp',
    ] as const) {
      await manager.increment(
        GamificationProfileEntity,
        { id: profile.id },
        column,
        reward.amount,
      );
    }
    await manager.save(TransactionEntity, {
      profile: { id: profile.id },
      category: TransactionCategoryEnum.XP_REWARD,
      amount: reward.amount,
      description: reward.description,
    });
  }
}
