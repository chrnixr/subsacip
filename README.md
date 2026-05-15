
# Subsacip

Subscription management web app with a Vite/React frontend and a NestJS/Postgres backend.

The original frontend code bundle is available at https://www.figma.com/design/BBoel01pZC2Vdpw1bOB6nP/Subscription-Management-Page.

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

## GitHub

This project is ready to push as a single repo. After creating a GitHub repo:

```bash
git remote add origin git@github.com:<your-user>/<repo-name>.git
git branch -M main
git push -u origin main
```
