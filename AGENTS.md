# Project Agent Rules

## Project Stack

Use the existing stack:

- Frontend: React, Vite, Atomic Design, Vitest, React Testing Library, and ESLint
- Backend: Node.js, Express, PostgreSQL, and Vitest
- Development: Docker, GitHub Spec Kit (Speckit), and Jira

Do NOT replace or introduce alternative frameworks, databases, ORMs, or test frameworks without explicit approval.

---

## Environment Configuration

Use exactly one local environment file:

`.env`

Do NOT create additional environment files inside `client/`, `backend/`, or for separate environments.

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
- Reusable API calls MUST go through `client/src/services`.
- Shared HTTP behavior and configuration MUST go through `apiClient`.
- Components MUST NOT contain unrelated data-access logic.
- Do NOT introduce Redux or another global state library without an approved requirement.

### PA#3 Frontend Delivery Constraints

- React source MUST remain in `client/`, and existing UI behavior and business logic MUST be preserved during structural or integration work.
- PA#3 work MUST follow contract-first, then HTTP mock-first delivery: define and review `docs/api/` before implementing `mock/`, and implement/review the HTTP mock before connecting domain services.
- Runtime domain requests MUST use relative `/api` paths. Do not hardcode hosts, ports, or absolute API URLs in application source.
- Main-flow business data MUST NOT be hardcoded in components. API-backed screens MUST provide loading, error with Retry, empty, and successful states.
- Do not add or change API contract endpoints, mock behavior/data, or dependencies without explicit approval and coordinated review.
- C1-C11 flows, the `normal`/`slow`/`error`/`empty` HTTP mock modes, direct-route access, and responsive checks at 360 px, 768 px, and 1280 px are PA#3 acceptance gates.
- Preserve semantic HTML, one `h1` per screen, labeled form controls, link/button semantics, 44 px mobile targets, and no horizontal page scroll.

---

## Backend Architecture

Backend MUST follow:

`Route -> Validator/Middleware -> Controller -> Service -> Repository -> PostgreSQL`

Models represent domain entities and domain-specific behavior.

Rules:

- Routes define endpoints and compose middleware and controllers; they MUST NOT contain business logic or database access.
- Validators and middleware validate or preprocess requests before business logic runs.
- Controllers MUST handle HTTP concerns only.
- Controllers MUST NOT contain business logic or access the database directly.
- Services MUST contain business workflows and MUST NOT execute SQL or access Express `req`/`res`.
- Repositories MUST own application data-access queries.
- Repositories MAY map database rows into domain models.
- Models MUST NOT execute SQL, access the PostgreSQL pool, access Express `req`/`res`, or act as repositories.
- Models are domain entities, not a mandatory processing layer after repositories.
- Untrusted API input MUST be validated before reaching business logic.
- Application data-access SQL MUST remain in repositories.
- Do NOT introduce an ORM without explicit approval.

Database infrastructure MAY execute SQL required for migrations, initialization, transactions, and infrastructure-level operations.

---

## Database and Testing

Shared PostgreSQL schema changes MUST use migrations.

Do NOT silently rewrite migrations that have already been shared or used by the team.

Seeds are for development and demo data only.

Use Vitest for frontend and backend automated tests. Use React Testing Library for frontend component and interaction tests when applicable. Backend coverage may include unit and integration tests.

New or modified business rules, validators, important API behavior, domain model behavior, and critical UI interactions MUST include relevant automated tests when their observable behavior changes.

Where practical, tests SHOULD verify observable behavior rather than implementation details.

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

## Team Workflow and Git Conventions

Use short, descriptive branch names:

- `feature/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`
- `test/<short-name>`
- `chore/<short-name>`

Use commits in the form `<type>: <brief description>`, for example:

- `feat: add login endpoint`
- `fix: handle expired token`
- `test: add upload middleware tests`
- `docs: update quality gate`

Changes SHOULD be understandable by another team member. Important or non-trivial changes SHOULD be checked against the approved specification and receive human review. AI-generated code MUST be reviewed before acceptance, and the team MUST NOT merge code it cannot explain.

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

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/002-pa3-http-integration/plan.md
<!-- SPECKIT END -->
