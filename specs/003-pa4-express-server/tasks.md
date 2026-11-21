---
description: "Dependency-ordered tasks for the PA#4 Express server, with owners"
---

# Tasks: PA#4 Express Server

**Input**: [spec.md](spec.md), [plan.md](plan.md), `docs/api/`, the PA#4 rubric.

**Due**: PA#4 and PA#5 on Monday 2026-12-07, 22:00. PA#6 demo on 2026-12-08.

## Team and ownership

| Member | Student ID | Owns |
| --- | --- | --- |
| Phan Lê Anh Minh | 24127082 | Harness, contract update, server skeleton, database skeleton, S2, S3, shared 401 tests, `BACKEND.md`, `HARNESS.md` |
| Hồ Phan Như Nguyệt | 24127211 | Sign-in, and the Visitor, Applicant and Interviewer screens end to end (C1, C2, C5, C6, C10, applicant side of C11) |
| Huỳnh Thái Hoàng | 24127171 | The Executive screens end to end (C3, C4, C7, C8, C9, executive side of C11) |

"End to end" means: the contract preamble of that file, the migration, the seed module, repository, service, controller, route, validation, the R/S tests and the `BACKEND.md` rows for that screen.

## How every task is done

1. Commit the test first, named with its rule id when it proves one (`R3 second application for the same position returns 409`). Run it and see it fail for the right reason. A test that only expects `404` must also contain a request that must succeed.
2. Commit the code that makes it pass, in its own commit.
3. Read `git diff -- server/test docs/api` after every assistant request; reject any change nobody asked for.
4. Add an entry under `## PA#4` in `AI-LOG.md` (tool, request, kept, changed, rejected, by hand).
5. Commit from your own machine, under your own `git config user.name` / `user.email`.

## Migration and seed numbers

Numbers follow the order of dependencies, not the person. Seed modules use the same number as their migration. Leave gaps; ask before taking a number not in this table.

| No. | Tables | Owner | Needs |
| --- | --- | --- | --- |
| `010` | users | Nguyệt | — |
| `020` | campaigns, departments | Hoàng | — |
| `030` | positions | Hoàng | 020 |
| `040` | rooms, interviewer slots, interviewer–position assignments | Hoàng | 010, 030 |
| `050` | applications, application availability | Nguyệt | 010, 030 |
| `060` | private notes, screening decisions | Hoàng | 050 |
| `070` | schedule draft, interviews | Hoàng | 040, 050 |
| `080` | assessments | Nguyệt | 070 |
| `090` | final results, notifications | Hoàng (results), Nguyệt (notifications) | 050 |

Order of work that follows from it: Hoàng starts with `020`–`030`, Nguyệt with `010` and sign-in; Nguyệt's `050` needs Hoàng's `030` merged, Hoàng's `060` needs Nguyệt's `050` merged.

---

## Phase 0 — Harness (Minh) ✅

- [x] T001 Merge `pa3-finalize` into `dev`, branch `feature/pa4`
- [x] T002 `AGENTS.md`: server stack, env rule, PA#4 constraints, never list (`db1676f`)
- [x] T003 Prettier with `format` / `format:check`; format the codebase (`a397a0f`, `a35a5eb`, `dfecaba`)
- [x] T004 GitHub Actions: format check, lint, tests, build (`e46301c`)

## Phase 1 — Contract update (Minh) — blocks everything

- [x] T010 `docs/api/README.md`: seed state, `APP_TODAY`, each file runs alone on a fresh seed, access rule (403 wrong role / 404 not theirs), JWT and token placeholders, R8 timing (spec FR-13), with `## Changes` lines
- [x] T011 `01-auth-profile.md`: tokens shown as `"…"`, JWT expiry, logout clears the client only
- [x] T012 `02-public-applicant.md`: A01, A02 and studentB's application come from the seed; new applications start at the next id; duplicate Content → `409` with A01
- [x] T013 `03`–`07`: each file states its needed starting state and the access-rule codes (done 2026-11-21). **Still open, per owner before coding that file:** the opening requests that create the state, and the updated example rows (Hoàng: 03, 04, 06 results, 07; Nguyệt: 05, 06 notifications)
- [x] T014 `AGENTS.md`: point the plan line at this folder
- [x] T015 `docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md`: record the product owners' answers to Q-01–Q-07 with the [post link](https://www.facebook.com/share/p/1DHPpDkB2n/); Q-03, Q-05 and Q-07 superseded
- [x] T016 Q-04 follow-up: not posted (team decision, 2026-11-21). The server follows R8; `BACKEND.md` explains why (spec FR-13)

## Phase 2 — Server skeleton (Minh)

- [x] T020 `git mv backend server`; remove it from the root workspaces; own `package-lock.json`; scripts `start`, `seed`, `test` (`vitest run`); `"engines": { "node": ">=22" }`; `npm start` never seeds or wipes data (spec FR-23)
- [x] T021 Dependencies: remove `cors`, `cloudinary`; add `bcryptjs`, `zod`
- [x] T022 `server/.env.example` and `config/env.js` (D1); delete the root `.env.example`; update `docker-compose.yml` (`postgres:17`, `--env-file server/.env`); `UPLOAD_DIR=./uploads` (outside `src/`) and `server/uploads/` in `.gitignore`, so the zip carries no uploaded file
- [x] T023 Test (red): **S2 server stops with a message when JWT_SECRET is missing**; then code
- [x] T024 Test (red): **S3 no Access-Control-Allow-Origin for any origin**; then remove `cors`
- [x] T025 `AppError`, error handler, not-found handler: the error shape, broken JSON → 400, no stack trace (tests first)
- [x] T026 `validate()` middleware on `zod`: `fieldErrors` per field, unknown fields dropped (tests first)
- [x] T027 `authenticate` (HS256 only) and `requireRole` middleware; `routes/index.js` mounting one router per screen area

## Phase 3 — Database skeleton (Minh)

- [ ] T030 Move migrations to `server/migrations/`; `migrate.js` reads `DATABASE_URL`
- [ ] T031 Seed runner: drop schema, migrate, run `src/db/seeds/*.js` in order, one transaction; same result when run twice
- [ ] T032 Test helpers: global setup, `resetDatabase`, `tokenFor` (secret from `env.js`), `loginAs`; `fileParallelism: false`. Keep `npm test` under 5 minutes on one CPU (bcryptjs cost 10)
- [ ] T033 Shared 401 tests (red until Nguyệt's `/api/auth/me` exists): no token, other secret, `alg: none`, expired, edited payload — each test also sends one request that must succeed
- [ ] T034 CI: `postgres:17` service, `npm ci --ignore-scripts` and `npm test` in `server/`; drop the temporary `DB_*` variables

## Phase 4 — Sign-in and Applicant/Interviewer screens (Nguyệt)

- [ ] T040 `010` users migration and seed (the 5 demo accounts plus `studentC`, an applicant with no application for the PA#6 live demo; `bcryptjs` hashes, cost 10)
- [ ] T041 `POST /api/auth/login` (same `401` for wrong password and unknown e-mail, `exp` ≤ 24 h), `GET /api/auth/me`, `POST /api/auth/logout`, `GET`/`PATCH /api/me/profile` (a `role` field is ignored)
- [ ] T042 Front end: `401` clears the session and opens sign-in with a message
- [ ] T043 C1 `GET /api/campaigns/current`; "open" means `opensOn <= APP_TODAY <= closesOn` (spec FR-19)
- [ ] T044 `050` applications; C5 `POST /api/applications` — **R2**, **R3**, **S5** (PDF magic bytes, 5 MB, server-made name)
- [ ] T045 C6 `GET /api/me/applications` — **S4** (own applications only)
- [ ] T046 `GET /api/applications/{id}/cv` — owner, assigned interviewer, executive; served as `application/pdf` with `X-Content-Type-Options: nosniff`, never as HTML — **S4**, **S5**
- [ ] T047 C10 `GET /api/me/interviews`, `GET /api/interviews/{id}` — **S4**, no screening note
- [ ] T048 `080` assessments; `POST /api/interviews/{id}/assessment` — **R8** (assigned interviewer, once, after confirmation)
- [ ] T049 `090` notifications; `GET`/`PATCH /api/me/notifications`
- [ ] T04A **S1** tests for every search, filter and sort parameter in these endpoints

## Phase 5 — Executive screens (Hoàng)

- [ ] T050 `020`, `030` campaigns, departments, positions; C3 `GET`/`POST`/`PATCH /api/campaigns…`, `DELETE …/positions/{id}`, `POST …/publish` — **R1**
- [ ] T051 `040` rooms, slots, assignments; C4 `PATCH …/interview-setup`
- [ ] T052 `POST …/close-applications`
- [ ] T053 `060` notes and decisions; C7 list (search, filter, sort, pagination), detail, CSV, private note, screening decision — **R4**, **S1** (sort/filter field names from a list), **S4**
- [ ] T054 `070` schedule; C8 generate, row edit, save, CSV — **R5**, **R6**. Generation is first-fit in the product owners' order (spec FR-18): applications by `submittedAt` then ID, earliest slot first, interviewers then rooms by stable ID, no backtracking; the conflict check covers applicant, interviewer and room
- [ ] T055 C9 `POST …/schedule/confirm` and the lock on campaign, applications and schedule — **R7**
- [ ] T056 `090` final results; C11 results, assessment view, final result, publish (creates notifications) — **R8**

## Phase 6 — Integration and hand-in (all, led by Minh)

- [ ] T060 Rebuild `client/dist/` on the server; walk C1–C11 with the demo accounts; restart without seeding and check persistence
- [ ] T061 `BACKEND.md`: team, how to run, demo accounts, data model, rules and checks (each owner writes their rows), uploads, sign-in, product owner decisions (with links), not done. In the S2 row, say that `DB_PASSWORD: ci-only-not-a-secret` in `.github/workflows/ci.yml` history is a throwaway CI value for a database that exists only inside the CI run
- [ ] T062 `brief.md` for PA#4: the prompts actually given, pasted in order. **Every member saves their prompts as they go** — they cannot be rebuilt at the end. `SELF_ASSESSMENT_REPORT.md`
- [ ] T063 Clean-copy run of the acceptance steps in spec.md, including the `node:22-slim` + `postgres:17` run with the network off; zip with `.git` and `client/dist/`, without `node_modules/`, `server/.env` and uploads
- [ ] T064 PA#5: `HARNESS.md`, `checks/gates-final.txt`, `checks/ci-runs.png`, `git tag final`

## Optional — "beyond the brief" for PA#6 B5 (only if time allows)

- [ ] T070 Candidate: an applicant withdraws their own application while the campaign accepts applications and before it is reviewed (allowed as optional by the product owners, Q-06). Contract first, with a `## Changes` line; then tests and code. Owner to be decided. Not self-registration (excluded by D-10).
