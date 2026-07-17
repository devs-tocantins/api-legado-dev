import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLearningTrackDto } from './dto/create-learning-track.dto';
import { UpdateLearningTrackDto } from './dto/update-learning-track.dto';
import { LearningTrackRepository } from './infrastructure/persistence/learning-track.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { LearningTrack } from './domain/learning-track';
import { LearningTrackStatus } from './domain/learning-track-status.enum';
import { TrackSectionsService } from '../track-sections/track-sections.service';
import { TrackSectionStatus } from '../track-sections/domain/track-section-status.enum';
import { TrackItemsService } from '../track-items/track-items.service';
import { TrackItemStatus } from '../track-items/domain/track-item-status.enum';
import { TrackEnrollmentsService } from '../track-enrollments/track-enrollments.service';
import { TrackItemCompletionsService } from '../track-item-completions/track-item-completions.service';
import { GamificationProfilesService } from '../gamification-profiles/gamification-profiles.service';

@Injectable()
export class LearningTracksService {
  constructor(
    private readonly learningTrackRepository: LearningTrackRepository,
    private readonly trackSectionsService: TrackSectionsService,
    private readonly trackItemsService: TrackItemsService,
    private readonly trackEnrollmentsService: TrackEnrollmentsService,
    private readonly trackItemCompletionsService: TrackItemCompletionsService,
    private readonly gamificationProfilesService: GamificationProfilesService,
  ) {}

  create(createLearningTrackDto: CreateLearningTrackDto) {
    return this.learningTrackRepository.create({
      slug: createLearningTrackDto.slug,
      title: createLearningTrackDto.title,
      description: createLearningTrackDto.description ?? null,
      area: createLearningTrackDto.area,
      tier: createLearningTrackDto.tier,
      status: createLearningTrackDto.status ?? LearningTrackStatus.DRAFT,
      requiresTrackId: createLearningTrackDto.requiresTrackId ?? null,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.learningTrackRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: LearningTrack['id']) {
    return this.learningTrackRepository.findById(id);
  }

  findByIds(ids: LearningTrack['id'][]) {
    return this.learningTrackRepository.findByIds(ids);
  }

  findBySlug(slug: LearningTrack['slug']) {
    return this.learningTrackRepository.findBySlug(slug);
  }

  update(
    id: LearningTrack['id'],
    updateLearningTrackDto: UpdateLearningTrackDto,
  ) {
    return this.learningTrackRepository.update(id, {
      ...(updateLearningTrackDto.slug !== undefined && {
        slug: updateLearningTrackDto.slug,
      }),
      ...(updateLearningTrackDto.title !== undefined && {
        title: updateLearningTrackDto.title,
      }),
      ...(updateLearningTrackDto.description !== undefined && {
        description: updateLearningTrackDto.description,
      }),
      ...(updateLearningTrackDto.area !== undefined && {
        area: updateLearningTrackDto.area,
      }),
      ...(updateLearningTrackDto.tier !== undefined && {
        tier: updateLearningTrackDto.tier,
      }),
      ...(updateLearningTrackDto.status !== undefined && {
        status: updateLearningTrackDto.status,
      }),
      ...(updateLearningTrackDto.requiresTrackId !== undefined && {
        requiresTrackId: updateLearningTrackDto.requiresTrackId,
      }),
    });
  }

  remove(id: LearningTrack['id']) {
    return this.learningTrackRepository.remove(id);
  }

  // Etapas e marcos ativos, ordenados (section.position, depois item.position),
  // no formato que a tela "Dentro da trilha" consome de uma vez só.
  async getOverview(id: LearningTrack['id']) {
    const track = await this.learningTrackRepository.findById(id);
    if (!track) {
      throw new NotFoundException('Trilha não encontrada.');
    }

    const [allSections, allItems] = await Promise.all([
      this.trackSectionsService.findByTrackId(id),
      this.trackItemsService.findByTrackId(id),
    ]);

    const activeSections = allSections.filter(
      (section) => section.status === TrackSectionStatus.ACTIVE,
    );
    const activeItemsBySection = new Map<
      string,
      ReturnType<typeof allItems.filter>
    >();
    for (const item of allItems) {
      if (item.status !== TrackItemStatus.ACTIVE) continue;
      const list = activeItemsBySection.get(item.sectionId) ?? [];
      list.push(item);
      activeItemsBySection.set(item.sectionId, list);
    }

    return {
      track,
      sections: activeSections.map((section) => ({
        section,
        items: activeItemsBySection.get(section.id) ?? [],
      })),
    };
  }

  // Posição atual do usuário na trilha: o primeiro item ativo (na ordem de
  // etapa/posição) que ele ainda não concluiu. Editar/arquivar/inserir itens
  // nunca corrompe isso, pois é derivado a cada chamada — nunca armazenado.
  async getProgress(id: LearningTrack['id'], userId: number) {
    const profile = await this.gamificationProfilesService.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil de gamificação não encontrado.');
    }

    const [enrollment, overview, completions] = await Promise.all([
      this.trackEnrollmentsService.findByTrackAndProfile(id, profile.id),
      this.getOverview(id),
      this.trackItemCompletionsService.findByProfileId(profile.id),
    ]);

    const completedItemIds = new Set(completions.map((c) => c.itemId));

    let currentItemId: string | null = null;
    let currentSectionId: string | null = null;
    outer: for (const { section, items } of overview.sections) {
      for (const item of items) {
        if (!completedItemIds.has(item.id)) {
          currentItemId = item.id;
          currentSectionId = section.id;
          break outer;
        }
      }
    }

    return {
      enrollment,
      currentSectionId,
      currentItemId,
      isCompleted: currentItemId === null,
    };
  }
}
