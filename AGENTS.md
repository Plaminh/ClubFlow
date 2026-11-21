# Project Agent Rules

## Project Stack

Use the existing stack:

- Frontend: React, Vite, Atomic Design, Vitest, React Testing Library, and ESLint
- Backend (`server/`, renamed from `backend/` in PA#4): Node.js 22, Express 5, PostgreSQL 17 through `pg` (no ORM), `jsonwebtoken`, `bcryptjs`, Multer, Vitest and supertest
- Formatting and linting: Prettier and ESLint
- Development: Docker, GitHub Spec Kit (Speckit), and Jira

Do NOT replace or introduce alternative frameworks, databases, ORMs, or test frameworks without explicit approval.

---

## Environment Configuration

Use exactly one local environment file: `server/.env`, copied from `server/.env.example`.
(Changed in PA#4: the marker copies `server/.env.example` to `server/.env` and sets only `PORT`, `DATABASE_URL` and `JWT_SECRET`, so the server cannot depend on a root `.env`.)

Do NOT create other environment files in the repository root, `client/`, or for separate environments.

Rules:

- The server reads the environment in one module (`server/src/config/env.js`) and finds the database through `DATABASE_URL` only.
- Every variable has a placeholder in `server/.env.example`; the example values of `UPLOAD_DIR` and `APP_TODAY` must work as they are.
- A missing `JWT_SECRET` stops the server with a message. No fallback value for any secret.
- Browser-visible variables MUST use the `VITE_` prefix; secrets MUST NOT.
- `.env` MUST remain ignored by Git.

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
- Call only endpoints that exist in `docs/api/`. If a screen needs one that is missing, stop and say so; do not call it, and do not edit `docs/api/` or `mock/` to make it exist.
- When a change to `docs/api/` or `mock/` is approved, add a dated line to that file's `## Changes` section, and read `git diff -- docs/api mock` after every assistant request; reject any change nobody asked for.
- Stack for PA#3: React Router (`BrowserRouter`), plain CSS bundled by Vite, no form library, no other framework. Adding any dependency needs explicit approval.
- Before a hand-in: build with `NODE_ENV=production` (a development bundle sends every request twice), start `node mock/server.mjs` fresh, run `node tools/contract-check.mjs`, then open every route as each demo account at 360, 768 and 1280 px in the `normal`, `slow`, `error` and `empty` modes.
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

### PA#4 Server Delivery Constraints

- `server/` is a standalone npm project (not a root workspace) with its own committed `package-lock.json`. It must install with `npm ci --ignore-scripts`.
- The server implements `docs/api/` as written. When the server needs something different, change the contract first, add a dated line to its `## Changes`, and commit that before the code.
- Every rule R1–R8 and flaw S1–S5 gets a test named with its id first (`R3 second application for the same position returns 409`) that sends real HTTP requests. Commit the test red, then the code that makes it green. Read `git diff -- server/test` after every assistant request.
- `npm test` in `server/` runs offline against an empty `DATABASE_URL`; tests create what they need.
- `npm run seed` gives the same state on an empty and on a seeded database.
- Uploaded CVs: PDF only (file starts with `%PDF-`), at most 5 MB, stored under a server-made name in `UPLOAD_DIR`, served as `application/pdf`.

Commands (in `server/`): `npm ci --ignore-scripts`, `npm run seed`, `npm start`, `npm test`.
Commands (root): `npm run lint`, `npm run format:check`, `npm test`.

### Never

- Never commit `.env`, a real password, key or connection string.
- Never call `cors()` with no options, or answer `Access-Control-Allow-Origin: *`.
- Never build SQL with template strings or `+`; request data goes in `$1` placeholders, and sort/filter field names are checked against a list.
- Never read the role from the request body; it comes from the verified token.
- Never edit, skip, loosen or delete a test, the contract or the seed to make something pass — stop and say so.
- Never add a package that needs an install script (`bcrypt`, `sharp`, `better-sqlite3`, ORMs that download engines).
- Never change the database schema outside a migration.
- Never put a real student's CV or personal data in a prompt, a test or the seed.

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
