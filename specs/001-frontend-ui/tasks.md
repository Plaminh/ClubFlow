---

description: "Task list for the ClubFlow UI-first frontend"
---

# Tasks: ClubFlow UI-First Frontend

**Input**: Design documents from `specs/001-frontend-ui/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/ui-services.md](contracts/ui-services.md)

**Tests**: Included. `AGENTS.md` requires automated tests for critical UI interactions and validators when observable behavior changes.

**Organization**: UI-0 is preparation. Phase 1–2 = UI-1 (foundation), Phase 3–5 = UI-2 (Executive stories US1–US3), Phase 6 = UI-3 (US4), Phase 7 = UI-4 (US5), Phase 8 = UI-5 (polish and integration readiness), and Phases 11–13 = UI-8 (US6 Sign In and US7 My Profile). Historical task wording is retained where useful and annotated when UI-8 superseded it.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story from spec.md (US1…US5)
- Paths are relative to the repository root.

---

## Phase 0: UI-0 Preparation ✅

- [x] T001 Ignore only the static UI reference assets in `eslint.config.mjs` so `npm run verify` passes
- [x] T002 Create the documentation hub at `docs/README.md`
- [x] T003 Create spec, research, data model, service contracts, quickstart, and tasks in `specs/001-frontend-ui/`
- [x] T004 Record UI-0 in `AI-LOG.md`

---

## Phase 1: Setup (UI-1)

**Purpose**: Dependencies and global styling. Requires team approval of D-UI-02 (router).

- [x] T005 Install `react-router-dom` in the `frontend` workspace (`frontend/package.json`, `package-lock.json`) — UI-1.1
- [x] T006 [P] Set `lang="vi"` in `frontend/index.html` — UI-1.2
- [x] T007 [P] Create design tokens in `frontend/src/styles/tokens.css` from `docs/reference/ui/assets/css/styles.css` (colors, spacing, radii, focus, content width, breakpoint notes) — UI-1.1
- [x] T008 Extend `frontend/src/styles/global.css` to import tokens and set base typography, focus-visible, and `overflow-wrap` (no `overflow-x: hidden` on `body`) — UI-1.1
- [x] T009 [P] Create status and role label mapping in `frontend/src/constants/labels.js` with tests in `frontend/src/tests/constants/labels.test.js` — UI-1.1
- [x] T010 [P] Create date, time, date-time, and time-range helpers in `frontend/src/utils/format.js` with tests in `frontend/src/tests/utils/format.test.js` — UI-1.1 (the SOP word-count helper moved to T052, where it is first used)

---

## Phase 2: Foundational (UI-1)

**Purpose**: Shell, demo session, demo data. ⚠️ No story work before this phase is complete.

- [x] T011 Create base fixtures in `frontend/src/mocks/fixtures.js` from `docs/reference/ui/UI_REFERENCE_NOTES.md` — UI-1.3
- [x] T012 Create scenarios and demo clocks in `frontend/src/mocks/scenarios.js` (before-open, accepting, screening, confirmed) — UI-1.3 (plus a `draft` scenario)
- [x] T013 Create the in-memory session store in `frontend/src/mocks/store.js` — UI-1.3
- [x] T014 Add fixture integrity tests (data-model invariants 1–6) in `frontend/src/tests/mocks/fixtures.test.js` — UI-1.3
- [x] T015 [P] Create `UiError` helpers in `frontend/src/services/uiError.js` — UI-1.2/UI-1.3
- [x] T016 [P] Create `frontend/src/services/demoSessionService.js` — UI-1.3
- [x] T017 Create `frontend/src/contexts/DemoSessionContext.jsx` (account + scenario; visible demo labeling) — UI-1.3 (account, scenario, reset, simulated network; `sessionStorage` keeps the selection)
- [x] T018 [P] Add variants (primary, secondary, quiet, danger), 44 px minimum height, and focus style to `frontend/src/components/atoms/Button/`; extend `frontend/src/tests/components/Button.test.jsx` — UI-1.2
- [x] T019 [P] Create `frontend/src/components/atoms/Badge/` (tone-based, text always visible) — UI-1.2
- [x] T020 [P] Create `frontend/src/components/molecules/Alert/` — UI-1.2
- [x] T021 Create `frontend/src/components/organisms/AppHeader/` with role-aware navigation and demo controls — UI-1.2/UI-1.3 (demo controls in `organisms/DemoBar`)
- [x] T022 Adapt `frontend/src/components/templates/MainTemplate/` into the page template (title, eyebrow, campaign context, actions slot) — UI-1.2
- [x] T023 Turn `frontend/src/layouts/MainLayout.jsx` into the app shell (header, main, footer) — UI-1.2 (renamed to `AppLayout.jsx`)
- [x] T024 Add route constants to `frontend/src/routes/paths.js` and create `frontend/src/routes/AppRoutes.jsx` — UI-1.1
- [x] T025 Create the six route targets present in the historical UI-1…UI-4 scope (five business screens with correct titles/campaign context, plus `NotFoundPage.jsx`) and wire `frontend/src/App.jsx` — UI-2…UI-4 (UI-8 later added Sign In and My Profile; the temporary placeholder page was removed in UI-5)
- [x] T026 Add shell tests in `frontend/src/tests/routes/AppRoutes.test.jsx` (titles, role navigation, not-found) — UI-1.2 (with `frontend/src/tests/layouts/AppLayout.test.jsx`)
- [x] T027 Decide with the team whether to retire `ClubFlowOverview`, `StatusBadge`, `HomePage`, and `useApiHealth`; record the decision in `AI-LOG.md` — UI-5 (removed after confirming no references: HomePage, RoutePlaceholderPage, ClubFlowOverview, constants/project.js; useApiHealth and StatusBadge kept for the footer health check)

**Checkpoint**: UI-1 complete — `npm run verify` passes; review and commit.

---

## Phase 3: User Story 1 — Campaign Management (UI-2, P1)

**Goal**: US1 in spec.md. **Independent test**: see spec.md US1.

- [x] T028 [P] [US1] Create form atoms `TextInput`, `Select`, `Textarea` in `frontend/src/components/atoms/` — UI-2.1 (implemented as the FormField molecule wrapping native input/select/textarea instead of separate atoms)
- [x] T029 [P] [US1] Create `FormField`, `StatCard`, `StepIndicator` in `frontend/src/components/molecules/` — UI-2.1/UI-2.2
- [x] T030 [US1] Create `frontend/src/services/campaignService.js` per contracts — UI-1.3 (mock services built with the data foundation; tested in `tests/services/mockServices.test.js`)
- [x] T031 [US1] Create `frontend/src/hooks/useCampaign.js` — UI-2.1
- [x] T032 [US1] Create `CampaignForm` and `PositionEditor` organisms in `frontend/src/components/organisms/` — UI-2.1 (CampaignDetailsCard, PositionsEditor, InterviewSetupCard, CampaignPreview)
- [x] T033 [US1] Implement `frontend/src/pages/CampaignManagementPage.jsx` (draft, preview, publish, removal blocked, read-only when confirmed) — UI-2.1
- [x] T034 [US1] Add tests in `frontend/src/tests/pages/CampaignManagementPage.test.jsx` (BR-01 messages, preserved input, publish confirmation, read-only) — UI-2.1

---

## Phase 4: User Story 2 — Application Review and Final Results (UI-2, P1)

- [x] T035 [P] [US2] Create `Tabs`, `Pagination`, `EmptyState` in `frontend/src/components/molecules/` — UI-2.2
- [x] T036 [P] [US2] Create `Modal`, `ConfirmDialog`, `DetailPanel`, `DataTable` (stacked rows below 80rem) in `frontend/src/components/organisms/` — UI-2.2/UI-2.3 (`DataTable` with stacked cards below 80rem since UI-2.4, see research.md D-UI-04, and explicit table roles; the detail panel is the `ApplicationDetail` organism)
- [x] T037 [US2] Create `frontend/src/services/applicationService.js` and `frontend/src/services/resultService.js` — UI-1.3
- [x] T038 [US2] Create `frontend/src/hooks/useApplications.js` and `frontend/src/hooks/useFinalResults.js` — UI-2.2/UI-2.3
- [x] T039 [US2] Create `ApplicationList`, `ApplicationDetail`, `FinalResultsTable` organisms — UI-2.2/UI-2.3 (plus `ApplicationFilters`, `FinalDecisionPanel`, `PublishResultsCard`)
- [x] T040 [US2] Implement the CV Screening tab in `frontend/src/pages/ApplicationReviewPage.jsx` — UI-2.2
- [x] T041 [US2] Implement the Final Results tab in `frontend/src/pages/ApplicationReviewPage.jsx` — UI-2.3
- [x] T042 [P] [US2] Add dialog and tabs tests in `frontend/src/tests/components/` (focus trap, Escape, arrow keys) — UI-2.2 (`tests/components/Modal.test.jsx`, `tests/components/Tabs.test.jsx`)
- [x] T043 [US2] Add page tests in `frontend/src/tests/pages/ApplicationReviewPage.test.jsx` (stats 6/5, filters vs counts, per-application decision, preserved filters, results visibility, publish) — UI-2.2/UI-2.3 (`ApplicationReviewPage.test.jsx`, `FinalResults.test.jsx`)

---

## Phase 5: User Story 3 — Interview Scheduling (UI-2, P1)

- [x] T044 [US3] Create `frontend/src/services/scheduleService.js` (scenario data and scripted demo transitions only) — UI-1.3
- [x] T045 [US3] Create `frontend/src/hooks/useSchedule.js` — UI-2.4
- [x] T046 [US3] Create `ScheduleSettings`, `InterviewerAssignments`, `ScheduleTable`, `ConfirmationChecklist` organisms — UI-2.4 (plus `ScheduleRowDialog`, `InterviewerAssignmentsCard`, `ChoiceGroup` molecule)
- [x] T047 [US3] Implement `frontend/src/pages/InterviewSchedulingPage.jsx` (draft, regenerate confirmation, conditions, confirm, read-only, export) — UI-2.4
- [x] T048 [US3] Add tests in `frontend/src/tests/pages/InterviewSchedulingPage.test.jsx` (counts equal rows, conflict reasons, confirm disabled with reasons, confirmed read-only, zero-shortlisted message) — UI-2.4

**Checkpoint**: UI-2 complete — review and commit per story.

---

## Phase 6: User Story 4 — Applicant Portal (UI-3, P2)

- [x] T049 [P] [US4] Create `Checkbox` atom and `FileField` molecule — UI-3 (checkboxes via the `ChoiceGroup` molecule from UI-2.4; `FileField` molecule)
- [x] T050 [US4] Create `frontend/src/services/portalService.js` (submission takes `FormData`) — UI-1.3
- [x] T051 [US4] Create `frontend/src/hooks/useApplicantPortal.js` — UI-3
- [x] T052 [US4] Create `PublicCampaign`, `SignInDialog`, `ApplicationForm`, `MyApplications`, `NotificationList` organisms; add the SOP word-count helper to `frontend/src/utils/format.js` with tests — UI-3 (`PublicCampaignPanel`, `ApplicationForm`, `MyApplicationsTable`, `NotificationList`; the historical `SignInDialog` was removed and replaced by `/login` in UI-8; the word counter uses `countWords` in `utils/validation.js`)
- [x] T053 [US4] Implement `frontend/src/pages/ApplicantPortalPage.jsx` with URL-synced tabs — UI-3
- [x] T054 [US4] Add tests in `frontend/src/tests/pages/ApplicantPortalPage.test.jsx` (phase messages, sign-in prompt, PDF/5 MB, SOP 300/301 words, slot required, duplicate notice, unpublished results hidden) — UI-3

---

## Phase 7: User Story 5 — Interviewer Workspace (UI-4, P2)

- [x] T055 [US5] Create `frontend/src/services/interviewerService.js` — UI-1.3
- [x] T056 [US5] Create `frontend/src/hooks/useInterviewerWorkspace.js` — UI-4
- [x] T057 [US5] Create `AssignedInterviews`, `InterviewDetail`, `AssessmentForm` organisms — UI-4 (`AssignedInterviewsTable`, `InterviewDetailCard`, `AssessmentForm`)
- [x] T058 [US5] Implement `frontend/src/pages/InterviewerWorkspacePage.jsx` (empty and restricted states) — UI-4
- [x] T059 [US5] Add tests in `frontend/src/tests/pages/InterviewerWorkspacePage.test.jsx` — UI-4

---

## Phase 8: Polish & Integration Readiness (UI-5)

- [x] T060 Run the `specs/001-frontend-ui/quickstart.md` responsive, zoom, and accessibility checklist for all five business screens and fix issues in the affected component CSS — UI-5 (automated browser matrix; see quickstart.md results)
- [x] T061 Record results in the quickstart.md results log — UI-5
- [x] T062 Update `frontend/src/services/apiClient.js` (no forced JSON header for `FormData`, keep backend error message, optional Bearer token, 204 handling) with tests in `frontend/src/tests/services/apiClient.test.js` — UI-5
- [x] T063 [P] Write `docs/frontend/INTEGRATION.md` (service → hook → page map; how to replace demo bodies) and link it from `docs/README.md` — UI-5
- [x] T064 Run `npm run verify` and update this file and `AI-LOG.md` — UI-5

---

## Phase 9: Pre-integration cleanup (UI-6)

Source: AI-assisted read-only audit (AI-LOG 2026-11-15, UI-6). Corrects mismatches with this spec and the integration contract; no new features.

- [x] T065 Store the submitted student info (`studentInfo` in data-model.md: email/faculty as submitted) on each application and read it in the Executive detail, CSV export, and interviewer detail; validate `faculty` — tests in `tests/services/mockServices.test.js`
- [x] T066 Give the Interviewer Workspace its campaign context from `listAssignedInterviews()` and make the mock `getCampaign()` Executive-only — tests in `mockServices.test.js`, `InterviewerWorkspacePage.test.jsx`
- [x] T067 `apiClient`: backend `details` keys directly on `UiError.details` next to `status` — test in `apiClient.test.js`
- [x] T068 Cancel a mock call when the demo account/scenario changed while it waited (UI-FR-009); show the Mark-all-read failure (UI-FR-028); focus the first invalid field in `AssessmentForm` and `ScheduleRowDialog` (UI-FR-017) — tests in `mockServices.test.js`, `ApplicantPortalPage.test.jsx`, `InterviewerWorkspacePage.test.jsx`, `tests/components/ScheduleRowDialog.test.jsx`
- [x] T069 Remove unused placeholders and code (`.gitkeep` ×3, `getNow`, `CAMPAIGN_STATUS_LABELS`, 3 unused CSS rules, `.field--invalid`); load the review campaign once and the portal data in parallel
- [x] T070 Align `plan.md`, `research.md`, `contracts/ui-services.md`, this file, `quickstart.md`, `spec.md` status, `docs/frontend/INTEGRATION.md`, TRACEABILITY and ACCEPTANCE_CRITERIA status with the implementation; run `npm run verify`; update `AI-LOG.md`

---

## Phase 10: Q-01…Q-07 decision alignment (UI-7)

Source: team-selected decisions dated 2026-11-16 in `docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md`. These remain pending Product Owner confirmation and do not implement production backend behavior.

- [x] T071 [US2] [US5] Finish Q-06 confirmations and immutable UI states for application screening and assessment submission; pin every confirmed action to its original entity and payload
- [x] T072 [US2] [US4] [US5] Add Q-06 regression coverage for cancel, stale selection, duplicate submission guards and read-only submitted states
- [x] T073 Document the Q-06 frontend behavior, backend state-transition contract, limitations and pending approval status in the decision record, integration guide and feature spec
- [x] T074 Audit Q-02 date-only and timestamp formatting across all five business screens and rerun boundary-focused tests; no code change required beyond existing commit `f76eb54`
- [x] T075 [US3] Align mock schedule/resource presentation with Q-01 submission-time/ID, chronological-slot and stable-resource ordering without adding a frontend generator; add regression coverage
- [x] T076 Document the Q-01 backend first-fit loop, no-backtracking limitation and pending approval status in the decision record, integration guide and research
- [x] T077 [US2] [US4] Keep Q-05 publication and applicant notification visibility consistent, and state accurately that mock mode sends no real email
- [x] T078 [US2] Add Q-05 regression coverage that repeat publication cannot duplicate an in-app notification
- [x] T079 Document the deferred Brevo outbox, idempotent retry, credential boundary, common template and pending approval status
- [x] T080 [US4] Audit Q-07 `FileField`, FormData, API-client and mock validation behavior; add an exact 5 MB acceptance boundary regression
- [x] T081 Confirm the prototype exposes only the fictional sample PDF and makes no public-URL security claim; no real Cloudinary upload implemented
- [x] T082 Document Multer/PDF-content validation, protected Cloudinary metadata, authorized retrieval, short-lived delivery, cleanup and pending capability/approval decisions
- [x] T083 Audit the three requested UI cleanups: Vietnamese date display, concise interview preparation summary and absent Campaign Preview read-only badge; existing implementation/tests already satisfy them
- [x] T084 Run the final headless Edge matrix for 8 key states across all five business screens at 360/768/1280 px and record the 24/24 result in `quickstart.md`
- [x] T085 Run the final lint, frontend/backend tests, build, verify, diff/link/status/security-scope checks; update `AI-LOG.md` and close UI-7

---

## Phase 11: User Story 6 — Dedicated demo Sign In (UI-8, P1)

**Goal**: Replace the normal account-picker entry with validated credentials at `/login`, while preserving the existing demo session and safe role-aware redirects.

**Independent test**: Exercise empty, malformed, invalid, slow, and failed submissions; sign in as each role; restore only an allowed intended route; redirect an already authenticated account away from `/login`.

- [x] T086 [US6] Extend UI-8 requirements, design decisions, data model, service contracts, quality checklist, and implementation plan in `specs/001-frontend-ui/`
- [x] T087 [US6] Add Sign In route, form, redirect, loading, failure, and unauthorized-intent tests in `frontend/src/tests/pages/SignInPage.test.jsx`, `frontend/src/tests/routes/AppRoutes.test.jsx`, and `frontend/src/tests/layouts/AppLayout.test.jsx`
- [x] T088 [US6] Add fictional credential fixtures and `signIn`, `signOut`, `getCurrentUser`, and demo-credential contracts in `frontend/src/mocks/auth.js`, `frontend/src/services/authService.js`, and `frontend/src/tests/services/authService.test.js`
- [x] T089 [US6] Integrate credential Sign In and development-only account switching with `frontend/src/contexts/DemoSessionContext.jsx`, `frontend/src/services/demoSessionService.js`, and `frontend/src/components/organisms/DemoBar/`
- [x] T090 [US6] Implement the responsive accessible form and page in `frontend/src/components/organisms/SignInForm/`, `frontend/src/hooks/useSignIn.js`, and `frontend/src/pages/SignInPage.jsx`
- [x] T091 [US6] Wire `/login`, safe intended-route checks, visitor redirects, and the header entry in `frontend/src/routes/`, `frontend/src/layouts/AppLayout.jsx`, `frontend/src/pages/ApplicantPortalPage.jsx`, and `frontend/src/components/organisms/AppHeader/`

## Phase 12: User Story 7 — Shared My Profile (UI-8, P2)

**Goal**: Let every authenticated role view its own profile and edit only display name/email without leaking state or rewriting application snapshots.

**Independent test**: Open `/profile` as all roles, save/cancel/validate edits, switch accounts/scenarios, compare application snapshots, sign out, and retry protected access.

- [x] T092 [US7] Add guest/all-role, read-only, save/cancel/error, account-isolation, snapshot, and sign-out tests in `frontend/src/tests/pages/ProfilePage.test.jsx` and `frontend/src/tests/services/profileService.test.js`
- [x] T093 [US7] Add scenario-backed profile records and `getProfile`/`updateProfile` contracts in `frontend/src/mocks/scenarios.js`, `frontend/src/services/profileService.js`, and `frontend/src/contexts/DemoSessionContext.jsx`
- [x] T094 [US7] Implement profile loading/actions and the shared protected page in `frontend/src/hooks/useProfile.js`, `frontend/src/components/organisms/ProfileDetailsCard/`, `frontend/src/components/organisms/ProfileEditForm/`, and `frontend/src/pages/ProfilePage.jsx`
- [x] T095 [US7] Add `/profile`, the shared authentication gate, and the account menu actions in `frontend/src/routes/`, `frontend/src/layouts/AppLayout.jsx`, and `frontend/src/components/organisms/AppHeader/`

## Phase 13: UI-8 regression, responsive review, and handoff

- [x] T096 Add Sign In/Profile accessibility coverage and update existing five-screen expectations in `frontend/src/tests/a11y/screens.a11y.test.jsx` and affected frontend tests
- [x] T097 Document routes, mock credentials, editability, future service replacement, prototype limitations, and 360/768/1280 results in `docs/frontend/INTEGRATION.md` and `specs/001-frontend-ui/quickstart.md`
- [x] T098 Run `npm run lint`, `npm test`, `npm run build`, and `npm run verify`; inspect the final diff; update `AI-LOG.md`, `specs/001-frontend-ui/spec.md`, and this task list without committing

---

## Dependencies & Execution Order

- Phase 0 → Phase 1 → Phase 2 (blocks all stories)
- US1 → US2 → US3 in order for one developer (US2 creates `Modal`/`Tabs`/`DataTable` reused later)
- US4 needs Phase 2 and the US2 shared components; US5 needs Phase 2 and `DataTable`/`FormField`
- Phase 8 after all stories; Phase 9 after Phase 8, before backend integration; Phase 10 aligns the team-selected Q-01…Q-07 decisions before backend integration
- UI-8 US6 depends on UI-1 and replaces the normal SignInDialog entry; US7 depends on the US6 session/route work; Phase 13 follows both
- Within a story: service → hook → organisms → page → page tests

## Implementation Strategy

One developer builds the UI in the order above, committing at each checkpoint after review. Backend teammates can start replacing service bodies for a screen once its story phase is committed; the contract in `contracts/ui-services.md` is the handoff point.
