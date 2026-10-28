import { SuggestedVacancy } from './domain/project-idea';
import { ProjectRole } from './domain/project-role.enum';

// Máximo de vagas sugeridas por cargo, mesmo que haja mais interessados.
const MAX_SUGGESTED: Record<ProjectRole, number> = {
  [ProjectRole.FRONTEND]: 3,
  [ProjectRole.BACKEND]: 3,
  [ProjectRole.DATABASE]: 1,
  [ProjectRole.REQUIREMENTS_ANALYST]: 1,
  [ProjectRole.UX_DESIGNER]: 1,
  [ProjectRole.QA]: 1,
  [ProjectRole.DEVOPS]: 1,
  [ProjectRole.MOBILE]: 2,
  [ProjectRole.PROJECT_MANAGER]: 1,
};

// Cargos que quase todo projeto precisa, independente do texto da ideia.
const ESSENTIAL_ROLES: ProjectRole[] = [
  ProjectRole.FRONTEND,
  ProjectRole.BACKEND,
  ProjectRole.REQUIREMENTS_ANALYST,
];

// Pistas no título/descrição/tags que sugerem um cargo a mais.
const KEYWORD_RULES: { role: ProjectRole; pattern: RegExp; reason: string }[] =
  [
    {
      role: ProjectRole.MOBILE,
      pattern: /\b(app|mobile|android|ios|flutter|react native)\b/,
      reason: 'A ideia menciona aplicativo mobile',
    },
    {
      role: ProjectRole.DATABASE,
      pattern:
        /(banco de dados|database|sql|postgres|mysql|mongo|dados|relat[óo]rio)/,
      reason: 'A ideia envolve armazenamento ou análise de dados',
    },
    {
      role: ProjectRole.UX_DESIGNER,
      pattern: /\b(design|ux|ui|interface|prot[óo]tipo|figma)\b/,
      reason: 'A ideia destaca a experiência/interface do usuário',
    },
    {
      role: ProjectRole.DEVOPS,
      pattern: /(deploy|docker|infra|ci\/cd|kubernetes|nuvem|cloud)/,
      reason: 'A ideia menciona infraestrutura ou deploy',
    },
    {
      role: ProjectRole.QA,
      pattern: /(teste|qualidade|\bqa\b)/,
      reason: 'A ideia destaca testes/qualidade',
    },
  ];

/**
 * Sugere vagas para o time a partir do interesse demonstrado por cargo e de
 * pistas no texto da ideia. A quantidade de cada cargo é o maior valor entre
 * o mínimo exigido (essencial/pista) e o número de interessados, limitado ao
 * teto do cargo.
 */
export function suggestVacancies(input: {
  text: string;
  interestByRole: Partial<Record<ProjectRole, number>>;
}): SuggestedVacancy[] {
  const text = input.text.toLowerCase();

  return Object.values(ProjectRole)
    .map((role) => {
      const interestedCount = input.interestByRole[role] ?? 0;

      let minimum = 0;
      let reason = '';
      if (ESSENTIAL_ROLES.includes(role)) {
        minimum = 1;
        reason = 'Cargo essencial para a maioria dos projetos';
      }
      const keywordRule = KEYWORD_RULES.find(
        (rule) => rule.role === role && rule.pattern.test(text),
      );
      if (keywordRule) {
        minimum = 1;
        reason = keywordRule.reason;
      }
      if (interestedCount > 0) {
        reason = `${interestedCount} ${
          interestedCount === 1 ? 'interessado' : 'interessados'
        } neste cargo`;
      }

      const quantity = Math.min(
        Math.max(minimum, interestedCount),
        MAX_SUGGESTED[role],
      );

      const suggestion = new SuggestedVacancy();
      suggestion.role = role;
      suggestion.quantity = quantity;
      suggestion.interestedCount = interestedCount;
      suggestion.reason = reason;
      return suggestion;
    })
    .filter((suggestion) => suggestion.quantity > 0);
}
