import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GamificationProfilesService } from './gamification-profiles.service';

const DEFAULT_MONTHLY_TOKENS = 5;

@Injectable()
export class GamificationProfilesCronService {
  private readonly logger = new Logger(GamificationProfilesCronService.name);

  constructor(
    private readonly gamificationProfilesService: GamificationProfilesService,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyReset() {
    this.logger.log('Iniciando reset mensal de XP e Tokens de Gratidão...');
    try {
      await this.gamificationProfilesService.resetMonthlyXpAndTokens(
        DEFAULT_MONTHLY_TOKENS,
      );
      this.logger.log(
        `Reset mensal concluído. currentMonthlyXp zerado; gratitudeTokens recarregados para ${DEFAULT_MONTHLY_TOKENS}.`,
      );
    } catch (err) {
      this.logger.error('Falha no reset mensal', err);
    }
  }
}
