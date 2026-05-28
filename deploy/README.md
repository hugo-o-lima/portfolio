# Deploy para a VPS

## Pré-requisitos

- Acesso SSH à VPS (`ubuntu@167.234.240.230`)
- DNS `hugo-antonio.dev.br` apontando para `167.234.240.230` (já configurado ✓)

## Primeiro deploy

```bash
# 1. Acesse a VPS
ssh ubuntu@167.234.240.230

# 2. Clone o repositório
git clone https://github.com/hugo-o-lima/portfolio.git /opt/portfolio

# 3. Execute o deploy
bash /opt/portfolio/deploy/deploy.sh
```

O script vai perguntar interativamente:
- Email do admin (padrão: `admin@hugo-antonio.dev.br`)
- Senha do admin
- Senha do PostgreSQL (gerada automaticamente se deixar em branco)

Tempo estimado: **5–10 minutos** (instalação de pacotes, build, SSL).

## O que o script faz

1. Instala Node 20, PostgreSQL 16, Nginx, Certbot, PM2
2. Cria banco de dados e usuário PostgreSQL
3. Clona o repositório do GitHub
4. Cria o `.env` de produção na VPS
5. Build do backend (TypeScript → Node)
6. Roda migrations e seed (cria o admin)
7. Build do frontend (React → arquivos estáticos)
8. Inicia o backend com PM2 (auto-restart + systemd)
9. Configura Nginx como reverse proxy
10. Emite certificado SSL via Let's Encrypt

## Resultado final

| Serviço   | URL                             |
|-----------|---------------------------------|
| Portfolio | https://hugo-antonio.dev.br     |
| Admin     | https://hugo-antonio.dev.br/admin |
| API       | https://hugo-antonio.dev.br/api |

## Atualizações futuras

Após fazer push de mudanças para o GitHub:

```bash
# Na VPS:
bash /opt/portfolio/deploy/update.sh
```

Faz pull, rebuild, migrations, e reinicia os serviços — sem perder dados.

## Gerenciamento manual na VPS

```bash
ssh ubuntu@167.234.240.230

# Ver status do backend
pm2 status
pm2 logs portfolio-backend

# Reiniciar backend
pm2 restart portfolio-backend

# Testar nginx
nginx -t && systemctl reload nginx

# Renovar SSL manualmente (automático via cron do certbot)
certbot renew --dry-run
```

## Arquitetura de produção

```
Internet → Nginx (80/443)
               ├── /api/* → PM2 → Node.js (porta 3001)
               └── /*     → dist/ (arquivos estáticos do React)
```

O banco de dados PostgreSQL roda localmente na VPS (socket Unix), acessado apenas pelo backend.
