# ClubFlow PA#3 Frontend Guide

## 1. Team Members

| Member | Student ID | Role | Status |
| --- | --- | --- | --- |
| Phan Lê Anh Minh | 24127082 | Full-Stack / React Frontend / QA Lead | Verified |
| Huỳnh Thái Hoàng | 24127171 | Full-Stack / HTTP Mock & Contracts / QA | Verified |
| Hồ Phan Như Nguyệt | 24127211 | Full-Stack / UI & Accessibility / QA | Verified |

## 2. How to Run

Prerequisite: Node.js 22.12.0 or newer and existing repository dependencies installed from the root workspace (`npm install`).

### Quick start

```sh
npm ci                      # from the repository root; installs client/ too (npm workspace)
node mock/server.mjs        # terminal 1: the mock on http://localhost:3001 (PORT overrides the port)
cd client && npm run dev    # terminal 2: Vite on http://localhost:3000, /api proxied to the mock
```

Preview the production build:

```sh
cd client
npm run build
npx vite preview            # http://localhost:4173, /api proxied to the mock
```

### PA#3 HTTP Mock

Start the built-in Node HTTP mock (`npm run mock` at the root does the same):

```sh
node mock/server.mjs
```

The default address is `http://localhost:3001`. The process starts from fresh deterministic in-memory fixtures on every restart and logs one structured JSON status record per request.

Select a mode with the process variable `MOCK_MODE=normal|slow|error|empty`; no additional environment file is used:

```powershell
$env:MOCK_MODE = 'normal' # default; ~150 ms latency
$env:MOCK_MODE = 'slow'   # ~2000 ms latency; loading indicator visible
$env:MOCK_MODE = 'error'  # HTTP 500 on all domain routes except POST /api/auth/login; Error + Retry visible
$env:MOCK_MODE = 'empty'  # all arrays and nested arrays become []; zero counts; empty states visible
npm run mock
```

### Frontend Development

In another terminal, start the Vite development server:

```sh
npm run dev:frontend
```

The Vite development server runs at `http://localhost:3000`. Relative `/api` requests are proxied directly to `http://localhost:3001`.

### Production Build & Preview

```sh
npm run build
npm run preview --workspace client
```

Vite preview serves `client/dist/` at `http://localhost:4173`, also proxying `/api` to `http://localhost:3001`.

Build pitfall: if the root `.env` sets `NODE_ENV=development` (the value in `.env.example`), Vite builds a development bundle (about 676 kB, with React StrictMode sending every request twice). Delete that line from your local `.env` or run `NODE_ENV=production npm run build`, and check that `client/dist/assets/index-*.js` is about 400 kB before you zip.

### Verification Commands

```sh
npm run lint             # ESLint check across client, backend, and mock
npm test                 # Run all frontend, backend, and mock Vitest suites
npm run test:mock        # Run mock-specific tests
npm run verify:mock-http # Run non-official fresh-state 24-endpoint workflow verifier
node tools/validate-api-docs.mjs # Run structural API documentation validator
node tools/contract-check.mjs --base http://localhost:3001 # Course checker; restart the mock first
```

The mock verifier is the repository's clearly non-official fresh-state workflow verifier. It is not the unavailable course checker.

## 3. Demo Accounts

The HTTP mock and its fresh-state verifier runtime-check these deterministic fictional credentials:

| Name in examples | Role | User name | Password |
| --- | --- | --- | --- |
| `exec` | Executive | `exec` | `ClubFlowDemo!` |
| `studentA` | Applicant | `studentA` | `ClubFlowDemo!` |
| `studentB` | Applicant (ownership/upload checks) | `studentB` | `ClubFlowDemo!` |
| `int-content` | Interviewer - Content | `int-content` | `ClubFlowDemo!` |
| `int-comms` | Interviewer - Communications | `int-comms` | `ClubFlowDemo!` |

### Demo Account Display Mapping

All authentication is handled by `POST /api/auth/login`, returning real deterministic HTTP bearer tokens that are attached to all subsequent requests. The development DemoBar provides quick-switch buttons mapping to these accounts:

| Demo Account ID | Role | Display Name | Username | Password |
| --- | --- | --- | --- | --- |
| `exec-recruitment` | Executive | Hoàng Long | `exec` | `ClubFlowDemo!` |
| `ap-minhanh` | Applicant | Minh Anh | `studentA` | `ClubFlowDemo!` |
| `ap-quocbao` | Applicant | Quốc Bảo | `studentB` | `ClubFlowDemo!` |
| `iv-giahuy` | Interviewer - Content | Gia Huy | `int-content` | `ClubFlowDemo!` |
| `iv-hamy` | Interviewer - UX/Comms | Hà My | `int-comms` | `ClubFlowDemo!` |

## 4. Routes and HTTP Integration

All domain requests use relative `/api` paths through `client/src/services/apiClient.js`. The application has zero hardcoded host/port URLs in client source. Every API-backed screen provides loading, error with Retry, empty, and success states.

| Path | Role | C-step | Contract endpoint(s) | Notes |
| --- | --- | --- | --- | --- |
| `/` | Visitor / Applicant | C1, C5, C6, C11 | `GET /api/campaigns/current`; `POST /api/applications`; `GET /api/me/applications`; `GET/PATCH /api/me/notifications` | Tabs: `?tab=campaign`, `apply`, `mine`, `notifications`. 409 duplicate keeps form values and links to existing application. |
| `/login` | Everyone | C2 | `POST /api/auth/login`; `GET /api/auth/me`; `POST /api/auth/logout` | Real HTTP token authentication; session restored via `/api/auth/me` on reload. |
| `/profile` | Any signed-in role | C2 support | `GET /api/me/profile`; `PATCH /api/me/profile` | `AuthGate` preserves intended destination and redirects after sign-in. |
| `/executive/campaign` | Executive | C3, C4 | `GET/POST /api/campaigns`; `GET/PATCH /api/campaigns/{id}`; `POST /api/campaigns/{id}/publish`; `POST /api/campaigns/{id}/close-applications`; `PATCH /api/campaigns/{id}/interview-setup` | Supports new draft creation (C3), Q-03 early close, position management, and composite Interview Setup. |
| `/executive/review` | Executive | C7, C11 | `GET /api/campaigns/{id}/applications`; `POST .../screening-decision`; `PUT .../note`; `GET .../cv`; `GET .../applications/csv`; `GET/PUT .../final-result`; `POST .../results/publish` | CV screening and Final Results tabs. Search is debounced ~300 ms. Results publishing is idempotent. |
| `/executive/scheduling` | Executive | C8, C9 | `GET .../schedule`; `POST .../schedule/draft/generate`; `PATCH .../draft/rows/{id}`; `POST .../draft/save`; `POST .../schedule/confirm`; `GET .../schedule/csv` | Draft generation, conflict/unassigned calculation, row resolution, meaningful save, and confirmation lock. |
| `/interviewer` | Interviewer | C10 | `GET /api/me/interviews`; `GET /api/interviews/{id}`; `POST /api/interviews/{id}/assessment`; `GET /api/applications/{id}/cv` | Lists only assigned confirmed interviews. CV access authorized via bearer token. One immutable assessment per completed interview. |
| Any unmatched path | Everyone | C2 support | None | Renders accessible Not Found page with home link. |

The app shell footer calls `GET /api/health` to indicate API connection status.

## 5. Product Owner Decisions

Source of Q-01 to Q-07: the product owners' reply to our questions, posted under "ClubFlow - questions for the product owners" in the course Facebook group. Post: https://www.facebook.com/share/p/1CVJXYupXP/

The implementation adheres to all Product Owner decisions:

| Decision | PA#3 Direction & Implementation |
| --- | --- |
| Q-01 Scheduling | A deterministic consistent mock draft is generated; conflict calculation covers applicant, interviewer, and room; first-fit optimization engine is deferred to PA#4. |
| Q-02 Time | Uses Vietnam time (UTC+7); a date-only closing value remains open through 23:59:59 of that date and closes at 00:00 the next day. |
| Q-03 Published editing | Constrained position, quota, and interview window changes permitted on published campaigns until schedule confirmation; linked positions cannot be deleted; first valid application locks interview configuration; confirmed schedules are read-only; early close action supported. |
| Q-04 Assessments | One assessment per assigned completed interview; notes required; recommendation (Pass/Fail) is optional advisory; Executive owns final decision. |
| Q-05 Notifications | In-app notification created idempotently upon result publication; email/Brevo/SMS deferred to PA#4. |
| Q-06 Optional edits | Applicant edit/withdraw and assessment editing are excluded for PA#3; confirmed schedules remain read-only. |
| Q-07 CV privacy | PDF up to 5 MiB; visible only to owner, campaign Executive, and assigned Interviewer via authorized bearer token download. |

## 6. Libraries

| Library | Reason |
| --- | --- |
| React / React DOM (v19) | Component and rendering stack |
| Vite (v8) | Development server, proxies, and production bundler |
| React Router DOM (v7) | Declarative routing, navigation, redirects, and role/auth guards |
| Plain CSS | Existing Atomic Design styling approach; no external CSS framework |
| Vitest (v5) | Unified automated test framework for frontend, backend, and mock checks |
| React Testing Library / jest-dom | User-centric component, route, form, and accessibility assertions |
| ESLint (v9) with React plugins | Code style, linting, and React Hooks rules |
| Node.js built-in modules (`http`, `fs`, `url`, `crypto`) | HTTP mock runtime without third-party frameworks |

Zero dependencies were added for the contract or HTTP mock.

## 7. Remaining Not Done

- **Official course `contract-check.mjs`**: `node tools/contract-check.mjs --base http://localhost:3001` on a freshly started mock answered 52 of 52 examples as written (exit 0) and found an example for each of the 37 endpoints in the README table, on 2026-11-19. It also lists 3 notes (the CSV and PDF answers have no body in the example block by design), which do not count as failures. Before the fixes of that day the first run found 44 failures: the Demo accounts table sat under a sub-heading so the tool could not sign in, and the CSV and PDF answer blocks carried a body. `node tools/validate-api-docs.mjs` and `node tools/verify-pa3-http.mjs` are our own non-official checks.
- **Schedule generation**: the mock returns a fixed draft schedule; the first-fit rule of Q-01 is not computed (planned for PA#4).
- **W3C Automated Validation**: On 2026-11-19 the rendered HTML of 17 screens, 4 applicant-portal tabs and 13 states with data (lists, review drawer, final results, assessment, confirmed schedule, interviewer, preview) gave 0 errors and 0 warnings in the W3C Nu checker. Structural rules are also tested in `client/src/tests/a11y/screens.a11y.test.jsx`.
- **Interview date, window and duration on the scheduling screen**: shown, not chosen; they are set in Campaign Management and locked after publication (Q-03).
- **Draft campaign after a reload**: the campaign page edits the current campaign, so a draft created earlier is not reopened after a reload.
- **Production backend features**: Real PostgreSQL persistence, Docker containerized services, external email notifications, and cloud storage belong to PA#4.
