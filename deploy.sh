#!/bin/bash
# deploy.sh — sincroniza o código e reconstrói o container na VM
# Uso: ./deploy.sh

set -e

SSH_KEY="ssh-key-2026-04-01.key"
REMOTE="ubuntu@136.248.75.34"
COMPOSE="docker-compose.prod.yaml"

if [ ! -f "$SSH_KEY" ]; then
  echo "Erro: chave SSH '$SSH_KEY' não encontrada. Execute a partir da raiz do projeto."
  exit 1
fi

echo "==> Sincronizando código..."
rsync -avz \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.env' \
  --exclude='.env.prod' \
  --exclude='ssh-key-*.key' \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  . "$REMOTE:~/app/"

echo "==> Reconstruindo e subindo container..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE" \
  "cd ~/app && \
   sudo docker compose -f $COMPOSE down && \
   sudo docker compose -f $COMPOSE build --no-cache && \
   sudo docker compose -f $COMPOSE up -d"

echo "==> Aguardando API..."
until ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE" \
  "curl -sk https://136.248.75.34.nip.io/healthz | grep -q ok" 2>/dev/null; do
  sleep 3
done

echo "==> Deploy concluído! API no ar."
