# ClubFlow

ClubFlow is a student club recruitment management web application.

It is built on the team's reusable full-stack course scaffold, which was originally developed in this repository under the name `web-application-development`. The scaffold infrastructure (health check, authentication utilities, upload middleware, quality gate) is kept; ClubFlow features are added on top of it through the Spec-Driven Development flow.

## Stack

- Frontend: React + Vite
- Frontend architecture: Atomic Design
- Backend: Node.js + Express
- Backend architecture: Route → Validator / Middleware → Controller → Service → Repository → PostgreSQL
- Database: PostgreSQL 17 (`pg`, no ORM)
- Tests: Vitest
- Environment: Docker Compose for PostgreSQL
- Project management: Jira
- Development process: Spec-Driven Development with Spec Kit

## Project structure

```text
client/      React UI using Atomic Design (calls relative /api paths)
server/      Express API, standalone npm project (renamed from backend/ in PA#4)
  migrations/  versioned schema (SQL)
  src/db/seeds/  demo data modules for npm run seed
mock/        PA#3 HTTP mock (kept for front-end work; not kept in step with PA#4)
database/    init.sql for the local Docker database only
docs/api/    the HTTP contract the server implements
specs/       feature specifications (PA#4: specs/003-pa4-express-server)
```

The only environment file is `server/.env`, copied from `server/.env.example`. The front end needs no variables.

Models represent domain entities and behavior; they are not a mandatory processing layer after repositories. For canonical implementation conventions, see [`AGENTS.md`](AGENTS.md). For an explanatory overview, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Prerequisites

- Node.js 22.9+ (the marker uses Node 22)
- npm
- Docker Desktop (local PostgreSQL 17) or any PostgreSQL 17
- Git

## First setup

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL 17 on `127.0.0.1:5433` with two databases, `clubflow` and `clubflow_test`, user `clubflow`, no password (local only).

### 2. Server

```bash
cd server
npm ci --ignore-scripts
cp .env.example .env      # set a long random JWT_SECRET
npm run seed
npm start                 # http://localhost:3001/api/health
```

Add `TEST_DATABASE_URL=postgres://clubflow@localhost:5433/clubflow_test` to `server/.env` so `npm test` does not wipe the `clubflow` database. Every variable is explained in `server/.env.example`.

### 3. Front end

From the repository root, in another terminal:

```bash
npm install
npm run dev:frontend      # http://localhost:3000, /api proxied to port 3001
```

## Testing

```bash
npm test                  # root: client and mock tests
npm run test:server       # server tests (needs PostgreSQL; see TEST_DATABASE_URL above)
```

## Local quality gate

From the repository root:

```bash
npm run format:check
npm run lint
npm test
npm run test:server
npm run build
```

CI (`.github/workflows/ci.yml`) runs the same commands on every push, with PostgreSQL 17. See [`docs/QUALITY-GATE.md`](docs/QUALITY-GATE.md) for the human checks that define completion.

## Database workflow

- `server/migrations/NNN-name.sql`: versioned schema, numbered in dependency order (`specs/003-pa4-express-server/tasks.md`). Never edit a migration teammates have pulled; add a new file.
- `server/src/db/seeds/NNN-name.js`: demo data for the same tables.
- `npm run seed` (in `server/`): drop the schema, apply every migration, run every seed module. Same result every time.
- `npm run migrate` (in `server/`): apply only new migrations, keeping data.

## Spec Kit

Install the official CLI once:

```bash
uv tool install specify-cli
```

Because this repository already contains code, initialize Spec Kit in-place from the repository root:

```bash
specify init --here --force --script ps
```

Choose the coding-agent integration when prompted. After initialization, establish the project constitution before the first feature, then use the Spec-Driven Development flow for each feature.

Recommended feature flow:

```text
Specify → Clarify (when needed) → Plan → Tasks → Analyze → Implement
```

Keep AI usage recorded in `AI-LOG.md` and review generated code before merging.
