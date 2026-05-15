
# Subsacip

Subscription management web app with a Vite/React frontend and a NestJS/Postgres backend.

## Frontend

```bash
npm install
npm run dev
```

The frontend uses `VITE_API_BASE_URL` and defaults to `http://localhost:3001/api`.

## Backend

A NestJS/Postgres backend is available in `backend/`.

```bash
docker compose up -d postgres
cp backend/.env.example backend/.env
cd backend
npm install
npm run start:dev
```

The API listens on `http://localhost:3001/api` by default.

## Supabase

1. Create a Supabase project.
2. Copy the project Postgres connection string.
3. Create `backend/.env` from `backend/.env.supabase.example`.
4. Set `DATABASE_URL` to your Supabase Postgres URL and keep `DATABASE_SSL=true`.
5. Start the backend from `backend/` with `npm run start:dev`.

Do not commit real `.env` files or Supabase credentials.

## Deploy

### Backend: Fly.io

The backend deploy config lives in `backend/fly.toml`, and the Docker image is built from `backend/Dockerfile`.

If `subsacip-api` is unavailable on Fly.io, change the `app` value in `backend/fly.toml` first.

```bash
cd backend
fly auth login
fly apps create subsacip-api
fly secrets set DATABASE_URL="<your-supabase-postgres-url>"
fly secrets set CORS_ORIGIN="https://<your-cloudflare-pages-domain>"
fly deploy
```

The backend URL will be:

```txt
https://subsacip-api.fly.dev/api
```

For the first deployment, `TYPEORM_SYNC=true` and `SEED_DATABASE=true` are enabled in `fly.toml` so the app can create and seed tables. After schema is stable, set `TYPEORM_SYNC=false` and use migrations.

### Frontend: Cloudflare Pages

Create a Cloudflare Pages project from the GitHub repository.

Use these build settings:

```txt
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

Set this Pages environment variable:

```txt
VITE_API_BASE_URL=https://<your-fly-app>.fly.dev/api
```

The `public/_redirects` file is included so Cloudflare Pages serves the Vite app for client-side routes.

## GitHub

This project is ready to push as a single repo. After creating a GitHub repo:

```bash
git remote add origin git@github.com:<your-user>/<repo-name>.git
git branch -M main
git push -u origin main
```
