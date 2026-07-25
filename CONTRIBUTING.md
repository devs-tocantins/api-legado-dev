# Guia de Contribuição - legado.dev 🚀

Obrigado pelo seu interesse em contribuir para o **legado.dev - Devs Tocantins**! Siga as diretrizes abaixo para garantir que seu código seja aceito sem atritos e mantenha a qualidade do projeto.

---

## 1. Regras de Ouro e Boas Práticas

- **O Código deve ser em Inglês:** Manteremos o padrão do ecossistema NestJS. Variáveis, funções, pastas, entidades e _commits_ devem ser descritos em inglês. **Documentações e comentários** (como o README, dicas em JSDoc) podem ser em Português-BR para facilitar o entendimento.
- **Evite lógica solta no Controller:** Toda regra pesada de gamificação, validação e manipulação de pontuação deve residir estritamente nos `Services`.
- **Validação Restrita (Pipes DTOs):** Nunca confie na entrada do Frontend. Valide absolutamente todas as propriedades usando anotações de tipagem (`@IsString()`, `@IsNumber()`, etc.) da biblioteca `class-validator` nas DTOs.
- **DRY e Single Responsibility:** Evite duplicação de códigos usando Módulos separados e compartilháveis. Um Repositório (TypeORM Repository) não deve ter métodos genéricos de múltiplos propósitos (vide Documentação de Arquitetura em `docs/architecture.md`).

---

## 2. Qualidade e CI (Integração Contínua)

O projeto contém esteiras rigorosas de qualidade baseadas em _Hooks_ do Git (`husky` / `lint-staged`) e fluxos do GitHub Actions.
Se você não passar nas regras abaixo, o commit ou o Pull Request será bloqueado.

### Linter e Formatação
Usamos o **ESLint** e **Prettier**.
Antes de enviar seu código, reformate ativamente suas mudanças. Se quiser testar o que a ferramenta acusa, rode:
```bash
npm run lint
npm run format
```

### Regras de Commit (Commitlint)
Nossas mensagens de Commit são prefixadas seguindo o modelo **Conventional Commits**. Assim nosso CHANGELOG é construído automaticamente! 
Formatos válidos:
- `feat: adicionado módulo de recompensas` (Para features novas)
- `fix: corrigido o timeout em transferências p2p` (Para correções de bugs)
- `chore: atualizada a biblioteca aws-sdk` (Para manutenções de background ou tarefas burocráticas)
- `refactor: mudou a ordem de validação de cooldown` (Refatoração de código sem mudar a funcionalidade final)
- `test: adicionados testes e2e pro controller de usuários` (Apenas relacionado a testes)
- `docs: atualizado guia de contribuição` (Apenas arquivos .md)

_Observação:_ O sistema impedirá automaticamente que você complete um `git commit` caso não comece a frase com o prefixo apropriado.

---

## 3. Fluxo de Git Básico (Git Flow Simplificado)

1. Faça o fork ou branch a partir da `main`.
2. Crie uma branch descritiva contendo o prefixo e o nome do que fará: `feat/ranking-mensal` ou `fix/badge-bug`.
3. Garanta que todas as baterias de testes passem localmente executando `npm run test` e `npm run test:e2e:relational:docker`.
4. Abra um **Pull Request** claro detalhando visualmente (com prints / vídeos se for endpoint via Postman/Swagger) o que foi alcançado ou fixado.

---

## 4. Setup Local Expresso (Para Desenvolvedores Locais)

Lembre-se da ordem oficial para subir sua máquina com tudo operante:

1. `cp env-example-relational .env`
2. `docker compose up -d postgres adminer maildev`
3. `npm run app:config` (Uma vez)
4. `npm run migration:run`
5. `npm run seed:run:relational` (Gera perfis fakes pro Banco/Admin)
6. `npm run start:dev`

Se o banco conflitar porque você quebrou algo e precisa reiniciar limpo, você pode dropar o sistema num clique rodando `npm run schema:drop` seguido de `npm run migration:run` novamente.

Qualquer dúvida técnica aprofundada, leia os guias da pasta `docs/`! Estamos felizes em ter sua ajuda!
