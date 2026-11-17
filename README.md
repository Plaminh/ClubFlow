# ClubFlow

ClubFlow is a student club recruitment management web application.

It is built on the team's reusable full-stack course scaffold, which was originally developed in this repository under the name `web-application-development`. The scaffold infrastructure (health check, authentication utilities, upload middleware, quality gate) is kept; ClubFlow features are added on top of it through the Spec-Driven Development flow.

## Stack

- Frontend: React + Vite
- Frontend architecture: Atomic Design
- Backend: Node.js + Express
- Backend architecture: Route → Validator / Middleware → Controller → Service → Repository → PostgreSQL
- Database: PostgreSQL (`pg`)
- Tests: Vitest
- Environment: Docker Compose for PostgreSQL
- Project management: Jira
- Development process: Spec-Driven Development with Spec Kit

## Project structure

```text
client/      React UI using Atomic Design
backend/     Express API using layered architecture
database/    bootstrap SQL, migrations, and seeds
docs/        architecture and project documentation
specs/       feature specifications generated during SDD
.specify/    populated by Spec Kit after initialization
```

The project intentionally uses one local `.env` file at repository root. Frontend Vite, backend Node.js, and Docker Compose all read from that root configuration.

Models represent domain entities and behavior; they are not a mandatory processing layer after repositories. For canonical implementation conventions, see [`AGENTS.md`](AGENTS.md). For an explanatory overview, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

The current frontend prototype contains five business screens plus the shared `/login` and protected `/profile` screens. It uses mock data and simulated authentication/profile state; only the API health check reaches the backend. See the detailed [frontend walkthrough](docs/frontend/walkthrough/ClubFlow_UI_Prototype_to_Backend_Guide.md) and the concise [backend integration contract](docs/frontend/INTEGRATION.md).

## Prerequisites

- Node.js 22.12+ (Node 24 is also fine)
- npm
- Docker Desktop
- Git
- Python 3.11+ and `uv` if using Spec Kit

## First setup

### 1. Install dependencies

From repository root:

```bash
npm install
```

### 2. Prepare environment variables

The scaffold includes a local `.env` for convenience. When cloning from Git later, create it from the committed example:

PowerShell:

```powershell
Copy-Item .env.example .env
```

Then update values if needed.

`.env.example` uses `DB_NAME=clubflow` and `DB_USER=clubflow_user`. Docker Compose pins the project name to `clubflow`, so the container is `clubflow_postgres` and the data volume is `clubflow_postgres_data`, regardless of the directory name.

PostgreSQL only creates the database and role named in `DB_NAME` and `DB_USER` when the Docker volume is first initialized; changing these values later does not rename an existing database or role. If you still have a local volume from the earlier scaffold (`web-application-development_postgres_data`, database `webapp_db`, user `webapp_user`), do not just edit `.env`: back the old database up with `pg_dump`, start the new `clubflow` environment, and restore the backup into it with `pg_restore --no-owner`.

### 3. Start PostgreSQL

```bash
npm run db:up
```

Check logs if needed:

```bash
npm run db:logs
```

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Start backend

```bash
npm run dev:backend
```

Backend health endpoint (port from `BACKEND_PORT`, `5000` in `.env.example`):

```text
GET http://localhost:5000/api/health
```

### 6. Start frontend

Open another terminal:

```bash
npm run dev:frontend
```

Frontend URL (port `3000` is set in `client/vite.config.js` and must match `FRONTEND_ORIGIN`):

```text
http://localhost:3000
```

## Testing

Run all tests once:

```bash
npm test
```

Watch frontend tests:

```bash
npm run test:frontend
```

Watch backend tests:

```bash
npm run test:backend
```

No `.env.test` is used. Vitest's `environment: node` and `environment: jsdom` describe the JavaScript runtime used by tests, not separate environment-variable files.

## Local quality gate

Run individual checks from the repository root:

```bash
npm run lint
npm test
npm run build
```

Run the complete local quality gate with:

```bash
npm run verify
```

`npm run verify` runs lint → test → build. See [`docs/QUALITY-GATE.md`](docs/QUALITY-GATE.md) for the automated and human checks that define completion.

## Database workflow

- `database/init.sql`: one-time PostgreSQL bootstrap used by the Docker image.
- `database/migrations/`: versioned schema changes.
- `database/seeds/`: optional development/demo data.

Create a new migration as a new numbered SQL file instead of editing a migration that teammates may already have applied.

Example:

```text
database/migrations/001_create_users.sql
database/migrations/002_add_user_role.sql
```

Then run:

```bash
npm run db:migrate
```

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
