# ClubFlow PA#3 Frontend Guide

## 1. Team Members

Team member names and student IDs have not been verified from repository evidence. **Team input required before submission.**

| Member | Student ID | Status |
| --- | --- | --- |
| To be provided | To be provided | Unverified |

## 2. Run the Frontend and Mock

### Frontend

Prerequisite: Node.js 22.12.0 or newer and the repository dependencies installed from the root workspace.

```sh
npm run dev:frontend
```

The Vite development server uses `http://localhost:3000`.

### PA#3 HTTP Mock

The required `mock/server.mjs` and `mock/data/` do not exist yet. The required future command is therefore **not currently runnable**:

```sh
node mock/server.mjs
```

The current React prototype uses in-browser fixtures and services. Only the footer health check uses the shared HTTP client. This does not satisfy PA#3 HTTP mock integration.

## 3. Demo Accounts

### Required PA#3 Accounts

The rubric requires the following names in examples. These accounts do **not** exist in an approved API contract or HTTP mock yet, and no HTTP credentials are verified.

| Name in examples | Required role | HTTP email/username | HTTP password | Status |
| --- | --- | --- | --- | --- |
| `exec` | Executive | Unverified | Unverified | Required; not implemented over HTTP |
| `studentA` | Applicant | Unverified | Unverified | Required; not implemented over HTTP |
| `int-content` | Interviewer — Content | Unverified | Unverified | Required; not implemented over HTTP |
| `int-comms` | Interviewer — Communications | Unverified | Unverified | Required; not implemented over HTTP |

### Existing Browser-Demo Accounts

The following credentials are verified only for the current in-browser prototype in `client/src/mocks/auth.js` and `client/src/mocks/fixtures.js`. They are fictional, issue no HTTP token, and must not be presented as the required PA#3 HTTP accounts.

| Browser-demo account ID | Role | Browser-demo email | Browser-demo password | Relationship to required examples |
| --- | --- | --- | --- | --- |
| `exec-recruitment` | Executive | `executive@clubflow.demo.example` | `ClubFlowDemo!` | Possible future mapping to `exec`; not approved |
| `ap-minhanh` | Applicant | `minh.anh@demo.example` | `ClubFlowDemo!` | Possible future mapping to `studentA`; not approved |
| `iv-giahuy` | Interviewer — Content Creation | `gia.huy@clubflow.demo.example` | `ClubFlowDemo!` | Possible future mapping to `int-content`; not approved |
| `iv-hamy` | Interviewer — UX | `ha.my@clubflow.demo.example` | `ClubFlowDemo!` | No verified mapping to `int-comms` |

## 4. Routes

No ClubFlow domain endpoint inventory is approved in `docs/api/` yet. “Browser mock” means the page currently reads or mutates in-memory data rather than an HTTP mock response.

| Path | Role | C-step | Current data endpoint | Notes |
| --- | --- | --- | --- | --- |
| `/` | Visitor / Applicant | C1, C5, C6, C11 | Not defined; browser mock | Tabs use `?tab=campaign`, `apply`, `mine`, or `notifications`; unavailable steps show contextual UI rather than a blank page |
| `/login` | Everyone | C2 | Not defined; browser mock | Returns an authenticated user only from browser-demo state |
| `/profile` | Any signed-in role | C2 support | Not defined; browser mock | `AuthGate` redirects visitors to `/login` and preserves the intended location |
| `/executive/campaign` | Executive | C3, C4 | Not defined; browser mock | `RoleGate` redirects visitors and shows a restricted state to other roles |
| `/executive/review` | Executive | C7, C11 | Not defined; browser mock | Screening and results are selected with `?tab=` |
| `/executive/scheduling` | Executive | C8, C9 | Not defined; browser mock | Current scenarios control draft/confirmed availability and messages |
| `/interviewer` | Interviewer | C10 | Not defined; browser mock | Shows a restricted or empty state when the current demo state cannot provide work |
| Any unmatched path | Everyone | C2 support | None | Renders the Not Found page |

The application footer separately calls the health service through `apiClient('/health')`; with the current root environment example this resolves to the backend `GET /api/health`. Domain pages are not HTTP-integrated.

## 5. Product Owner Decisions

The PA#3 rubric prompt supplied these decisions directly to the assistant. No public Product Owner URLs were provided. The existing local decision record is [`docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md`](docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md), but it requires reconciliation with the supplied PA#3 decisions before the API contract is approved, especially Q-03.

| Decision | Verified PA#3 direction | Source status |
| --- | --- | --- |
| Q-01 Scheduling | A fixed, consistent mock schedule is acceptable; a real first-fit engine is not required for PA#3 | Supplied PA#3 prompt; no public link |
| Q-02 Time | Use Vietnam time (UTC+7); a date-only closing value remains open through that date and closes at 00:00 the next day | Supplied PA#3 prompt; no public link |
| Q-03 Published editing | Published campaigns may still allow constrained position/quota/window changes; linked positions cannot be deleted, interview configuration locks after the first valid application, and Confirmed is read-only | Supplied PA#3 prompt; local record conflicts and needs review |
| Q-04 Assessments | One assessment per assigned completed interview is sufficient; criteria scores and recommendations are optional; Executive owns the final result | Supplied PA#3 prompt; no public link |
| Q-05 Notifications | In-app notification after result publication is required; email/Brevo is optional for PA#3 | Supplied PA#3 prompt; no public link |
| Q-06 Optional edits | Applicant edit/withdraw and interviewer assessment edits are optional within the stated pre-review/pre-publication limits; confirmed schedules remain read-only | Supplied PA#3 prompt; no public link |
| Q-07 CV privacy | PDF up to 5 MB; Applicant sees own CV, assigned Interviewer sees assigned CVs, and Executive sees campaign CVs; backend direct-URL enforcement belongs to PA#4 | Supplied PA#3 prompt; no public link |

## 6. Libraries

| Library | Reason |
| --- | --- |
| React / React DOM | Required PA#3 component and rendering stack |
| Vite | Development server and production bundler required by PA#3 |
| React Router DOM | Browser routing, direct routes, navigation, redirects, and role/auth gates |
| Plain CSS | Existing bundled styling approach; no CSS framework dependency is present |
| Vitest | Existing frontend unit and integration test runner |
| React Testing Library / jest-dom | Observable component, route, form, and accessibility-oriented assertions |
| ESLint with React plugins | Repository linting and React/Hook rule enforcement |

No new dependency was added during Phase 1.

## 7. Not Done

- Complete API contract, endpoint examples, and change history under `docs/api/`.
- Node built-in HTTP mock server at `mock/server.mjs`, seed data under `mock/data/`, and `normal`, `slow`, `error`, and `empty` modes.
- Canonical PA#3 demo accounts and token-based mock authentication.
- Relative `/api` runtime configuration with Vite development and preview proxies.
- Conversion of domain services from browser fixtures/store access to HTTP requests.
- Contract checker and complete C1-C11 endpoint trace.
- Full C4 interviewer assignment, availability, room, date, slot, and duration editor required by the PA#3 rubric.
- Reconciliation of Q-03 and any other local requirement conflicts before contract approval.
- Current runtime evidence for all direct routes, four HTTP modes, responsive widths, and rendered HTML validation.
- Team names, student IDs, and any public Product Owner decision links.
