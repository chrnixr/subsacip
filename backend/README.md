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

## Render

The root `render.yaml` defines this backend as `subsacip-api`.

Render settings:

```txt
Root Directory: backend
Build Command: npm ci && npm run build
Start Command: npm run start:prod
Health Check Path: /api
```

Required environment variables:

```txt
DATABASE_URL=<your-supabase-postgres-url>
DATABASE_SSL=true
CORS_ORIGIN=https://<your-render-frontend-domain>
```

The service binds to `0.0.0.0` and uses Render's `PORT` environment variable.

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
