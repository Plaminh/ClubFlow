# Implementation Plan: ClubFlow UI-First Frontend

**Branch**: `001-frontend-ui` (spec directory) | **Date**: 2026-11-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-frontend-ui/spec.md`

## Summary

Build the five ClubFlow screens (Campaign Management, Application Review with Final Results, Interview Scheduling, Applicant Portal, Interviewer Workspace) as a responsive, keyboard-accessible React UI driven by one consistent set of demo records. Pages talk to Promise-based service functions that use demo data now and are replaced by real API calls later, without changing layouts. Decisions and their justifications are in [research.md](research.md); demo records are in [data-model.md](data-model.md); the service boundary is in [contracts/ui-services.md](contracts/ui-services.md); manual verification steps are in [quickstart.md](quickstart.md).

## Technical Context

**Language/Version**: JavaScript (ES modules), JSX, React 19, Node ≥ 22.12 for tooling

**Primary Dependencies**: React, Vite (existing). **New in UI-1, pending team approval**: `react-router-dom` (D-UI-02). No other new runtime dependencies.

**Storage**: None. Demo records live in memory (`frontend/src/mocks/`) and reset on reload.

**Testing**: Vitest + React Testing Library + jest-dom (existing). Responsive and zoom checks are manual ([quickstart.md](quickstart.md)) because jsdom does not render layout.

**Target Platform**: Current Chrome, Edge, and Firefox on desktop, tablet, and mobile widths.

**Project Type**: Web application (existing `frontend/` + `backend/` workspaces); this feature changes `frontend/` only.

**Performance Goals**: Demo data is small (6 applications); no specific performance target beyond responsive interactions.

**Constraints**: 360 / 768 / 1280+ px; 100–200% browser zoom by reflow; Vietnamese UI; no backend changes; `npm run verify` must pass at each commit.

**Scale/Scope**: 5 screens, about 6 routes, 4 demo scenarios.

## Constitution Check

*GATE: checked before research and after design.*

| Principle | Status | Notes |
|---|---|---|
| I. Fixed stack | ✅ | React + Vite + Vitest unchanged. `react-router-dom` is a library within the stack, not a replacement; needs approval (see Complexity Tracking). |
| II. Frontend architecture | ✅ | Atomic Design kept; atoms and molecules never call services; API access only through `services/` and `apiClient`; no Redux (context only). |
| III. Backend architecture | ✅ N/A | No backend changes. |
| IV. Database discipline | ✅ N/A | No schema changes; demo records are not seeds. |
| V. Testing | ✅ | Tests for validation, critical interactions, state transitions, and fixture integrity; no count-padding tests. |
| VI. Environment | ✅ | No new variables; `VITE_API_URL` unchanged. |
| VII. Simplicity | ✅ | Plain CSS, small shared component set grown per need, no generic frameworks. |
| VIII. Spec-driven | ✅ | This spec, plan, and tasks; `analyze` before `implement`. |
| IX. Scope control | ✅ | Architecture additions (router, demo context, mocks folder) justified in research.md. |
| X. AI usage | ✅ | AI-LOG entry per phase. |

**Post-design re-check**: no violations introduced by data-model or contracts.

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-ui/
├── spec.md
├── plan.md                 # this file
├── research.md             # D-UI-01…D-UI-07
├── data-model.md           # demo records and scenarios
├── quickstart.md           # manual responsive/zoom/a11y checklist
├── contracts/
│   └── ui-services.md      # service and hook boundary
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (target state after UI-5; files appear phase by phase)

```text
frontend/src/
├── App.jsx                         # router + providers
├── main.jsx
├── routes/
│   ├── paths.js                    # route constants (existing, extended)
│   └── AppRoutes.jsx
├── contexts/
│   └── DemoSessionContext.jsx      # demo account + scenario (not auth)
├── layouts/
│   └── MainLayout.jsx              # existing, becomes the app shell
├── styles/
│   ├── tokens.css                  # one token system
│   └── global.css                  # existing, extended
├── constants/
│   ├── project.js                  # existing
│   └── labels.js                   # status id → Vietnamese label
├── utils/
│   └── format.js                   # dd/MM/yyyy, time ranges, word count
├── mocks/
│   ├── fixtures.js                 # base records
│   ├── scenarios.js                # scenario overrides + demo clock
│   └── store.js                    # in-memory session store
├── services/
│   ├── apiClient.js                # existing (fixed in UI-5)
│   ├── healthService.js            # existing
│   ├── uiError.js
│   ├── demoSessionService.js
│   ├── campaignService.js
│   ├── applicationService.js
│   ├── resultService.js
│   ├── scheduleService.js
│   ├── portalService.js
│   └── interviewerService.js
├── hooks/                          # one per screen area (useCampaign, useApplications, …)
├── components/
│   ├── atoms/                      # Button (existing), Badge, TextInput, Select, Textarea, Checkbox
│   ├── molecules/                  # FormField, Alert, StatCard, Tabs, Pagination, EmptyState, StepIndicator, FileField
│   ├── organisms/                  # AppHeader, Modal, ConfirmDialog, DataTable, DetailPanel, screen organisms
│   └── templates/                  # MainTemplate (existing) → page template with title + campaign context
├── pages/
│   ├── CampaignManagementPage.jsx
│   ├── ApplicationReviewPage.jsx
│   ├── InterviewSchedulingPage.jsx
│   ├── ApplicantPortalPage.jsx
│   ├── InterviewerWorkspacePage.jsx
│   └── NotFoundPage.jsx
└── tests/                          # existing location; mirrors components/, pages/, mocks/
```

**Structure Decision**: Keep the existing `frontend/src` layout and Atomic Design folders. The only new top-level folder is `mocks/` (justified in D-UI-05). `layouts/MainLayout.jsx` remains the routing shell; `templates/` stays the page-level composition, as described in `docs/ARCHITECTURE.md`.

## Phased Roadmap

Each phase ends with `npm run verify` passing, an AI-LOG entry, and a review before commit. Shared components are added **when a screen first needs them**, not all in UI-1.

### UI-1 — Foundation

- **Scope**: router, app shell and header, demo session (account + scenario), tokens and global CSS, label mapping, formatting helpers, fixtures + scenarios + store, `UiError`, demo session service, route targets for the five screens rendering their real title and campaign context, not-found page.
- **Shared components built now (needed by the shell)**: `Button` (variants), `Badge`, `Alert`, `AppHeader`, page template.
- **Dependencies**: UI-0 approved; `react-router-dom` approved.
- **Expected files**: `frontend/package.json`, `package-lock.json` (router), `frontend/index.html` (`lang="vi"`), `src/App.jsx`, `src/routes/{paths.js,AppRoutes.jsx}`, `src/contexts/DemoSessionContext.jsx`, `src/layouts/MainLayout.jsx`, `src/styles/{tokens.css,global.css}`, `src/constants/labels.js`, `src/utils/format.js`, `src/mocks/{fixtures.js,scenarios.js,store.js}`, `src/services/{uiError.js,demoSessionService.js}`, `src/components/atoms/{Button,Badge}/*`, `src/components/molecules/Alert/*`, `src/components/organisms/AppHeader/*`, `src/components/templates/MainTemplate/*`, `src/pages/*Page.jsx` (6), tests.
- **Acceptance**: every route renders its correct title; the header shows role-appropriate links and a visible "Demo" label; switching scenario or account updates the header; unknown URL shows not-found; no horizontal scroll at 360 px; fixture invariants pass.
- **Tests**: header navigation per role; route titles; not-found; Button variants and disabled reason; fixture integrity (data-model invariants 1–6).
- **Commit boundary**: (1) `chore: add react-router-dom` + tokens/global/labels; (2) `feat: add app shell and demo session`; (3) `feat: add ClubFlow demo fixtures and scenarios`.
- **Scaffold decision at UI-1 review**: `ClubFlowOverview`, `StatusBadge` (API health), `HomePage`, and `useApiHealth` stop being routed. Keep them until the team agrees to remove them; do not delete in the same commit as new features.

### UI-2 — Executive screens (US1, US2, US3)

- **Scope**: Campaign Management → Application Review (CV Screening tab) → Final Results tab → Interview Scheduling.
- **Shared components added as first needed**: `TextInput`, `Select`, `Textarea`, `FormField`, `StatCard`, `StepIndicator` (US1); `Tabs`, `Pagination`, `EmptyState`, `DetailPanel`, `DataTable` with stacked mobile rows, `Modal`, `ConfirmDialog` (US2); reuse for US3.
- **Dependencies**: UI-1.
- **Expected files**: `src/pages/{CampaignManagementPage,ApplicationReviewPage,InterviewSchedulingPage}.jsx`, `src/services/{campaignService,applicationService,resultService,scheduleService}.js`, `src/hooks/{useCampaign,useApplications,useFinalResults,useSchedule}.js`, screen organisms (for example `CampaignForm`, `PositionEditor`, `ApplicationList`, `ApplicationDetail`, `FinalResultsTable`, `ScheduleTable`, `ConfirmationChecklist`), the new atoms and molecules, tests.
- **Acceptance**: the acceptance scenarios of US1, US2, and US3 in spec.md.
- **Tests**: campaign validation messages and preserved input; filter, search, sort, and pagination agree with counts; shortlist/reject affects only the selected application; detail close preserves filters; Pass/Fail unavailable without assessment; publish confirmation; schedule counts equal rows; confirm disabled with listed reasons, then enabled after the demo resolution; confirmed state read-only; dialog focus trap and Escape.
- **Commit boundary**: four commits: `feat: add campaign management screen`, `feat: add application review screening tab`, `feat: add final results tab`, `feat: add interview scheduling screen`.

### UI-3 — Applicant Portal (US4)

- **Scope**: public campaign and positions, demo sign-in dialog, application form (CV file checks, SOP counter, slot selection, duplicate-position notice), My Applications, notifications.
- **Shared components added**: `Checkbox`, `FileField`, reuse `Tabs`, `Modal`, `DataTable`.
- **Dependencies**: UI-1; `Modal` and `Tabs` from UI-2.
- **Expected files**: `src/pages/ApplicantPortalPage.jsx`, `src/services/portalService.js`, `src/hooks/useApplicantPortal.js`, organisms (`PublicCampaign`, `ApplicationForm`, `MyApplications`, `NotificationList`, `SignInDialog`), tests.
- **Acceptance**: the US4 acceptance scenarios.
- **Tests**: phase messages per scenario; sign-in prompt for Visitor; PDF type and 5 MB checks; SOP 300-word boundary (300 passes, 301 fails); slot required; duplicate position notice; unpublished result never shown; notification appears only for published results.
- **Commit boundary**: (1) `feat: add applicant portal campaign and application form`; (2) `feat: add applicant applications and notifications`.

### UI-4 — Interviewer Workspace (US5)

- **Scope**: assigned interviews, details and CV control, assessment form, submitted read-only state, empty and restricted states.
- **Dependencies**: UI-1; `DataTable` and `FormField` from UI-2.
- **Expected files**: `src/pages/InterviewerWorkspacePage.jsx`, `src/services/interviewerService.js`, `src/hooks/useInterviewerWorkspace.js`, organisms (`AssignedInterviews`, `InterviewDetail`, `AssessmentForm`), tests.
- **Acceptance**: the US5 acceptance scenarios.
- **Tests**: only own interviews listed; validation; submit → read-only; empty state in the screening scenario; restricted state for other roles.
- **Commit boundary**: one commit `feat: add interviewer workspace`.

### UI-5 — Responsive, accessibility, and integration readiness

- **Scope**: run the [quickstart.md](quickstart.md) checklist (5 screens × 360/768/1280 px × 100/125/150/200% zoom), fix issues; keyboard and focus review; loading/error review via demo simulation; `apiClient` FormData, error-body, and Bearer support; integration handoff notes.
- **Dependencies**: UI-2…UI-4.
- **Expected files**: CSS fixes in touched components, `src/services/apiClient.js`, `src/tests/services/apiClient.test.js`, `docs/frontend/INTEGRATION.md` (service → hook → page map and how to swap demo bodies), `specs/001-frontend-ui/tasks.md` checkmarks.
- **Acceptance**: SC-002, SC-004, SC-006, SC-007 met and recorded in quickstart.md results; `apiClient` sends `FormData` without forcing JSON content type and rejects with a `UiError` carrying the backend message.
- **Tests**: `apiClient` (JSON, FormData, error body, 204); loading/error/empty rendering per hook.
- **Commit boundary**: (1) `fix: responsive and zoom adjustments`; (2) `feat: prepare api client for integration`; (3) `docs: add frontend integration guide`.

## Complexity Tracking

| Addition | Why needed | Simpler alternative rejected because |
|---|---|---|
| `react-router-dom` dependency | Deep-linkable screens and tabs, back/forward, role routes | Hand-written state switching gives no URLs and is harder to explain |
| `src/mocks/` folder + in-memory store | Consistent demo data across five screens in one session | Per-page constants contradict each other (shown in the reference package) |
| `DemoSessionContext` | Role and scenario previews without real auth | Prop drilling through every page; Redux is prohibited |
