import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { CourseReviewRepository } from './infrastructure/persistence/course-review.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { CourseReview } from './domain/course-review';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';
import { TrackItemsService } from '../track-items/track-items.service';
import { TrackItemCompletionsService } from '../track-item-completions/track-item-completions.service';
import { TrackItemType } from '../track-items/domain/track-item-type.enum';
import { CoursesService } from '../courses/courses.service';
import { CourseStatus } from '../courses/domain/course-status.enum';
import { GamificationProfileEntity } from '../gamification-profiles/infrastructure/persistence/relational/entities/gamification-profile.entity';
import { TransactionEntity } from '../transactions/infrastructure/persistence/relational/entities/transaction.entity';
import { TransactionCategoryEnum } from '../transactions/domain/transaction-category.enum';
import { CourseReviewEntity } from './infrastructure/persistence/relational/entities/course-review.entity';
import { CourseReviewMapper } from './infrastructure/persistence/relational/mappers/course-review.mapper';

const COURSE_REVIEW_XP_REWARD = 10;

@Injectable()
export class CourseReviewsService {
  constructor(
    private readonly courseReviewRepository: CourseReviewRepository,
    private readonly gamificationProfilesService: GamificationProfilesService,
    private readonly trackItemsService: TrackItemsService,
    private readonly trackItemCompletionsService: TrackItemCompletionsService,
    private readonly coursesService: CoursesService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  private async hasProvenCompletion(
    courseId: string,
    profileId: string,
  ): Promise<boolean> {
    const courseCompletionItems = (
      await this.trackItemsService.findByCourseId(courseId)
    ).filter((item) => item.type === TrackItemType.COURSE_COMPLETION);

    for (const item of courseCompletionItems) {
      const completion =
        await this.trackItemCompletionsService.findByItemAndProfile(
          item.id,
          profileId,
        );
      if (completion) return true;
    }

    return false;
  }

  // Qualquer membro pode avaliar um curso VERIFIED, mesmo sem tê-lo concluído
  // formalmente numa trilha — o objetivo é ter várias avaliações reais sobre
  // o mesmo tema. provenCompletion vira uma flag informativa (não bloqueante)
  // que sinaliza avaliações de quem realmente comprovou a conclusão.
  // Concede um XP simbólico como indução a avaliar pelo menos um material.
  async create(createCourseReviewDto: CreateCourseReviewDto, userId: number) {
    const profile = await this.gamificationProfilesService.findByUserId(userId);
    if (!profile) {
      throw new UnprocessableEntityException(
        'Perfil de gamificação não encontrado.',
      );
    }

    const course = await this.coursesService.findById(
      createCourseReviewDto.courseId,
    );
    if (!course) {
      throw new NotFoundException('Curso não encontrado.');
    }
    if (course.status !== CourseStatus.VERIFIED) {
      throw new UnprocessableEntityException(
        'Só é possível avaliar cursos já verificados pela moderação.',
      );
    }

    const provenCompletion = await this.hasProvenCompletion(
      createCourseReviewDto.courseId,
      profile.id,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedEntity = await queryRunner.manager.save(
        CourseReviewEntity,
        queryRunner.manager.create(CourseReviewEntity, {
          courseId: createCourseReviewDto.courseId,
          profileId: profile.id,
          rating: createCourseReviewDto.rating,
          comment: createCourseReviewDto.comment ?? null,
          provenCompletion,
        }),
      );

      await queryRunner.manager.increment(
        GamificationProfileEntity,
        { id: profile.id },
        'totalXp',
        COURSE_REVIEW_XP_REWARD,
      );
      await queryRunner.manager.increment(
        GamificationProfileEntity,
        { id: profile.id },
        'currentMonthlyXp',
        COURSE_REVIEW_XP_REWARD,
      );
      await queryRunner.manager.increment(
        GamificationProfileEntity,
        { id: profile.id },
        'currentYearlyXp',
        COURSE_REVIEW_XP_REWARD,
      );
      await queryRunner.manager.save(TransactionEntity, {
        profile: { id: profile.id },
        category: TransactionCategoryEnum.XP_REWARD,
        amount: COURSE_REVIEW_XP_REWARD,
        description: `Avaliação de curso: ${course.title}`,
      });

      await queryRunner.commitTransaction();

      return CourseReviewMapper.toDomain(savedEntity);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.courseReviewRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findByCourseId(courseId: CourseReview['courseId']) {
    return this.courseReviewRepository.findByCourseId(courseId);
  }

  findById(id: CourseReview['id']) {
    return this.courseReviewRepository.findById(id);
  }

  findByIds(ids: CourseReview['id'][]) {
    return this.courseReviewRepository.findByIds(ids);
  }

  remove(id: CourseReview['id']) {
    return this.courseReviewRepository.remove(id);
  }
}
