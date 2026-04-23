# Upload de Arquivos

---

## Tabela de Conteúdos <!-- omit in toc -->

- [Suporte a Provedores (Drivers)](#suporte-a-provedores)
- [Fluxo de Upload `local`](#fluxo-de-upload-local)
- [Fluxo de Upload `s3`](#fluxo-de-upload-s3)
  - [Configuração para S3](#configuração-para-s3)
- [Fluxo de Upload `s3-presigned` (Recomendado)](#fluxo-de-upload-s3-presigned)
  - [Configuração para S3 Presigned](#configuração-para-s3-presigned)
- [Como deletar arquivos?](#como-deletar-arquivos)

---

## Suporte a Provedores

A API do Motor de Engajamento suporta (através do Boilerplate) os seguintes provedores (drivers) de configuração de armazenamento de imagens/documentos: `local`, `s3`, e `s3-presigned`.
Você pode escolher um na variável `FILE_DRIVER` do seu `.env`.

> O Motor de Engajamento exigirá armazenar comprovantes de atividades. Para Produção é muito recomendado usar a flag "s3-presigned".

---

## MinIO: Simulador Local do S3 (Desenvolvimento)

O **MinIO** é um servidor S3-compatível que roda localmente via Docker, eliminando qualquer dependência de internet para uploads durante o desenvolvimento. Ao ativá-lo, o desenvolvedor faz uploads de arquivos localmente como se estivesse usando a Amazon S3.

### Iniciando o MinIO com Docker

O serviço `minio` já está configurado no `docker-compose.yaml`. Ao subir os containers, o MinIO estará disponível em:

- **API S3 (endpoint):** `http://localhost:9000`
- **Console Web (UI):** `http://localhost:9001`

```bash
docker compose up -d minio
```

### Acessando o Console do MinIO

1. Acesse `http://localhost:9001` no navegador.
2. Faça login com as credenciais padrão: **usuário** `minioadmin` / **senha** `minioadmin`.
3. Crie um **Bucket** com o nome `engajamento-local` (ou o nome definido em `AWS_DEFAULT_S3_BUCKET`).
4. Defina a política do bucket como **Public** para que as URLs de arquivos sejam acessíveis.

### Configuração do `.env` para usar o MinIO

Copie as seguintes variáveis para o seu `.env`:

```dotenv
FILE_DRIVER=s3
ACCESS_KEY_ID=minioadmin
SECRET_ACCESS_KEY=minioadmin
AWS_S3_REGION=us-east-1
AWS_DEFAULT_S3_BUCKET=engajamento-local
AWS_S3_ENDPOINT=http://minio:9000
```

> **Atenção:** Dentro da rede Docker, o hostname é `minio`. Para acesso direto do host (fora do Docker), use `http://localhost:9000`.

---

## Fluxo de Upload `local`

O recurso `/api/v1/files/upload` aceita Multipart Form. Ele te devolve um Modelo `File` base contendo o ID e Path (`caminho`) para você atrelar a qualquer outra entidade.

**Formatos Suportados:**
- Imagens: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`.
- Tamanho máximo: Configurado via `FILE_MAX_FILE_SIZE` no `.env`.

## Fluxo de Upload `s3`

O endpoint funcionará exatamenente da mesma de forma (O Backend recebe o buffer da imagem através do cliente, transfere a RAM processando para o Bucket S3 remotamente da API e devolve as chaves finais).

### Configuração para S3

Você precisa acessar o IAM e S3 da AWS e conceder acesso via Cross-Origin Resource Sharing (CORS) permitindo o método `GET` liberado. 
Em seguida, configure o `.env`:
```dotenv
FILE_DRIVER=s3
ACCESS_KEY_ID=SUA_CHAVE_AWS
SECRET_ACCESS_KEY=SEU_SEGREDO_AWS
AWS_S3_REGION=us-east-1
AWS_DEFAULT_S3_BUCKET=nome-do-bucket-engajamento
```

## Fluxo de Upload `s3-presigned`

**Para aliviar o servidor Backend.**
Ao invés do Frontend mandar o Arquivo Pesado para API, a API devolve ao Frontend uma `Url Assinada Temporária`. O Frontend faz o Upload diretamente pro Bucket da Amazon *by-passando* o tráfego do servidor NodeJS.
Nenhum byte extra de imagem pesa no servidor de Produção!

### Configuração para S3 Presigned

CORS do lado da Amazon precisa permitir os métodos (`GET`, `PUT`). Modifique para garantir que suas restrições de "PUT" limitem apenas para a `https://sua-url-do-frontend.com`!

## Como deletar arquivos?

**Soft Delete.** O Boilerplate confia inteiramente no uso de exclusão lógica (Soft Delete - o registro ganha a flag `deletedAt` e não some de fato) para propósitos de Auditoria. Especialmente em um Motor de Gamificação, nunca precisaremos apagar os logs e fotos "impróprias"/"reprovadas". Elas devem continuar guardadas em Storage/Postgres com status passivos ou rejeitados.
