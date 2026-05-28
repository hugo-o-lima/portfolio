#!/usr/bin/env bash
# =============================================================
# deploy.sh — roda diretamente na VPS
# Uso:  bash deploy/deploy.sh
# =============================================================
set -euo pipefail

DOMAIN="hugo-antonio.dev.br"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${BLUE}[deploy]${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
die()  { echo -e "${RED}✗${NC} $1"; exit 1; }

[ -f "$SCRIPT_DIR/setup-server.sh" ] || die "setup-server.sh não encontrado em $SCRIPT_DIR"

# ── Variáveis de produção ─────────────────────────────────────
# Respeita variáveis de ambiente (para CI/automação)
# Ou pede input interativo se não definidas

if [ -z "${ADMIN_EMAIL:-}" ]; then
  echo ""
  echo "Configure as credenciais de produção (Enter para manter os padrões):"
  read -rp "  Email do admin [admin@$DOMAIN]: " input_email
  ADMIN_EMAIL="${input_email:-admin@$DOMAIN}"
else
  log "Email do admin: $ADMIN_EMAIL (via env)"
fi

if [ -z "${ADMIN_PASSWORD:-}" ]; then
  read -rsp "  Senha do admin (mín. 12 chars): " ADMIN_PASSWORD; echo ""
fi
[ ${#ADMIN_PASSWORD} -ge 12 ] || die "Senha muito curta (mínimo 12 caracteres)."

if [ -z "${DB_PASSWORD:-}" ]; then
  read -rsp "  Senha do PostgreSQL [gerada automaticamente]: " input_db_password; echo ""
  if [ -z "$input_db_password" ]; then
    DB_PASSWORD=$(LC_ALL=C tr -dc 'A-Za-z0-9!@#$%' < /dev/urandom | head -c 24)
    warn "Senha gerada: $DB_PASSWORD  ← anote esta senha!"
  else
    DB_PASSWORD="$input_db_password"
  fi
else
  log "Senha do PostgreSQL: *** (via env)"
fi

# Gera segredos JWT (sempre, ou usa env se definidas)
if [ -z "${JWT_ACCESS_SECRET:-}" ]; then
  if command -v openssl &>/dev/null; then
    JWT_ACCESS_SECRET=$(openssl rand -hex 64)
  else
    JWT_ACCESS_SECRET=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 128)
  fi
fi

if [ -z "${JWT_REFRESH_SECRET:-}" ]; then
  if command -v openssl &>/dev/null; then
    JWT_REFRESH_SECRET=$(openssl rand -hex 64)
  else
    JWT_REFRESH_SECRET=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 128)
  fi
fi

# ── Execução do setup ─────────────────────────────────────────
log "Iniciando setup (pode levar alguns minutos)..."

export DOMAIN ADMIN_EMAIL ADMIN_PASSWORD DB_PASSWORD JWT_ACCESS_SECRET JWT_REFRESH_SECRET
bash "$SCRIPT_DIR/setup-server.sh"

# ── Resultado ─────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
ok "Deploy concluído!"
echo ""
echo "  Site:    https://$DOMAIN"
echo "  Admin:   https://$DOMAIN/admin"
echo "  Email:   $ADMIN_EMAIL"
echo ""
warn "Guarde a senha do admin em local seguro."
echo "═══════════════════════════════════════════════════════"
