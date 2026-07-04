#!/usr/bin/env bash
# =============================================================
# update.sh — atualiza o deploy sem reconfigurar o servidor
# Roda diretamente na VPS: bash deploy/update.sh
# =============================================================
set -euo pipefail

APP_DIR="/opt/portfolio"
REPO_BRANCH="main"

BLUE='\033[0;34m'; GREEN='\033[0;32m'; NC='\033[0m'
log() { echo -e "${BLUE}[update]${NC} $1"; }
ok()  { echo -e "${GREEN}✓${NC} $1"; }

log "Puxando código novo..."
git -C "$APP_DIR" fetch origin "$REPO_BRANCH"
git -C "$APP_DIR" reset --hard "origin/$REPO_BRANCH"

log "Reinstalando deps do backend..."
cd "$APP_DIR/backend"
npm install --silent

log "Buildando backend..."
npm run build

log "Migrações..."
npm run migrate

log "Reinstalando deps do frontend..."
cd "$APP_DIR"
npm install --silent

log "Buildando frontend..."
npm run build

log "Reiniciando backend..."
pm2 restart portfolio-backend

log "Recarregando Nginx..."
nginx -t && systemctl reload nginx

pm2 list
ok "Atualização concluída."
