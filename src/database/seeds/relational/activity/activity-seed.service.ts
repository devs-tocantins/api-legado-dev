import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEntity } from '../../../../activities/infrastructure/persistence/relational/entities/activity.entity';

const SEED_ACTIVITIES = [
  {
    title: 'Contribuição de Código — Resolver uma Issue',
    description:
      'Resolva uma issue aberta no repositório da organização Devs Tocantins no GitHub. ' +
      'A issue deve estar listada em um dos repositórios oficiais (github.com/devs-tocantins) e ter sido criada antes da sua submissão. ' +
      'O Pull Request deve referenciar a issue resolvida (ex: "Closes #42") e ser aprovado e mergeado pelos mantenedores.\n\n' +
      '**Como comprovar:** envie o link do PR mergeado.',
    fixedReward: 100,
    isHidden: false,
    secretCode: null,
    requiresProof: true,
    cooldownHours: 24,
  },
  {
    title: 'Reporte de Bug ou Melhoria — legado.dev',
    description:
      'Encontrou um bug ou tem uma sugestão de melhoria para a plataforma legado.dev? Abra uma issue no repositório oficial seguindo o template padrão.\n\n' +
      '**Template obrigatório para Bug Report:**\n' +
      '```\n' +
      '## Descrição do Bug\n' +
      'Descreva claramente o que está acontecendo.\n\n' +
      '## Como Reproduzir\n' +
      '1. Vá para...\n' +
      '2. Clique em...\n' +
      '3. Veja o erro\n\n' +
      '## Comportamento Esperado\n' +
      'O que deveria acontecer.\n\n' +
      '## Screenshots / Evidências\n' +
      'Se aplicável, adicione capturas de tela.\n\n' +
      '## Ambiente\n' +
      '- Navegador:\n' +
      '- Sistema Operacional:\n' +
      '```\n\n' +
      '**Template obrigatório para Feature Request / Melhoria:**\n' +
      '```\n' +
      '## Problema que resolve\n' +
      'Descreva o problema que esta funcionalidade resolveria.\n\n' +
      '## Solução proposta\n' +
      'Descreva como você imagina que deveria funcionar.\n\n' +
      '## Alternativas consideradas\n' +
      'Existe outra forma de resolver? Por que esta é melhor?\n' +
      '```\n\n' +
      'Issues que não seguirem o template serão fechadas sem pontuação. ' +
      'A issue deve ser aceita (label "accepted" ou comentário de aprovação de um mantenedor) para ser pontuada.\n\n' +
      '**Como comprovar:** envie o link da issue aberta no GitHub.',
    fixedReward: 50,
    isHidden: false,
    secretCode: null,
    requiresProof: true,
    cooldownHours: 0,
  },
  {
    title: 'Participação em Evento',
    description:
      'Participe de um evento, meetup ou hackathon organizado pela comunidade Devs Tocantins.',
    fixedReward: 75,
    isHidden: false,
    secretCode: null,
    requiresProof: true,
    cooldownHours: 168,
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
