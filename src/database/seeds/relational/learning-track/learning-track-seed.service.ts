import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningTrackEntity } from '../../../../learning-tracks/infrastructure/persistence/relational/entities/learning-track.entity';
import { LearningTrackTier } from '../../../../learning-tracks/domain/learning-track-tier.enum';
import { LearningTrackStatus } from '../../../../learning-tracks/domain/learning-track-status.enum';
import { TrackSectionEntity } from '../../../../track-sections/infrastructure/persistence/relational/entities/track-section.entity';
import { TrackSectionStatus } from '../../../../track-sections/domain/track-section-status.enum';
import { TrackItemEntity } from '../../../../track-items/infrastructure/persistence/relational/entities/track-item.entity';
import { TrackItemType } from '../../../../track-items/domain/track-item-type.enum';
import { TrackItemStatus } from '../../../../track-items/domain/track-item-status.enum';

interface SeedItem {
  type: TrackItemType;
  title: string;
  body?: string;
  journeyXp: number;
  allowsTestOut?: boolean;
  config?: Record<string, unknown>;
}

interface SeedSection {
  title: string;
  description: string;
  items: SeedItem[];
}

const BACKEND_INICIAL_SECTIONS: SeedSection[] = [
  {
    title: 'Ambiente & Git',
    description:
      'Configure seu ambiente de desenvolvimento e aprenda a versionar código.',
    items: [
      {
        type: TrackItemType.RESOURCE,
        title: 'Git na prática: commits, branches e pull requests',
        body: 'Leia o guia oficial do Git e entenda o fluxo básico de versionamento.',
        journeyXp: 10,
      },
      {
        type: TrackItemType.PROOF,
        title: 'Versione seu primeiro repositório no GitHub',
        journeyXp: 40,
        allowsTestOut: true,
        config: {
          criteria: [
            'Repositório público no GitHub com ao menos 3 commits',
            'README explicando o que o projeto faz',
            'Histórico de commits com mensagens descritivas',
          ],
        },
      },
    ],
  },
  {
    title: 'HTTP e REST',
    description:
      'Entenda como a web se comunica e os princípios de uma API REST.',
    items: [
      {
        type: TrackItemType.RESOURCE,
        title: 'HTTP: métodos, status codes e headers',
        body: 'Artigo introdutório sobre o protocolo HTTP e como ele sustenta a web.',
        journeyXp: 10,
      },
      {
        type: TrackItemType.CHECKPOINT,
        title: 'Quiz: fundamentos de HTTP e REST',
        journeyXp: 20,
        allowsTestOut: true,
        config: {
          questions: [
            {
              question: 'Qual método HTTP é usado para criar um novo recurso?',
              options: ['GET', 'POST', 'DELETE', 'HEAD'],
              correctIndex: 1,
            },
            {
              question:
                'Qual status code indica sucesso na criação de um recurso?',
              options: ['200', '201', '301', '404'],
              correctIndex: 1,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Primeira API',
    description: 'Suba sua primeira API REST com CRUD completo.',
    items: [
      {
        type: TrackItemType.RESOURCE,
        title: 'Construindo uma API REST do zero',
        body: 'Tutorial guiado para subir uma API com rotas de CRUD.',
        journeyXp: 10,
      },
      {
        type: TrackItemType.PROOF,
        title: 'Suba uma API REST com CRUD em produção',
        journeyXp: 60,
        allowsTestOut: true,
        config: {
          criteria: [
            'API com rotas de criar, listar, atualizar e remover um recurso',
            'Deploy acessível publicamente (link funcional)',
            'Repositório com instruções de como rodar o projeto',
          ],
        },
      },
    ],
  },
  {
    title: 'Banco de dados',
    description:
      'Modele dados relacionais e conecte sua API a um banco de verdade.',
    items: [
      {
        type: TrackItemType.RESOURCE,
        title: 'Bancos relacionais na prática',
        body: 'Como transformar um domínio de negócio em tabelas, chaves e relacionamentos.',
        journeyXp: 10,
      },
      {
        type: TrackItemType.PROOF,
        title: 'Modele e versione um schema no GitHub',
        journeyXp: 60,
        allowsTestOut: true,
        config: {
          criteria: [
            'Ao menos 4 tabelas relacionadas com chaves estrangeiras coerentes',
            'Migrations versionadas, uma por alteração',
            'README explicando as decisões de modelagem',
          ],
        },
      },
    ],
  },
];

@Injectable()
export class LearningTrackSeedService {
  constructor(
    @InjectRepository(LearningTrackEntity)
    private readonly trackRepository: Repository<LearningTrackEntity>,
    @InjectRepository(TrackSectionEntity)
    private readonly sectionRepository: Repository<TrackSectionEntity>,
    @InjectRepository(TrackItemEntity)
    private readonly itemRepository: Repository<TrackItemEntity>,
  ) {}

  async run() {
    const existing = await this.trackRepository.findOne({
      where: { slug: 'backend-inicial' },
    });
    if (existing) return;

    const track = await this.trackRepository.save(
      this.trackRepository.create({
        slug: 'backend-inicial',
        title: 'Backend inicial',
        description:
          'Vá do zero até provar que sabe subir uma API REST com banco de dados em produção.',
        area: 'backend',
        tier: LearningTrackTier.ALICERCE,
        status: LearningTrackStatus.PUBLISHED,
        requiresTrackId: null,
      }),
    );

    for (let s = 0; s < BACKEND_INICIAL_SECTIONS.length; s++) {
      const seedSection = BACKEND_INICIAL_SECTIONS[s];
      const section = await this.sectionRepository.save(
        this.sectionRepository.create({
          trackId: track.id,
          title: seedSection.title,
          description: seedSection.description,
          position: (s + 1) * 10,
          status: TrackSectionStatus.ACTIVE,
          badgeId: null,
        }),
      );

      for (let i = 0; i < seedSection.items.length; i++) {
        const seedItem = seedSection.items[i];
        await this.itemRepository.save(
          this.itemRepository.create({
            trackId: track.id,
            sectionId: section.id,
            type: seedItem.type,
            title: seedItem.title,
            body: seedItem.body ?? null,
            position: (i + 1) * 10,
            status: TrackItemStatus.ACTIVE,
            isOptional: false,
            allowsTestOut: seedItem.allowsTestOut ?? false,
            journeyXp: seedItem.journeyXp,
            grantsCommunityXp: false,
            activityId: null,
            missionId: null,
            courseId: null,
            config: seedItem.config ?? null,
          }),
        );
      }
    }
  }
}
