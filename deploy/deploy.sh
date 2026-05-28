#!/usr/bin/env bash
# =============================================================
# deploy.sh — roda na sua máquina local
# Uso:  ./deploy/deploy.sh <caminho/para/chave_ssh>
# Ex:   ./deploy/deploy.sh ~/.ssh/id_ed25519
# =============================================================
set -euo pipefail

SSH_KEY="${1:-}"
VPS_HOST="ubuntu@167.234.240.230"
DOMAIN="hugo-antonio.dev.br"

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${BLUE}[deploy]${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
die()  { echo -e "${RED}✗${NC} $1"; exit 1; }

# ── Validações locais ─────────────────────────────────────────
[ -z "$SSH_KEY" ] && die "Passe o caminho da chave SSH: ./deploy/deploy.sh ~/.ssh/sua_chave"
[ -f "$SSH_KEY" ] || die "Chave SSH não encontrada: $SSH_KEY"

SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=20"

# ── Teste de conectividade ─────────────────────────────────────
log "Testando conexão SSH com a VPS..."
ssh $SSH_OPTS "$VPS_HOST" "echo OK" > /dev/null || die "Não foi possível conectar à VPS. Verifique a chave e a conectividade."
ok "VPS acessível"

# ── Variáveis de produção ─────────────────────────────────────
echo ""
echo "Configure as credenciais de produção (Enter para manter os padrões):"

read -rp "  Email do admin [$DOMAIN admin@$DOMAIN]: " ADMIN_EMAIL
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@$DOMAIN}"

read -rsp "  Senha do admin (mín. 12 chars): " ADMIN_PASSWORD; echo ""
[ ${#ADMIN_PASSWORD} -ge 12 ] || die "Senha muito curta (mínimo 12 caracteres)."

read -rsp "  Senha do PostgreSQL [gerada automaticamente]: " DB_PASSWORD; echo ""
if [ -z "$DB_PASSWORD" ]; then
  DB_PASSWORD=$(LC_ALL=C tr -dc 'A-Za-z0-9!@#$%' < /dev/urandom | head -c 24)
  warn "Senha gerada: $DB_PASSWORD  ← anote esta senha!"
fi

# Gera segredos JWT se openssl estiver disponível
if command -v openssl &>/dev/null; then
  JWT_ACCESS_SECRET=$(openssl rand -hex 64)
  JWT_REFRESH_SECRET=$(openssl rand -hex 64)
else
  JWT_ACCESS_SECRET=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 128)
  JWT_REFRESH_SECRET=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 128)
fi

# ── Upload dos artefatos ──────────────────────────────────────
log "Enviando arquivos para a VPS..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
scp $SSH_OPTS "$SCRIPT_DIR/setup-server.sh" "$VPS_HOST:/tmp/portfolio-setup.sh"
ok "Arquivos enviados"

# ── Execução remota ───────────────────────────────────────────
log "Iniciando setup na VPS (pode levar alguns minutos)..."
ssh $SSH_OPTS "$VPS_HOST" "bash /tmp/portfolio-setup.sh" <<EOF
export DOMAIN="$DOMAIN"
export ADMIN_EMAIL="$ADMIN_EMAIL"
export ADMIN_PASSWORD="$ADMIN_PASSWORD"
export DB_PASSWORD="$DB_PASSWORD"
export JWT_ACCESS_SECRET="$JWT_ACCESS_SECRET"
export JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
EOF

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
