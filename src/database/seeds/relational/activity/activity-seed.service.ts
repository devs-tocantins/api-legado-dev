import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEntity } from '../../../../activities/infrastructure/persistence/relational/entities/activity.entity';

const SEED_ACTIVITIES = [
  {
    title: 'Contribuição de Código',
    description:
      'Abra um Pull Request em qualquer repositório da organização Devs Tocantins e tenha-o aprovado e mergeado.',
    fixedReward: 100,
    isHidden: false,
    secretCode: null,
    requiresProof: true,
    cooldownHours: 24,
  },
  {
    title: 'Participação em Evento',
    description:
      'Participe de um evento, meetup ou hackathon organizado pela comunidade Devs Tocantins.',
    fixedReward: 75,
    isHidden: false,
    secretCode: null,
    requiresProof: true,
    cooldownHours: 168, // 7 dias
  },
  {
    title: 'Resposta Técnica no Fórum',
    description:
      'Responda uma dúvida técnica no canal do Discord ou fórum da comunidade de forma clara e detalhada.',
    fixedReward: 30,
    isHidden: false,
    secretCode: null,
    requiresProof: false,
    cooldownHours: 12,
  },
  {
    title: 'Publicação de Artigo',
    description:
      'Escreva e publique um artigo técnico referenciando a comunidade Devs Tocantins (blog, Dev.to, Medium, etc.).',
    fixedReward: 150,
    isHidden: false,
    secretCode: null,
    requiresProof: true,
    cooldownHours: 72,
  },
  {
    title: 'Indicação de Membro',
    description:
      'Indique um novo desenvolvedor para a comunidade. O novo membro deve se cadastrar e completar o perfil.',
    fixedReward: 50,
    isHidden: false,
    secretCode: null,
    requiresProof: false,
    cooldownHours: 0,
  },
];

@Injectable()
export class ActivitySeedService {
  constructor(
    @InjectRepository(ActivityEntity)
    private repository: Repository<ActivityEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();
    if (count > 0) return;

    await this.repository.save(
      SEED_ACTIVITIES.map((activity) => this.repository.create(activity)),
    );
  }
}
