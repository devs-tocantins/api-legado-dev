# Guia de Gestão Comunitária do GitHub 🛡️

Como Lider Técnico (Mantenedor) da organização *Devs Tocantins*, este guia serve para você configurar o repositório de forma blindada, permitindo escalar o projeto com dezenas de voluntários sem risco de "quebrarem" o código de Produção.

---

## 1. Convites e Limites da Organização 
No GitHub, uma Organização no plano gratuito **não tem limite de membros** públicos atuando em repositórios abertos. 
No entanto, a melhor prática **NÃO É** convidar todo mundo para ser "Membro Oficial" da organização.

### A Estratégia de "Fork and Pull" (O Padrão Ouro)
Você mencionou que não queria usar a tática de *Fork*, mas para projetos open-source ela é **vital pela segurança**. Se você der acesso de escrita diretamente no seu repositório para 50 juniores, as branches vão virar um caos (ex: `branch-do-pedro`, `branch-teste-mariana`).

**Como deve funcionar:**
1. O repositório oficial (`DevsTocantins/motor-engajamento`) fica intocável.
2. O voluntário clica no botão **Fork** (cria uma cópia exata do projeto no perfil pessoal dele: `joao-silva/motor-engajamento`).
3. Ele coda na cópia dele o quanto quiser, criando as branches e bagunças dele lá.
4. Quando estiver pronto, ele abre um **Pull Request (PR)** do repositório dele apontando para o seu diretório oficial.
5. Você analisa o código limpo, e só aprova o PR se for bom.

*Dica: Você só deve convidar para serem "Membros da Organização" os desenvolvedores Sêniores/Plenos de maior confiança, conferindo a eles o cargo de "Maintainers". Estes sim te ajudarão a revisar os PRs da galera.*

---

## 2. A Proteção das "Branches" de Ouro
Acesse `Settings > Branches` no seu repositório GitHub e crie **Branch Protection Rules**.

Você deverá proteger **obrigatoriamente** as seguintes branches:
*   `main` (Onde fica o código letal de Produção)
*   `develop` (A branch base onde a comunidade une as tarefas prontas para irem pra Homologação)

**Regras que você deve marcar no painel para as duas:**
- [x] **Require a pull request before merging:** Ninguém (nem você) pode fazer um `git push` direto para essas branches via terminal. Tem que ser sempre por PR.
- [x] **Require approvals:** Exigir no mínimo `1` aprovação. (Seu PR precisa do ok de um Sênior, e o do Júnior precisa do seu ok).
- [x] **Require status checks to pass before merging:** Isso força o robô do GitHub Actions a rodar o Linter e os Testes antes de liberar o botão verde de Merge.

---

## 3. Lançamento Automático de Novas Versões (CI/CD de Release)
Observe que o seu projeto já contém a ferramenta **`release-it`** configurada no `package.json`. Ela é responsável por atualizar sozina o número da versão do seu sistema (ex: `v1.0.0` para `v1.1.0`) baseando-se nas palavras-chave dos **Conventional Commits** (como `feat:` ou `fix:`).

Para que a empresa e a comunidade não precisem ficar alterando versão na mão, você vai configurar um GitHub Action (um robô) para fazer isso toda vez que um PR for aceito na branch `main`.

### O arquivo do Robô (Fluxo do Release)
*Ele já foi configurado e se encontra em `.github/workflows/release.yml`.*

A mágica dele é simples:
1. Você funde (merge) um PR na branch `main`.
2. O robô acorda. Ele checa todos os commits daquele envio.
3. Se tiver algo com `feat:` (feature nova), ele muda a versão "Minor" (ex: 1.0.0 para 1.1.0). Se tiver só `fix:` (correção), ele muda a "Patch" (ex: 1.0.0 para 1.0.1).
4. O robô automaticamente gera um arquivo genérico chamado `CHANGELOG.md` descrevendo quem fez o quê, cria a etiqueda de *Release* brilhante na página do GitHub e avisa a nuvem para atualizar o servidor.

Siga esses passos de blindagem antes de divulgar o repositório na comunidade do Discord/WhatsApp!
