#!/usr/bin/env bash
# =============================================================
# start-backend.sh — sobe o backend num único comando
# Uso (na VPS):  bash deploy/start-backend.sh
# Faz: migrate → build → start/restart no PM2 (porta :3001)
# =============================================================
set -euo pipefail

BACKEND_DIR="/opt/portfolio/backend"
APP_NAME="portfolio-backend"
PM2_HOME="/home/ubuntu/.pm2"   # PM2 roda sob o usuário ubuntu

BLUE='\033[0;34m'; GREEN='\033[0;32m'; NC='\033[0m'
log() { echo -e "${BLUE}[backend]${NC} $1"; }
ok()  { echo -e "${GREEN}✓${NC} $1"; }

# Reexecuta como root: .env é 600/root e PM2 daemon roda como root
if [ "$(id -u)" -ne 0 ]; then
  exec sudo HOME=/home/ubuntu bash "$0" "$@"
fi
export HOME=/home/ubuntu

cd "$BACKEND_DIR"

log "Aplicando migrações..."
npm run migrate

log "Buildando (tsc → dist/)..."
npm run build

if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  log "Reiniciando $APP_NAME..."
  pm2 restart "$APP_NAME" --update-env
else
  log "Iniciando $APP_NAME..."
  pm2 start dist/server.js --name "$APP_NAME"
fi

pm2 save
pm2 list
ok "Backend no ar em http://localhost:3001"
