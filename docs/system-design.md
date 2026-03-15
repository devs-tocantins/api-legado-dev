# System Design - Motor de Engajamento Devs Tocantins ☁️

Este documento detalha a arquitetura de Nuvem e Infraestrutura necessária para hospedar, testar e evoluir o Motor de Engajamento. O foco aqui é **Custo-Zero (ou hiper-otimizado)**, permitindo que a comunidade contribua sem que a liderança precise desembolsar milhares de reais mensais mantendo o sistema no ar.

---

## 🏗️ 1. Arquitetura de Ambientes (Staging vs Produção)

Para um projeto open source onde centenas de pessoas enviarão códigos (Pull Requests), é proibido mandar um código novo direto para Produção. 
Nossa infraestrutura será dividida em **3 Camadas Isoladas**:

### 1. Ambiente Local (Development)
*   **Onde Fica:** Na máquina (computador) de cada Desenvolvedor da comunidade.
*   **Como Roda:** Totalmente operado via `docker compose up -d` (usando PostgreSQL local, Maildev local, Memória da máquina local e o MinIO simulando AWS S3).
*   **Custo:** R$ 0,00.

### 2. Ambiente de Homologação (Staging / Testes)
*   **Onde Fica:** Em um servidor em Nuvem de baixo custo.
*   **Papel Principal:** Funcionar como um "Espelho" da Produção com a versão do código mais recente da branch `develop`.
*   **Quem Usa:** Você (Mantenedor) e os Seniores da comunidade usam este ambiente (URL web e chamadas API reais) para bater nos botões, testar os *Tokens de Gratidão* e ver se algo quebra antes de lançar a versão oficial para a comunidade inteira.
*   **Banco de Dados:** PostgreSQL com menos recurso e dados *fakes* (apagados esporadicamente).
*   **Emails:** Disparam para fornecedores gratuitos como Mailtrap.

### 3. Ambiente de Produção (Production)
*   **Onde Fica:** Num servidor de Alta Disponibilidade.
*   **Conceito:** O código "Sagrado". Só cai aqui quando a versão Staging for validada por dias.
*   **Banco de Dados:** O "ouro" do projeto (PostgreSQL real blindado onde ficam os pontos de todos os devs do estado). 
*   **Dominio:** `api.devstocantins.com.br`

---

## 🛠️ 2. Topologia da Infraestrutura (Ferramentas Indicadas)
Como líder, sua meta é gastar **R$ 0 ou o mínimo possível** no começo. As Big Techs fornecem "Free Tiers" generosos. 

### A) Hospedagem da API NestJS (A Máquina)
> **Stack Escolhida:** Render.com ou Railway.app (Plano Gratuito/Hobby)
A API não precisa de máquinas EC2 caras da Amazon no início. Soluções de *PaaS (Platform as a Service)* como **Render** conectam direto no nosso repositório do Github. 
*   Você cria os Web Services separados (`api-staging` no Render ligado à branch *develop* e `api-prod` ligado à branch *main*).
*   A cada PR que você fundir no GitHub, a plataforma derruba o código velho e sobe a imagem Docker nova em segundos.

### B) Banco de Dados PostgreSQL (A Persistência)
> **Stack Escolhida:** Supabase (Gratuito para 2 projetos / 500MB) ou Neon.tech
Levantar um RDS (Relational Database) em AWS é absurdamente caro para ONGs.
*   O **Supabase** fornece banco relacional de alta performance e painéis de SQL excelentes.
*   Criaremos o "`Devs-Tocantins-Prod`" e "`Devs-Tocantins-Staging`", gerando URLS de conexão diferentes a serem injetadas na API através da variável `DATABASE_URL`.

### C) Onde as Fotos das Provas Vão Ficar (Armazenamento em Nuvem)
> **Stack Escolhida:** AWS S3 (Free Tier 5GB por 12 Meses) ou Cloudflare R2
*   As fotos de currículo e provas das missões da comunidade **nunca** ficarão salvas na nossa API (para não estourar a memória local).
*   A API Nest usa a sintaxe de *Presigned-URL*. O front-end envia a foto pesada *direto* pro servidor bilionário da Amazon.
*   O Cloudflare R2 é uma alternativa que não cobra taxa de transação (Egress), excelente se a plataforma viralizar. Você terá *Buckets* isolados (`bucket-staging` e `bucket-prod`).

---

## 🚀 3. Continuous Integration / Deploy (CI/CD Pipeline)

Para que tudo isso funcione lindamente e sem você precisar apertar botões, o arquivo principal responsável é nosso pipeline do **GitHub Actions**.

### Fluxo de um Desenvolvedor Comunitário Vendo a API online:
1. Ele coda em casa, e faz o `git push` subindo um PR pro repositório.
2. O **CI do GitHub Actons** entra em ação: "Roda `npm run lint`" e "Roda `npm run test`". (Se o dev quebrou uma funcionalidade sua anterior, o robô automaticamente reprova o Pull Request dele num X vermelho bem grande e você nem perde tempo abrindo).
3. **Revisão Humana (Você):** Você vê que os testes do PR ficaram com a bola "Verde". Você analisa o código, elogia o dev, e clica em `Merge` integrando pra branch mãe `develop`.
4. O **CD (Continuous Deployment)** do Render.com vê o botão verde no git, baixa o sistema, gera a imagem Docker real, dispara o `npm run migration:run` para atualizar tabelas do banco online, e em menos de 1 minuto, o botão que o júnior construiu online aparece na API Staging pra equipe de QA testar de verdade!
