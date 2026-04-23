#!/bin/bash
# deploy.sh — Faz o build local e envia a imagem pronta para a VM
# Uso: ./deploy.sh

set -e

SSH_KEY="ssh-key-2026-04-01.key"
REMOTE="ubuntu@136.248.75.34"
COMPOSE="docker-compose.prod.yaml"
IMAGE_NAME="api-legado-dev:latest"
TAR_FILE="app-image.tar.gz"

if [ ! -f "$SSH_KEY" ]; then
  echo "Erro: chave SSH '$SSH_KEY' não encontrada. Execute a partir da raiz do projeto."
  exit 1
fi

echo "==> [1/4] Realizando o build da imagem localmente para AMD64..."
# Usa o buildx do docker para construir a imagem cross-platform
docker buildx build --platform linux/amd64 -t $IMAGE_NAME -f Dockerfile . --load

echo "==> [2/4] Compactando a imagem Docker (isso pode demorar um pouco)..."
docker save $IMAGE_NAME | gzip > $TAR_FILE

echo "==> [3/4] Enviando a imagem e configuração para a VM..."
rsync -avP \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  $TAR_FILE $COMPOSE "$REMOTE:~/app/"

echo "==> [4/4] Carregando a imagem e reiniciando os containers na VM..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE" \
  "cd ~/app && \
   echo 'Carregando imagem no Docker...' && \
   gunzip -c $TAR_FILE | sudo docker load && \
   sudo docker compose -f $COMPOSE down && \
   sudo docker compose -f $COMPOSE up -d"

echo "==> Aguardando API..."
until ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE" \
  "curl -sk https://136.248.75.34.nip.io/healthz | grep -q ok" 2>/dev/null; do
  sleep 3
done

echo "==> Limpando arquivo temporário local e remoto..."
rm -f $TAR_FILE
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE" "rm -f ~/app/$TAR_FILE"

echo "==> Deploy concluído! API no ar."