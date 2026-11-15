---

description: "Task list for the ClubFlow UI-first frontend"
---

# Tasks: ClubFlow UI-First Frontend

**Input**: Design documents from `specs/001-frontend-ui/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/ui-services.md](contracts/ui-services.md)

**Tests**: Included. `AGENTS.md` requires automated tests for critical UI interactions and validators when observable behavior changes.

**Organization**: UI-0 is preparation. Phase 1–2 = UI-1 (foundation), Phase 3–5 = UI-2 (Executive stories US1–US3), Phase 6 = UI-3 (US4), Phase 7 = UI-4 (US5), Phase 8 = UI-5 (polish and integration readiness).

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
- [ ] T025 Create the six route targets in `frontend/src/pages/` (five screens with correct titles and campaign context, plus `NotFoundPage.jsx`) and wire `frontend/src/App.jsx` — *UI-1.1 partial: `App.jsx` wired, `NotFoundPage.jsx` done, screens use the temporary `RoutePlaceholderPage.jsx` (campaign context pending UI-1.2)*
- [x] T026 Add shell tests in `frontend/src/tests/routes/AppRoutes.test.jsx` (titles, role navigation, not-found) — UI-1.2 (with `frontend/src/tests/layouts/AppLayout.test.jsx`)
- [ ] T027 Decide with the team whether to retire `ClubFlowOverview`, `StatusBadge`, `HomePage`, and `useApiHealth`; record the decision in `AI-LOG.md`

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
- [ ] T036 [P] [US2] Create `Modal`, `ConfirmDialog`, `DetailPanel`, `DataTable` (stacked rows below 48rem) in `frontend/src/components/organisms/` — *UI-2.2 partial: Modal and ConfirmDialog done; the detail panel is the `ApplicationDetail` organism beside the list; DataTable comes with UI-2.3*
- [x] T037 [US2] Create `frontend/src/services/applicationService.js` and `frontend/src/services/resultService.js` — UI-1.3
- [ ] T038 [US2] Create `frontend/src/hooks/useApplications.js` and `frontend/src/hooks/useFinalResults.js` — *UI-2.2 partial: `useApplications` done; `useFinalResults` comes with UI-2.3*
- [ ] T039 [US2] Create `ApplicationList`, `ApplicationDetail`, `FinalResultsTable` organisms — *UI-2.2 partial: `ApplicationList`, `ApplicationDetail`, `ApplicationFilters` done; `FinalResultsTable` comes with UI-2.3*
- [x] T040 [US2] Implement the CV Screening tab in `frontend/src/pages/ApplicationReviewPage.jsx` — UI-2.2
- [ ] T041 [US2] Implement the Final Results tab in `frontend/src/pages/ApplicationReviewPage.jsx`
- [x] T042 [P] [US2] Add dialog and tabs tests in `frontend/src/tests/components/` (focus trap, Escape, arrow keys) — UI-2.2 (`tests/components/Modal.test.jsx`, `tests/components/Tabs.test.jsx`)
- [ ] T043 [US2] Add page tests in `frontend/src/tests/pages/ApplicationReviewPage.test.jsx` (stats 6/5, filters vs counts, per-application decision, preserved filters, results visibility, publish) — *UI-2.2 partial: CV Screening tests done; Final Results tests come with UI-2.3*

---

## Phase 5: User Story 3 — Interview Scheduling (UI-2, P1)

- [x] T044 [US3] Create `frontend/src/services/scheduleService.js` (scenario data and scripted demo transitions only) — UI-1.3
- [ ] T045 [US3] Create `frontend/src/hooks/useSchedule.js`
- [ ] T046 [US3] Create `ScheduleSettings`, `InterviewerAssignments`, `ScheduleTable`, `ConfirmationChecklist` organisms
- [ ] T047 [US3] Implement `frontend/src/pages/InterviewSchedulingPage.jsx` (draft, regenerate confirmation, conditions, confirm, read-only, export)
- [ ] T048 [US3] Add tests in `frontend/src/tests/pages/InterviewSchedulingPage.test.jsx` (counts equal rows, conflict reasons, confirm disabled with reasons, confirmed read-only, zero-shortlisted message)

**Checkpoint**: UI-2 complete — review and commit per story.

---

## Phase 6: User Story 4 — Applicant Portal (UI-3, P2)

- [ ] T049 [P] [US4] Create `Checkbox` atom and `FileField` molecule
- [x] T050 [US4] Create `frontend/src/services/portalService.js` (submission takes `FormData`) — UI-1.3
- [ ] T051 [US4] Create `frontend/src/hooks/useApplicantPortal.js`
- [ ] T052 [US4] Create `PublicCampaign`, `SignInDialog`, `ApplicationForm`, `MyApplications`, `NotificationList` organisms; add the SOP word-count helper to `frontend/src/utils/format.js` with tests
- [ ] T053 [US4] Implement `frontend/src/pages/ApplicantPortalPage.jsx` with URL-synced tabs
- [ ] T054 [US4] Add tests in `frontend/src/tests/pages/ApplicantPortalPage.test.jsx` (phase messages, sign-in prompt, PDF/5 MB, SOP 300/301 words, slot required, duplicate notice, unpublished results hidden)

---

## Phase 7: User Story 5 — Interviewer Workspace (UI-4, P2)

- [x] T055 [US5] Create `frontend/src/services/interviewerService.js` — UI-1.3
- [ ] T056 [US5] Create `frontend/src/hooks/useInterviewerWorkspace.js`
- [ ] T057 [US5] Create `AssignedInterviews`, `InterviewDetail`, `AssessmentForm` organisms
- [ ] T058 [US5] Implement `frontend/src/pages/InterviewerWorkspacePage.jsx` (empty and restricted states)
- [ ] T059 [US5] Add tests in `frontend/src/tests/pages/InterviewerWorkspacePage.test.jsx`

---

## Phase 8: Polish & Integration Readiness (UI-5)

- [ ] T060 Run the `specs/001-frontend-ui/quickstart.md` responsive, zoom, and accessibility checklist for all five screens and fix issues in the affected component CSS
- [ ] T061 Record results in the quickstart.md results log
- [ ] T062 Update `frontend/src/services/apiClient.js` (no forced JSON header for `FormData`, keep backend error message, optional Bearer token, 204 handling) with tests in `frontend/src/tests/services/apiClient.test.js`
- [ ] T063 [P] Write `docs/frontend/INTEGRATION.md` (service → hook → page map; how to replace demo bodies) and link it from `docs/README.md`
- [ ] T064 Run `npm run verify` and update this file and `AI-LOG.md`

---

## Dependencies & Execution Order

- Phase 0 → Phase 1 → Phase 2 (blocks all stories)
- US1 → US2 → US3 in order for one developer (US2 creates `Modal`/`Tabs`/`DataTable` reused later)
- US4 needs Phase 2 and the US2 shared components; US5 needs Phase 2 and `DataTable`/`FormField`
- Phase 8 after all stories
- Within a story: service → hook → organisms → page → page tests

## Implementation Strategy

One developer builds the UI in the order above, committing at each checkpoint after review. Backend teammates can start replacing service bodies for a screen once its story phase is committed; the contract in `contracts/ui-services.md` is the handoff point.
