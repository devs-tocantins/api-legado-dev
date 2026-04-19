import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionEntity } from '../../../../missions/infrastructure/persistence/relational/entities/mission.entity';
import { MissionStatus } from '../../../../missions/domain/mission-status.enum';

// ─── Badge art specification (embedded in every mission description) ──────────
const BADGE_SPEC = `
**Especificações técnicas obrigatórias do arquivo:**
- **Formato:** PNG com fundo transparente ou SVG
- **Dimensão:** 512×512 px (exibido em 48×48 px circular na plataforma)
- **Shape:** arte deve ser pensada em formato circular — elementos centrais, sem informações nas bordas
- **Estilo:** flat design / ícone vetorial, sem gradientes complexos
- **Paleta:** livre, mas coerente com o estilo da plataforma (fundo escuro com ícone colorido ou fundo colorido com ícone branco)
- **Entrega:** link público para o arquivo (Figma, Google Drive, Imgur, etc.)
`.trim();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
const POSITION_LABEL = ['1º Lugar', '2º Lugar', '3º Lugar'];

function mission(title: string, description: string, xpReward = 200) {
  return {
    title,
    description: `${description}\n\n${BADGE_SPEC}`,
    requirements: null,
    xpReward,
    status: MissionStatus.OPEN,
    winnerId: null,
    isSecret: false,
  };
}

// ─── Mission definitions ──────────────────────────────────────────────────────

function buildMissions() {
  const missions: ReturnType<typeof mission>[] = [];

  // ── MILESTONE: Nível por XP ────────────────────────────────────────────────
  missions.push(
    mission(
      'Arte do Badge: Contribuidor',
      'Crie a arte para o badge **Contribuidor** — concedido automaticamente a quem atinge 100 XP na plataforma.\n\n**Conceito:** representa o primeiro marco de XP. Transmite o início de uma jornada, energia de quem está começando a contribuir. Cor sugerida: verde (emerald).',
    ),
  );

  missions.push(
    mission(
      'Arte do Badge: Colaborador Ativo',
      'Crie a arte para o badge **Colaborador Ativo** — concedido a quem atinge 500 XP.\n\n**Conceito:** representa consistência e presença ativa. Alguém que já colou de verdade. Cor sugerida: azul claro (sky).',
    ),
  );

  missions.push(
    mission(
      'Arte do Badge: Referência',
      'Crie a arte para o badge **Referência** — concedido a quem atinge 1.500 XP.\n\n**Conceito:** alguém que já é ponto de referência na comunidade. Transmite autoridade, confiança. Cor sugerida: azul (blue). Pode usar elementos como estrela ou símbolo de destaque.',
    ),
  );

  missions.push(
    mission(
      'Arte do Badge: Mentor',
      'Crie a arte para o badge **Mentor** — concedido a quem atinge 4.000 XP.\n\n**Conceito:** alguém que guia outros, transmite conhecimento. Elemento visual: chama/tocha, mão estendida, ou símbolo de ensinamento. Cor sugerida: âmbar/dourado.',
    ),
  );

  missions.push(
    mission(
      'Arte do Badge: Lenda',
      'Crie a arte para o badge **Lenda** — concedido a quem atinge 10.000 XP. O nível mais alto da plataforma.\n\n**Conceito:** rare, imponente, histórico. Arte deve transmitir algo épico e atemporal. Cor sugerida: rosa/vermelho vibrante. Elemento: coroa, medalha, ou símbolo de legado.',
      300,
    ),
  );

  // ── MILESTONE: Por submissões ──────────────────────────────────────────────
  missions.push(
    mission(
      'Arte do Badge: Primeira Missão',
      'Crie a arte para o badge **Primeira Missão** — concedido na primeira submissão aprovada.\n\n**Conceito:** momento de estreia, o "clique" inicial. Transmite começo, descoberta. Sugestão: porta se abrindo, chave, ou símbolo de início.',
    ),
  );

  missions.push(
    mission(
      'Arte do Badge: Colaborador',
      'Crie a arte para o badge **Colaborador** — concedido ao atingir 5 submissões aprovadas.\n\n**Conceito:** trabalho em equipe, contribuição recorrente. Sugestão: mãos se encontrando, peças de quebra-cabeça, ou símbolo de cooperação.',
    ),
  );

  missions.push(
    mission(
      'Arte do Badge: Herói da Comunidade',
      'Crie a arte para o badge **Herói da Comunidade** — concedido ao atingir 20 submissões aprovadas.\n\n**Conceito:** herói, campeão, alguém que vai além. Sugestão: escudo, capa, ou símbolo de proteção/força.',
    ),
  );

  // ── MILESTONE: Por tokens enviados ────────────────────────────────────────
  missions.push(
    mission(
      'Arte do Badge: Grato',
      'Crie a arte para o badge **Grato** — concedido a quem envia 5 Pontos de Reconhecimento.\n\n**Conceito:** gratidão, reconhecimento genuíno. Sugestão: coração, aperto de mão, ou símbolo de agradecimento. Tons quentes.',
    ),
  );

  missions.push(
    mission(
      'Arte do Badge: Generoso',
      'Crie a arte para o badge **Generoso** — concedido a quem envia 20 Pontos de Reconhecimento.\n\n**Conceito:** generosidade abundante. Sugestão: mãos espalhando algo, presente, ou símbolo de doação. Tons dourados/quentes.',
    ),
  );

  // ── PARTICIPATION ──────────────────────────────────────────────────────────
  missions.push(
    mission(
      'Arte do Badge: Membro Fundador',
      'Crie a arte para o badge **Membro Fundador** — concedido após 1 mês de participação.\n\n**Conceito:** alguém que acreditou desde o início. Pode ter elementos de fundação, pedra fundamental, ou semente. Transmite pertencimento e início.',
    ),
  );

  missions.push(
    mission(
      'Arte do Badge: Veterano',
      'Crie a arte para o badge **Veterano** — concedido após 3 meses de participação.\n\n**Conceito:** já tem história aqui, conhece a comunidade. Sugestão: escudo com listras, insígnia militar estilizada, ou símbolo de permanência.',
    ),
  );

  missions.push(
    mission(
      'Arte do Badge: Ancião',
      'Crie a arte para o badge **Ancião** — concedido após 6 meses de participação.\n\n**Conceito:** sabedoria, maturidade, raízes. Sugestão: árvore com raízes profundas, relógio de areia, ou símbolo de tempo.',
    ),
  );

  missions.push(
    mission(
      'Arte do Badge: Pilar da Comunidade',
      'Crie a arte para o badge **Pilar da Comunidade** — concedido após 1 ano de participação.\n\n**Conceito:** sustenta, suporta, é essencial. Sugestão: coluna, pilar arquitetônico estilizado, ou símbolo de solidez. Arte mais elaborada — é o badge de maior longevidade.',
      250,
    ),
  );

  // ── RANKING MENSAL 2026 ────────────────────────────────────────────────────
  const REMAINING_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  const POSITION_EMOJI = ['🥇', '🥈', '🥉'];
  const POSITION_ELEMENT = [
    'ouro — dourado brilhante, símbolo de primeiro lugar absoluto',
    'prata — tons prateados, símbolo de segunda posição',
    'bronze — tons de cobre/bronze, símbolo de terceira posição',
  ];

  for (const month of REMAINING_MONTHS) {
    for (let pos = 1; pos <= 3; pos++) {
      missions.push(
        mission(
          `Arte do Badge: ${POSITION_EMOJI[pos - 1]} Ranking ${MONTHS_PT[month - 1]} 2026 — ${POSITION_LABEL[pos - 1]}`,
          `Crie a arte para o badge **${POSITION_LABEL[pos - 1]} do Ranking Mensal de ${MONTHS_PT[month - 1]} de 2026** — concedido automaticamente pelo cron no último dia do mês ao ${pos}º colocado em XP mensal.\n\n**Conceito:** ${POSITION_ELEMENT[pos - 1]}. Deve conter visualmente o mês "${MONTHS_PT[month - 1]}" ou abreviação e o número "${pos}º". Pode ser uma medalha circular com o mês e posição integrados na arte.`,
        ),
      );
    }
  }

  // ── RANKING ANUAL 2026 ─────────────────────────────────────────────────────
  for (let pos = 1; pos <= 3; pos++) {
    missions.push(
      mission(
        `Arte do Badge: ${POSITION_EMOJI[pos - 1]} Ranking Anual 2026 — ${POSITION_LABEL[pos - 1]}`,
        `Crie a arte para o badge **${POSITION_LABEL[pos - 1]} do Ranking Anual de 2026** — concedido ao ${pos}º colocado em XP acumulado no ano de 2026.\n\n**Conceito:** ${POSITION_ELEMENT[pos - 1]}, com peso e raridade de troféu anual. Arte mais elaborada que os mensais — deve transmitir grandiosidade. Deve conter "2026" e "${pos}º" visíveis na arte.`,
        300,
      ),
    );
  }

  // ── ESPECIAIS ─────────────────────────────────────────────────────────────
  missions.push(
    mission(
      'Arte do Badge: Destaque do Mês',
      'Crie a arte para o badge **Destaque do Mês** — concedido manualmente pelo admin ao membro mais destacado de cada mês.\n\n**Conceito:** estrela, spotlight, reconhecimento especial. Deve transmitir admiração e distinção. Elementos: estrela, holofote, coroa sutil. Tons: dourados, âmbar.',
    ),
  );

  missions.push(
    mission(
      'Arte do Badge: Organizador',
      'Crie a arte para o badge **Organizador** — concedido manualmente a quem organiza eventos ou iniciativas da comunidade.\n\n**Conceito:** liderança, organização, mobilização. Sugestão: símbolo de megafone, agenda, ou pessoas em círculo. Tons: azul ou verde.',
    ),
  );

  return missions;
}

// ─── Seed service ─────────────────────────────────────────────────────────────

@Injectable()
export class MissionSeedService {
  constructor(
    @InjectRepository(MissionEntity)
    private readonly repository: Repository<MissionEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();
    if (count > 0) return;

    const missions = buildMissions();
    await this.repository.save(missions.map((m) => this.repository.create(m)));
  }
}
