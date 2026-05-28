#!/usr/bin/env bash
# =============================================================
# update.sh — atualiza o deploy sem reconfigurar o servidor
# Uso: ./deploy/update.sh <caminho/para/chave_ssh>
# =============================================================
set -euo pipefail

SSH_KEY="${1:-}"
VPS_HOST="ubuntu@167.234.240.230"
APP_DIR="/opt/portfolio"
REPO_BRANCH="main"

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
log() { echo -e "${BLUE}[update]${NC} $1"; }
ok()  { echo -e "${GREEN}✓${NC} $1"; }
die() { echo -e "${RED}✗${NC} $1"; exit 1; }

[ -z "$SSH_KEY" ] && die "Passe o caminho da chave SSH: ./deploy/update.sh ~/.ssh/sua_chave"
[ -f "$SSH_KEY" ] || die "Chave SSH não encontrada: $SSH_KEY"

SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no"

log "Conectando à VPS e atualizando..."
ssh $SSH_OPTS "$VPS_HOST" bash <<'REMOTE'
set -euo pipefail
APP_DIR="/opt/portfolio"
REPO_BRANCH="main"

echo "[update] Puxando código novo..."
git -C "$APP_DIR" fetch origin "$REPO_BRANCH"
git -C "$APP_DIR" reset --hard "origin/$REPO_BRANCH"

echo "[update] Reinstalando deps do backend..."
cd "$APP_DIR/backend"
npm install --silent

echo "[update] Buildando backend..."
npm run build

echo "[update] Migrações..."
npm run migrate

echo "[update] Reinstalando deps do frontend..."
cd "$APP_DIR"
npm install --silent

echo "[update] Buildando frontend..."
npm run build

echo "[update] Reiniciando backend..."
pm2 restart portfolio-backend

echo "[update] Recarregando Nginx..."
nginx -t && systemctl reload nginx

pm2 list
echo "Atualização concluída."
REMOTE

ok "Deploy de atualização concluído!"
