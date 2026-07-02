import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from '../../../../events/infrastructure/persistence/relational/entities/event.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { EventStatus } from '../../../../events/domain/event-status.enum';
import { EventCategory } from '../../../../events/domain/event-category.enum';
import { EventModality } from '../../../../events/domain/event-modality.enum';

const SEED_EVENTS = [
  {
    title: 'Meetup DevsTO: Introdução ao NestJS',
    description:
      'Uma noite de talks sobre arquitetura NestJS, injeção de dependências e boas práticas para APIs em produção.',
    category: EventCategory.MEETUP,
    modality: EventModality.PRESENCIAL,
    startAt: new Date('2026-08-15T22:00:00.000Z'),
    endAt: new Date('2026-08-16T00:00:00.000Z'),
    location: 'Coworking Casa Digital, Palmas/TO',
    organizerEmail: 'ana.mod@example.com',
    status: EventStatus.APPROVED,
    reviewerEmail: 'admin@example.com',
  },
  {
    title: 'Workshop Online: React Server Components na prática',
    description:
      'Workshop hands-on sobre React Server Components e como migrar apps Next.js existentes.',
    category: EventCategory.WORKSHOP,
    modality: EventModality.ONLINE,
    startAt: new Date('2026-08-22T20:00:00.000Z'),
    endAt: new Date('2026-08-22T22:00:00.000Z'),
    onlineUrl: 'https://meet.google.com/devsto-rsc-workshop',
    organizerEmail: 'carlos.mod@example.com',
    status: EventStatus.APPROVED,
    reviewerEmail: 'admin@example.com',
  },
  {
    title: 'Hackathon Tocantins Tech 2026',
    description:
      '48 horas de desenvolvimento em equipe para resolver desafios reais de impacto social no Tocantins.',
    category: EventCategory.HACKATHON,
    modality: EventModality.HIBRIDO,
    startAt: new Date('2026-09-05T13:00:00.000Z'),
    endAt: new Date('2026-09-07T13:00:00.000Z'),
    location: 'UFT - Câmpus Palmas',
    onlineUrl: 'https://meet.google.com/hackathon-to-2026',
    externalUrl: 'https://tocantinstech.dev/hackathon2026',
    organizerEmail: 'admin@example.com',
    status: EventStatus.APPROVED,
    reviewerEmail: 'admin@example.com',
  },
  {
    title: 'Palestra: Carreira em TI fora do eixo Rio-SP',
    description:
      'Bate-papo sobre como construir uma carreira sólida em tecnologia morando no Tocantins.',
    category: EventCategory.PALESTRA,
    modality: EventModality.ONLINE,
    startAt: new Date('2026-09-10T19:30:00.000Z'),
    onlineUrl: 'https://meet.google.com/carreira-ti-to',
    organizerEmail: 'john.doe@example.com',
    status: EventStatus.PENDING,
  },
  {
    title: 'Curso rápido de Docker para iniciantes',
    description:
      'Curso introdutório de Docker e Docker Compose, com exemplos práticos de containerização de APIs.',
    category: EventCategory.CURSO,
    modality: EventModality.ONLINE,
    startAt: new Date('2026-09-18T20:00:00.000Z'),
    onlineUrl: 'https://meet.google.com/curso-docker-to',
    organizerEmail: 'maria.souza@example.com',
    status: EventStatus.PENDING,
  },
  {
    title: 'Divulgação de curso pago de programação',
    description: 'Anúncio de bootcamp particular sem relação com a comunidade DevsTO.',
    category: EventCategory.OUTRO,
    modality: EventModality.ONLINE,
    startAt: new Date('2026-09-01T20:00:00.000Z'),
    onlineUrl: 'https://exemplo-bootcamp-pago.com',
    organizerEmail: 'john.doe@example.com',
    status: EventStatus.REJECTED,
    reviewerEmail: 'ana.mod@example.com',
    rejectionReason: 'Divulgação comercial fora do foco de comunidade da agenda.',
  },
];

@Injectable()
export class EventSeedService {
  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    const count = await this.eventRepository.count();
    if (count > 0) return;

    for (const seed of SEED_EVENTS) {
      const organizer = await this.userRepository.findOne({
        where: { email: seed.organizerEmail },
      });
      if (!organizer) continue;

      const reviewer = seed.reviewerEmail
        ? await this.userRepository.findOne({
            where: { email: seed.reviewerEmail },
          })
        : null;

      await this.eventRepository.save(
        this.eventRepository.create({
          title: seed.title,
          description: seed.description,
          category: seed.category,
          modality: seed.modality,
          startAt: seed.startAt,
          endAt: seed.endAt ?? null,
          location: seed.location ?? null,
          onlineUrl: seed.onlineUrl ?? null,
          externalUrl: seed.externalUrl ?? null,
          status: seed.status,
          rejectionReason: seed.rejectionReason ?? null,
          organizerId: organizer.id,
          reviewerId: reviewer?.id ?? null,
          reviewedAt: reviewer ? new Date() : null,
        }),
      );
    }
  }
}
