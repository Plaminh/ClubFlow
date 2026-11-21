# Implementation Plan: PA#4 Express Server

**Branch**: `feature/pa4` | **Date**: 2026-11-21 | **Spec**: [spec.md](spec.md) | **Tasks**: [tasks.md](tasks.md)

## Summary

Turn the existing `backend/` scaffold into a standalone Express server in `server/`, backed by PostgreSQL 17, that implements `docs/api/`. One member builds the shared foundation (harness, contract update, server skeleton, database skeleton); the other two then build their screens end to end — migration, seed, repository, service, controller, route and tests — each on their own machine and under their own name.

## Technical Context

| | |
| --- | --- |
| Language | JavaScript ES modules, Node.js 22 |
| Server | Express 5 |
| Database | PostgreSQL 17 through `pg`, no ORM; reached only through `DATABASE_URL` |
| Auth | `jsonwebtoken` (HS256), `bcryptjs` |
| Validation | `zod`, through one shared `validate()` middleware |
| Uploads | Multer, disk storage in `UPLOAD_DIR` |
| Tests | Vitest and supertest, real HTTP requests to the app, against a real database |
| Gates | Prettier (`format:check`), ESLint, Vitest, GitHub Actions |
| Marking environment | `node:22-slim`, 1 CPU, 1 GB, no network after `npm ci --ignore-scripts`, `postgres:17` |

## Decisions (agreed 2026-11-21)

| # | Decision | Why |
| --- | --- | --- |
| D1 | One env file: `server/.env`, copied from `server/.env.example`. Variables: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `UPLOAD_DIR`, `APP_TODAY`. | The marker copies `server/.env.example` and sets only `PORT`, `DATABASE_URL`, `JWT_SECRET`. The old root `.env` with `BACKEND_PORT` and `DB_*` would stop the server. |
| D2 | `server/` leaves the npm workspaces and has its own `package-lock.json`. | The marker runs `npm ci --ignore-scripts` inside `server/`. |
| D3 | Remove `cors` and `cloudinary`; add `bcryptjs` and `zod`. | The Vite proxy makes CORS unnecessary (S3). Marking is offline and CVs must be on disk (S5). `bcryptjs` and `zod` are plain JavaScript with no install script. |
| D4 | One error shape `{ error, code, fieldErrors?, details? }`, one error handler. | Contract and PA#4 criterion 1. |
| D5 | Validation with `zod`; the shared `validate()` turns its issues into `fieldErrors`. | One way to answer `400` for both screen owners. |
| D6 | Wrong role → `403`; right role, not their item → `404`. Written in `docs/api/README.md`. | S4 accepts either; one rule keeps the API consistent and hides what exists. |
| D7 | Migration and seed files are numbered in dependency order (table in tasks.md), not by person. | Two people add migrations in parallel; the seed of a table must run after the seed of the tables it references. |
| D8 | No self-registration. | Excluded by the brief (D-10). A different "beyond the brief" feature will be chosen for PA#6 B5. |
| D9 | An assessment is allowed once the schedule is confirmed (R8), not only after the interview time. | Q-04 would make C10 impossible with a fixed `APP_TODAY`; the conflict is recorded in the contract and `BACKEND.md` and posted to the product owners. |
| D10 | Each R/S rule: test committed red, then the code. Each member commits from their own machine. | PA#4 criteria 7 and 10; PA#6 questions start from `git log --author`. |
| D11 | Identifiers stay the contract's strings (`A01`, `cmp-2026-hk1`, `u-studenta`); new applications get the next `Axx`. | The contract examples and the front end use these ids. |
| D12 | The front end keeps the token in `sessionStorage` (unchanged from PA#3). | Cleared when the tab closes; one role per tab, as the PA#6 demo needs one window per role. Reason written in `BACKEND.md`. |

## Server structure

```text
server/
├── package.json, package-lock.json, .env.example, vitest.config.js
├── migrations/                 # NNN-name.sql, numbered as in tasks.md
├── src/
│   ├── server.js               # app.listen(PORT)
│   ├── app.js                  # express.json, routes, 404, error handler
│   ├── config/env.js           # the only module that reads process.env
│   ├── db/                     # pool, transaction, migrate, seed runner
│   │   └── seeds/NNN-name.js   # one seed module per table group, same numbers as migrations
│   ├── errors/AppError.js      # status, code, message, fieldErrors, details
│   ├── middleware/             # authenticate, requireRole, validate, errorHandler, notFound, upload
│   ├── routes/index.js         # only mounts the per-screen routers
│   ├── routes/<area>.routes.js # one router per screen area, owned by one member
│   ├── controllers/ services/ repositories/ validators/ models/
└── test/
    ├── helpers/                # app, resetDatabase, tokenFor, loginAs
    └── *.test.js               # named with the rule id first
```

Layering follows `AGENTS.md`: Route → Validator/Middleware → Controller → Service → Repository → PostgreSQL.

## Database

- Migrations: plain SQL in `server/migrations/`, applied in file-name order by `src/db/migrate.js`, recorded in `schema_migrations`. A shared migration is never rewritten; a change is a new file.
- Seed (`npm run seed`): drop and recreate the `public` schema, run every migration, then run every module in `src/db/seeds/` in file-name order, inside one transaction. Running it twice gives the same state.
- Seed data is copied from `mock/data/` into the seed modules so the contract ids and the example story match; the server does not read `mock/`.
- Seeded CVs: `mock/data/sample-cv.pdf` (a fictional CV) is copied into `UPLOAD_DIR` under server-made names.

## Tests

- `npm test` = `vitest run`, files run one after another (`fileParallelism: false`): the files share one database.
- A global setup migrates the empty database in `DATABASE_URL`; each test file runs the seed in `beforeAll`.
- `tokenFor(userId, role)` signs with `env.jwtSecret` (never a literal); `loginAs(name)` signs in through the API.
- On a developer machine, point `DATABASE_URL` at a separate test database when running `npm test`: the tests wipe it.
- CI adds a `postgres:17` service and runs `npm ci --ignore-scripts` and `npm test` in `server/`.

## Constitution check

| Principle | Status |
| --- | --- |
| Fixed stack | PASS — Express, PostgreSQL, Vitest kept; `zod` and `bcryptjs` approved by the team on 2026-11-21. |
| Backend layering | PASS — enforced by the structure above and reviewed per pull request. |
| Database discipline | PASS — schema only in migrations; seeds are demo data. |
| Environment | CHANGED — one `server/.env` instead of one root `.env`; `AGENTS.md` updated in `db1676f`. |
| Spec-driven | PASS — this plan, spec.md and tasks.md before implementation; `clarify` and `analyze` were done in conversation and are recorded in `AI-LOG.md`. |
