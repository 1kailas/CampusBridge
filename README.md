# Campus Bridge — Placement Readiness Platform

Campus Bridge is a full-stack placement-preparation workspace for final-year engineering students. It combines a curated coding problem set, company-specific SDE sheets, timed mock assessments, a multi-language judge, readiness analytics, and a trainer question studio.

The interface is built as a modern dark product surface: deep navy planes, an indigo/cyan brand system, consistent tables and cards, responsive layouts, and an accessible focus treatment.

---

## Feature set

- **Coding workspace** — Monaco editor, Python / C++ / Java / JavaScript starter templates, sample and hidden test cases, run and submit actions, runtime and pass/fail reporting.
- **Problem directory** — filter by company drive, pattern, difficulty, and personal status (solved / attempted / not started).
- **Curated SDE sheets** — Placement 100, Service MNC, Blind 75, and Product/FinTech tracks with live progress.
- **Timed mock assessments** — countdown, multi-question navigation, weighted marks, automatic scoring, and a pass/fail report.
- **Readiness analytics** — difficulty breakdown, solved-by-drive and solved-by-pattern coverage, submission history, and campus leaderboard.
- **Accounts** — student and trainer demo accounts, registration/login, JWT sessions, profile editing, and per-problem notes.
- **Question studio** — trainers can publish problems with sample/hidden cases, starter signatures, hints, and editorials.

---

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, Monaco Editor, Lucide |
| Backend | NestJS 10, Prisma ORM, Passport JWT, bcrypt |
| Database | SQLite (file-based, persisted in a Docker volume) |
| Judge | Native Python 3, GCC/G++, Java 17, Node.js 20 |
| Deployment | Docker multi-stage builds + Docker Compose |

---

## Run with Docker (recommended)

Prerequisites: Docker 24+ with the Compose plugin.

```bash
cp .env.example .env
# Edit JWT_SECRET in .env before exposing the app.

docker compose up --build -d
```

Open **http://localhost:3000**. The API is available at **http://localhost:4000/api**, and a health probe lives at **http://localhost:4000/api/health**.

What happens on first start:

1. The backend container applies the Prisma schema to the persistent SQLite volume.
2. The idempotent seed creates demo users, problems, sheets, and assessments.
3. The frontend waits for the backend health check, then starts the standalone Next.js server.
4. Browser requests to `/api/*` are proxied by Next.js to the backend service (no CORS setup required).

Useful commands:

```bash
docker compose logs -f           # follow logs
docker compose restart backend   # re-run schema push + seed
docker compose down              # stop, keep the database volume
docker compose down -v           # stop and delete the database volume
```

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Student | `student@placement.edu` | `placement2026` |
| Trainer / admin | `trainer@placement.edu` | `trainer2026` |

The login screen also exposes one-click **Student demo** and **Trainer demo** buttons.

---

## Local development

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run prisma:seed
npm run start:dev
```

The API runs at `http://localhost:4000/api`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000` and proxies `/api/*` to `http://localhost:4000` by default. To use a different API URL:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api npm run dev
```

For production builds:

```bash
cd backend && npm run build && npm run start:prod
cd frontend && npm run build && npm start
```

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | Prisma SQLite connection string |
| `PORT` | `4000` | API port |
| `JWT_SECRET` | dev-only fallback | JWT signing secret — set a long random value in production |
| `CORS_ORIGINS` | allow all if unset | Comma-separated origin allow-list |
| `SEED_ON_START` | `true` in Docker | Run the idempotent seed on container boot |

### Frontend

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `/api` | Browser-facing API base URL, baked at build time |
| `API_PROXY_TARGET` | `http://localhost:4000` | Next.js rewrite target for `/api/*`, baked at build time |

### Compose (`.env`)

`JWT_SECRET`, `CORS_ORIGINS`, `FRONTEND_PORT`, `BACKEND_PORT`, and `SEED_ON_START` are read by `docker-compose.yml`.

---

## Project structure

```
backend/
  prisma/schema.prisma        SQLite schema and relations
  src/auth/                   JWT auth, registration, demo accounts
  src/problems/               Problem CRUD, filters, metadata, notes
  src/submissions/            Run/submit endpoints and history
  src/judge/                  Multi-language execution engine and drivers
  src/assessments/            Timed mock-test lifecycle and scoring
  src/sheets/                 SDE sheet catalogue and progress
  src/stats/                  Readiness analytics and leaderboard
  src/health.controller.ts    Container health probe
  Dockerfile                  Node + Prisma + judge toolchains
  docker-entrypoint.sh        Schema push and idempotent seed

frontend/
  src/app/                    App Router pages (home, login, problems, sheets, mocks, profile, admin)
  src/components/             Navbar, footer, editor, shared UI primitives
  src/lib/api.ts              Cached API client
  Dockerfile                  Standalone Next.js build

docker-compose.yml            Backend + frontend with health checks and a persistent volume
```

---

## Judge notes

Each submission is compiled and executed inside the backend container with a 4-second per-case timeout. The judge supports:

- Python 3 (`python3`)
- C++ 17 (`g++ -O2 -std=c++17`)
- Java 17 (`javac` + `java -cp`)
- JavaScript (`node`)

Output comparison tolerates whitespace, JSON formatting, numeric precision, and case differences for booleans.

> **Security note:** the bundled judge is intended for trusted classroom/training deployments. It executes student code in the API container. For public, untrusted traffic, move the judge to an isolated worker with a hardened sandbox (seccomp, cgroups, network isolation, and per-run quotas).

---

## Production checklist

- Set a strong `JWT_SECRET` in `.env`.
- Put the stack behind TLS (reverse proxy or managed load balancer).
- Back up the `campusbridge-data` volume.
- Keep the backend port private if you only expose the frontend.
- Review `CORS_ORIGINS` when the frontend and API are on different hosts.
- Monitor `GET /api/health` and container health status.
