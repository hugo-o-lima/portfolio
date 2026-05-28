#!/usr/bin/env bash
# =============================================================
# setup-server.sh — roda DENTRO da VPS (enviado por deploy.sh)
# Variáveis esperadas via env (injetadas pelo deploy.sh):
#   DOMAIN, ADMIN_EMAIL, ADMIN_PASSWORD, DB_PASSWORD,
#   JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
# =============================================================
set -euo pipefail

DOMAIN="${DOMAIN:-hugo-antonio.dev.br}"
APP_DIR="/opt/portfolio"
REPO_URL="https://github.com/hugo-o-lima/portfolio.git"
REPO_BRANCH="main"
DB_NAME="portfolio_prod"
DB_USER="portfolio"
NODE_VERSION="20"

BLUE='\033[0;34m'; GREEN='\033[0;32m'; NC='\033[0m'
log() { echo -e "${BLUE}[setup]${NC} $1"; }
ok()  { echo -e "${GREEN}✓${NC} $1"; }

# ── 1. Sistema ────────────────────────────────────────────────
log "Atualizando pacotes do sistema..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq

# ── 2. Node.js 20 via NodeSource ──────────────────────────────
if ! command -v node &>/dev/null || [ "$(node -e 'process.stdout.write(process.version.split(".")[0].replace("v",""))')" -lt "$NODE_VERSION" ]; then
  log "Instalando Node.js $NODE_VERSION..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash -
  apt-get install -y nodejs
fi
ok "Node $(node -v) / npm $(npm -v)"

# ── 3. PostgreSQL ─────────────────────────────────────────────
if ! command -v psql &>/dev/null; then
  log "Instalando PostgreSQL..."
  apt-get install -y postgresql postgresql-contrib
fi
systemctl enable postgresql --now
ok "PostgreSQL $(pg_lsclusters | awk 'NR==2{print $2}')"

# ── 4. Nginx ──────────────────────────────────────────────────
if ! command -v nginx &>/dev/null; then
  log "Instalando Nginx..."
  apt-get install -y nginx
fi
systemctl enable nginx --now
ok "Nginx instalado"

# ── 5. Certbot ────────────────────────────────────────────────
if ! command -v certbot &>/dev/null; then
  log "Instalando Certbot..."
  apt-get install -y certbot python3-certbot-nginx
fi
ok "Certbot instalado"

# ── 6. PM2 ────────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  log "Instalando PM2..."
  npm install -g pm2 --silent
fi
ok "PM2 $(pm2 -v)"

# ── 7. Banco de dados ─────────────────────────────────────────
log "Configurando banco de dados..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" \
  | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" \
  | grep -q 1 || sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
# Concede privilégios no schema public (necessário no PostgreSQL 15+)
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
ok "Banco '$DB_NAME' e usuário '$DB_USER' configurados"

# ── 8. Clonar / atualizar repositório ─────────────────────────
log "Clonando repositório..."
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch origin "$REPO_BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$REPO_BRANCH"
else
  git clone --branch "$REPO_BRANCH" --depth 1 "$REPO_URL" "$APP_DIR"
fi
chown -R ubuntu:ubuntu "$APP_DIR"
ok "Repositório em $APP_DIR"

# ── 9. Configurar .env do backend ─────────────────────────────
log "Criando .env de produção..."
cat > "$APP_DIR/backend/.env" <<ENVFILE
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://$DOMAIN
SEED_ADMIN_EMAIL=$ADMIN_EMAIL
SEED_ADMIN_PASSWORD=$ADMIN_PASSWORD
ENVFILE
chmod 600 "$APP_DIR/backend/.env"
ok ".env criado"

# ── 10. Instalar dependências e buildar ───────────────────────
log "Instalando dependências do backend..."
cd "$APP_DIR/backend"
npm install --silent

log "Buildando backend..."
npm run build

log "Executando migrations..."
npm run migrate

log "Executando seed (admin inicial)..."
npm run seed

log "Instalando dependências do frontend..."
cd "$APP_DIR"
npm install --silent

log "Buildando frontend..."
npm run build
ok "Build concluído — arquivos estáticos em $APP_DIR/dist"

# ── 11. PM2 — iniciar backend ─────────────────────────────────
log "Iniciando backend com PM2..."
cd "$APP_DIR/backend"
# O dotenv é carregado pelo próprio código ao encontrar o .env na mesma pasta.
# PM2 precisa rodar a partir do diretório do backend para que __dirname funcione.
pm2 delete portfolio-backend 2>/dev/null || true
pm2 start dist/server.js \
  --name portfolio-backend \
  --cwd "$APP_DIR/backend"
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | bash || true
ok "Backend rodando via PM2"

# ── 12. Nginx — configuração inicial (HTTP) ───────────────────
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/portfolio <<NGINXCONF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $APP_DIR/dist;
    index index.html;

    # Proxy para a API
    location /api/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
    }

    # SPA — todas as rotas servem o index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXCONF

ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
ok "Nginx configurado"

# ── 13. SSL com Certbot ───────────────────────────────────────
log "Emitindo certificado SSL (Let's Encrypt)..."
certbot --nginx \
  --non-interactive \
  --agree-tos \
  --email "webmaster@$DOMAIN" \
  --domains "$DOMAIN,www.$DOMAIN" \
  --redirect \
  2>&1 | tail -10

ok "SSL ativo — site disponível em https://$DOMAIN"

# ── 14. Status final ──────────────────────────────────────────
echo ""
log "Status dos serviços:"
pm2 list
systemctl is-active nginx && echo "nginx: ativo" || echo "nginx: inativo"
systemctl is-active postgresql && echo "postgresql: ativo" || echo "postgresql: inativo"
