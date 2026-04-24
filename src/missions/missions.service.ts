import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateMissionDto } from './dto/create-mission.dto';
import { SubmitMissionDto } from './dto/submit-mission.dto';
import { FindAllMissionsDto } from './dto/find-all-missions.dto';
import { ReviewMissionSubmissionDto } from './dto/review-mission-submission.dto';
import { MissionStatus } from './domain/mission-status.enum';
import { MissionSubmissionStatus } from './domain/mission-submission-status.enum';
import { MissionEntity } from './infrastructure/persistence/relational/entities/mission.entity';
import { MissionSubmissionEntity } from './infrastructure/persistence/relational/entities/mission-submission.entity';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/domain/notification-type.enum';

@Injectable()
export class MissionsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ── Admin: CRUD ──────────────────────────────────────────────────────────────

  async create(dto: CreateMissionDto) {
    const mission = this.dataSource.getRepository(MissionEntity).create({
      title: dto.title,
      description: dto.description ?? null,
      requirements: dto.requirements ?? null,
      xpReward: dto.xpReward,
      isSecret: dto.isSecret ?? false,
      requiresProof: dto.requiresProof ?? false,
      requiresDescription: dto.requiresDescription ?? false,
      status: MissionStatus.OPEN,
      winnerId: null,
    });
    return this.dataSource.getRepository(MissionEntity).save(mission);
  }

  async findAll(dto?: FindAllMissionsDto) {
    const page = dto?.page ?? 1;
    const limit = dto?.limit ?? 10;
    const search = dto?.search;
    const view = dto?.view;

    const query = this.dataSource
      .getRepository(MissionEntity)
      .createQueryBuilder('mission');

    if (search) {
      query.andWhere(
        '(mission.title ILIKE :search OR mission.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query.orderBy('mission.createdAt', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const missions = await query.getMany();

    if (view === 'card') {
      return missions.map((m) => ({
        id: m.id,
        title: m.title,
        xpReward: m.xpReward,
        status: m.status,
        createdAt: m.createdAt,
      }));
    }
    return missions;
  }

  async findOpen(dto?: FindAllMissionsDto) {
    const page = dto?.page ?? 1;
    const limit = dto?.limit ?? 10;
    const search = dto?.search;
    const view = dto?.view;

    const query = this.dataSource
      .getRepository(MissionEntity)
      .createQueryBuilder('mission');

    query.andWhere('mission.status = :status', { status: MissionStatus.OPEN });
    query.andWhere('mission.isSecret = :isSecret', { isSecret: false });

    if (search) {
      query.andWhere(
        '(mission.title ILIKE :search OR mission.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query.orderBy('mission.createdAt', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const missions = await query.getMany();

    if (view === 'card') {
      return missions.map((m) => ({
        id: m.id,
        title: m.title,
        xpReward: m.xpReward,
        status: m.status,
        createdAt: m.createdAt,
      }));
    }
    return missions;
  }

  async findById(id: string) {
    const mission = await this.dataSource
      .getRepository(MissionEntity)
      .findOne({ where: { id } });
    if (!mission) throw new NotFoundException('Missão não encontrada.');
    return mission;
  }

  async update(id: string, dto: Partial<CreateMissionDto>) {
    const mission = await this.findById(id);
    Object.assign(mission, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.requirements !== undefined && { requirements: dto.requirements }),
      ...(dto.xpReward !== undefined && { xpReward: dto.xpReward }),
      ...(dto.isSecret !== undefined && { isSecret: dto.isSecret }),
      ...(dto.requiresProof !== undefined && {
        requiresProof: dto.requiresProof,
      }),
      ...(dto.requiresDescription !== undefined && {
        requiresDescription: dto.requiresDescription,
      }),
    });
    return this.dataSource.getRepository(MissionEntity).save(mission);
  }

  async remove(id: string) {
    const mission = await this.findById(id);
    await this.dataSource.getRepository(MissionEntity).remove(mission);
  }

  // ── User: submit ─────────────────────────────────────────────────────────────

  async submit(missionId: string, userId: number, dto: SubmitMissionDto) {
    const mission = await this.findById(missionId);
    if (mission.status === MissionStatus.CLOSED) {
      throw new ForbiddenException('Esta missão já foi encerrada.');
    }

    const profile = await this.dataSource
      .getRepository(GamificationProfileEntity)
      .findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Perfil não encontrado.');

    const existing = await this.dataSource
      .getRepository(MissionSubmissionEntity)
      .findOne({ where: { missionId, profileId: profile.id } });
    if (existing) {
      throw new ConflictException(
        'Você já submeteu uma resposta para esta missão.',
      );
    }

    const submission = this.dataSource
      .getRepository(MissionSubmissionEntity)
      .create({
        missionId,
        profileId: profile.id,
        proofUrl: dto.proofUrl ?? null,
        description: dto.description ?? null,
        status: MissionSubmissionStatus.PENDING,
      });
    return this.dataSource
      .getRepository(MissionSubmissionEntity)
      .save(submission);
  }

  // ── Admin: list submissions for a mission ────────────────────────────────────

  async findSubmissions(missionId: string) {
    await this.findById(missionId);
    return this.dataSource.getRepository(MissionSubmissionEntity).find({
      where: { missionId },
      order: { createdAt: 'ASC' },
    });
  }

  async findParticipants(missionId: string): Promise<{
    count: number;
    participants: { username: string; status: string; submittedAt: Date }[];
  }> {
    await this.findById(missionId);
    const submissions = await this.dataSource
      .getRepository(MissionSubmissionEntity)
      .find({
        where: { missionId },
        relations: { profile: true },
        order: { createdAt: 'ASC' },
      });
    return {
      count: submissions.length,
      participants: submissions.map((s) => ({
        username: s.profile?.username ?? 'desconhecido',
        status: s.status,
        submittedAt: s.createdAt,
      })),
    };
  }

  async findMySubmission(missionId: string, userId: number) {
    const profile = await this.dataSource
      .getRepository(GamificationProfileEntity)
      .findOne({ where: { userId } });
    if (!profile) return null;
    return this.dataSource.getRepository(MissionSubmissionEntity).findOne({
      where: { missionId, profileId: profile.id },
    });
  }

  // ── Admin: review submission ─────────────────────────────────────────────────

  async reviewSubmission(
    missionId: string,
    submissionId: string,
    dto: ReviewMissionSubmissionDto,
    reviewerUserId: number,
  ) {
    const mission = await this.findById(missionId);

    const submission = await this.dataSource
      .getRepository(MissionSubmissionEntity)
      .findOne({ where: { id: submissionId, missionId } });
    if (!submission) throw new NotFoundException('Submissão não encontrada.');

    const reviewerProfile = await this.dataSource
      .getRepository(GamificationProfileEntity)
      .findOne({ where: { userId: reviewerUserId } });
    if (reviewerProfile && reviewerProfile.id === submission.profileId) {
      throw new ForbiddenException(
        'Você não pode revisar sua própria submissão de missão.',
      );
    }

    if (submission.status !== MissionSubmissionStatus.PENDING) {
      throw new BadRequestException('Submissão já foi revisada.');
    }

    if (dto.status === MissionSubmissionStatus.REJECTED && !dto.feedback) {
      throw new BadRequestException('Feedback é obrigatório ao rejeitar.');
    }

    if (dto.status === MissionSubmissionStatus.APPROVED) {
      // Check no other submission is already approved
      const alreadyApproved = await this.dataSource
        .getRepository(MissionSubmissionEntity)
        .findOne({
          where: { missionId, status: MissionSubmissionStatus.APPROVED },
        });
      if (alreadyApproved) {
        throw new ConflictException('Esta missão já tem um vencedor.');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(MissionSubmissionEntity, submissionId, {
        status: dto.status,
        feedback: dto.feedback ?? null,
        reviewerId: reviewerUserId,
        reviewedAt: new Date(),
        awardedXp:
          dto.status === MissionSubmissionStatus.APPROVED
            ? mission.xpReward
            : 0,
      });

      if (dto.status === MissionSubmissionStatus.APPROVED) {
        // Grant XP to winner
        await queryRunner.manager.increment(
          GamificationProfileEntity,
          { id: submission.profileId },
          'totalXp',
          mission.xpReward,
        );
        await queryRunner.manager.increment(
          GamificationProfileEntity,
          { id: submission.profileId },
          'currentMonthlyXp',
          mission.xpReward,
        );
        await queryRunner.manager.increment(
          GamificationProfileEntity,
          { id: submission.profileId },
          'currentYearlyXp',
          mission.xpReward,
        );

        // Close mission and record winner
        await queryRunner.manager.update(MissionEntity, missionId, {
          status: MissionStatus.CLOSED,
          winnerId: submission.profileId,
        });

        // Auto-reject remaining pending submissions
        await queryRunner.manager
          .createQueryBuilder()
          .update(MissionSubmissionEntity)
          .set({
            status: MissionSubmissionStatus.REJECTED,
            feedback: 'A missão foi concluída por outro participante.',
            reviewerId: reviewerUserId,
            reviewedAt: new Date(),
          })
          .where('missionId = :missionId AND status = :status AND id != :id', {
            missionId,
            status: MissionSubmissionStatus.PENDING,
            id: submissionId,
          })
          .execute();
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    if (dto.status === MissionSubmissionStatus.APPROVED) {
      const winnerProfile = await this.dataSource
        .getRepository(GamificationProfileEntity)
        .findOne({ where: { id: submission.profileId } });
      if (winnerProfile) {
        void this.notificationsService.create({
          userId: winnerProfile.userId,
          type: NotificationType.MISSION_WON,
          title: 'Você venceu uma missão!',
          body: `Parabéns! Sua participação na missão foi aprovada e você ganhou ${mission.xpReward} XP.`,
          relatedId: missionId,
        });
      }
    }

    return this.dataSource
      .getRepository(MissionSubmissionEntity)
      .findOne({ where: { id: submissionId } });
  }
}
