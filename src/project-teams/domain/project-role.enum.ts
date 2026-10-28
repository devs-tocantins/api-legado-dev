export enum ProjectRole {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  DATABASE = 'DATABASE',
  REQUIREMENTS_ANALYST = 'REQUIREMENTS_ANALYST',
  UX_DESIGNER = 'UX_DESIGNER',
  QA = 'QA',
  DEVOPS = 'DEVOPS',
  MOBILE = 'MOBILE',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
}

/** Nomes (pt-BR) usados como cargos padrão de uma ideia. */
export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  [ProjectRole.FRONTEND]: 'Front-end',
  [ProjectRole.BACKEND]: 'Back-end',
  [ProjectRole.DATABASE]: 'Banco de dados',
  [ProjectRole.REQUIREMENTS_ANALYST]: 'Analista de requisitos',
  [ProjectRole.UX_DESIGNER]: 'UX/UI Designer',
  [ProjectRole.QA]: 'QA / Testes',
  [ProjectRole.DEVOPS]: 'DevOps',
  [ProjectRole.MOBILE]: 'Mobile',
  [ProjectRole.PROJECT_MANAGER]: 'Gerente de projeto',
};
