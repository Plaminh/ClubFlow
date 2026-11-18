---

description: "Dependency-ordered tasks for PA#3 HTTP integration and completion"
---

# Tasks: PA#3 HTTP Integration and Completion

**Input**: Design documents from `specs/002-pa3-http-integration/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/http-boundary.md](contracts/http-boundary.md), [quickstart.md](quickstart.md)

**Tests**: Required. New contract behavior, mock workflows, validation, service adapters, and critical UI interactions must be covered with Vitest before their implementation is considered complete.

**Organization**: Contract and full HTTP mock are shared blocking phases because the approved delivery order is contract-first, then mock-first. Frontend consumer work is then grouped by the four user stories from `spec.md`.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: May be implemented independently in a different file after its phase prerequisites.
- **[US1]**: Executive recruitment workflow.
- **[US2]**: Applicant submission and tracking.
- **[US3]**: Interviewer assigned assessment workflow.
- **[US4]**: Reviewer modes, routing, responsive, and evidence workflow.

---

## Phase 1: API Contract and Review (PA#3 Phase 2B/2C)

**Purpose**: Complete, validate, review, and commit the authoritative C1-C11 contract before any mock route or consumer changes.

- [x] T001 Audit `docs/api/`, `client/src/services/`, `docs/requirements/`, `FRONTEND.md`, and the supplied PA#3 decisions; record the final endpoint/C1-C11 coverage matrix in `docs/api/README.md`
- [x] T002 Finalize shared scalar, resource, visibility, lifecycle, validation, and canonical fixture definitions in `docs/api/00-resource-models.md`
- [x] T003 Finalize username/password login, deterministic tokens, current-user, logout, and profile examples/errors in `docs/api/01-auth-profile.md`
- [x] T004 [P] Define public campaign, multipart Applicant submission, own applications, duplicate/closed errors, and paired examples in `docs/api/02-public-applicant.md`
- [x] T005 [P] Define Executive review list/stats/search/filter/sort/page, detail, note, screening, protected CV, and CSV contracts in `docs/api/03-review-files.md`
- [x] T006 [P] Define schedule view, generate, row edit/resolve, meaningful save, export, refusal, confirmation, and locks in `docs/api/04-scheduling.md`
- [x] T007 [P] Define assigned Interviewer list/detail/CV visibility and immutable assessment submission in `docs/api/05-interviewer.md`
- [x] T008 [P] Define Executive assessment/result operations, idempotent result publication, and Applicant notifications in `docs/api/06-results-notifications.md`
- [x] T009 [P] Define draft/published campaign management, constrained Q-03 edits, position removal, close action, and composite interview setup in `docs/api/07-campaign-management.md`
- [x] T010 Add a non-official structural contract validator covering inventory, document links, `## Changes`, example pairing/order, endpoint coverage, and placeholder syntax in `tools/validate-api-docs.mjs`
- [x] T011 Add Vitest coverage for `tools/validate-api-docs.mjs`, run the validator directly as a structural gate, and document the official checker as unavailable/NOT RUN without creating `tools/contract-check.mjs`
- [x] T012 Reconcile verified PA#3 accounts, routes, decisions, run instructions, and contract status in `FRONTEND.md`; append the real request and Phase 2B/2C work to `brief.md` and `AI-LOG.md`
- [x] T013 Run contract structural validation, Markdown/link/coverage review, `git diff --check`, explicit staged diff review, and create the scoped local commit `docs: define PA3 API contract`

**Checkpoint**: The committed contract is complete and independently reviewed. No `mock/` or frontend consumer implementation is included in the commit.

---

## Phase 2: Full HTTP Mock (PA#3 Phase 3 - Blocking Foundation)

**Purpose**: Implement and verify the entire committed provider before any frontend domain service consumes it.

**CRITICAL**: Phase 1 commit must exist before this phase begins. No frontend domain integration starts until the Phase 2 commit exists.

- [x] T014 Add mock test configuration and root scripts without new dependencies in `mock/vitest.config.mjs` and `package.json`
- [x] T015 [P] Create deterministic fictional users, campaign, positions, slots, rooms, assignments, applications, schedule, assessments, results, notifications, and sample PDF fixtures under `mock/data/`
- [x] T016 [P] Add failing tests for login/role/profile handling and stable restart tokens in `mock/tests/auth-profile.test.mjs`
- [x] T017 [P] Add failing tests for public campaign, multipart limits, duplicate applications, A01/A02 independence, and own-data visibility in `mock/tests/applicant.test.mjs`
- [x] T018 [P] Add failing tests for campaign publication/Q-03 edits, review mutations, CSV, CV permissions, and interview setup in `mock/tests/executive.test.mjs`
- [x] T019 [P] Add failing tests for conflict/unassigned recalculation, meaningful save, invalid confirmation, confirmation lock, and CSV export in `mock/tests/scheduling.test.mjs`
- [x] T020 [P] Add failing tests for assigned Interviewer ownership, assessment uniqueness, result publication, notification uniqueness, and privacy in `mock/tests/outcomes.test.mjs`
- [x] T021 [P] Add failing tests for normal/slow/error/empty modes, nested arrays, request logging, and restart/reset behavior in `mock/tests/modes.test.mjs`
- [x] T022 Implement request parsing, JSON/error/file responses, path matching, delay/mode handling, recursive empty projection, and structured request logging in `mock/lib/http.mjs`
- [x] T023 Implement deterministic fixture loading, deep-cloned in-memory state, ID generation, lifecycle clock/phase helpers, visibility projections, and reset behavior in `mock/lib/state.mjs`
- [x] T024 Implement token authentication, role/ownership/assignment guards, validation helpers, interval/conflict evaluation, and file rules in `mock/lib/domain.mjs`
- [x] T025 Implement all committed auth/profile, campaign/setup, public/applicant, review/files, schedule, interviewer, result, and notification routes in `mock/lib/routes.mjs`
- [x] T026 Implement the built-in Node entry point, startup validation, port/mode defaults, clean shutdown, and request status logs in `mock/server.mjs`
- [x] T027 Implement a clearly non-official fresh-state HTTP workflow verifier in `tools/verify-pa3-http.mjs` without naming or presenting it as the official checker
- [x] T028 Run focused mock tests, fresh normal-mode HTTP verification, strict value review where compatible, all four mode checks, lint, full tests, build, and `git diff --check`; fix and re-run every failure
- [x] T029 Append truthful Phase 3 details, checker limitation, verification, and incidents to `AI-LOG.md`; update mock run instructions in `FRONTEND.md`
- [x] T030 Review/stage only `mock/`, approved scripts/tooling, and Phase 3 docs; create the scoped local commit `feat: implement contract-driven PA3 HTTP mock`

**Checkpoint**: Full committed provider passes its tests and manual/equivalent HTTP checks from fresh state. Official checker remains NOT RUN unless its exact course file is later supplied.

---

## Phase 3: Shared HTTP Client and Authentication Foundation

**Purpose**: Establish the only frontend HTTP/session boundary before story-specific domain integration.

- [x] T031 Add failing client tests for relative paths, JSON/FormData, CSV/PDF responses, structured codes/field errors/details, bearer headers, 204, network failure, and abort behavior in `client/src/tests/services/apiClient.test.js`
- [x] T032 Implement relative `/api` request and download behavior with token provider support in `client/src/services/apiClient.js`; remove runtime dependence on `VITE_API_URL` without adding an environment file
- [x] T033 Configure matching development and preview `/api` proxies in `client/vite.config.js` and update `.env.example` only if a remaining browser-visible variable is genuinely introduced
- [x] T034 Add failing service/context/route tests for HTTP username login, current user restore, logout, token storage/clearing, intended route, reload, and role navigation in `client/src/tests/services/authService.test.js`, `client/src/tests/routes/AppRoutes.test.jsx`, and `client/src/tests/pages/SignInPage.test.jsx`
- [x] T035 Replace browser-store authentication/profile calls with contract adapters in `client/src/services/authService.js` and `client/src/services/profileService.js`
- [x] T036 Make `client/src/contexts/DemoSessionContext.jsx` the shared HTTP user/token owner, register the token provider, restore through `/auth/me`, clear on logout, and isolate any development-only controls from runtime domain state
- [x] T037 Adapt `client/src/hooks/useSignIn.js`, `client/src/hooks/useProfile.js`, `client/src/routes/AuthGate.jsx`, `client/src/routes/RoleGate.jsx`, and account UI only as needed to preserve existing behavior with HTTP auth
- [x] T038 Run focused auth/client/route tests, lint, full regression tests, build, and diff checks; append real verification to `AI-LOG.md` and create `feat: integrate PA3 authentication and API client`

**Checkpoint**: All roles sign in through HTTP, bearer headers are attached, reload/deep links are safe, and no story service has yet bypassed the committed mock.

---

## Phase 4: User Story 1A - Campaign Management and Interview Setup (Priority: P1)

**Goal**: Connect campaign creation, constrained published editing, publication, and composite interview setup before Applicant and downstream Executive integration.

**Independent Test**: From a fresh provider, load, validate, publish, and apply permitted/forbidden campaign and setup edits while observing API-driven state and locks.

### Tests for User Story 1A

- [x] T039 [P] [US1] Add failing HTTP adapter tests for campaign and composite setup in `client/src/tests/services/campaignHttpService.test.js`
- [x] T040 [P] [US1] Extend `client/src/tests/pages/CampaignManagementPage.test.jsx` for loading, retryable error, empty positions, API field errors, constrained published edits, setup validation, and confirmation locks

### Implementation for User Story 1A

- [x] T041 [US1] Replace campaign browser-store calls with HTTP adapters, including composite interview setup and Q-03 DTO mapping, in `client/src/services/campaignService.js`
- [x] T042 [US1] Add cancellation, refetch-safe mutation handling, and setup actions in `client/src/hooks/useCampaign.js`
- [x] T043 [US1] Adapt `client/src/pages/CampaignManagementPage.jsx`, `client/src/components/organisms/CampaignDetailsCard/`, `PositionsEditor/`, and `CampaignPreview/` for HTTP loading/error/empty/success and contract-driven mutations
- [x] T044 [US1] Complete editable Interviewer-position assignments, availability, room selection, date/window, 15/20/30-minute validation, and lock behavior in `client/src/components/organisms/InterviewSetupCard/`
- [x] T045 [US1] Run focused campaign/setup tests and fresh-state flow, then full lint/test/build/diff checks; append `AI-LOG.md` evidence and create `feat: integrate PA3 campaign management APIs`

---

## Phase 5: User Story 2 - Applicant Submission and Tracking (Priority: P1)

**Goal**: Connect public campaign, multipart application submission, own applications, results, and notifications to HTTP with ownership-safe UI states.

**Independent Test**: Student A submits Content and Communications, duplicate submission opens/identifies the existing application, invalid/closed attempts retain form values, and only own confirmed/published data appears.

### Tests for User Story 2

- [x] T046 [P] [US2] Add failing public/applicant/notification HTTP adapter tests in `client/src/tests/services/portalHttpService.test.js`
- [x] T047 [P] [US2] Extend `client/src/tests/pages/ApplicantPortalPage.test.jsx` for loading/retry/empty, exact PDF and SOP boundaries, multi-position submission, duplicate existing ID, closed-during-submit value retention, and published-only results

### Implementation for User Story 2

- [x] T048 [US2] Replace public campaign, multipart submission, own applications, and notification browser-store calls with HTTP adapters in `client/src/services/portalService.js`
- [x] T049 [US2] Add cancellation/refetch and mutation response handling in `client/src/hooks/useApplicantPortal.js`
- [x] T050 [US2] Adapt `client/src/pages/ApplicantPortalPage.jsx` and `client/src/components/organisms/ApplicationForm/`, `MyApplicationsTable/`, `NotificationList/`, and `PublicCampaignPanel/` for contract errors and HTTP state without losing valid drafts
- [x] T051 [US2] Run focused Applicant tests and fresh multi-position flow, then full lint/test/build/diff checks; append `AI-LOG.md` evidence and create `feat: integrate campaign and applicant API flows`

---

## Phase 6: User Story 1B - Application Review and Scheduling (Priority: P1)

**Goal**: Connect Executive application review, protected files/CSV, draft scheduling, resolution, meaningful save, export, and confirmation after campaign and Applicant integration.

**Independent Test**: Review A01/A02 independently, preserve filters, generate conflict/unassigned rows, resolve and save them, refuse invalid confirmation, and lock a valid confirmed schedule.

### Tests for User Story 1B

- [x] T052 [P] [US1] Add failing HTTP adapter tests for review, statistics, files, and CSV in `client/src/tests/services/applicationHttpService.test.js`
- [x] T053 [P] [US1] Add failing HTTP adapter tests for schedule read/generate/edit/save/export/confirm in `client/src/tests/services/scheduleHttpService.test.js`
- [x] T054 [P] [US1] Extend `client/src/tests/pages/ApplicationReviewPage.test.jsx` and `client/src/tests/pages/InterviewSchedulingPage.test.jsx` for HTTP loading/retry/empty, independent mutations, filters, conflict reasons, meaningful Save, refusal, and locks

### Implementation for User Story 1B

- [x] T055 [US1] Replace review, detail, note, screening, CSV, and protected CV browser-store calls with HTTP adapters in `client/src/services/applicationService.js`
- [x] T056 [US1] Replace schedule read/generate/edit/save/confirm/export browser-store calls with HTTP adapters in `client/src/services/scheduleService.js`
- [x] T057 [US1] Add cancellation/refetch-safe behavior to `client/src/hooks/useApplications.js` and `client/src/hooks/useSchedule.js`
- [x] T058 [US1] Adapt `client/src/pages/ApplicationReviewPage.jsx`, screening organisms, and file/CSV actions for contract-driven reads and mutations without reloads
- [x] T059 [US1] Adapt `client/src/pages/InterviewSchedulingPage.jsx`, `ScheduleSettingsCard/`, `ScheduleTable/`, `ScheduleRowDialog/`, and `ConfirmationChecklist/` for HTTP states, staged edits, save, and confirmation locks
- [x] T060 [US1] Run focused review/schedule tests and fresh-state flow, then full lint/test/build/diff checks; append `AI-LOG.md` evidence and create `feat: integrate application review and scheduling APIs`

---

## Phase 7: User Story 3 and Executive Outcomes - Interviewer Assessments and Results (Priority: P1)

**Goal**: Connect assigned interviews, protected CV/detail, immutable assessment submission, Executive final decisions, result publication, and Applicant notifications without cross-role leakage.

**Independent Test**: Each Interviewer submits only their assigned assessment; the Executive records/publishes the corresponding result; the Applicant sees only published results and exactly one notification.

### Tests for User Story 3 and Outcomes

- [ ] T061 [P] [US3] Add failing assigned-interview/detail/CV/assessment HTTP adapter tests in `client/src/tests/services/interviewerHttpService.test.js`
- [ ] T062 [P] [US1] Add failing assessment/result/publication HTTP adapter tests in `client/src/tests/services/resultHttpService.test.js`
- [ ] T063 [P] [US3] Extend `client/src/tests/pages/InterviewerWorkspacePage.test.jsx` for loading/retry/empty, assignment privacy, private-note absence, future/unassigned refusal, validation, and duplicate submission
- [ ] T064 [P] [US1] Extend `client/src/tests/pages/FinalResults.test.jsx` for assessment prerequisites, decisions, publication, retry/empty states, and notification uniqueness

### Implementation for User Story 3 and Outcomes

- [ ] T065 [US3] Replace assigned-interview/detail/assessment browser-store calls with HTTP adapters in `client/src/services/interviewerService.js`
- [ ] T066 [US1] Replace result list/assessment/record/publish browser-store calls with HTTP adapters in `client/src/services/resultService.js`
- [ ] T067 [US3] Add cancellation/refetch and mutation handling in `client/src/hooks/useInterviewerWorkspace.js` and `client/src/hooks/useFinalResults.js`
- [ ] T068 [US3] Adapt `client/src/pages/InterviewerWorkspacePage.jsx`, assigned-interview organisms, and `client/src/pages/ApplicationReviewPage.jsx` result organisms for HTTP states and immutable workflow records
- [ ] T069 [US3] Run focused Interviewer/outcome flow, full lint/test/build/diff checks, append `AI-LOG.md` evidence, and create `feat: integrate interviewer and results APIs`

---

## Phase 8: User Story 4 - Delivery States, Routing, and Responsive Evidence (Priority: P2)

**Goal**: Prove normal/slow/error/empty, direct-route, role, semantic, and responsive behavior across the integrated application.

**Independent Test**: Restart each mode and directly open/reload every important route at 360/768/1280, exercising retry and cross-role states without stale fixture data.

- [ ] T070 [P] [US4] Extend `client/src/tests/pages/CampaignManagementPage.test.jsx`, `ApplicationReviewPage.test.jsx`, `InterviewSchedulingPage.test.jsx`, `ApplicantPortalPage.test.jsx`, and `InterviewerWorkspacePage.test.jsx` so every main data screen proves loading, retryable error, empty, and success behavior
- [ ] T071 [P] [US4] Extend route tests for direct access, reload-equivalent initialization, Browser Back behavior, unknown routes, signed-out redirects, and cross-role access in `client/src/tests/routes/AppRoutes.test.jsx`
- [ ] T072 [US4] Remove remaining runtime domain imports from `client/src/mocks/store.js` across `client/src/services/`, pages, hooks, contexts, and components; retain only justified development/test fixtures
- [ ] T073 [US4] Audit and fix one-`h1`, landmarks, labels, link/button semantics, focus, 44-pixel targets, table/drawer/dialog containment, and page overflow in affected `client/src/` JSX/CSS
- [ ] T074 [US4] Execute available browser automation at 360/768/1280 for important routes/modes and record exact automated, manual, zoom, screen-reader, and W3C PASS/FAIL/NOT RUN evidence in `specs/002-pa3-http-integration/quickstart.md`
- [ ] T075 [US4] Run full normal/slow/error/empty and route regression gates, fix/re-run failures, append `AI-LOG.md`, and create focused test/fix commits only after reviewed green diffs

---

## Phase 9: Full QA, Documentation, and Submission Readiness (PA#3 Phase 6)

**Purpose**: Converge all tasks, rebuild current artifacts, assess the rubric honestly, and leave a reviewable local history.

- [ ] T076 Run the complete fresh-state C1-C11 flow and independent failure cases against `mock/server.mjs`; record trace evidence in `SELF_ASSESSMENT_REPORT.md`
- [ ] T077 Run final `npm run lint`, all frontend/backend/mock tests, `npm run build`, documentation validation, equivalent HTTP verification, four modes, diff checks, and official checker only if the exact file is available
- [ ] T078 Audit all runtime frontend requests against `docs/api/`, all documented examples against mock routes, and all C1-C11 operations against tests; correct contract only with an explicit documented corrective commit
- [ ] T079 Complete English documentation in `FRONTEND.md`, `brief.md`, `AI-LOG.md`, `SELF_ASSESSMENT_REPORT.md`, `docs/api/`, and this task file without inventing team identity, public links, incidents, or unexecuted evidence
- [ ] T080 Rebuild and inspect `client/dist/`, verify production preview through the HTTP mock, and record any preview limitation truthfully
- [ ] T081 Audit required submission contents including hidden `.git`, exclusions, secrets, real uploads, temporary artifacts, and missing team/student/score fields; do not create the final ZIP while required human inputs remain
- [ ] T082 Review final Git history, branch, HEAD, commit order, expected committed files, and working tree; stage explicitly, create only justified final documentation/test commits, and never push
- [ ] T083 Re-run Spec Kit checklist status and cross-artifact convergence; mark every genuinely completed task `[x]` in `specs/002-pa3-http-integration/tasks.md` and leave any blocked item unchecked with evidence

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Contract**: starts after planning; blocks all mock work.
- **Phase 2 Mock**: depends on the verified Phase 1 commit; blocks all frontend domain consumers.
- **Phase 3 HTTP/Auth Foundation**: depends on the verified Phase 2 commit; blocks all role journeys.
- **US1A Campaign, US2 Applicant, US1B Review/Scheduling, US3/Outcomes**: depend on Phase 3 and execute in that order so campaign/applicant consumers precede review/scheduling and final outcomes.
- **US4**: depends on integrated US1-US3 behavior.
- **Phase 9 QA**: depends on all desired story phases and performs convergence rather than adding unrelated features.

### User Story Dependencies

- **US1 Executive**: requires deterministic fixture applications and the shared HTTP/auth foundation, but is independently testable through seeded records.
- **US2 Applicant**: requires public/auth foundation and independently creates A01/A02.
- **US3 Interviewer**: requires confirmed fixture/workflow records and is independently testable with canonical Interviewer accounts.
- **US4 Reviewer**: observes the completed role journeys and therefore follows US1-US3.

### Within Each Phase

1. Add or update focused tests and demonstrate the targeted failure where practical.
2. Implement the smallest contract-consistent change.
3. Run focused checks, inspect the diff, and fix root causes.
4. Run all relevant regression gates and `git diff --check`.
5. Update truthful documentation and task markers.
6. Stage explicit phase files, inspect the staged diff, and create the local commit.

## Parallel Opportunities

- Contract resource documents T004-T009 are independent after shared conventions stabilize.
- Mock test files T016-T021 and deterministic data T015 touch separate files after route inventory is fixed.
- Campaign tests T039-T040, Applicant tests T046-T047, review/schedule tests T052-T054, and Interviewer/outcome tests T061-T064 target separate files within their phases.
- Documentation and unrelated domain code must not be edited in parallel when they share `AI-LOG.md`, `FRONTEND.md`, `apiClient`, auth context, or route setup.

## Implementation Strategy

The minimum viable delivery is the committed contract plus fully verified mock. Frontend integration then preserves existing page composition and changes one service group at a time. Each story remains demonstrable against seeded state, while the final C1-C11 run proves cross-story continuity. Failed required gates stop the affected commit and dependent work until corrected.

## Notes

- Do not create `tools/contract-check.mjs` unless the exact official course file is found.
- Do not use `git add .` or `git add -A`; stage explicit paths.
- Do not modify or delete unrelated working-tree changes.
- Do not add runtime dependencies, environment files, production backend domain code, or external integrations.
