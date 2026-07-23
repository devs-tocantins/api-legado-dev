import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, LessThan } from 'typeorm';
import { UserEntity } from './infrastructure/persistence/relational/entities/user.entity';
import { StatusEnum } from '../statuses/statuses.enum';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';

@Injectable()
export class UsersCronService {
  private readonly logger = new Logger(UsersCronService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteUnconfirmedUsers() {
    this.logger.log(
      'Buscando usuários não confirmados há mais de 7 dias para exclusão definitiva...',
    );
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      const usersToDelete = await this.dataSource
        .getRepository(UserEntity)
        .find({
          where: {
            status: { id: StatusEnum.inactive },
            createdAt: LessThan(sevenDaysAgo),
          },
          select: ['id'],
        });

      if (usersToDelete.length > 0) {
        const userIds = usersToDelete.map((u) => u.id);

        // Remove os perfis de gamificação primeiro devido à FK
        await this.dataSource
          .getRepository(GamificationProfileEntity)
          .createQueryBuilder()
          .delete()
          .where('userId IN (:...userIds)', { userIds })
          .execute();

        // Hard delete dos usuários (para liberar o e-mail para novo cadastro)
        await this.dataSource
          .getRepository(UserEntity)
          .createQueryBuilder()
          .delete()
          .where('id IN (:...userIds)', { userIds })
          .execute();

        this.logger.log(
          `Foram excluídos definitivamente ${usersToDelete.length} usuário(s) não confirmado(s).`,
        );
      } else {
        this.logger.log('Nenhum usuário não confirmado para excluir hoje.');
      }
    } catch (error) {
      this.logger.error('Erro ao excluir usuários não confirmados:', error);
    }
  }
}
