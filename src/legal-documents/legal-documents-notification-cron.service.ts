import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, LessThan } from 'typeorm';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/domain/notification-type.enum';
import { MailService } from '../mail/mail.service';
import {
  CURRENT_LEGAL_DOCUMENTS_VERSION,
  LEGAL_NOTIFICATION_BATCH_SIZE,
} from './legal-documents.constants';

@Injectable()
export class LegalDocumentsNotificationCronService {
  private readonly logger = new Logger(
    LegalDocumentsNotificationCronService.name,
  );

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  // Roda todo dia às 9h, notificando até 100 usuários que ainda não foram
  // avisados sobre a versão atual do Termo de Serviço / Política de
  // Privacidade, até que todos estejam em dia.
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async notifyPendingUsers() {
    // Para evitar execução simultânea em múltiplas instâncias da API sem usar Redis,
    // utilizamos o pg_try_advisory_lock nativo do PostgreSQL (lock level de sessão).
    const lockId = 1001; // ID único para este cron job
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const [{ locked }] = await queryRunner.query(
        `SELECT pg_try_advisory_lock(${lockId}) as "locked"`,
      );

      if (!locked) {
        this.logger.debug(
          'Rotina já está sendo executada por outra instância, abortando...',
        );
        return;
      }

      const pendingUsers = await this.dataSource
        .getRepository(UserEntity)
        .find({
          where: {
            lastNotifiedLegalVersion: LessThan(CURRENT_LEGAL_DOCUMENTS_VERSION),
          },
          take: LEGAL_NOTIFICATION_BATCH_SIZE,
        });

      if (!pendingUsers.length) return;

      this.logger.log(
        `Notificando ${pendingUsers.length} usuário(s) sobre a versão ${CURRENT_LEGAL_DOCUMENTS_VERSION} dos termos...`,
      );

      let sent = 0;
      for (const user of pendingUsers) {
        try {
          await this.notificationsService.create({
            userId: user.id,
            type: NotificationType.LEGAL_DOCUMENT_UPDATED,
            title: 'Atualizamos nossos termos',
            body: 'Revisamos a Política de Privacidade e o Termo de Serviço do legado.dev. Dê uma olhada quando puder.',
            relatedId: 'legal-documents',
          });

          if (user.email) {
            await this.mailService.legalDocumentUpdated({
              to: user.email,
              data: {},
            });
          }

          await this.dataSource.getRepository(UserEntity).update(user.id, {
            lastNotifiedLegalVersion: CURRENT_LEGAL_DOCUMENTS_VERSION,
          });
          sent += 1;
        } catch (err) {
          this.logger.error(
            `Falha ao notificar usuário ${user.id} sobre atualização dos termos`,
            err,
          );
        }
      }

      this.logger.log(
        `Notificação em lote concluída: ${sent}/${pendingUsers.length} usuário(s) notificado(s).`,
      );
    } finally {
      await queryRunner.query(`SELECT pg_try_advisory_unlock(${lockId})`);
      await queryRunner.release();
    }
  }
}
