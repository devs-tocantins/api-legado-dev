import { ProjectRole } from './domain/project-role.enum';
import { suggestVacancies } from './vacancy-suggestions';

const quantityOf = (
  suggestions: ReturnType<typeof suggestVacancies>,
  role: ProjectRole,
) => suggestions.find((s) => s.role === role)?.quantity ?? 0;

describe('suggestVacancies', () => {
  it('should sugerir ao menos os cargos essenciais mesmo sem interessados', () => {
    const result = suggestVacancies({
      text: 'um site simples',
      interestByRole: {},
    });

    expect(quantityOf(result, ProjectRole.FRONTEND)).toBe(1);
    expect(quantityOf(result, ProjectRole.BACKEND)).toBe(1);
    expect(quantityOf(result, ProjectRole.REQUIREMENTS_ANALYST)).toBe(1);
    expect(quantityOf(result, ProjectRole.DATABASE)).toBe(0);
  });

  it('should usar o número de interessados, respeitando o teto do cargo', () => {
    const result = suggestVacancies({
      text: '',
      interestByRole: {
        [ProjectRole.FRONTEND]: 2,
        [ProjectRole.BACKEND]: 9,
      },
    });

    expect(quantityOf(result, ProjectRole.FRONTEND)).toBe(2);
    expect(quantityOf(result, ProjectRole.BACKEND)).toBe(3);
  });

  it('should incluir cargos que só têm interessados', () => {
    const result = suggestVacancies({
      text: '',
      interestByRole: { [ProjectRole.QA]: 1 },
    });

    expect(quantityOf(result, ProjectRole.QA)).toBe(1);
  });

  it('should adicionar cargos a partir de palavras-chave da ideia', () => {
    const result = suggestVacancies({
      text: 'Aplicativo mobile com banco de dados e deploy em docker',
      interestByRole: {},
    });

    expect(quantityOf(result, ProjectRole.MOBILE)).toBe(1);
    expect(quantityOf(result, ProjectRole.DATABASE)).toBe(1);
    expect(quantityOf(result, ProjectRole.DEVOPS)).toBe(1);
  });
});
