# Subsacip Backend

NestJS API backed by Postgres for the subscription management UI.

## Local setup

From the project root:

```bash
docker compose up -d postgres
cp backend/.env.example backend/.env
cd backend
npm install
npm run start:dev
```

The API listens on `http://localhost:3001/api` by default.

## Supabase Postgres

Use `DATABASE_URL` when connecting to Supabase:

```bash
cp .env.supabase.example .env
npm run start:dev
```

Fill `DATABASE_URL` with the Postgres connection string from your Supabase project and keep `DATABASE_SSL=true`.

For local Docker Postgres, leave `DATABASE_URL` empty and use the `POSTGRES_*` variables instead.

## Fly.io

This directory includes `Dockerfile` and `fly.toml`.

If the app name in `fly.toml` is unavailable, change `app = "subsacip-api"` before creating the Fly app.

```bash
fly auth login
fly apps create subsacip-api
fly secrets set DATABASE_URL="<your-supabase-postgres-url>"
fly secrets set CORS_ORIGIN="https://<your-cloudflare-pages-domain>"
fly deploy
```

The service listens on `0.0.0.0:3001`, matching `internal_port = 3001` in `fly.toml`.

## Endpoints

- `GET /api` health check
- `GET /api/subscriptions`
- `POST /api/subscriptions`
- `PATCH /api/subscriptions/:id`
- `DELETE /api/subscriptions/:id`
- `GET /api/payment-methods`
- `POST /api/payment-methods`
- `PATCH /api/payment-methods/:id`
- `DELETE /api/payment-methods/:id`
- `GET /api/history`
- `GET /api/history?year=2026`
- `POST /api/history`

`TYPEORM_SYNC=true` and `SEED_DATABASE=true` are intended for local development. Use migrations and set both carefully before production use.
