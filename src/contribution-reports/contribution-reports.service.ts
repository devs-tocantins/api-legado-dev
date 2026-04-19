import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  ContributionReportEntity,
  ContributionReportStatus,
} from './infrastructure/persistence/relational/entities/contribution-report.entity';
import { SubmissionEntity } from '../submissions/infrastructure/persistence/relational/entities/submission.entity';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/domain/notification-type.enum';
import { CreateContributionReportDto } from './dto/create-report.dto';
import { ReviewContributionReportDto } from './dto/review-report.dto';
import { SubmissionStatus } from '../submissions/domain/submission-status.enum';

@Injectable()
export class ContributionReportsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateContributionReportDto, reporterUserId: number) {
    const reporterProfile = await this.dataSource
      .getRepository(GamificationProfileEntity)
      .findOne({ where: { userId: reporterUserId } });
    if (!reporterProfile) throw new NotFoundException('Perfil não encontrado.');

    const submission = await this.dataSource
      .getRepository(SubmissionEntity)
      .findOne({ where: { id: dto.submissionId } });
    if (!submission) throw new NotFoundException('Submissão não encontrada.');
    if (submission.status !== SubmissionStatus.APPROVED) {
      throw new BadRequestException(
        'Só é possível reportar submissões aprovadas.',
      );
    }
    if (submission.profileId === reporterProfile.id) {
      throw new ForbiddenException(
        'Não é possível reportar a própria submissão.',
      );
    }

    const existing = await this.dataSource
      .getRepository(ContributionReportEntity)
      .findOne({
        where: {
          submissionId: dto.submissionId,
          reporterProfileId: reporterProfile.id,
        },
      });
    if (existing)
      throw new ConflictException('Você já reportou esta submissão.');

    const report = this.dataSource
      .getRepository(ContributionReportEntity)
      .create({
        submissionId: dto.submissionId,
        reporterProfileId: reporterProfile.id,
        reason: dto.reason,
        proofUrl: dto.proofUrl ?? null,
      });
    const saved = await this.dataSource
      .getRepository(ContributionReportEntity)
      .save(report);

    // Notify admins/moderators (userId -1 is a sentinel — real impl queries admin users)
    // For now we create a generic notification; admins see all pending in the panel
    return saved;
  }

  async findAll() {
    return this.dataSource.getRepository(ContributionReportEntity).find({
      order: { createdAt: 'DESC' },
    });
  }

  async findPending() {
    return this.dataSource.getRepository(ContributionReportEntity).find({
      where: { status: ContributionReportStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async review(
    reportId: string,
    dto: ReviewContributionReportDto,
    reviewerUserId: number,
  ) {
    const report = await this.dataSource
      .getRepository(ContributionReportEntity)
      .findOne({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report não encontrado.');
    if (report.status !== ContributionReportStatus.PENDING) {
      throw new BadRequestException('Este report já foi revisado.');
    }

    if (dto.status === 'UPHELD') {
      const submission = await this.dataSource
        .getRepository(SubmissionEntity)
        .findOne({ where: { id: report.submissionId } });
      if (!submission) throw new NotFoundException('Submissão não encontrada.');

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        // Mark submission as rejected
        await queryRunner.manager.update(SubmissionEntity, submission.id, {
          status: SubmissionStatus.REJECTED,
          feedback:
            `Contribuição removida por report aceito. ${dto.adminNote ?? ''}`.trim(),
        });

        // Revert XP if any was awarded
        if (submission.awardedXp > 0) {
          await queryRunner.manager.decrement(
            GamificationProfileEntity,
            { id: submission.profileId },
            'totalXp',
            submission.awardedXp,
          );
          await queryRunner.manager.decrement(
            GamificationProfileEntity,
            { id: submission.profileId },
            'currentMonthlyXp',
            submission.awardedXp,
          );
          await queryRunner.manager.decrement(
            GamificationProfileEntity,
            { id: submission.profileId },
            'currentYearlyXp',
            submission.awardedXp,
          );
        }

        await queryRunner.manager.update(ContributionReportEntity, reportId, {
          status: ContributionReportStatus.UPHELD,
          adminNote: dto.adminNote ?? null,
          reviewedBy: reviewerUserId,
          reviewedAt: new Date(),
        });

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }

      // Notify the submission owner
      const ownerProfile = await this.dataSource
        .getRepository(GamificationProfileEntity)
        .findOne({ where: { id: submission.profileId } });
      if (ownerProfile) {
        await this.notificationsService.create({
          userId: ownerProfile.userId,
          type: NotificationType.CONTRIBUTION_REPORT_UPHELD,
          title: 'Contribuição removida',
          body: dto.adminNote
            ? `Uma contribuição sua foi removida após revisão. Motivo: ${dto.adminNote}`
            : 'Uma contribuição sua foi removida após revisão de um report.',
          relatedId: submission.id,
        });
      }
    } else {
      await this.dataSource
        .getRepository(ContributionReportEntity)
        .update(reportId, {
          status: ContributionReportStatus.DISMISSED,
          adminNote: dto.adminNote ?? null,
          reviewedBy: reviewerUserId,
          reviewedAt: new Date(),
        });
    }

    return this.dataSource
      .getRepository(ContributionReportEntity)
      .findOne({ where: { id: reportId } });
  }
}
