import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsService } from './events.service';

@Injectable()
export class EventsCleanupCronService {
  private readonly logger = new Logger(EventsCleanupCronService.name);

  constructor(private readonly eventsService: EventsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCoverImageCleanup() {
    this.logger.log('Iniciando limpeza de capas de eventos encerrados...');
    try {
      const count = await this.eventsService.cleanupEndedCoverImages();
      this.logger.log(
        `Limpeza concluída. ${count} evento(s) tiveram a capa removida do storage.`,
      );
    } catch (err) {
      this.logger.error('Falha na limpeza de capas de eventos', err);
    }
  }
}
