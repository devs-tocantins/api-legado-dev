import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GamificationProfilesService } from './gamification-profiles.service';

const DEFAULT_DAILY_TOKENS = 5;
const DEFAULT_MONTHLY_TOKENS = DEFAULT_DAILY_TOKENS;

@Injectable()
export class GamificationProfilesCronService implements OnModuleInit {
  private readonly logger = new Logger(GamificationProfilesCronService.name);

  constructor(
    private readonly gamificationProfilesService: GamificationProfilesService,
  ) {}

  async onModuleInit() {
    this.logger.log(
      'Executando recarga inicial de Tokens de Gratidão na inicialização...',
    );
    try {
      await this.gamificationProfilesService.replenishDailyTokens(
        DEFAULT_DAILY_TOKENS,
      );
      this.logger.log(
        `Recarga inicial concluída. gratitudeTokens = ${DEFAULT_DAILY_TOKENS}.`,
      );
    } catch (err) {
      this.logger.error('Falha na recarga inicial de tokens', err);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyTokenReplenishment() {
    this.logger.log('Recarregando Tokens de Gratidão diariamente...');
    try {
      await this.gamificationProfilesService.replenishDailyTokens(
        DEFAULT_DAILY_TOKENS,
      );
      this.logger.log(
        `Recarga diária concluída. gratitudeTokens = ${DEFAULT_DAILY_TOKENS}.`,
      );
    } catch (err) {
      this.logger.error('Falha na recarga diária de tokens', err);
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyReset() {
    this.logger.log('Iniciando reset mensal de XP...');
    try {
      await this.gamificationProfilesService.resetMonthlyXpAndTokens(
        DEFAULT_MONTHLY_TOKENS,
      );
      this.logger.log('Reset mensal concluído. currentMonthlyXp zerado.');
    } catch (err) {
      this.logger.error('Falha no reset mensal', err);
    }
  }

  @Cron('0 0 1 1 *')
  async handleYearlyReset() {
    this.logger.log('Iniciando reset anual de XP (currentYearlyXp)...');
    try {
      await this.gamificationProfilesService.resetYearlyXp();
      this.logger.log('Reset anual concluído. currentYearlyXp zerado.');
    } catch (err) {
      this.logger.error('Falha no reset anual', err);
    }
  }
}
