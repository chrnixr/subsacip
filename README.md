
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

## Deploy: Render

This repo includes `render.yaml` for a Render Blueprint with two services:

- `subsacip-web`: Vite static site
- `subsacip-api`: NestJS web service

In Render, create a new Blueprint from this GitHub repo. During setup, Render prompts for `DATABASE_URL` for `subsacip-api`; paste the Supabase Postgres URL there.

Expected Render URLs:

```txt
Frontend: https://subsacip-web.onrender.com
Backend:  https://subsacip-api.onrender.com/api
```

If Render creates different service URLs, update these environment variables in the Render dashboard and redeploy:

```txt
subsacip-web  -> VITE_API_BASE_URL=https://<actual-api-service>.onrender.com/api
subsacip-api  -> CORS_ORIGIN=https://<actual-web-service>.onrender.com
```

For the first deployment, `TYPEORM_SYNC=true` and `SEED_DATABASE=true` are enabled so the app can create and seed Supabase tables. After schema is stable, set `TYPEORM_SYNC=false` and use migrations.

## GitHub

This project is ready to push as a single repo. After creating a GitHub repo:

```bash
git remote add origin git@github.com:<your-user>/<repo-name>.git
git branch -M main
git push -u origin main
```
