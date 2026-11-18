# ClubFlow PA#3 Frontend Guide

## 1. Team Members

Team member names and student IDs have not been verified from repository evidence. **Team input is required before submission.**

| Member | Student ID | Status |
| --- | --- | --- |
| To be provided | To be provided | Unverified |

## 2. How to Run

Prerequisite: Node.js 22.12.0 or newer and the existing repository dependencies installed from the root workspace.

### Frontend

```sh
npm run dev:frontend
```

The Vite development server uses `http://localhost:3000`.

### PA#3 HTTP Mock

Start the built-in Node HTTP mock with:

```sh
npm run mock
```

The default address is `http://localhost:3001`. The process starts from fresh deterministic in-memory fixtures on every restart and logs one structured JSON status record per request. The current React UI still uses browser fixtures for domain data until the consumer-integration phases are complete.

Select a mode with the process variable `MOCK_MODE=normal|slow|error|empty`; no additional environment file is used. For example in PowerShell:

```powershell
$env:MOCK_MODE = 'slow'
npm run mock
```

Verification commands:

```sh
npm run test:mock
npm run verify:mock-http
```

The second command is the repository's clearly non-official fresh-state workflow verifier. It is not the unavailable course checker.

## 3. Demo Accounts

### Required PA#3 Accounts

The HTTP mock and its fresh-state verifier runtime-check these deterministic fictional credentials.

| Name in examples | Role | User name | Password |
| --- | --- | --- | --- |
| `exec` | Executive | `exec` | `ClubFlowDemo!` |
| `studentA` | Applicant | `studentA` | `ClubFlowDemo!` |
| `studentB` | Applicant (ownership/upload checks) | `studentB` | `ClubFlowDemo!` |
| `int-content` | Interviewer - Content | `int-content` | `ClubFlowDemo!` |
| `int-comms` | Interviewer - Communications | `int-comms` | `ClubFlowDemo!` |

### Existing Browser-Demo Accounts

These credentials remain the existing browser-prototype identities in `client/src/mocks/`. The canonical usernames above issue deterministic HTTP bearer tokens; frontend session migration is a later phase.

| Browser-demo account ID | Role | Browser-demo email | Browser-demo password | Contract relationship |
| --- | --- | --- | --- | --- |
| `exec-recruitment` | Executive | `executive@clubflow.demo.example` | `ClubFlowDemo!` | Maps to `exec` |
| `ap-minhanh` | Applicant | `minh.anh@demo.example` | `ClubFlowDemo!` | Maps to `studentA` |
| `ap-quocbao` | Applicant | `quoc.bao@demo.example` | `ClubFlowDemo!` | Maps to `studentB` |
| `iv-giahuy` | Interviewer - Content | `gia.huy@clubflow.demo.example` | `ClubFlowDemo!` | Maps to `int-content` |
| `iv-hamy` | Interviewer - UX | `ha.my@clubflow.demo.example` | `ClubFlowDemo!` | Preserved legacy identity; not renamed to `int-comms` |

`int-comms` is a new deterministic HTTP fixture and does not silently replace the existing UX Interviewer.

## 4. Routes

The reviewed endpoint inventory is in [`docs/api/README.md`](docs/api/README.md). The current UI still uses browser data until integration, so these route mappings are approved contract targets rather than runtime evidence.

| Path | Role | C-step | Contract endpoint(s) | Notes |
| --- | --- | --- | --- | --- |
| `/` | Visitor / Applicant | C1, C5, C6, C11 | `GET /api/campaigns/current`; `POST /api/applications`; `GET /api/me/applications`; notification endpoints | Tabs use `?tab=campaign`, `apply`, `mine`, or `notifications`; unavailable steps need contextual UI rather than a blank page |
| `/login` | Everyone | C2 | `POST /api/auth/login`; `GET /api/auth/me`; `POST /api/auth/logout` | Contract uses username/password and returns a deterministic bearer token |
| `/profile` | Any signed-in role | C2 support | `GET/PATCH /api/me/profile` | `AuthGate` preserves a safe intended location |
| `/executive/campaign` | Executive | C3, C4 | Campaign create/read/update/publish/position endpoints; `PATCH /api/campaigns/{campaignId}/interview-setup` | Composite Campaign read includes Interview Setup data |
| `/executive/review` | Executive | C7, C11 | Application list/detail/note/screening/file/CSV; assessment/result/publication endpoints | Screening and results use `?tab=` |
| `/executive/scheduling` | Executive | C8, C9 | Schedule read/generate/row/save/export/confirm endpoints | Direct access before prerequisites must show readiness conditions |
| `/interviewer` | Interviewer | C10 | `GET /api/me/interviews`; assigned detail/CV; assessment submission | Assigned-only work or contextual empty/restricted state |
| Any unmatched path | Everyone | C2 support | None | Renders the Not Found page |

The footer separately calls `GET /api/health`. Runtime domain requests must use relative `/api` paths through `apiClient` after integration.

## 5. Product Owner Decisions

The supplied PA#3 prompt contains the following directions. No public Product Owner URLs were provided. Where the older team-selected prototype record in [`docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md`](docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md) differs, the PA#3 contract follows the supplied direction and retains the older text as history.

| Decision | PA#3 direction | Source status |
| --- | --- | --- |
| Q-01 Scheduling | A fixed consistent mock draft is acceptable; a real first-fit engine is deferred to PA#4 | Supplied PA#3 prompt; no public link |
| Q-02 Time | Use Vietnam time (UTC+7); a date-only closing value remains open through that date and closes at 00:00 the next day | Supplied PA#3 prompt; no public link |
| Q-03 Published editing | Allow constrained position/quota/window changes; linked positions cannot be deleted; first valid Application locks interview configuration; Confirmed is read-only | Supplied PA#3 prompt; reconciled in `docs/api/` |
| Q-04 Assessments | One assessment per assigned completed interview is sufficient; optional recommendation is advisory; Executive owns final result | Supplied PA#3 prompt; no public link |
| Q-05 Notifications | In-app notification after publication is required; email/Brevo is optional and not implemented for PA#3 | Supplied PA#3 prompt; no public link |
| Q-06 Optional edits | Applicant edit/withdraw and assessment editing are optional and excluded unless already required; confirmed schedules remain read-only | Supplied PA#3 prompt; no public link |
| Q-07 CV privacy | PDF up to 5 MiB; owner, campaign Executive, and assigned Interviewer visibility; production direct-URL enforcement belongs to PA#4 | Supplied PA#3 prompt; no public link |

## 6. Libraries

| Library | Reason |
| --- | --- |
| React / React DOM | Required PA#3 component and rendering stack |
| Vite | Development server and production bundler |
| React Router DOM | Direct routes, navigation, redirects, and role/auth gates |
| Plain CSS | Existing styling approach; no CSS framework dependency |
| Vitest | Sole automated test framework for frontend, backend, and mock checks |
| React Testing Library / jest-dom | Observable component, route, form, and accessibility assertions |
| ESLint with React plugins | Repository lint and React/Hook rules |
| Node.js built-in modules | HTTP mock runtime without a third-party server/router |

No dependency was added for the contract or HTTP mock.

## 7. Not Done

- Relative `/api` Vite development/preview proxies and removal of runtime absolute API configuration.
- Conversion of domain services from browser fixture/store access to HTTP.
- Full C4 editing behavior and remaining Q-03 UI correction.
- Exact official course `contract-check.mjs` execution. The file is unavailable, so official checker status is **NOT RUN**; a separate structural validator is not a substitute.
- Frontend runtime evidence for C1-C11, direct routes, 360/768/1280 widths, production preview, and rendered HTML validation. Provider-level C1-C11 and four-mode behavior are automated; they do not substitute for browser evidence.
- Team names, student IDs, public Product Owner decision links, and final submission ZIP naming fields.
