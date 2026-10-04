# Project Agent Rules

## Technology Stack

Use the existing stack:

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Testing: Vitest
- Containerization: Docker
- Specification workflow: GitHub Spec Kit

Do NOT replace or introduce alternative frameworks, databases, ORMs, or test frameworks without explicit approval.

---

## Environment Configuration

Use exactly one local environment file:

`.env`

Do NOT create additional environment files inside `frontend/`, `backend/`, or for separate environments.

Rules:

- Browser-visible variables MUST use the `VITE_` prefix.
- Secrets MUST NOT use the `VITE_` prefix.
- `.env` MUST remain ignored by Git.
- Update `.env.example` whenever a new environment variable is introduced.

---

## Frontend Architecture

Frontend MUST follow:

`atoms -> molecules -> organisms -> templates -> pages`

Rules:

- Lower-level components MUST NOT import higher-level components.
- Atoms and molecules MUST NOT perform backend API calls.
- API access MUST go through frontend services.
- Shared HTTP configuration MUST go through the shared API client.
- Do NOT introduce Redux or another global state library without an approved requirement.

---

## Backend Architecture

Backend MUST follow:

`Route -> Validator/Middleware -> Controller -> Service -> Repository -> PostgreSQL`

Models represent domain entities and domain-specific behavior.

Rules:

- Routes MUST NOT contain business logic or database access.
- Controllers MUST handle HTTP concerns only.
- Controllers MUST NOT contain business logic or access the database directly.
- Services MUST contain business workflows and MUST NOT execute SQL or access Express `req`/`res`.
- Repositories MUST own application data-access queries.
- Repositories MAY map database rows into domain models.
- Models MUST NOT execute SQL, access the PostgreSQL pool, access Express `req`/`res`, or act as repositories.
- Untrusted API input MUST be validated before reaching business logic.
- Application data-access SQL MUST remain in repositories.

Database infrastructure MAY execute SQL required for migrations, initialization, transactions, and infrastructure-level operations.

---

## Database and Testing

Shared PostgreSQL schema changes MUST use migrations.

Do NOT silently rewrite migrations that have already been shared or used by the team.

Seeds are for development and demo data only.

Use Vitest only.

New or modified business rules, validators, important API behavior, domain model behavior, and critical UI interactions MUST include relevant automated tests when their observable behavior changes.

Do NOT create meaningless tests only to increase test count or coverage.

---

## Spec-Driven Development

Non-trivial features MUST follow:

`specify -> clarify -> plan -> checklist -> tasks -> analyze -> implement -> converge`

Implementation MUST remain consistent with:

- project constitution
- `spec.md`
- `plan.md`
- `tasks.md`

If these artifacts conflict, report the conflict instead of guessing.

Architecture changes MUST first be justified in `plan.md`.

---

## Change Safety

Before changing code:

1. inspect the relevant existing files;
2. inspect the active specification, plan, and tasks when available;
3. preserve existing project conventions;
4. make the smallest change that satisfies the approved specification.

Do NOT:

- modify unrelated files;
- silently refactor unrelated working code;
- delete working functionality unless required by the specification;
- silently modify unrelated dependencies, configuration, or project structure.

Do NOT introduce without explicit approval:

- Next.js
- Prisma
- Sequelize
- MongoDB
- Jest
- Redux
- microservices
- Kubernetes
- dependency injection containers
- generic repository frameworks

---

## Completion and AI Usage

A task is complete only when:

- implementation satisfies the approved specification;
- project architecture and constitution are respected;
- relevant tests pass;
- no unrelated changes were introduced;
- `tasks.md` reflects completed work.

AI-assisted specification, planning, task generation, implementation, review, or code generation MUST be recorded in `AI-LOG.md`.

AI-generated or AI-modified code MUST be reviewed and understood by the team before it is considered complete.