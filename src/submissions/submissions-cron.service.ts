import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SubmissionsService } from './submissions.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class SubmissionsCronService {
  private readonly logger = new Logger(SubmissionsCronService.name);

  constructor(
    private readonly submissionsService: SubmissionsService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @Cron('0 6 * * *')
  async handlePendingSubmissionsDigest() {
    const pending = await this.submissionsService.findPending({
      page: 1,
      limit: 1000,
    });

    if (pending.length === 0) return;

    const moderators = await this.usersService.findManyWithPagination({
      filterOptions: {
        roles: [{ id: RoleEnum.moderator }, { id: RoleEnum.admin }],
      },
      sortOptions: [],
      paginationOptions: { page: 1, limit: 500 },
    });

    let sent = 0;
    for (const user of moderators) {
      if (!user.email) continue;
      try {
        await this.mailService.sendPendingSubmissionsDigest({
          to: user.email as string,
          data: { count: pending.length },
        });
        sent++;
      } catch (err) {
        this.logger.error(
          `Falha ao enviar digest para ${user.email}: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(
      `Digest de submissões pendentes enviado para ${sent} moderador(es). Total pendente: ${pending.length}`,
    );
  }
}
