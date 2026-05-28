# Portfolio

Meu site que uso de portfólio.

Monorepo: frontend (Vite + React + TypeScript) na raiz e backend (Express + TypeScript + PostgreSQL) em `backend/`.

## Rodando com Docker (recomendado)

Sobe PostgreSQL + backend + frontend com um comando. As migrations e o admin inicial são criados automaticamente.

```bash
# 1. (Opcional) copie as variáveis de ambiente e ajuste os segredos
cp .env.example .env

# 2. Suba tudo
docker compose up --build
```

Serviços:

| Serviço  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:5173    |
| API      | http://localhost:3001    |
| Postgres | localhost:5432           |

Login do admin (definido em `.env` / valores padrão):

- **Email:** `admin@example.com`
- **Senha:** `ChangeMe!SuperStrong123`

Acesse `http://localhost:5173/admin` para entrar no painel e gerenciar projetos.

Para parar: `docker compose down` (os dados do banco persistem no volume `pgdata`).

> **Mac/Windows:** se o hot reload do frontend não disparar, adicione `CHOKIDAR_USEPOLLING=true` ao environment do serviço `frontend` no `docker-compose.yml`.

## Rodando localmente (sem Docker)

Requer Node 20+ e um PostgreSQL rodando.

```bash
# Backend
cd backend
npm install
cp .env.example .env   # ajuste DATABASE_URL e segredos
npm run migrate
npm run seed
npm run dev            # porta 3001

# Frontend (em outro terminal)
cd ..
npm install
npm run dev            # porta 5173
```
