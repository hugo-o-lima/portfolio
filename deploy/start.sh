#!/usr/bin/env bash
# =============================================================
# start.sh — deploy local de front + back num único comando
# Uso (na VPS):  bash deploy/start.sh
# Faz: [backend] migrate → build → start/restart no PM2 (:3001)
#      [frontend] build (vite → dist/) → reload nginx
# NÃO faz git pull (use deploy/update.sh para puxar código novo).
# =============================================================
set -euo pipefail

APP_DIR="/opt/portfolio"
BACKEND_DIR="$APP_DIR/backend"
APP_NAME="portfolio-backend"

BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${BLUE}[deploy]${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }

# Reexecuta como root: .env é 600/root e PM2 daemon roda como root
if [ "$(id -u)" -ne 0 ]; then
  exec sudo HOME=/home/ubuntu bash "$0" "$@"
fi
export HOME=/home/ubuntu

# ── Backend ───────────────────────────────────────────────────
cd "$BACKEND_DIR"

log "[backend] Aplicando migrações..."
npm run migrate

log "[backend] Buildando (tsc → dist/)..."
npm run build

if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  log "[backend] Reiniciando $APP_NAME..."
  pm2 restart "$APP_NAME" --update-env
else
  log "[backend] Iniciando $APP_NAME..."
  pm2 start dist/server.js --name "$APP_NAME"
fi
pm2 save

# ── Frontend ──────────────────────────────────────────────────
cd "$APP_DIR"

log "[frontend] Buildando (vite → dist/)..."
npm run build

log "[frontend] Recarregando nginx..."
if nginx -t > /dev/null 2>&1; then
  systemctl reload nginx
  ok "nginx recarregado"
else
  warn "nginx -t falhou; reload pulado (config inválida?)"
fi

# ── Resultado ─────────────────────────────────────────────────
echo ""
pm2 list
ok "Deploy concluído — backend em :3001, frontend em $APP_DIR/dist"
