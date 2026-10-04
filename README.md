# Web Application Development

Course full-stack web application scaffold.

## Stack

- Frontend: React + Vite
- Frontend architecture: Atomic Design
- Backend: Node.js + Express
- Backend architecture: Route → Controller → Service → Repository → Model
- Database: PostgreSQL (`pg`)
- Tests: Vitest
- Environment: Docker Compose for PostgreSQL
- Project management: Jira
- Development process: Spec-Driven Development with Spec Kit

## Project structure

```text
frontend/    React UI using Atomic Design
backend/     Express API using layered architecture
database/    bootstrap SQL, migrations, and seeds
docs/        architecture and project documentation
specs/       feature specifications generated during SDD
.specify/    populated by Spec Kit after initialization
```

The project intentionally uses one local `.env` file at repository root. Frontend Vite, backend Node.js, and Docker Compose all read from that root configuration.

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

Backend health endpoint:

```text
GET http://localhost:3000/api/health
```

### 6. Start frontend

Open another terminal:

```bash
npm run dev:frontend
```

Default Vite URL:

```text
http://localhost:5173
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
