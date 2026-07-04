#!/usr/bin/env bash
# =============================================================
# setup-monitoring.sh — instala stack de monitoramento na VPS
# Grafana + Prometheus + Node Exporter via Docker Compose
# Requer: DOMAIN exportado (ex: export DOMAIN=hugo-antonio.dev.br)
# =============================================================
set -euo pipefail

APP_DIR="/opt/portfolio"
MONITORING_DIR="$APP_DIR/monitoring"
DOMAIN="${DOMAIN:-hugo-antonio.dev.br}"

BLUE='\033[0;34m'; GREEN='\033[0;32m'; NC='\033[0m'
log() { echo -e "${BLUE}[monitoring]${NC} $1"; }
ok()  { echo -e "${GREEN}✓${NC} $1"; }

# ── 1. Docker ─────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  log "Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker --now
fi
ok "Docker $(docker --version | awk '{print $3}' | tr -d ',')"

# ── 2. Docker Compose plugin ──────────────────────────────────
if ! docker compose version &>/dev/null 2>&1; then
  log "Instalando Docker Compose plugin..."
  apt-get install -y docker-compose-plugin
fi
ok "Docker Compose $(docker compose version --short)"

# ── 3. Subir stack de monitoring ──────────────────────────────
log "Subindo Grafana + Prometheus + Node Exporter..."
cd "$MONITORING_DIR"
DOMAIN="$DOMAIN" docker compose up -d --remove-orphans
ok "Stack de monitoring rodando"

# ── 4. Nginx — adicionar proxy /grafana/ ──────────────────────
NGINX_CONF="/etc/nginx/sites-available/portfolio"

if ! grep -q "location /grafana/" "$NGINX_CONF" 2>/dev/null; then
  log "Adicionando proxy /grafana/ ao Nginx..."
  # Insere o bloco de proxy antes do último "}" do server block
  python3 - "$NGINX_CONF" <<'PYEOF'
import re, sys

path = sys.argv[1]
text = open(path).read()

grafana_block = """
    # Grafana — monitoring dashboard
    location /grafana/ {
        proxy_pass         http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
"""

# Insert before the last closing brace of the server block
text = re.sub(r'(\n})\s*$', grafana_block + r'\1', text, count=1)
open(path, 'w').write(text)
print("Nginx config updated.")
PYEOF

  nginx -t
  systemctl reload nginx
  ok "Nginx atualizado com proxy /grafana/"
else
  ok "Nginx já tem proxy /grafana/ configurado"
fi

# ── 5. Aguardar Grafana ficar pronto ──────────────────────────
log "Aguardando Grafana inicializar..."
for i in $(seq 1 30); do
  if curl -s http://127.0.0.1:3000/api/health | grep -q '"database": "ok"'; then
    ok "Grafana pronto"
    break
  fi
  sleep 2
  [ "$i" -eq 30 ] && echo "Aviso: Grafana pode ainda estar inicializando, verifique manualmente."
done

echo ""
log "Monitoramento disponível em: https://$DOMAIN/grafana/"
log "Painéis provisionados: CPU, RAM, Disco, Uptime (uid: server-stats)"
