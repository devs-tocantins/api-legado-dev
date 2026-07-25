# api-engajamento — guia para agentes de IA (Gemini CLI)

Backend NestJS + TypeORM + Postgres (Neon), deploy automático via GitHub Actions
pra uma VM Oracle. Repo remoto real: `devs-tocantins/api-legado-dev` (o remote
`origin` local ainda aponta pra `api-engajamento`, o GitHub redireciona).

## Antes de mexer em qualquer coisa

- **`.env`/`.env.prod` locais apontam pro Neon/R2 de PRODUÇÃO de verdade.**
  Rodar o servidor local (`npm run start:dev`) é seguro pra LEITURA. Nunca rode
  uma migration, um comando destrutivo, ou qualquer escrita gerada por você
  sem confirmar com o usuário antes — não existe banco de teste separado aqui.
- CRLF/autocrlf: arquivos no working tree às vezes aparecem como "modified"
  por causa de `core.autocrlf=true` no Windows, sem diff real nenhum (`git diff`
  mostra warning de CRLF mas zero conteúdo mudado). Antes de commitar, rode
  `npx eslint "{src,apps,libs,test}/**/*.ts" --fix` pra normalizar — senão o
  hook de pre-commit (que roda lint no repo INTEIRO) falha com centenas de
  erros de formatação que não têm nada a ver com sua mudança.

## Branch `main` é protegida — nada de push direto

`git push origin main` é rejeitado (`GH013: Repository rule violations`).
Fluxo obrigatório:

```
git checkout -b fix/nome-descritivo
# ... mudanças ...
git add <arquivos específicos>   # nunca `git add -A`/`git add .` sem checar antes
git commit -m "..."
git push -u origin fix/nome-descritivo
gh pr create --title "..." --body "..."
```

Depois espere a CI (workflow "NestJS API CI", job `build` + "SonarCloud Code
Analysis") ficar verde:

```
gh pr checks <numero-do-pr>
```

Só então mescle:

```
gh pr merge <numero-do-pr> --merge --delete-branch
```

**Nunca faça `git push --force`, `git reset --hard`, ou pule hooks
(`--no-verify`) sem autorização explícita do usuário no chat.**

## O que acontece depois do merge (deploy automático)

Merge em `main` dispara o job `deploy` (`.github/workflows/docker-e2e.yml`):
builda a imagem Docker, manda via `rsync` pra VM Oracle (`136.248.75.34`), faz
`docker compose down && up -d` lá dentro, e checa `https://136.248.75.34.nip.io/healthz`.

- O job `deploy` tem um `concurrency: group: production-deploy, cancel-in-progress: false`
  (adicionado em 2026-07 pra evitar dois deploys simultâneos brigando pela
  mesma VM — se dois merges acontecerem em sequência rápida, o segundo
  deploy ENFILEIRA, não roda em paralelo).
- Pra checar se a API está no ar agora, sem precisar SSH: `curl -sk https://136.248.75.34.nip.io/healthz` → deve responder `{"status":"ok"}`.
- Pra ver o histórico de runs: `gh run list --branch main --limit 10`.
- Pra investigar uma falha: `gh run view <run-id> --log-failed`.

## Testes e lint

```
npm run lint    # eslint em src/apps/libs/test
npm run test    # jest, 160+ specs
```

Ambos rodam automaticamente no `build` job da CI e no hook de pre-commit local
(husky) — não pule.

## Se te pedirem pra "corrigir" algo sozinho

1. Diagnostique a causa raiz antes de mexer (não aplique patch sem entender
   o porquê — ver histórico de commits/PRs recentes com `gh pr list --state all`
   e `git log` costuma dar contexto).
2. Faça a menor mudança que resolve, sem refatorações não pedidas.
3. Rode lint + test localmente antes de commitar.
4. Siga o fluxo de branch/PR acima — nunca commite direto em `main`.
5. Depois de abrir o PR, espere a CI e reporte o resultado (verde ou o que
   falhou) antes de mesclar sozinho, a menos que o usuário já tenha
   autorizado merge solo sem revisão humana (isso já foi autorizado
   anteriormente nesta equipe, mas espere a CI mesmo assim).
