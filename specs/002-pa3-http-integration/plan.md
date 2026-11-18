# Implementation Plan: PA#3 HTTP Integration and Completion

**Branch**: `pa3-finalize` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-pa3-http-integration/spec.md`

## Summary

Complete PA#3 without rewriting the existing UI: finish and review the C1-C11 HTTP contract, implement a deterministic stateful mock with Node.js built-ins, replace browser-store domain services with relative `/api` calls through the shared client, close remaining functional and accessibility gaps, and produce evidence-based submission documentation. Delivery is strictly contract-first, then mock-first, then frontend integration, with a verified local commit at each boundary.

## Technical Context

**Language/Version**: JavaScript ES modules and JSX; Node.js 22.12 or newer; React 19

**Primary Dependencies**: Existing React, React DOM, React Router, Vite, Vitest, React Testing Library, ESLint; the runtime mock uses Node.js built-in modules only

**Storage**: Deterministic JSON fixtures under `mock/data/` loaded into process memory; mutations reset on server restart; no PA#3 database persistence

**Testing**: Vitest for frontend, backend regression, and mock/contract-equivalent automated checks; React Testing Library for UI interactions; browser automation only when an already available browser can be driven without new dependencies

**Target Platform**: Current Chromium-family, Firefox, and modern mobile/desktop browsers; local Node.js mock on port 3001

**Project Type**: Existing web application with a React/Vite client, preserved Express/PostgreSQL scaffold, and a separate PA#3 mock process

**Performance Goals**: Normal mock responses approximately 150 ms; slow mode approximately 2 seconds; UI must expose loading without request loops or stale search results

**Constraints**: Relative `/api` runtime paths; one root `.env`; no new runtime dependencies; no Express in the mock; no PA#4 domain backend; contract and mock changes require review; semantic and responsive gates at 360/768/1280 px

**Scale/Scope**: One club, one primary campaign, three roles plus visitors, canonical accounts, C1-C11, four mock modes, seven existing product screens plus account screens

## Constitution Check

*GATE: Passed before research and re-checked after design.*

| Principle | Status | Plan evidence |
| --- | --- | --- |
| I. Fixed Technology Stack | PASS | Existing React/Vite/Vitest/ESLint stack is retained; no dependency or framework replacement. |
| II. Frontend Architecture | PASS | Pages/hooks continue to call `client/src/services`; all HTTP behavior remains in `apiClient`; Atomic Design dependency direction is unchanged. |
| III. Backend Architecture | PASS / N/A | PA#4 Express domain code is not implemented or bypassed; the separate PA#3 mock is explicitly not the production backend. |
| IV. Database Discipline | PASS / N/A | No schema or migration change; mock fixtures are demonstration data only. |
| V. Testing Strategy | PASS | Vitest remains the sole automated test framework; changed validation and business behavior receive observable tests. |
| VI. Environment Configuration | PASS | No additional environment file; mode/port are process variables with safe defaults; browser runtime uses relative paths. |
| VII. Simplicity and Oral-Exam Readiness | PASS | Plain built-in HTTP routing and small domain helpers; no ORM, Redux, DI container, or generalized framework. |
| VIII. Spec-Driven Development | PASS | Dedicated spec, clarification audit, plan, requirement checklist, tasks, analysis, implementation, and convergence. |
| IX. Scope Control | PASS | Existing UI and backend scaffold are preserved; the mock is required by the PA#3 rubric and justified below. |
| X. AI Usage | PASS | Each implementation phase and real verification result is appended to `AI-LOG.md`; no historical entry is rewritten. |

**Post-design re-check**: The design artifacts retain all gates. The only new runtime boundary is `mock/`, mandated for PA#3 and isolated from the production backend architecture.

## Delivery Phases and Gates

### Phase 2B/2C - Contract and independent review

- Complete `docs/api/` using current service shapes and the authoritative C1-C11 requirements.
- Resolve Q-03 in favor of the supplied PA#3 direction: constrained edits remain possible after publication; the first valid application locks interview configuration; confirmation locks required records.
- Pair every request example with its response and keep checker-compatible token/file placeholders.
- Validate inventory, examples, schemas, roles, ownership, transitions, links, and `## Changes` sections.
- Commit only contract/planning/documentation files after diff and structural validation.

### Phase 3 - Stateful HTTP mock

- Load deterministic fixtures into memory and expose the committed contract through `mock/server.mjs`.
- Authenticate canonical accounts with stable deterministic tokens.
- Enforce role, ownership, assignment, lifecycle, validation, and conflict rules.
- Support JSON, multipart PDF input, CSV/PDF output, request logs, normal/slow/error/empty modes, and restart reset.
- Add Vitest coverage and equivalent contract-driving HTTP checks; record the official checker as NOT RUN unless the exact official file appears.

### Phase 4 - React HTTP integration

- Make `apiClient` path-relative and capable of JSON, FormData, empty bodies, CSV/PDF downloads, structured errors, bearer tokens, and abort signals.
- Add Vite development and preview proxies for `/api`.
- Replace domain service browser-store imports with contract-aligned adapters while retaining existing exports and page-facing DTOs where practical.
- Convert the shared session context to HTTP authentication and token ownership; retain only clearly labeled development controls that do not become runtime domain sources.
- Integrate in the order auth, public campaign, campaign/applicant, review/schedule, interviewer/results.

### Phase 5 - Functional convergence

- Reconcile UI behavior with the committed contract, especially interview setup, constrained published editing, duplicate applications, search/filter/page state, schedule resolution, assessment ownership, and result notification.
- Ensure every API-backed page handles loading, retryable error, empty, and success states without reloads or request loops.
- Preserve semantic structure, one `h1`, form labeling, focus behavior, and responsive layouts.

### Phase 6 - Full QA and submission readiness

- Run lint, all Vitest suites, build, fresh-state contract-equivalent checks, and all four modes.
- Walk C1-C11 and route/role/reload/back behavior; use available browser automation for 360/768/1280 checks.
- Validate rendered HTML where tooling permits; otherwise label W3C or manual checks NOT RUN.
- Finish `FRONTEND.md`, `brief.md`, `AI-LOG.md`, `SELF_ASSESSMENT_REPORT.md`, API docs, task status, and latest `client/dist/`.
- Audit submission contents and produce a missing-human-input checklist; do not create a final ZIP when team identity or accurate score naming is unavailable.

## Project Structure

### Documentation (this feature)

```text
specs/002-pa3-http-integration/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- http-boundary.md
|-- checklists/
|   |-- requirements.md
|   `-- api-delivery.md
`-- tasks.md
```

### Source Code (repository root)

```text
docs/api/                         # committed HTTP contract and examples
mock/
|-- server.mjs                    # built-in Node HTTP entry point
|-- lib/                          # routing, validation, serialization, domain helpers
|-- data/                         # deterministic fictional fixture JSON
|-- tests/                        # Vitest mock and workflow tests
`-- vitest.config.mjs
tools/                            # official checker only if supplied; local equivalent verifier otherwise
client/
|-- src/
|   |-- components/               # existing Atomic Design UI, minimal behavior changes
|   |-- contexts/                 # authenticated user/token shared state
|   |-- hooks/                    # screen reads/actions, abort and retry behavior
|   |-- pages/                    # existing routes and UI states
|   |-- services/                 # all domain HTTP adapters through apiClient
|   `-- tests/                    # service, route, page, interaction, and accessibility tests
|-- vite.config.js                # `/api` development and preview proxy
`-- dist/                         # latest production build artifact
backend/                          # preserved PA#4 scaffold; regression-tested but unchanged by default
```

**Structure Decision**: Keep the production `backend/` untouched and add the rubric-required `mock/` boundary at repository root. Continue using the established frontend service/hook/page layering; remove browser fixtures only as runtime domain dependencies, not as historical test references until their tests are safely migrated.

## Commit Boundaries

1. `docs: define PA3 API contract`
2. `feat: implement contract-driven PA3 HTTP mock`
3. `feat: integrate PA3 authentication and API client`
4. `feat: integrate campaign and applicant API flows`
5. `feat: integrate application review and scheduling APIs`
6. `feat: integrate interviewer and results APIs`
7. Focused functional/test/docs commits only when independently verified

Every commit is local, stages explicit files only, follows a reviewed diff, and requires relevant green gates. No push, merge, rebase, reset, history rewrite, or branch change is permitted.

## Complexity Tracking

No constitution violations require justification. The separate built-in mock is an explicit PA#3 deliverable rather than an alternative backend framework.
