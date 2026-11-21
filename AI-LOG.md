# AI Usage Log

## How to use this file

Format of the CSC13008 AI-LOG template.

- One entry per task where an assistant did part of the work, written as we go.
- Every entry uses the six lines below, in this order. `Rejected` and `By hand` are the lines read most closely.
- A line that was not written down when the work was done says `Not recorded at the time.`; it is not filled in afterwards.
- Lines after `By hand` (`Verified`, `Incident`, `Limitations`, …) record which check caught a problem.
- No secrets in prompts: no API keys, no real user data, no classmate's work. The team must be able to explain every line it accepts.

```md
## <YYYY-MM-DD> — <what we were working on>
Tool: <Claude Code / Codex / ChatGPT / none>
Asked for: <the task, in one sentence>
Kept: <what we took as it came>
Changed: <what we rewrote, and why>
Rejected: <what we threw away, and why>
By hand: <the parts we did ourselves>
```

---

## 2026-10-04 — Initial project setup

Tool: ChatGPT

Asked for: Help set up the initial full-stack project structure.

Kept: The basic frontend, backend, database, and project folder structure.

Changed: Some project rules and structure were adjusted later as the project requirements became clearer.

Rejected: Not recorded at the time.

By hand: The team reviewed the project structure and continued configuring the project.

---

## Earlier AI-assisted work

Some earlier development tasks were completed before the team started using this AI-LOG format consistently.

These may include work related to authentication, file upload, and ESLint setup.

Detailed AI usage for those tasks was not recorded at the time, so missing information will not be recreated.

Future AI-assisted tasks will be recorded using the format below.

---

## 2026-10-11 — PA#5 documentation

Tool: Codex

Asked for: Review and improve the project documentation required for PA#5.

Kept: The existing project architecture, ESLint, testing setup, build process, and local verification commands.

Changed: Updated the project conventions, README, AI-LOG, Quality Gate, and Self-Assessment structure to better match the PA#5 requirements.

Rejected: CI and other unnecessary tools because they are not required for the current project.

By hand: The team reviewed the changes and decided which parts to accept.

---

## 2026-11-14 — Phase 0A: rebrand framework to ClubFlow

Tool: Claude Code

Asked for: Rebrand the existing reusable web application framework to ClubFlow (names, metadata, visible branding, documentation) without adding business features.

Kept: Architecture, API routes, authentication and upload infrastructure, database schema, ports, Docker Compose configuration, and earlier entries in this log.

Changed: npm package names (`clubflow`, `clubflow-frontend`, `clubflow-backend`) and the matching lockfile entries, frontend title and displayed branding, `DB_NAME` in `.env.example`, README description, and README URLs that contradicted the configured ports.

Rejected: Renaming the Docker Compose project, container, or existing local database, and editing the constitution title, because these need a manual migration or team approval.

By hand: The team reviews the diff before committing; repository, directory, remote, and database renames are left as manual follow-up actions.

---

## 2026-11-14 — Phase 0A.2 — Docker & PostgreSQL Migration

Tool: Claude Code

Asked for: Migrate the local Docker Compose project, PostgreSQL container, database, user, and volume from the earlier scaffold names to ClubFlow names without losing data or touching unrelated Docker resources.

Kept: PostgreSQL 16 (`postgres:16-alpine`), the local port, all passwords and secrets, application code, and the old container and volume (stopped, kept as rollback resources).

Changed: `docker-compose.yml` (explicit project name `clubflow`, container `clubflow_postgres`), `DB_USER` in `.env.example`, `DB_NAME` and `DB_USER` in the local `.env`, and the README note about database naming. A new volume `clubflow_postgres_data` was initialized and the old database was restored into it from a verified `pg_dump` backup stored outside the repository.

Rejected: Reusing the old data directory under the new names, and deleting the old container, volume, or network.

By hand: The migration plan was approved by the team before any Docker resource was created; the team reviews the diff before committing and decides when to remove the old rollback resources.

Cleanup follow-up (2026-11-14):

- Legacy container `webapp_postgres` was removed.
- Legacy volume `web-application-development_postgres_data` and network `web-application-development_default` were removed after verification.
- The temporary bind-mount stub was removed.
- The new ClubFlow PostgreSQL environment remains healthy.
- The verified database backup was retained.
- Rollback now requires restoring the backup rather than restarting the old container.

---

## 2026-11-14 — Phase 0A.3 — Constitution & Frontend Branding

Tool: Claude Code

Asked for: Rename the constitution to ClubFlow, rename the remaining scaffold-named frontend component, and align the development preview branding with ClubFlow, without adding business features.

Kept: All constitution principles, stack, governance rules, and ratification date; the Atomic Design structure; the API health status display; the layout and styling; dependencies; backend code; and earlier entries in this log.

Changed: Constitution title to `ClubFlow Constitution` with a PATCH amendment (1.0.0 to 1.0.1, wording only). Renamed the `ProjectOverview` organism to `ClubFlowOverview` (files, CSS class names, import in `HomePage.jsx`). Set the displayed description to `Student Club Recruitment Management System` in `constants/project.js` and the `index.html` meta description. Added a component test for `ClubFlowOverview`.

Rejected: Fake dashboards or placeholder controls for features that do not exist yet, new pages or routes, new dependencies, edits to Spec Kit templates, and rewording historical references to the earlier scaffold name.

By hand: A team member confirmed team approval of the constitution title change before it was edited. The team reviews the diff, checks the preview page in a browser, and commits; this entry does not mean the phase has been committed.

Verified: `npm run lint`, `npm test`, `npm run build`, `npm run verify`, and `git diff --check` passed; no active source file references the old component name.

---

## 2026-11-14 — Phase 0B — Documentation Integration

Tool: Claude Code

Asked for: Integrate and review the prepared ClubFlow requirements documentation under `docs/` (`docs/requirements/`, `docs/requirements/sources/`, `docs/course/`): check the structure, check for conflicts with `AGENTS.md`, the constitution, `docs/ARCHITECTURE.md`, and `docs/QUALITY-GATE.md`, verify Markdown links, and confirm coverage of BR-01 through BR-14, without rewriting the documentation unless a concrete factual inconsistency was found.

Kept: All prepared documentation as supplied; no wording was changed. Frontend, backend, database, Docker, and dependencies were not touched.

Changed: Not recorded at the time.

Rejected: Writing a replacement `docs/README.md` or rewording any prepared document.

By hand: The team reviews the documentation and this entry, resolves the missing hub file, and commits; this entry does not mean the phase has been committed.

Checked:

- BR-01 to BR-14 in `BUSINESS_RULES.md` match the source Business Description v1.1; each BR has at least one acceptance criterion and one traceability row.
- Sample claims citing the Final Project Brief and meeting notes (Product Owner channel, PA weights, Cloudinary history) match the source files.
- No conflict was found with `AGENTS.md`, the constitution, `docs/ARCHITECTURE.md`, or `docs/QUALITY-GATE.md`. The documents leave schema, endpoints, and libraries to later phases and mark all requirements `Not verified`.
- Markdown links: 31 relative links checked, 1 broken.

Finding (not fixed): `docs/README.md` (the "Documentation Hub") does not exist, but `docs/requirements/README.md` links to it as `../README.md`. Its contents were not invented; the team should add the prepared hub file or remove the link.

Verified: `git diff --check` passed. `npm run verify` passed (lint, frontend 3 tests, backend 18 tests, build) when run from an uppercase `D:` drive path (`D:\nam3\clubflow`). When run from a lowercase `d:` drive path, the frontend Vitest run failed with `Cannot read properties of undefined (reading 'config')`. This is a Windows drive-letter casing issue in the local environment, not a documentation issue.

---

## 2026-11-14 — UI-0 — Frontend Preparation

Tool: Claude Code

Asked for: Resolve the blockers found in the read-only frontend readiness audit and prepare the repository for UI-first React development, without implementing screens.

Kept: All frontend, backend, database, Docker, and environment files; the scaffold components; the UI reference package (including `reference.js`) unchanged; the official business rules.

Changed:

- `eslint.config.mjs`: added one ignore entry, `docs/reference/ui/assets/**`, because the static reference demo script reported 12 `no-undef` errors and blocked `npm run verify`. No rule was weakened; frontend, backend, and test files are still linted.
- Added `docs/README.md` as the documentation hub (links only), fixing the broken link from `docs/requirements/README.md`.
- Created the Spec Kit feature `specs/001-frontend-ui/` with the project's scripts (`spec.md`, `checklists/requirements.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/ui-services.md`, `quickstart.md`, `tasks.md`). The scripts also wrote `.specify/feature.json` (the active-feature pointer).
- Proposed UI decisions D-UI-01…D-UI-07 in `research.md`: Vietnamese UI with English identifiers, `react-router-dom` (to be installed in UI-1 after approval), one rem-based token system from the original PA#2 CSS, stacked mobile tables, one fixture set with four demo scenarios and fixed demo clocks, a demo session context that is not authentication, and service/hook boundaries without invented API endpoints.

Rejected: Editing `reference.js` to satisfy lint, ignoring all JavaScript, installing the router in UI-0, placeholder pages, and running the optional Spec Kit agent-context hook (it would edit agent files outside this phase).

By hand: The team reviews and approves the spec, plan, and the router dependency before UI-1, and commits; this entry does not mean the phase has been committed.

Found: `reference.js` gives CF-030 and CF-031 an unpublished Pass, while `UI_REFERENCE_NOTES.md` and the Final Results preview show them awaiting assessment; the fixtures will follow the notes (recorded in `research.md`).

Verified: `npm run lint`, `npm test` (frontend 3, backend 18), `npm run build`, `npm run verify`, and `git diff --check` all exited 0 (run from `D:` uppercase path); 49 relative Markdown links in the new and hub documents resolve.

---

## 2026-11-14 — UI-1.1 — Routing & Design Foundation

Tool: Claude Code

Asked for: Add the approved `react-router-dom`, the five-screen route structure with temporary placeholders, one shared design-token file, Vietnamese status labels, and tested date/time formatting, without building any ClubFlow screen, mock data, demo session, or navigation.

Kept: The API health check (`useApiHealth` + `ClubFlowOverview`) still renders on `/`; `Button`, `StatusBadge`, `ClubFlowOverview`, `MainTemplate`, and `MainLayout` are unchanged; backend, database, Docker, and `.env` untouched.

Changed:

- Installed `react-router-dom@^7.18.5` in the `frontend` workspace (adds `react-router`, `cookie`, `set-cookie-parser` to the lockfile). npm 11 also re-sorted `devDependencies` alphabetically and dropped `"peer": true` metadata flags from the lockfile; no existing package version changed.
- Routing: `App.jsx` uses `BrowserRouter`; `routes/AppRoutes.jsx` maps `/`, `/executive/campaign`, `/executive/review`, `/executive/scheduling`, `/interviewer`, and `*`. `routes/paths.js` holds the paths and the `?tab=` values for later phases.
- Pages: `RoutePlaceholderPage.jsx` (clearly labeled temporary page), `NotFoundPage.jsx`; `HomePage.jsx` now renders the `/` placeholder titled "Cổng ứng viên" around the existing health overview.
- Styles: `styles/tokens.css` copies the PA#2 `styles.css` token values (navy brand, page/surface/border/text, success/warning/danger, spacing, radii, focus ring, 2.75rem control height, 72rem content width; breakpoints 48rem/80rem documented). `styles/global.css` imports the tokens and adds the PA#2 base rules (focus-visible, link colors, overflow-wrap, reduced motion) without `overflow-x: hidden` or transforms.
- `constants/labels.js`: Vietnamese labels for English identifiers, taken from the reference badges; `getLabel` never shows raw identifiers.
- `utils/format.js`: `formatDate`, `formatTime`, `formatDateTime`, `formatTimeRange` with fixed `vi-VN` output (`dd/MM/yyyy`, 24-hour `HH:mm`), a single display time zone constant (`Asia/Ho_Chi_Minh`, pending Q-02), and `—` fallbacks.
- Tests: `tests/routes/AppRoutes.test.jsx`, `tests/constants/labels.test.js`, `tests/utils/format.test.js`.
- `specs/001-frontend-ui/tasks.md`: checked T005, T007–T010, T024; T025/T026 marked partial; the word-count helper moved to T052.

Rejected: Five separate placeholder page files (one shared placeholder is clearer and is replaced screen by screen), relying on the browser's default `toLocaleDateString` (output varies by browser), and copying `reference.css` (px fonts, `overflow-x: hidden`).

By hand: The team reviews the diff, opens the routes in a browser, and commits; this entry does not mean the phase has been committed.

Verified:

- `npm run lint`, `npm test` (frontend 29, backend 18), `npm run build`, and `npm run verify` exited 0 (run from the uppercase `D:` path).
- Browser (headless Microsoft Edge against the Vite dev server): all six paths rendered the expected `<h1>`; `/` showed the real "API unavailable" state because the backend was not running. Headless Edge cannot shrink its window below 492 px, so widths were tested by loading each route in an iframe of exact width (360, 640, 768, 853, 1024, 1280 CSS px) through a same-origin local proxy: no horizontal overflow on any route. 640/853/1024 approximate a 1280 px window at 200/150/125% zoom; real browser zoom was not tested.

---

## 2026-11-14 — UI-1.2 — App Shell & Shared Components

Tool: Claude Code

Asked for: Build the shared application shell (layout, header, navigation, demo session for Visitor/Executive/Applicant/Interviewer) and the shared components needed by it, following `specs/001-frontend-ui/`. Part of an autonomous run of UI-1.2…UI-5 with per-phase commits authorized by the team.

Kept: Routes and paths from UI-1.1; the API health check (now shown in the shell footer through the existing `useApiHealth` + `StatusBadge`); `HomePage`/`ClubFlowOverview` still render on `/` until UI-3 replaces it.

Changed:

- `layouts/MainLayout.jsx` renamed to `layouts/AppLayout.jsx` (git mv) and turned into the shell: skip link, `AppHeader`, a single `<main>` that receives focus on navigation, footer, shared `SignInDialog` (opened from the header or by pages via the outlet context).
- New components: atoms `Badge`, molecules `Alert`, `Card`, `FormField`, `EmptyState`, `StepIndicator`, organisms `AppHeader`, `Modal` (focus trap, Escape, focus return), `SignInDialog`. `Button` gained the PA#2 variants and link rendering; `MainTemplate` became the page heading template (eyebrow, one `<h1>`, actions, campaign context, Executive step strip, `document.title`); `StatusBadge` uses tokens.
- Demo session: `contexts/DemoSessionContext.jsx` + `contexts/demoSession.js`, `services/demoSessionService.js`, `services/uiError.js`, `mocks/fixtures.js` (demo accounts from the reference), `mocks/store.js` (session only). Labeled everywhere as a demo, not authentication.
- `routes/navigation.js` (links per role, landing route per role), `styles/layout.css` (PA#2 typography and layout utilities), `index.html` `lang="vi"`, `labels.js` page titles now match the reference `<h1>` texts.
- Tests: shell/navigation/sign-in/focus tests, Modal tests, Button/Badge tests; shared `tests/helpers/renderApp.jsx`; the health service is mocked globally in `tests/setup.js`.

Rejected: Adding `@testing-library/user-event` (not installed; tests use `fireEvent` instead of a new dependency); a hamburger menu (at most four links, wrapping is enough).

By hand: The team reviews the commit.

Verified: `npm run lint` 0, frontend tests 43 passed, `npm run build` 0, no React `act()` warnings. Headless Edge (same-origin iframe at exact widths): `/`, `/executive/review`, and a not-found path at 360/768/1280 px have one `<h1>` and no horizontal overflow; screenshots at 360 and 1280 checked against the reference header.

---

## 2026-11-14 — UI-1.3 — Mock Data & Service Foundation

Tool: Claude Code

Asked for: One canonical, consistent mock dataset with demo scenarios and asynchronous mock services matching `specs/001-frontend-ui/contracts/ui-services.md`, so the five screens can be built against stable data and later switched to real APIs.

Kept: The service contract boundaries; no HTTP endpoints were invented; no business-rule engine in React components.

Changed:

- `mocks/fixtures.js` (accounts, campaign, departments, positions, slots, rooms, interviewer assignments, CF-026…CF-031, draft and confirmed interviews, assessments, results, notifications — from `UI_REFERENCE_NOTES.md` and the reference pages), `mocks/scenarios.js` (draft, before-open, accepting, screening, confirmed; each with a fixed demo clock), `mocks/store.js` (current scenario, session, simulated network mode, reset), `mocks/derive.js` (submission window, campaign phase, demo schedule evaluation), `mocks/guards.js` (role checks and BR-14 locks so the demo answers like a backend would).
- Services: `campaignService`, `applicationService`, `resultService`, `scheduleService`, `portalService`, `interviewerService`; `demoSessionService` gained scenarios, reset, and network simulation.
- `DemoSessionContext` now exposes scenario, reset, simulation, and a `dataVersion` that page hooks reload on; the selection (not the data) is kept in `sessionStorage`. New `organisms/DemoBar` under the header, clearly labeled "Demo".
- Hooks `useServiceData` (load with loading/error/refresh) and `useAction` (mutations returning `UiError`); `utils/validation.js` (UI input checks reused by the mock layer), `utils/csv.js`.
- `frontend/public/demo/fictional-sample-cv.pdf`: copy of the reference package's fictional sample CV, used for every demo CV link. Its text could not be rendered for review here (subset fonts); it is the file the reference itself labels as fictional.
- Spec updates in `research.md`/`data-model.md`: the extra `draft` scenario, mock-layer schedule evaluation, CF-031 availability resolution (reference showed 09:00–09:15; applicants choose hourly slots), no screening reversal (not settled by WORKFLOWS §3), interview configuration locked once applications exist (pending Q-03).
- Tests: fixture invariants for every scenario, and service state transitions (BR-01…BR-14 behaviors as demo responses).

Found and fixed during self-review: escape sequences in generated text were written as literal invisible characters (a CSV byte-order mark and a diacritics regex); replaced with `String.fromCharCode` and `\p{M}` and scanned the source tree for invisible characters (none left). A synchronous `setState` in `useServiceData` was flagged by `react-hooks/set-state-in-effect` and rewritten.

Rejected: Not recorded at the time.

By hand: The team reviews the commit; backend developers should treat `mocks/derive.js` and `mocks/guards.js` as descriptions of expected responses, not as reusable business logic.

Verified: `npm run lint` 0; `npm run verify` 0 (frontend 92 tests, backend 18); no `act()` warnings.

---

## 2026-11-14 — UI-2.1 — Campaign Management UI

Tool: Claude Code

Asked for: Implement `/executive/campaign` from `index.html` and SCREEN_REQUIREMENTS Screen 1 (BR-01, BR-02, BR-04, BR-14) against the mock services.

Kept: Not recorded at the time.

Changed:

- `pages/CampaignManagementPage.jsx` + `hooks/useCampaign.js`: campaign information, timeline, departments/positions with quotas and requirements, interview preparation, Save Draft, Preview (modal), Publish (confirmation dialog), "Lưu thay đổi" once published, inline errors with an error banner and focus on the first invalid field, published state with a link to Application Review, read-only state after schedule confirmation, BR-04 block when removing a position that has applications.
- New components: molecules `AsyncContent` (loading / error + retry), `Timeline`, `PositionCard`; organisms `ConfirmDialog`, `CampaignPreview`, `CampaignDetailsCard`, `PositionsEditor`, `InterviewSetupCard`. `routes/RoleGate.jsx` shows a restricted state for other demo roles (UI only, not access control).
- Self-review fixes after the browser check: native date inputs showed the browser's US order (11/05/2026 for 5 Nov), so each date field now also shows "Ngày đã chọn: dd/MM/yyyy"; the header showed "Ban tuyển dụng · Ban tuyển dụng" and now shows the club; the demo bar took about 300 px on mobile and is now a collapsed `<details>` summary.

Rejected: Not recorded at the time.

By hand: The team reviews the commit.

Assumptions: interview date/window/duration are locked once applications exist (pending Q-03); a published campaign stays editable until schedule confirmation, as the reference states.

Verified: lint 0; frontend tests 99 passed. Headless Edge as the demo Executive (`draft` scenario): one `<h1>`, no horizontal overflow at 360/640/768/853/1024/1280/1600 px; screenshots at 360 and 1280 compared with `index-360.png`/`index-1280.png`.

---

## 2026-11-15 — UI-2.2 — Application Review: CV Screening tab

Tool: Claude Code

Asked for: Implement `/executive/review?tab=screening` from `review.html` and SCREEN_REQUIREMENTS Screen 2 (BR-06…BR-09, BR-14). Work resumed after a pause; the uncommitted UI-2.2 changes were re-verified before committing.

Kept: Not recorded at the time.

Changed:

- `pages/ApplicationReviewPage.jsx` with URL-synced tabs (`?tab=screening|results`, no separate routes). CV Screening: campaign-wide statistics with applications and distinct applicants counted separately and the scope stated (BR-06); search (accent-insensitive), position/status filters, sort, pagination (5 per page) with a "filtered" summary; a detail panel beside the list (student info, availability, link to the fictional sample CV, full SOP, Executive-only private note); Shortlist / Reject for the selected application only, with a confirmation before rejecting (BR-07); CSV export of the current filter without private notes or CV files (BR-09); empty, filtered-empty, loading, and error-with-retry states; decisions read-only after schedule confirmation (BR-14). The Final Results tab shows a labeled interim state until UI-2.3.
- New components: molecules `StatCard`, `Tabs` (WAI-ARIA keyboard pattern), `Pagination`; organisms `ApplicationFilters`, `ApplicationList`, `ApplicationDetail`; hook `hooks/useApplications.js`; badge tone maps in `constants/labels.js`; the detail service response now includes the applicant's other application IDs and the lock flag.
- Decision hint follows the reference ("Áp dụng riêng cho CF-026; hồ sơ CF-027 được duyệt độc lập") and adds the reason when the buttons are unavailable (already decided — reversal is not defined by WORKFLOWS §3 — or locked by BR-14).
- Test timing: `tests/setup.js` raises the Testing Library async timeout from 1 s to 3 s, and `frontend/vitest.config.js` sets `testTimeout: 10000`. On resume, `npm run verify` failed twice intermittently (a full-page test still loading after 1 s when all files ran in parallel; the slowest page test takes about 3.4 s against the 5 s default). Both passed when rerun; no assertion was changed.

Rejected: Not recorded at the time.

By hand: The team reviews the commit.

Verified: `npm run verify` 0 twice in a row (frontend 110 tests after adding the Tabs test, backend 18); no `act()` warnings. Headless Edge as the demo Executive (`screening`): one `<h1>`, no horizontal overflow at 360/640/768/853/1024/1280/1600 px for both tabs; screenshots at 360 and 1280 compared with `review-360.png`/`review-1280.png`. The detail-panel-open state is covered by tests but was not captured in the browser (the headless check cannot click).

---

## 2026-11-15 — UI-2.3 — Application Review: Final Results tab

Tool: Claude Code

Asked for: Implement `/executive/review?tab=results` from `review-final-results-preview.html` (F6; BR-08, BR-14): results per application, assessment viewing, Executive Pass/Fail, publication with confirmation, in-app notifications.

Kept: Not recorded at the time.

Changed:

- `ApplicationReviewPage.jsx` Final Results panel: info alert (Shortlisted ≠ Pass; CV-rejected applications listed as excluded from the service data), results table, selected-application panel with "View Assessment" (advisory, `aria-expanded`), Record Pass / Record Fail (only with a submitted assessment and before publication), "Công bố kết quả" card with a confirmation dialog; empty state with a link to scheduling before the schedule is confirmed.
- New: organism `DataTable` (stacked label/value cards below 48rem so status and actions stay visible; explicit table roles so the semantics survive the card layout; `data-selected` instead of the invalid `aria-selected` on table rows), organisms `FinalResultsTable`, `FinalDecisionPanel`, `PublishResultsCard`, hook `hooks/useFinalResults.js`; `resultService.list()` also returns the interview date and the CV-rejected IDs.
- Tests: `tests/pages/FinalResults.test.jsx` (visibility rules, assessment view, Pass/Fail gating, publish → notification only for that applicant, pre-confirmation state).

Rejected: Not recorded at the time.

By hand: The team reviews the commit.

Verified: `npm run verify` 0 (frontend 116, backend 18). Headless Edge as the demo Executive (`confirmed`): one `<h1>`, no horizontal overflow at 360/640/768/853/1024/1280/1600 px; screenshots at 1280 (table + side-by-side panels) and 360 (stacked result cards) compared with `review-final-results-1280.png`/`-360.png`.

---

## 2026-11-15 — UI-2.4 — Interview Scheduling UI

Tool: Claude Code

Asked for: Implement `/executive/scheduling` from `scheduling.html` and SCREEN_REQUIREMENTS Screen 3 (BR-07, BR-08, BR-10…BR-14) using verified mock responses, without a frontend scheduling algorithm.

Kept: Not recorded at the time.

Changed:

- `pages/InterviewSchedulingPage.jsx` + `hooks/useSchedule.js`: draft parameters (one interview date and window from the campaign; common duration; available rooms), Generate / Regenerate (confirmation before replacing a draft), summary counts taken from the same rows as the table, interviewer assignments and availability, draft table with Proposed / Conflict / Unassigned and the reason for each, a conflict alert listing the real overlaps (including the same applicant across positions), manual Edit / Resolve / Assign Slot dialog, Save Changes with an unsaved-changes badge, timetable CSV export, BR-13 conditions with ✓/✗ text, confirmation dialog, confirmed read-only state (export still allowed), and the BR-13 "no shortlisted applications → skip confirmation" state.
- New components: molecule `ChoiceGroup`; organisms `ScheduleSettingsCard`, `InterviewerAssignmentsCard`, `ScheduleTable`, `ScheduleRowDialog`, `ConfirmationChecklist`.
- Self-review fixes from the browser check: short table values were breaking mid-word ("A-" / "201") because the global `overflow-wrap: anywhere` let columns shrink below a word — tables now use `break-word`; the 8-column tables overflowed their containers at 768–1024 px and hid the action column, so `DataTable` stacks rows as cards below 80rem (recorded in `research.md` D-UI-04); after confirmation the disabled button read "Tạo lịch nháp" and now reads "Tạo lại lịch nháp".
- Tests: `tests/pages/InterviewSchedulingPage.test.jsx` (counts equal rows, conflict reasons, blocked confirmation with each condition, room double-booking, resolve → save → confirm → read-only, regenerate confirmation, confirmed scenario, zero-shortlisted skip).

Rejected: Not recorded at the time.

By hand: The team reviews the commit.

Verified: `npm run verify` 0 three times in a row (frontend 124, backend 18). One earlier `verify` run, started right after the headless-browser checks, had 1 intermittent frontend test failure that could not be reproduced in 4 later full runs; its name was not captured. Open item for UI-5: find the flaky test under load (logs are now kept for every verify run). Headless Edge as the demo Executive: one `<h1>`, no page overflow and no table-container overflow (`scrollWidth == clientWidth`) at 360/640/768/853/1024/1280/1600 px in the `screening` and `confirmed` scenarios; screenshot at 1280 compared with `scheduling-1280.png`.

---

## 2026-11-15 — UI-3 — Applicant Portal (and a session data fix)

Tool: Claude Code

Asked for: Implement the Applicant Portal on `/` from `applicant.html` (F2, F6, F7; BR-02, BR-03, BR-05, BR-08): public campaign, Apply, My Applications, Notifications, shared sign-in, no registration or recovery.

Kept: Not recorded at the time.

Changed:

- `pages/ApplicantPortalPage.jsx` replaces the UI-1.1 `HomePage` on `/`. URL-driven tabs (`?tab=campaign|apply|mine|notifications`) with an unread count; public campaign (timeline, submission-window message per phase, positions, Apply Now → shared demo sign-in for visitors); a drafts-are-not-public state (BR-02); Apply form (read-only name/student ID, email, faculty, PDF CV ≤ 5 MB, SOP ≤ 300 words with live counter, club slots, summary, duplicate-position notice "(đã nộp)", field errors with banner and focus, disabled outside the submission window); My Applications (each application tracked separately; interview only once confirmed; result only once published, otherwise "Chưa công bố"); in-app notifications with "Mới" and mark-all-read; sign-in gates on private tabs and a notice for non-applicant demo roles.
- New: molecule `FileField`; organisms `PublicCampaignPanel`, `ApplicationForm`, `MyApplicationsTable`, `NotificationList`; hook `hooks/useApplicantPortal.js`; `utils/campaignPhase.js`. Removed the unused `FACULTIES` export from the fixtures (the form owns the option list).
- Separate commit `fix: never show another account's data while reloading`: found while testing the portal — the demo session learned the role only after the account list loaded, so a restored applicant session briefly loaded as a visitor and showed that data during the refresh. The provider now restores the account synchronously and `useServiceData` never returns data loaded for another account.
- Tests: `tests/pages/ApplicantPortalPage.test.jsx` (public access and sign-in prompt, private-tab gates, before-open state, draft hidden, validation and preserved input with focus, 300/301-word boundary, 6 MB CV, successful submission appearing as Pending Review, duplicate notice, BR-08 visibility in screening vs confirmed, notification and mark-as-read).

Rejected: Not recorded at the time.

By hand: The team reviews both commits.

Not done as suggested: the two suggested UI-3 commits are one, because the tracking and notification tabs live in the same page file as the form.

Verified: `npm run verify` 0 (frontend 134, backend 18); the isolated fix commit also passed verify (frontend 124, backend 18); no `act()` warnings. Headless Edge: one `<h1>`, no page or table-container overflow for visitor `/` and `?tab=apply` (accepting) at 360/768/1280, applicant `?tab=apply` (accepting) at 360/640/768/1024/1280/1600, and `?tab=mine` / `?tab=notifications` (confirmed) at 360/768/1024/1280; screenshots of Apply at 1280 and My Applications at 360 compared with `applicant-1280.png` / `applicant-results-360.png`. The native file button shows the browser's own language ("Choose File"); the Vietnamese status line under it states the chosen file.

---

## 2026-11-15 — UI-4 — Interviewer Workspace

Tool: Claude Code

Asked for: Implement `/interviewer` from `interviewer.html` (F6, F7; BR-14): assigned interviews only, details and CV access, one assessment per completed interview, submitted / upcoming / empty / restricted states, no Executive notes, no Pass/Fail publishing.

Kept: Not recorded at the time.

Changed:

- `pages/InterviewerWorkspacePage.jsx` + `hooks/useInterviewerWorkspace.js`: interviewer identity badge, campaign and interview-date context, four stats, "Assigned Interviews" table (only the signed-in interviewer's confirmed interviews, with Confirmed + assessment status), selected application details (faculty/year, interview time and room, SOP, link to the fictional sample CV), Interview Assessment form, success message that Pass/Fail is recorded by the Executive elsewhere.
- New organisms: `AssignedInterviewsTable`, `InterviewDetailCard`, `AssessmentForm` (states: form, submitted read-only, not-yet-held locked). `/interviewer` now goes through `RoleGate`; the temporary `RoutePlaceholderPage` is no longer routed (removal is part of the UI-5 cleanup).
- Assumption (Q-04 open): the assessment has the reference fields only — notes (required) and a three-option overall recommendation (required); no numeric scores. The form is a single organism so the fields are easy to change once Q-04 is answered.
- Tests: `tests/pages/InterviewerWorkspacePage.test.jsx` (own interviews only, no private notes, submitted read-only, validation then submit → locked, upcoming interview locked after confirming a schedule in the `screening` scenario, empty state, restricted state for other roles).

Rejected: Not recorded at the time.

By hand: The team reviews the commit.

Verified: `npm run verify` 0 (frontend 141, backend 18), run with the QA servers stopped. Headless Edge as Hà My (`confirmed`): one `<h1>`, no page or table-container overflow at 360/640/768/853/1024/1280/1600 px; empty state (`screening`) at 360 and 1280; screenshot at 1280 compared with `interviewer-1280.png`.

---

## 2026-11-15 — UI-5 — Responsive, accessibility and integration readiness

Tool: Claude Code

Asked for: Review the finished UI for responsiveness, browser zoom, and accessibility; prepare `apiClient` for backend integration; document the integration boundary; remove scaffold code only after confirming it is unused.

Changed (four commits):

- `chore: remove unused scaffold pages and components` — `HomePage`, `RoutePlaceholderPage`, `ClubFlowOverview` (+ test), `constants/project.js`; each had no remaining references. `useApiHealth` and `StatusBadge` are kept for the footer health check.
- `fix: improve frontend responsiveness and accessibility` — found by the browser matrix at 200 % root text: `overflow-wrap: anywhere` was applied only to a list of elements, so text in spans/badges/`dd` could not wrap and overflowed at 360 px; it is now inherited from `<body>`. Stacked table cells now wrap the value under its label instead of using a fixed 7rem label column; desktop tables keep `break-word`. `useServiceData` gained `{ enabled }`, so optional detail/assessment loads no longer start empty requests. `CampaignPreview` no longer spreads a `key` prop. New `tests/a11y/screens.a11y.test.jsx` checks every screen for one `<h1>`, one `<main>`, header/footer landmarks, accessible names on all controls, and unique ids.
- `feat: prepare api client for integration` — query strings, JSON bodies, `FormData` without a forced content type (CV upload), optional Bearer token provider, 204/empty → `null`, failures as `UiError` keeping the backend `{ error }` message with a status-based kind and optional `fieldErrors`/`details`; tests in `tests/services/apiClient.test.js`.
- `docs: document frontend backend integration contracts` — `docs/frontend/INTEGRATION.md` (route ownership, layer boundary, every service function with what the backend must enforce, error/loading conventions, auth replacement, CV boundary, mock-only code not to reuse, open questions), linked from `docs/README.md`; `quickstart.md` results log; `tasks.md` T025, T027, T060–T064.

Kept: Not recorded at the time.

Changed: Not recorded at the time.

Rejected: Not recorded at the time.

By hand: The team reviews the four UI-5 commits and does the manual keyboard pass.

Follow-up (2026-11-15, after the UI-5 docs commit): the final verification failed once more with no browser load, so the earlier "CPU load" explanation was wrong. Code review found the cause: in `ApplicationReviewPage.test.jsx`, "shows the reference header…" waited for the screening panel's request and then synchronously read the campaign context, which comes from the page header's separate `useCampaign()` request. A throwaway experiment that delayed only the header request made the old assertion fail and the awaited version pass. The test now awaits that text (`test: await the separately loaded campaign context`). No product change; the page shows the context as soon as its own request finishes.

Follow-up 2 (2026-11-15): the final gate failed once more (`npm test` and `verify` in the same run; the failing test name was not captured because that run was not logged — every later run is). A review of all page tests for "act on something found before its data arrived" found a **product bug**: when a different application or interview is selected, `useServiceData` kept showing the previous detail until the new one loaded, while the Shortlist / Reject / Save note / Submit Assessment handlers used the newly selected ID. With real network latency a user could act on the wrong application. Fixed (`fix: never show or act on a previous selection while it loads`): the CV-screening detail panel and the interviewer detail/assessment panel render only when the loaded data matches the selection (loading state otherwise), and the handlers use the ID of the displayed data. Two regression tests assert synchronously that the previous item disappears right after another is selected; both failed with the old page code and pass with the fix. The interviewer test that took the stale "Submit Assessment" button now waits for the new item, which is the most likely cause of the remaining intermittent failure. Verified: lint/test/build/verify sequence twice in a row, all exit 0 (frontend 157, backend 18), `--reporter=verbose` with 0 stderr blocks.

Checked:

- Contrast of all text/background token pairs: all pass WCAG AA (lowest 6.53:1; most AAA).
- No hard-coded colors outside `tokens.css`, no `overflow-x: hidden`, no page-scaling transforms, no positive `tabIndex`; every form control is labelled.
- Browser matrix (headless Edge, same-origin iframe at exact CSS widths): 117/117 checks pass — 17 screen/state combinations at 360, 640, 768, 853, 1024, 1280, 1600 px, plus 200 % root text at 360 and 768 px — no page overflow, no table-container overflow, one `<h1>`.

Limitations stated plainly: real browser zoom was not driven; 640/853/1024 px approximate a 1280 px window at 200/150/125 % zoom. Injecting a 200 % root font does not move `rem` media-query breakpoints (a real browser text-size setting does), so 200 % text at 1280 px is not a valid test of the desktop table and was not counted. A manual keyboard pass in a real browser is still recommended.

Correction to earlier entries: the UI-1.2…UI-4 entries say "no `act()` warnings". Those counts were taken from the default reporter output and missed two warnings that the verbose reporter showed (`ScreeningPanel`, `ResultsPanel`) and one React key-spread warning (`CampaignPreview`). All three were fixed in UI-5; the suite now prints no stderr at all (checked with `--reporter=verbose`).

Open item from UI-2.4 (intermittent failure after browser QA): not reproduced in 2 runs under concurrent headless-browser load and 6 further verify runs; the slowest test now takes about 2.2 s against the 10 s limit. Every verify run since UI-3 keeps a full log.

Verified: `npm run verify` 0 (frontend 156, backend 18, build OK); `--reporter=verbose` run with 0 stderr blocks; 57 relative Markdown links in the hub, the guide, and the spec folder resolve.

---

## 2026-11-15 — UI-6 — Pre-integration audit and cleanup

Tool: Claude Code (implementation); Codex using the `speckit-analyze` skill (read-only audit).

Asked for: A read-only audit of the repository before backend integration (unused files, code quality, CSS, mocks, backend scaffold, docs, quality gate), then the approved cleanup batches 1–5. Batch 6 (code splitting) is deferred, as the audit recommended.

Kept: Not recorded at the time.

Changed: Not recorded at the time.

Rejected: Not recorded at the time.

By hand: The team reviews the five UI-6 commits, especially the `studentInfo` snapshot (the backend must store the submitted values too) and the Executive-only `getCampaign()`.

Audit result: no Critical Constitution violation, no P0; four P1 issues, each confirmed in the code before it was changed.

Changed (five commits, `tasks.md` T065–T070):

- `fix: keep submitted student info and role-correct contracts before integration` — applications store a `studentInfo` snapshot (the email/faculty the applicant submitted; before this, `faculty` was dropped and reviewers saw the account profile); the Interviewer Workspace takes its campaign context from `listAssignedInterviews()` instead of the Executive-only `getCampaign()`, which the mock now guards; `apiClient` puts backend `details` keys directly on `UiError.details` (it produced `details.details`).
- `fix: cancel stale demo mutations and surface form and mark-read errors` — `mockRequest()` cancels a call with `UiError('conflict')` if the demo account or scenario changed while it waited (in Slow mode an action could change the newly loaded scenario); Mark all read shows an error alert; `AssessmentForm` and `ScheduleRowDialog` focus the first invalid field.
- `chore: remove unused placeholders, label map, and CSS selectors` — three `.gitkeep` files, `CAMPAIGN_STATUS_LABELS`, `.choice-list`, `.card--subtle`, `.field-legend`, the `.field--invalid` class (no rule); `getNow()` was removed in the previous commit.
- `perf: load the review campaign once and portal data in parallel` — the CV Screening panel no longer refetches `getCampaign()` on every filter change; one Retry reloads every failed request (a full-suite run caught that the first version needed two clicks); the Applicant Portal loads its three requests in parallel.
- `docs: align specs and integration guide with the cleanup` — contracts (`publish(draft)`, `updateRow(applicationId, …)`, `updateSettings`, `markNotificationsRead`, FormData fields, `details` shape, Executive-only `getCampaign`), plan (`AppLayout.jsx`), research (apiClient gap resolved), 80rem table breakpoint in tasks/quickstart, spec status, INTEGRATION.md, TRACEABILITY FR-13 and the ACCEPTANCE_CRITERIA status (mock-only UI evidence, not backend evidence).

Not done, with reasons:

- `.vscode/settings.json` (`{}`) was not deleted: it is Git-ignored, local editor configuration, not repository content.
- The audit's "quickstart says 117/117 tests" is a misreading: 117 is the UI-5 browser-matrix check count, not the unit-test count, so it was left unchanged.
- Making internal-only exports module-private was skipped: the audit named no specific exports, and changing them gives little value.
- The `node_modules/clubflow-backend` junction pointing to the old repository folder is a local-environment issue; a clean `npm install` fixes it. Nothing was changed.
- Feedback messages can still appear on a newly selected item when the selection changes in Slow mode (cosmetic; actions already use the displayed item's ID).

Checked: each new regression test was confirmed to fail without its fix where practical (the stale-mutation test fails with the guard disabled). One environment note: in this session, Vitest started from the Git Bash tool failed to load suites ("failed to find the current suite") even on unchanged files, while the same runs from PowerShell passed; all results below come from PowerShell.

Verified: `npm run verify` exit 0 — lint clean, frontend 166 tests (18 files), backend 18 tests, build OK (same >500 kB chunk warning as before).

---

## 2026-11-16 — UI-7.1 — Q-06 irreversible workflow actions

Tool: Codex using the `speckit-implement` skill.

Asked for: Resume the interrupted Q-06 frontend work without discarding the recovered changes; finish confirmations and immutable states for applications, screening decisions, assessments, confirmed schedules and published results; prevent stale-selection and duplicate-action regressions; synchronize documentation and tests.

Kept: The recovered changes in eight frontend files, the shared `ConfirmDialog`, the existing service/hook boundaries, the mock service state guards, the no-edit application and schedule behavior, and all Q-03/Q-04 behavior. No backend, dependency, environment or Docker file changed.

Changed:

- Both Shortlist and Reject now state that the saved decision is final and require confirmation. The confirmation state snapshots the application ID and decision, so selecting another application cannot retarget the action; feedback is shown only on the application it belongs to.
- Assessment submission validates first, then snapshots the interview ID and payload in a confirmation dialog. Cancelling keeps the draft; selecting another interview unmounts and cancels the old form. `useAction` and the mock service continue to reject duplicate in-flight or already-submitted actions.
- Application and assessment screens explicitly explain their read-only-after-submit behavior. Regression tests cover cancel, stale selection, immutable screening controls and submitted read-only states.
- Added the Q-06 decision record and backend state-transition contract (still `TEAM-SELECTED — PENDING PRODUCT OWNER CONFIRMATION`); aligned the UI service contract, feature requirement and Spec Kit tasks T071–T073.

Rejected: Not recorded at the time.

By hand: The team must review and understand the immutable-workflow policy and code before accepting it; Product Owner confirmation is still pending.

Verified:

- Recovery baseline before edits: `npm run verify` exit 0 — frontend 191/191, backend 18/18, lint and build passed.
- Targeted tests: 23/23 passed across `ApplicationReviewPage.test.jsx` and `InterviewerWorkspacePage.test.jsx`.
- Full `npm run verify` exit 0 — frontend 193/193 (18 files), backend 18/18 (5 files), lint and build passed; the existing Vite >500 kB chunk warning remains.
- Headless Microsoft Edge against the Vite dev server: Shortlist and assessment confirmation dialogs checked at 360, 768 and 1280 CSS px. In all six checks the page and dialog had no horizontal overflow, the dialog fit the 900 px viewport, and Cancel had initial focus. Escape/cancel caused no screening mutation; assessment cancel preserved its draft. This was real-browser viewport simulation, not real browser zoom.

---

## 2026-11-16 — UI-7.2 — Q-02 audit and Q-01 deterministic scheduling contract

Tool: Codex using the `speckit-implement` skill.

Asked for: Audit the existing Q-02 date/time work and all user-visible dates, then align the frontend mock and integration contract with the selected deterministic Q-01 first-fit order without implementing a production scheduling engine.

Kept:

- Q-02 implementation from `f76eb54`: UTC ISO instants, date-only campaign fields, `Asia/Ho_Chi_Minh` display, inclusive closing calendar day implemented as next-day exclusive midnight, and fixed scenario clocks. No date library or new code was needed.
- The verified reference draft, manual schedule editing, conflict/Unassigned evaluation and confirmation conditions. React still does not choose interview combinations.

Changed:

- Added one shared mock comparator: shortlisted applications are exposed by submission instant ascending, then Application ID. Session starts remain chronological; visible applicant slots are explicitly chronological; interviewer assignments and rooms are exposed by stable ID.
- Added a regression that reverses all fixture arrays and creates an equal-submission-time tie, then verifies the service order remains deterministic.
- Added the complete Q-01 decision record and backend algorithm contract: explicit ordering, first valid combination, Unassigned on failure, no backtracking/optimization, transactional overlap protection. Updated the integration guide, service contract, research note and tasks T074–T076. Product Owner approval remains pending.

Rejected: Not recorded at the time.

By hand: The team reviews the first-fit ordering and accepts its intentionally non-optimal/no-backtracking limitation before backend implementation.

Verified:

- Q-02 boundary and five-screen date audit suite: 135/135 tests passed (8 files). All JSX date/timestamp displays use the shared `formatDate`/`formatDateTime`; native date inputs retain ISO values and show an explicit `dd/MM/yyyy` hint.
- Q-01 targeted lint and scheduling tests: lint exit 0; 38/38 tests passed (2 files).
- Full `npm run verify` exit 0: frontend 194/194 (18 files), backend 18/18 (5 files), lint and build passed; the existing Vite >500 kB chunk warning remains.
- No browser check was repeated in this phase because the default fixture order and rendered UI did not change; only order stability under rearranged service input changed.

---

## 2026-11-16 — UI-7.3 — Q-05 Brevo notification readiness

Tool: Codex using the `speckit-implement` skill.

Asked for: Preserve the in-app result notification flow, make mock-mode email claims accurate, and document a future Brevo delivery/retry contract without integrating Brevo or modifying the backend.

Kept: `Publish Results` as the only trigger; confirmation before publication; unpublished result/notification privacy; one Applicant Portal notification list with unread state; no SMS, push, realtime or marketing feature.

Changed:

- Publication success now says the mock creates in-app notifications but sends no real email, and identifies the future one-template Brevo integration. React still makes no Brevo call and no credential/configuration was added.
- Added service and page regressions proving repeat publication is rejected and cannot duplicate an application's in-app notification.
- Added the complete Q-05 decision record and integration contract: atomic result publication + unique in-app notification + unique email outbox record; server-side Brevo worker; delivery status and provider ID; retry the failed record without republishing or duplicating side effects. Tasks T077–T079 are complete. Product Owner confirmation remains pending because email is excluded by the supplied product scope.

Rejected: Not recorded at the time.

By hand: Backend developers must review the outbox/idempotency model and verify the Brevo account, sender, template, retry policy and credential handling before implementation.

Verified:

- Targeted lint and notification tests: lint exit 0; 48/48 tests passed (3 files).
- Full `npm run verify` exit 0: frontend 195/195 (18 files), backend 18/18 (5 files), lint and build passed; the existing Vite >500 kB chunk warning remains.
- Headless Microsoft Edge at 360, 768 and 1280 CSS px: Publish Results confirmation fit the viewport with Cancel initially focused; after confirmation, the updated success alert containing the Brevo/mock disclaimer fit the viewport and the page had no horizontal overflow at all three widths. This was viewport simulation, not real browser zoom. No external email was sent.

---

## 2026-11-16 — UI-7.4 — Q-07 protected Cloudinary readiness

Tool: Codex using the `speckit-implement` skill.

Asked for: Preserve the existing FileField, FormData and mock PDF behavior; verify PDF/5 MB boundaries; document protected Cloudinary upload/retrieval and authorization without integrating Cloudinary or exposing secrets.

Kept: `FileField`, `ApplicationForm`, `portalService.submitApplication(FormData)`, the shared `apiClient` FormData behavior, the fictional sample PDF and all current layouts. No backend, dependency, environment or Cloudinary SDK change was made.

Changed:

- Added a service regression proving an exact 5 MB PDF is accepted while 6 MB is rejected; existing page tests continue to reject non-PDF input and preserve form data.
- Added the Q-07 decision record and integration contract: Express/Multer one-file/size enforcement, actual PDF content inspection, protected Cloudinary storage, PostgreSQL asset metadata, JWT plus Executive/assigned-interviewer authorization, short-lived signed delivery or backend streaming, and orphan cleanup.
- Explicitly documented that a public `secure_url` is not authorization, Cloudinary secrets must never use `VITE_`, the repository's fictional PDF is not a real-data delivery model, and account delivery capabilities must be verified. Tasks T080–T082 are complete; Product Owner/team confirmation remains pending.

Rejected: Not recorded at the time.

By hand: Backend developers must verify the Cloudinary account's protected/authenticated PDF delivery features and review retention, malware scanning, applicant self-access and recovery policy before implementation.

Verified:

- Targeted lint and upload tests: lint exit 0; 49/49 tests passed (3 files: API client, Applicant Portal, mock services).
- Full `npm run verify` exit 0: frontend 195/195 (18 files), backend 18/18 (5 files), lint and build passed; the existing Vite >500 kB chunk warning remains.
- No browser check was repeated because this phase changed only a service boundary test and documentation; the upload UI and rendered copy were unchanged from the previously verified screen.

---

## 2026-11-16 — UI-7.5 — Q-01…Q-07 acceptance and cleanup audit

Tool: Codex using the `speckit-implement` skill.

Asked for: Complete the Q-01…Q-07 frontend and documentation work, audit the requested UI cleanups, verify all five screens, keep backend production work deferred, and leave a clean phase-by-phase Git history.

Kept: Not recorded at the time.

Changed: Not recorded at the time.

Rejected: Not recorded at the time.

By hand: Product Owner confirmation is still required for Q-01…Q-07. Backend engineers must implement and review the documented production contracts, migrations, authorization, provider configuration and failure handling before the UI can replace mock services.

Completed:

- Audited the requested cleanup points: all user-visible campaign/application/interview dates use Vietnamese `dd/MM/yyyy` or `dd/MM/yyyy HH:mm` formatting; Scheduling renders campaign interview configuration as a concise, control-free summary; Campaign Preview has no read-only badge.
- Recorded the final UI-7 browser evidence in `quickstart.md` and closed tasks T083–T085. All Q-01…Q-07 choices remain explicitly team-selected and pending Product Owner confirmation.
- Confirmed the implementation range changes only frontend, tests, specifications and documentation. No backend source, migration, dependency, environment file or production integration was changed; `.env` remains ignored and untracked.

Verified:

- Final standalone commands: `npm run lint`, `npm test` and `npm run build` all exited 0; frontend 195/195 tests passed (18 files), backend 18/18 tests passed (5 files), and the production build completed. The existing Vite >500 kB chunk warning remains non-blocking.
- Final `npm run verify` exited 0 with the same 195 frontend and 18 backend tests, lint and build success.
- Headless Microsoft Edge at 360, 768 and 1280 CSS px: 24/24 checks across 8 key states and all 5 screens passed with one h1, no page/data-table overflow and no raw ISO date text. Dialog-specific checks for Q-05 and Q-06 also passed at all three widths. This was viewport simulation, not real browser zoom.
- `git diff --check` passed; the relevant local Markdown links resolved; the branch remained `feature/q01-q07-decisions`; scope and ignored-file checks found no backend or `.env` change.

---

## 2026-11-16 — UI-8 — Sign In and My Profile prototypes (simulated authentication)

Tool: Claude Code.

Asked for: Finish, debug, test and document the partially implemented UI-8 screens using React and mock data only; no backend, token, database, registration or password features; no commit.

Kept: Not recorded at the time.

Changed: Not recorded at the time.

Rejected: Not recorded at the time.

By hand: The team must review this AI-assisted change before committing, and should repeat a keyboard-only pass in a real browser. Backend engineers own real authentication, authorization and profile persistence.

Completed:

- Registered `/login` and the protected `/profile`; the header now links to "Đăng nhập" and, when signed in, offers an account menu with "Hồ sơ cá nhân" and "Đăng xuất". The account-picker `SignInDialog` was removed; a development-only account switch remains in the Demo controls.
- Mock Sign In matches the account by its current profile email, so an edited email signs into the same account; duplicate emails are rejected; the password stays a development fixture and is never stored in the browser.
- Fixed: profile email and credential email could disagree; a profile save could be shown stale after saving; Sign Out from a protected screen could end on `/login` instead of `/`; a service field error could miss focus because the field was still disabled; redirect after Sign In could race with the "already signed in" redirect; a late profile result could replace a newly selected account in the header.
- An in-flight profile save is cancelled without writing when the account, scenario or demo data changes; unsaved edits are discarded on any session change.

Verified:

- From the repository root: `npm run lint`, `npm test`, `npm run build` and `npm run verify` all exited 0; frontend 295/295 tests passed (23 files), backend 18/18 (5 files, unchanged). `git diff --check` reported no whitespace errors. The existing Vite >500 kB chunk warning remains.
- Headless Microsoft Edge on the production build at 360, 640, 768 and 1280 CSS px: 28/28 state checks passed (details in `specs/001-frontend-ui/quickstart.md`). Viewport simulation only; real browser zoom and a screen reader were not used.

Limitations: authentication and profile changes are simulated in browser memory and reset on reload, scenario switch or demo reset; route guards are UI convenience, not security; lists that resolve a person's name by account ID still show the fixture name after a profile rename.

---

## 2026-11-16 — Final frontend documentation synchronization after UI-8

Tool: Codex.

Asked for: Audit the current React implementation and synchronize frontend documentation only; cover five business screens plus shared Sign In and My Profile, align service contracts and backend handoff guidance, preserve canonical requirements, validate links/diff, and stop before commit.

Kept: Not recorded at the time.

Changed:

- Updated the detailed frontend walkthrough to describe all seven product screens, the current `/login` and `/profile` flows, role-safe redirects, account menu/Sign Out, `AuthGate`/`RoleGate`, `dataVersion`/`sessionEpoch`, mock reset/isolation, immutable application snapshots, loading/error/empty states, and current limitations.
- Rebuilt the walkthrough service map from the actual pages, hooks and service signatures, separated input/output/mock/backend responsibilities, and removed the unapproved proposed endpoint-path table.
- Synchronized `docs/frontend/INTEGRATION.md`, the UI service contracts, data model, routing research, plan, spec, tasks, quickstart and root README. Historical references to five screens now say five **business** screens where needed; historical `SignInDialog` work is explicitly marked as superseded by UI-8.
- Preserved `docs/requirements/` unchanged. Flagged the Q-05 conflict instead of silently resolving it: canonical scope excludes email/SMS/push, while the team's Brevo idea is provisional and still lacks Product Owner approval.
- Added a complete UI-8 manual checklist for all three roles, invalid credentials, Profile Save/Cancel/duplicate email, changed-email sign-in, account switching/reset, Sign Out, protected routes, responsive navigation, five-business-screen regressions, real zoom and screen-reader review.

Rejected: Not recorded at the time.

By hand: Not recorded at the time.

Evidence used:

- Existing UI-8 records: frontend 295/295 (23 files), backend 18/18 (5 files), and 28/28 headless responsive/state checks at 360/640/768/1280 CSS px. These checks were **not rerun** for this documentation-only task.
- Manual real-browser zoom and screen-reader verification remain outstanding, as already recorded in `specs/001-frontend-ui/quickstart.md`.
- Documentation verification for this task: all relative Markdown targets in the modified files resolve; Markdown table column counts pass; stale-term search leaves only clearly historical five-business-screen/`SignInDialog` references; `git diff --check` passes; the changed-file scope contains documentation only.

Scope: Documentation only. No file under `frontend/src/`, `backend/`, database, environment, dependency or canonical requirement documentation was modified. No branch, commit, add or push operation was performed.

---

## PA#3

Entries below this heading belong to PA#3. The PA#2 entries above are unchanged.

## 2026-11-17 — PA#3 Phase 1 — Requirements and repository alignment

Tool: Codex.

Asked for: Verify Git state, inventory all dependencies on the `frontend/` path, move the existing React workspace to `client/`, align PA#3 rules and required documentation, run the real quality gates, review the diff, and stop before commit. The request explicitly excluded API contract implementation, an HTTP mock server, domain service changes, C1–C11 business changes, backend/database changes, dependency installation, commit, and push.

Kept:

- Preserved all 214 tracked React workspace files with 100% rename similarity, including components, hooks, services, browser fixtures, tests, Vite/Vitest configuration, and the fictional PDF asset.
- Preserved current UI behavior, browser-mock behavior, business logic, dependencies, backend, database, and the historical T005–T098 task paths.

Changed:

- Moved `frontend/` to `client/` with `git mv` and updated root workspaces/scripts, `package-lock.json`, ESLint globs, ignore paths, Spec Kit templates, active design documentation, and current source-path references.
- Extended `AGENTS.md` with PA#3 contract-first, HTTP mock-first, relative `/api`, loading/error/empty/success, change-control, dependency-approval, UI-preservation, C1–C11, mock-mode, direct-route, responsive, and semantic constraints.
- Added `brief.md` with only the verified audit and Phase 1 prompts, plus `FRONTEND.md` with the seven required rubric sections. Unverified team IDs, canonical PA#3 accounts, public decision links, endpoints, and runtime evidence remain explicitly marked as missing or requiring team input.

Rejected: None

By hand: Not recorded at the time.

Verified:

- Initial state: branch `pa3-finalize`, HEAD `9144868`, clean working tree; `frontend/` existed and `client/` did not.
- `npm run lint` exited 0.
- `npm test` exited 0: frontend 295/295 tests passed in 23 files and backend 18/18 tests passed in 5 files.
- `npm run build` exited 0 from the `client` workspace; Vite transformed 202 modules and produced `client/dist`. The existing non-blocking warning for a minified chunk over 500 kB remains.
- Diff audit found 214 tracked files before and after the move, every staged workspace rename at 100% similarity, no React source content change, no whitespace error, and `client/dist` still ignored.

Limitations: The API contract, HTTP mock server/data/modes, canonical PA#3 demo handles, relative `/api` proxy configuration, domain HTTP integration, contract checker, C4 editor gaps, team details, and current browser/responsive/W3C evidence remain for later reviewed phases. No commit or push was performed.

---

## 2026-11-17 — PA#3 Phase 1 documentation finalization

Tool: Codex.

Asked for: Review and finalize Phase 1 documentation only; preserve verbatim prompt history, add the Phase 1 `Rejected` field, distinguish required PA#3 accounts from browser-demo accounts, restore historical Spec Kit accuracy with dated migration notes, verify documentation consistency and diff checks, and avoid source, configuration, dependency, contract, mock, commit, or push changes.

Kept: Not recorded at the time.

Changed:

- Rebuilt `brief.md` as a chronological request history with four clearly labeled exact prompts and separate non-verbatim summaries. The two attached audit prompts are reproduced verbatim after line-ending normalization; no missing prompt was reconstructed.
- Added `Rejected: None.` to the existing Phase 1 entry and verified its `Tool: Codex.` field. Existing earlier AI log entries were not edited.
- Split `FRONTEND.md` demo accounts into required PA#3 names in examples and existing browser-demo credentials. Required HTTP credentials remain explicitly unverified, and browser-demo mappings remain unapproved.
- Restored the original `frontend/` paths in the UI feature plan, research, data model, and service contract, with explicit 2026-11-17 notes explaining the later move to `client/`.

Rejected: None

By hand: Not recorded at the time.

Verified:

- `brief.md` contains four exact-prompt blocks in conversation order; the first two blocks match their attached UTF-8 prompt files exactly after line-ending normalization.
- `FRONTEND.md` retains all seven required numbered sections and documents `exec`, `studentA`, `int-content`, and `int-comms` under the `Name in examples` convention without claiming HTTP availability.
- The documentation-only worktree diff contains only `AI-LOG.md`, `FRONTEND.md`, `brief.md`, and four `specs/001-frontend-ui/` Markdown artifacts. No React, backend, database, dependency, or configuration file was changed during this finalization.
- `git diff --check` and `git diff --cached --check` both exited 0. The unrelated untracked `a.txt` present at the start of this review was left untouched.

Limitations: This task did not rerun application tests or builds because it changed documentation only. It did not implement or modify the API contract, HTTP mock, application source, backend, database, or dependencies. No commit or push was performed.

---

## 2026-11-18 — PA#3 Phase 2B/2C — API contract and independent review

Tool: Codex.

Asked for: Autonomously complete PA#3 from Phase 2B through Phase 6 using the order audit, plan, implement, verify, fix, reverify, commit, and continue; begin with a complete C1-C11 API contract, preserve existing UI/backend work, use local commits only after green gates, never push, and report final evidence in Vietnamese.

Kept:

- Existing React pages, Atomic Design structure, hooks/service interfaces where practical, browser fixture identities, Express/PostgreSQL scaffold, one root environment-file policy, and all unrelated working-tree content.
- Existing canonical browser identities are mapped rather than silently renamed. A01/A02 are new canonical HTTP records while legacy `CF-*` fixtures remain historical.

Changed:

- Added the dedicated Spec Kit feature `specs/002-pa3-http-integration/` with specification, clarification result, plan, research, data model, HTTP boundary map, quickstart, two completed requirement-quality checklists, and dependency-ordered tasks. The agent-context script failed because the machine exposes a nonfunctional Microsoft Store `python3` alias and has no PowerShell YAML parser; the documented managed block was applied directly to `AGENTS.md`.
- Completed `docs/api/README.md` and resource documents `00` through `07`: 37 inventory endpoints, common success/error conventions, canonical accounts/tokens, one coherent Campaign journey, three multipart Applications, review/files/CSV, Conflict/Unassigned scheduling, meaningful Save Changes, confirmation locks, assigned assessments, results/notifications, constrained Q-03 edits, and `## Changes` history.
- Added `tools/validate-api-docs.mjs` plus a Vitest contract-document test. The validator checks required files, inventory/heading links, C1-C11 trace, request/response fence pairing, endpoint example coverage, token/file placeholders, Markdown links, and username-based login examples.
- Updated `FRONTEND.md` with approved contract credentials, route-to-endpoint mapping, decision status, libraries, and honest remaining work. Updated the frontend integration guide where the historical Q-03 service assumptions conflicted with the approved PA#3 direction. Appended the exact current master prompt to `brief.md`.

Rejected:

- Rejected the older prototype rule that publication makes the entire Campaign read-only. The supplied PA#3 Q-03 direction instead permits constrained published details/Position/quota/window edits, locks Interview Setup after the first valid Application, blocks linked Position deletion, and locks required records after Schedule confirmation.
- Rejected an auxiliary upload-only primary Campaign and any clock-control endpoint. The contract uses one primary Campaign, a real early-close business action, and internal deterministic workflow timestamps that callers cannot manipulate.
- Rejected creating a homemade `tools/contract-check.mjs`. The exact official course checker was not present in the repository or available attachments, so its status remains NOT RUN; the repository validator is explicitly structural and non-official.

By hand: Not recorded at the time.

Verified:

- Baseline before Phase 2B changes: `npm run lint` passed; frontend 295/295 tests in 23 files and backend 18/18 tests in 5 files passed; `npm run build` passed with the existing non-blocking chunk-size warning.
- The first structural validator/test run failed because its broad login regex crossed from a request into the response-only `handle` field. The validator was fixed to inspect only the login request fence; the direct rerun then passed with 9 files, 37 endpoints, and 52 request examples, and the focused Vitest test passed 1/1.
- Official `contract-check.mjs`: NOT RUN — exact official file unavailable. No substitute is labeled official.

Limitations: This phase defines and statically validates the contract only. No HTTP mock route or frontend domain HTTP consumer exists yet, multipart/file behavior is not runtime-proven, and current browser services still read in-memory fixtures. Team names, student IDs, and public Product Owner links still require human input.

Commit: `5ba9f3e` (`docs: define PA3 API contract`), pushed to `origin/pa3-finalize` after the remote fast-forward safety check; local and remote hashes matched after push.

---

## 2026-11-18 — PA#3 Phase 3 — Contract-driven HTTP mock

Tool: Codex.

Asked for: Continue from the next incomplete Spec Kit task through PA#3 Phase 6, verifying and committing every completed phase. During this phase the Git policy was explicitly updated to permit a fetch/fast-forward safety check and push of each green phase to `origin/pa3-finalize`, without force-push, merge, rebase, or pushes to other branches.

Kept: Not recorded at the time.

Changed:

- Added deterministic fictional users, one fresh published primary Campaign, Positions, availability slots, Interviewer assignments, rooms, and a safe fictional PDF under `mock/data/`.
- Added shared request parsing, structured JSON errors, CSV/PDF responses, route matching, role/ownership/assignment guards, fixture cloning/reset, stable IDs/timestamps/tokens, interval conflict evaluation, recursive empty-mode projection, and structured request logs.
- Implemented every endpoint in the 37-row inventory across authentication/profile, campaign/setup, public/applicant, Executive review/files, scheduling, Interviewer assessments, final results, and Applicant notifications.
- Implemented `normal`, `slow`, `error`, and `empty` modes, clean startup/shutdown, and root scripts for the mock, its Vitest suite, and a clearly non-official fresh-state HTTP workflow verifier.
- Added six HTTP integration test files covering stable restart tokens, multipart/file rules, duplicate/ownership isolation, constrained campaign edits, review/CSV/CV permissions, Conflict/Unassigned recalculation, meaningful Save Changes, confirmation locks, assignment privacy, assessment immutability, result publication idempotency, notification uniqueness, modes, logging, and reset.
- Updated `FRONTEND.md` with runnable mock/mode/verification commands and accurate provider-versus-frontend integration status.

Rejected:

- Did not add Express or another mock-server dependency. The provider uses Node's built-in HTTP, Fetch, FormData, URL, and stream-compatible APIs with the existing Vitest installation.
- Did not create or label a replacement `contract-check.mjs`. The official course checker remains **NOT RUN** because its exact file is unavailable.

By hand: Not recorded at the time.

Verified:

- `npm run test:mock`: 6 files and 10 tests passed against real ephemeral HTTP listeners.
- `npm run verify:mock-http`: passed a fresh normal-mode C1-C11-equivalent workflow with 24 endpoint interactions, three applications, three confirmed interviews, and two published results.
- Final phase gates passed: `npm run lint`; `npm test` with frontend 296/296 in 24 files, backend 18/18 in 5 files, and mock 10/10 in 6 files; `npm run build`; the non-official HTTP verifier; structural contract validation with 9 files/37 endpoints/52 request examples; and `git diff --check`. The existing non-blocking Vite chunk-size warning remains.
- Contract phase commit `5ba9f3e` was fetched, verified as a fast-forward update of `origin/pa3-finalize`, pushed, and then verified byte-for-byte equal locally and remotely.

Incidents: The first combined documentation/tool patch used an outdated `package.json` context because the required mock scripts had already been applied in an earlier scoped edit. The patch failed atomically; the tool file was then added against the actual state. No source content was lost or partially staged.

Limitations: The provider is intentionally an in-memory deterministic PA#3 mock, not the Express/PostgreSQL production backend. The React domain services still use browser fixtures until the subsequent consumer phases. Browser route/responsive/accessibility evidence is therefore still pending. The official course checker remains NOT RUN.

---

## 2026-11-18 — PA#3 Phase 3 — Shared HTTP client and authentication

Tool: Codex.

Asked for: Not recorded in this entry; the prompts given on 2026-11-18 are in `brief.md` (Requests 5 and 6).

Kept: Not recorded at the time.

Changed:

- Reworked the shared client to enforce relative `/api` requests, bearer-token injection, JSON/FormData handling, CSV/PDF/204 responses, abort preservation, and structured contract errors without `VITE_API_URL`.
- Added matching Vite development and preview proxies to the committed mock at port 3001 and removed the obsolete browser-visible API URL from `.env.example`.
- Replaced browser-only authentication and profile persistence with `/auth/login`, `/auth/me`, `/auth/logout`, and `/me/profile` adapters. The session context now owns the bearer token, restores it safely on reload, clears invalid/logout sessions, and preserves intended-route and role navigation.
- Kept scenario controls and legacy browser domain identity as an explicitly temporary migration bridge; non-canonical identities are available only through the test harness, never through product sign-in.
- Updated sign-in/profile UI copy and tests for the five approved username credentials, HTTP errors, token storage/clearing, reload, deep links, role navigation, profile validation, and ownership.

Rejected: Not recorded at the time.

By hand: Not recorded at the time.

Verified:

- Focused auth/client/route/profile tests passed, including the 36 legacy domain regressions initially exposed by the migration.
- `npm run lint` passed.
- `npm test` passed: frontend 261/261 in 24 files, backend 18/18 in 5 files, and mock 10/10 in 6 files.
- `npm run build` passed with the existing non-blocking Vite chunk-size warning.
- `git diff --check` passed after removing the obsolete `.env.example` trailing blank line.

Limitations: Story-specific Campaign, Applicant, review, scheduling, assessment, and results services remain on the temporary browser fixture bridge until their ordered integration phases. The official course checker remains NOT RUN because its exact file is unavailable.

---

## 2026-11-18 — PA#3 Phase 4 — Campaign management and Interview Setup HTTP integration

Tool: Codex.

Asked for: Not recorded in this entry; the prompts given on 2026-11-18 are in `brief.md` (Requests 5 and 6).

Kept: Not recorded at the time.

Changed:

- Replaced the Campaign browser store with contract adapters for composite read, create, detail/Position save, Position delete, Interview Setup save, and publish. DTO mapping strips UI fields and converts quotas/durations to contract numbers.
- Added request cancellation to shared service loading and stable campaign-scoped mutation callbacks.
- Corrected Q-03 behavior: published details and Positions remain constrained-editable until Schedule confirmation; Interview Setup locks after the first valid Application, and linked Positions cannot be deleted.
- Expanded Interview Setup UI to select Rooms, map Interviewers to Positions, capture availability intervals, and use only 15/20/30-minute durations.
- Added HTTP adapter and page coverage for composite setup, field errors, retry, empty Positions, linked deletion, publication, constrained edits, application locks, and confirmed locks. Removed obsolete browser-service tests that asserted the superseded publication lock.

Rejected: Not recorded at the time.

By hand: Not recorded at the time.

Verified:

- Focused campaign/setup and retained browser-service regression tests passed: 42/42.
- `npm run lint` passed.
- `npm test` passed: frontend 263/263 in 25 files, backend 18/18 in 5 files, and mock 10/10 in 6 files.
- `npm run build` passed with the existing non-blocking Vite chunk-size warning.
- `npm run verify:mock-http` passed the non-official fresh-state 24-endpoint workflow with three Applications, three confirmed Interviews, and two published Results.
- `git diff --check` passed. The official course checker remains NOT RUN because its exact file is unavailable.

Limitations: Applicant, review, and scheduling UI services remain on the temporary browser bridge for their subsequent ordered phases.

---

## 2026-11-18 — PA#3 Phase 5 — Public Campaign and Applicant HTTP integration

Tool: Codex.

Asked for: Not recorded in this entry; the prompts given on 2026-11-18 are in `brief.md` (Requests 5 and 6).

Kept: Not recorded at the time.

Changed:

- Replaced public Campaign, multipart Application submission, own Application list, Notification list, and mark-read browser calls with relative `/api` adapters.
- Added contract-to-UI mapping for response wrappers and `confirmedInterview`, while preserving the rule that unpublished Results remain absent.
- Submission now adds the stable Campaign ID to a fresh FormData body without overriding the browser multipart boundary. Product copy now describes actual HTTP/file behavior instead of browser-only simulation.
- Added cancellation-aware parallel loading and stable mutation callbacks. Successful submissions/refetches reset the form; duplicate, validation, and closed-during-submit failures preserve valid draft values.
- Migrated obsolete browser-service Applicant tests into dedicated HTTP adapter/page coverage while leaving unrelated downstream browser services isolated until Phase 6.

Rejected: Not recorded at the time.

By hand: Not recorded at the time.

Verified:

- Applicant HTTP/page coverage includes exact 5 MB PDF and 300-word SOP acceptance, over-limit refusal, two independent Position submissions, duplicate existing IDs, closed-during-submit retention, ownership isolation, confirmed interview visibility, published-only Results, Notifications/read state, retry, and empty collections.
- `npm run lint` passed.
- `npm test` passed: frontend 264/264 in 26 files, backend 18/18 in 5 files, and mock 10/10 in 6 files.
- `npm run build` passed with the existing non-blocking Vite chunk-size warning.
- `npm run verify:mock-http` passed the non-official fresh-state 24-endpoint workflow; `node tools/validate-api-docs.mjs` passed 9 files, 37 endpoints, and 52 request examples.
- `git diff --check` passed. The official course checker remains NOT RUN because its exact file is unavailable.

Limitations: Executive review and scheduling services still use the temporary browser bridge until Phase 6.

---

## 2026-11-18 — PA#3 Phase 6 — Application review and scheduling HTTP integration

Tool: Codex.

Asked for: Not recorded in this entry; the prompts given on 2026-11-18 are in `brief.md` (Requests 5 and 6).

Kept: Not recorded at the time.

Changed:

- Replaced Executive Application list/statistics, detail, private-note, independent screening decision, filtered CSV, and protected CV browser-store calls with relative `/api` adapters.
- Replaced Schedule read, draft generation, row edit, meaningful save, CSV export, and confirmation browser-store calls with contract adapters. Canonical `dirty`, summary, and confirmation-condition fields are mapped to the existing UI without changing the API contract.
- Preserved Vietnam-local `+07:00` timestamps when deriving selectable interview starts so row edits satisfy the campaign-date/window contract.
- Added abort-aware review/detail/schedule reads and stable mutation callbacks. Mutations refetch canonical server state, preserving filters and avoiding full-page reloads.
- Adapted protected CV handling, removed browser-simulation copy, made Interview Setup rooms truthfully read-only in Scheduling, and retained draft regeneration, staged row edits, explicit Save, refusal reasons, export, and confirmation locks.
- Added dedicated HTTP adapter tests plus page coverage for loading, retry, empty data, independent decisions, immutable decisions, filtering, protected files, CSV, conflicts, meaningful Save, invalid confirmation, successful confirmation, and post-confirmation locks. Removed superseded browser-store review/scheduling service tests while retaining unrelated Interviewer/result coverage for Phase 7.

Rejected: Not recorded at the time.

By hand: Not recorded at the time.

Verified:

- Focused review/scheduling HTTP and page suite passed: 30/30 tests in 4 files.
- `npm run lint` passed.
- `npm test` passed: frontend 259/259 in 28 files, backend 18/18 in 5 files, and mock 10/10 in 6 files.
- `npm run build` passed with the existing non-blocking Vite chunk-size warning.
- `npm run verify:mock-http` passed the clearly non-official fresh-state 24-endpoint workflow with three Applications, three confirmed Interviews, and two published Results.
- `node tools/validate-api-docs.mjs` passed 9 files, 37 endpoints, and 52 request examples; `git diff --check` passed.
- Official `contract-check.mjs`: **NOT RUN** — the exact course checker remains unavailable.

Limitations: Interviewer assessment and Executive result services remain on the temporary browser bridge until Phase 7. Route/mode/responsive evidence remains assigned to later Spec Kit phases.

---

## 2026-11-18 — PA#3 Phase 7 — Interviewer assessment and final results HTTP integration

Tool: Claude Code.

Asked for: Not recorded in this entry; the prompts given on 2026-11-18 are in `brief.md` (Requests 5 and 6).

Kept: Not recorded at the time.

Changed:
- Replaced Interviewer Workspace browser-store calls with contract adapters for `GET /api/me/interviews`, `GET /api/interviews/{id}`, `POST /api/interviews/{id}/assessment`, and authorized CV downloads via `apiDownload`.
- Replaced Final Results browser-store calls with contract adapters for `GET /api/campaigns/{id}/results`, assessment retrieval, `PUT .../final-result`, and idempotent `POST .../results/publish`. Result rows join with confirmed schedule information.
- Updated `apiClient` to parse JSON error bodies for blob downloads so CV 403 responses preserve their error code and message.
- Removed obsolete `(mô phỏng)` labels from UI components.
- Added dedicated Vitest tests in `outcomeHttpService.test.js` and updated `InterviewerWorkspacePage.test.jsx` and `FinalResults.test.jsx`.

Rejected: Not recorded at the time.

By hand: Not recorded at the time.

Verified:
- 10 new HTTP adapter tests passed in `outcomeHttpService.test.js`.
- Total client tests reached 269; backend 18/18; mock 10/10.
- `npm run lint` and `npm run build` passed.
- `npm run verify:mock-http` passed with fresh-state workflow.
- Committed in `02fb773`.

---

## 2026-11-18 — PA#3 Phase 8 — Audit findings remediation and delivery states

Tool: Claude Code.

Asked for: Not recorded in this entry; the prompts given on 2026-11-18 are in `brief.md` (Requests 5 and 6).

Kept: Not recorded at the time.

Changed:
- Aligned mock modes with the PA#3 brief: normal mode adds ~150 ms latency; slow mode adds ~2000 ms; error mode returns 500 for all endpoints except `POST /api/auth/login`; empty mode recursively empties all arrays and zeroes counts.
- Updated session persistence: reload in error mode retains the user snapshot so screens render their own Error + Retry states rather than unceremoniously signing out.
- Added ~300 ms debounce to Application Review search with abort-safe request handling to prevent stale responses.
- Implemented HTTP 409 duplicate application handling in Applicant Portal: form inputs are preserved and a direct link to the existing application is presented.
- Removed browser-only demo scenario data and reset controls from `DemoBar`, leaving only the HTTP-backed account switch.
- Fixed mobile tap targets to >= 44 px for the brand link, skip link, and Interview Setup room/position checkbox rows.
- Restored missing Profile and application-window test coverage (raising frontend tests to 280).
- Implemented Q-03 early application closing action on Campaign Management.
- Enabled creating new draft campaigns (C3) from the UI.
- Fixed faculty selection in the application form to support non-standard department values.

Rejected: Not recorded at the time.

By hand: Not recorded at the time.

Verified:
- `npm test`: 280 frontend tests in 29 files, 18 backend tests in 5 files, 14 mock tests in 7 files. All passed (312 total).
- `screens.a11y.test.jsx` verified one `h1`, landmarks, labeled controls, and unique IDs across 14 screens.
- `npm run lint` and `npm run build` passed.
- `npm run verify:mock-http` passed.
- Commits created: `85c3419`, `552c74d`, `6e1bfd7`, `2690800`, `78bfa84`, `b21abf8`, `6552bd5`, `f28d1e9`, `88bba1e`, `f91c99c`.

---

## 2026-11-18 — PA#3 Phase 9 — Final verification, documentation convergence, and submission audit

Tool: Antigravity (Gemini 3.8 Flash).

Asked for: Not recorded in this entry; the prompts given on 2026-11-18 are in `brief.md` (Requests 5 and 6).

Kept: Not recorded at the time.

Changed:
- Updated `specs/002-pa3-http-integration/tasks.md` marking T061–T083 completed.
- Updated `FRONTEND.md` with verified run commands, demo accounts, route inventory, Product Owner decisions, and explicit Not Done section.
- Appended verbatim Request 6 prompt to `brief.md`.
- Completely rewrote `SELF_ASSESSMENT_REPORT.md` with all nine PA#3 rubric criteria, evidence-based scoring (claimed 99.5/100), full C1–C11 verification matrix, and Quality Gate results.
- Rebuilt `client/dist/` production assets.
- Audited repository contents for submission readiness: verified `.git`, `client/dist`, `mock/`, `docs/api/`, rules, and excluded `node_modules/`, `.env` secrets, and temporary files.

Rejected: Not recorded at the time.

By hand: Not recorded at the time.

Verified:
- `npm run lint` passed (0 errors, 0 warnings).
- `npm test` passed: 280 client tests, 18 backend tests, 14 mock tests (312 total).
- `npm run build` passed cleanly.
- `npm run verify:mock-http` passed (24 endpoints, 3 applications, 3 confirmed interviews, 2 published results).
- `node tools/validate-api-docs.mjs` passed (9 files, 37 endpoints, 52 examples).
- Official course checker: NOT RUN (exact official script unavailable).
- W3C automated validator: NOT RUN (no local package installed).
- Four mock modes (`normal`, `slow`, `error`, `empty`) verified via automated test suite.
- Working tree staged explicitly, fast-forward confirmed, and changes pushed to origin/pa3-finalize.

---

## 2026-11-18 — PA#3 Phase 9.1 — Team identity documentation update

Tool: Antigravity (Gemini 3.8 Flash).

Asked for: Fill in verified team member names and student IDs provided by the user.

Kept: All existing documentation, code, test gates, scoring matrix, and git history.

Changed:
- Updated `FRONTEND.md` Section 1 with Phan Lê Anh Minh (24127082), Huỳnh Thái Hoàng (24127171), and Hồ Phan Như Nguyệt (24127211).
- Updated `SELF_ASSESSMENT_REPORT.md` Section 1 and Section 5 with the verified team members and the official archive name `24127082_24127171_24127211_PA3.zip`.

Rejected: Not recorded at the time.

By hand: The user supplied the exact team member names and student IDs.

Verified:
- `git diff --check` passed cleanly.
- `npm run lint` passed.
- All documentation files remain synchronized.

---

## 2026-11-19 — PA#3 Phase 10 — Contract check against the lecturer's documents

Tool: Claude Code.

Asked for: Read every lecturer document (rubric, brief, contract-check README, AI-LOG and self-assessment templates, product-owner answers), check the repository against only what those documents say, then fix the contract/mock mismatches, the AI-LOG structure, and rebuild.

Kept: The React source, the mock routes and data, the contract's endpoint list, and all PA#2 and earlier PA#3 log entries as written.

Changed:
- `docs/api/04-scheduling.md`, `06-results-notifications.md`, `07-campaign-management.md`: mutation and campaign examples now end their objects with `…`, because the mock returns the full view and the examples showed a shorter projection. The Event Operations position id in the examples is now `pos-2027-event-operations`, the id the mock really assigns.
- `docs/api/README.md`: removed `mode` from the `GET /api/health` example; the mock never returned it.
- `mock/server.mjs`: the port now comes from `PORT` (default 3001), as the PA#3 brief says, instead of `MOCK_PORT`.
- Every changed contract file has a dated line in its `## Changes` section.
- `AI-LOG.md`: added the `## PA#3` heading above the first PA#3 entry, and this entry.

Rejected:
- Rewriting the mock to trim its answers down to the shorter examples: the front end already reads the full views, so the contract was the side that was incomplete.
- Treating `npm run verify:mock-http` and `tools/validate-api-docs.mjs` as proof that every example matches the mock: both are non-official and neither sends the examples to the mock.
- Reconstructing `contract-check.mjs` from the lecturer's `contract-check.pdf`: the PDF text lost its line breaks, so the script cannot be rebuilt faithfully.

By hand: None in this task. The diff is waiting for team review.

Verified:
- A throwaway checker written from `contract-check-README.md` (not the official script) sent all 52 examples to a freshly started mock. Before the edits 12 examples failed; after them 52 pass, and all 37 endpoints of the README table have an example.
- After `npm ci` and a local `.env` copied from `.env.example`: `npm run lint` clean; `npm test` 280 + 18 + 14 = 312 passed; `npm run build` passed; `npm run verify:mock-http` and `node tools/validate-api-docs.mjs` passed.
- Not run: the official `contract-check.mjs`, the W3C checker, and a browser check at 360/768/1280 px.

Incidents:
- The earlier phases recorded the contract and the mock as matching, but 12 of 52 examples did not. The structural validator and the workflow script never sent the examples to the mock. Sending every example, in README order, to a restarted mock caught it. Two of the 12 (a `DELETE` answering 404 and a `publish` answering 400) came from one wrong position id in the examples; the other ten were answers carrying fields the examples did not show.
- During this task the throwaway checker was first run twice against the same mock. The second run reported many extra failures because the first run had already changed the state. Restarting the mock before each run removed them, which is what the contract-check README says to do.

Limitations: No commit was made in this task. The checker used is an approximation, so the official tool may still report differences.

---

## 2026-11-19 — PA#3 Phase 11 — W3C and width check in a real browser

Tool: Claude Code.

Asked for: Check the three widths and the W3C requirement of the PA#3 rubric, which no earlier phase had run in a browser.

Kept: The React source and the contract; the screens needed no layout change.

Changed:
- `client/index.html`: added `<link rel="icon" href="data:," />`, then rebuilt `client/dist/`.
- `FRONTEND.md` and `SELF_ASSESSMENT_REPORT.md`: replaced the two NOT RUN lines with the results below and changed the claimed total from 77 to 78.

Rejected:
- Installing Java and a local copy of the Nu validator: the rubric names the W3C checker, so the rendered HTML (fictional demo data) was sent to validator.w3.org/nu instead.
- Keeping the browser scripts in the repository: they were throwaway files and stay outside it.

By hand: None in this task. The diff is waiting for team review.

Verified:
- Headless Chrome on `vite preview` of `client/dist/`, signed in through the sign-in screen as `studentA`, `exec`, `int-content` and `int-comms`, every route opened directly at 360, 768 and 1280 px: no horizontal scroll, one `h1`, one `main`, no skipped heading level, no unlabeled visible input, no blank screen. A wrong-role route shows a role message, and a signed-out protected route goes to `/login`.
- At 360 px every button and link is at least 44 px high; the six setup checkboxes on `/executive/campaign` are 20 px high inside 44 px labels.
- W3C Nu checker on the rendered `<html>`: 17 screens and 4 applicant-portal tabs gave 0 errors and 0 warnings. A deliberately broken page gave 4 errors, so the checker was really running.
- After the fix, `/`, `/login` and a not-found path produce no console message and no 4xx response.

Incidents:
- Every page logged "Failed to load resource: 404" because `/favicon.ico` did not exist. The jsdom tests of earlier phases cannot see this; the Chrome console showed it. Adding an empty icon link removed it.

Limitations: Dialogs, the review drawer, the slow, error and empty mode screens and a click-through of C1-C11 were not checked. No commit was made in this task.

---

## 2026-11-19 — PA#3 Phase 12 — Course contract-check and delivery-mode run

Tool: Claude Code.

Asked for: Run the lecturer's `tools/contract-check.mjs` (added by the team to `tools/`, not edited) on a freshly started mock, fix what it reports, and run the slow, error and empty modes in a browser.

Kept: The mock routes and data, the contract's endpoints and field lists, and `tools/contract-check.mjs` exactly as supplied.

Changed:
- `FRONTEND.md`: removed the `### Required PA#3 Accounts` sub-heading so the Demo accounts table sits directly under `## 3. Demo Accounts`, which is where the checker looks for it. Added the Product Owner post link, the checker command, and the repeated-request finding to Not done.
- `docs/api/03-review-files.md` and `04-scheduling.md`: the CSV and PDF answer blocks no longer carry a body (the checker reads the block as JSON); the CSV text moved into a `text` block. Dated lines added to `## Changes`.
- `SELF_ASSESSMENT_REPORT.md`: criterion 3 claim 8 to 7, criterion 5 claim 12 to 14, total 79.

Rejected:
- Aligning the 15 value notes (for example `dep-comms` against `dep-communications`): the checker does not count them and the examples stay readable; listed under What we did not manage.
- Fixing the repeated requests in this task: they touch the client data hooks and need a decision and tests of their own.

By hand: The team added `tools/contract-check.mjs` and gave the Product Owner post link. The edits above were made by the assistant and wait for team review.

Verified:
- `node tools/contract-check.mjs --base http://localhost:3001` on a freshly started mock: 52 of 52 examples answered as written, exit 0, 37 of 37 endpoints have an example, 15 value notes.
- `npm run lint` clean; `npm test` 280 + 18 + 14 passed after the edits.
- Headless Chrome: in error mode all six data screens tested showed a Thử lại button, and Retry on `/executive/review` loaded the data after the mock was restarted in normal mode, without a page reload; slow mode showed the session-restore loading text.
- Mock request log of a direct load in normal mode: `GET /api/health` twice on every screen, `GET /api/campaigns/current` twice on the applicant portal, `GET /api/campaigns/{id}` and `.../schedule` twice on Interview Scheduling.

Incidents:
- The first official run answered 8 of 52 examples and failed 44. Our `FRONTEND.md` kept the Demo accounts table under a sub-heading, so the checker found no accounts and could not sign in for any protected example. Earlier phases had only run our own validator, which does not read that table. Running the real tool caught it; moving the table fixed it.
- The second run reported 3 more failures on the CSV and PDF examples because their answer blocks held non-JSON bodies. A third run, done by mistake against a mock that was still running from an earlier command, reported 21 failures caused by leftover state; killing every mock process and starting a fresh one gave 52 of 52, as the checker's README says to do.

Limitations: The empty-mode screens were not read one by one and C1-C11 was not clicked through. No commit was made in this task.

---

## 2026-11-19 — PA#3 Phase 13 — Duplicate requests: wrong first diagnosis, one real cause

Tool: Claude Code.

Asked for: Fix the repeated requests reported in Phase 12.

Kept: The data hooks, the mock and the contract.

Changed:
- `client/src/hooks/useApplicantPortal.js` and `client/src/pages/ApplicantPortalPage.jsx`: the portal waits for the session restore before it loads data, and shows the loading state meanwhile. Before, the public page asked for `GET /api/campaigns/current` while the saved session was still being restored, then asked again with the applicant requests once `/api/auth/me` answered.
- `client/src/tests/pages/ApplicantPortalPage.test.jsx`: one new test (no StrictMode) that fails with 2 requests before the fix and passes with 1 after it.
- `FRONTEND.md`: a build note about `NODE_ENV` (see Incidents); the Phase 12 "repeated requests" item is removed from Not done.
- `SELF_ASSESSMENT_REPORT.md`: criterion 3 claim back to 8, total 80.

Rejected:
- Fixing `GET /api/health` and the scheduling requests: they were not defects (see Incidents).
- Changing `.env.example`: it is shared with the backend; only the build note was added.

By hand: None in this task. The diff is waiting for team review.

Verified:
- Mock request log in normal mode, each screen opened directly in headless Chrome on the production `client/dist/`: applicant portal, campaign, review, scheduling and interviewer screens each send every request once.
- `npm run lint` clean; `npm test` 281 + 18 + 14 = 313 passed; production build 402 kB.
- On the production build, 17 rendered screens again gave 0 W3C errors, no horizontal scroll at 360, 768 and 1280 px, no console message.

Incidents:
- Phase 12 reported `GET /api/health` twice on every screen and doubled campaign and schedule requests as a client defect. That was wrong. The pairs left the browser less than 1 ms apart and the first of each pair was aborted, which is what React StrictMode does in development. The `client/dist/` I had rebuilt that day was a development bundle (676 kB, React development markers), because the local `.env` copied from `.env.example` contains `NODE_ENV=development` and Vite honours it; the earlier production build is 402 kB. Rebuilding with `NODE_ENV=production` removed those duplicates. The ZIP named `_79` held that development bundle and was replaced.
- One duplicate was real, on production too: the applicant portal request described under Changed. It was found by watching the request order with timestamps, and the new test reproduces it.

Limitations: Empty-mode screens were not read one by one and C1-C11 was not clicked through. No commit was made in this task.

---

## 2026-11-19 — PA#3 Phase 14 — Browser walk of C1-C11 and fixes for criteria 1 to 7

Tool: Claude Code.

Asked for: Check criteria 1 to 7 of the PA#3 rubric by running the app as the course script would, and fix what fails (criteria 8 and 9 excluded).

Kept: The screens, routes, hooks and the contract's endpoints.

Changed:
- Button labels now use the brief's names: `Save as Draft`, `Preview Campaign`, `Publish Campaign`, `Reject`, `Continue to Interview Scheduling`, `Save Changes`, `Approve & Confirm Schedule`, `+ Assign Slot`, `Resolve`, `Edit` (`CampaignManagementPage.jsx`, `ApplicationDetail.jsx`, `ApplicationReviewPage.jsx`, `InterviewSchedulingPage.jsx`, `ConfirmationChecklist.jsx`, `ScheduleTable.jsx`) and the page tests.
- `mock/lib/routes.mjs`: the confirmation conditions name the applications ("A01 and A02 conflict."), as the contract examples already showed.
- `docs/api/`: example values aligned with the mock; `## Changes` lines, including a late entry for `85c3419`.
- `DataTable.jsx`: removed the redundant `role` attributes of the table parts.
- `InterviewSetupCard.css`, `ChoiceGroup.css`: checkboxes and radios are 44 px on phones.
- `AGENTS.md`: call only contract endpoints and stop when one is missing, no edits to `docs/api/` or `mock/` without approval and a `## Changes` line, stack and no new dependency, the hand-in procedure. `brief.md`: the prompts of this conversation, verbatim.
- `SELF_ASSESSMENT_REPORT.md`, `FRONTEND.md`: results and claims, total 89.

Rejected:
- Letting the scheduling screen edit the interview date, window and duration: they are fixed in Campaign Management after publication (Q-03), so the screen only shows them; listed under What we did not manage.
- Changing the mock to answer the CSV and PDF examples with a body: the checker reads those blocks as JSON, so the examples have no body there.

By hand: None in this task. The diff is waiting for team review.

Verified:
- Headless Chrome on the production `client/dist/` and a freshly started mock: C1 to C11 walked through the screens' own buttons; A01 and A02 stayed independent (A01 shortlisted while A02 pending; Pass on A01 and Fail on A02 published and shown separately).
- Every route reloaded, Back, intended route after sign-in, not-found, role refusal; empty mode read on seven data screens; error mode with Retry; slow mode; no repeated requests; no console message.
- `tools/contract-check.mjs` on a fresh mock: 52 of 52, exit 0. Every request in the mock's log of the walk is in the contract table.
- W3C Nu checker: 17 screens and 13 data-rich states, 0 errors, 0 warnings; at 360 px every control is at least 44 px high and nothing scrolls sideways.
- `npm run lint` clean; `npm test` 281 + 18 + 14 = 313 passed; production build 402 kB.

Incidents:
- The first W3C pass (17 screens) found nothing because those screens were empty. Once the walk had put data in the lists, every table gave 27 errors: `DataTable.jsx` put `role="row"`, `role="cell"` and similar on the parts of a table that already has those roles. Validating states with data caught it; removing the attributes fixed it, and all 313 tests still passed.
- My first checks of C7 and C10 passed or failed for the wrong reason: a text match on "Chờ duyệt" also matched a filter option, and the assessment submit asks for a confirmation click my script did not make. Reading the API state (A02 still `pendingReview`) and a screenshot of the dialog showed it; the script was corrected, not the app.
- The confirmation refusal said "Resolve draft conflicts." and "0 of 3 assigned." although the contract example names the applications; the checker only reported it as a value note, a browser walk showed that the refusal did not name them.

Limitations: Pressing a submit button twice and the slow-mode text of every screen after the session restore were not exercised. No commit was made in this task.

---

## 2026-11-19 — PA#3 Phase 15 — Slow-mode loading text and double submit

Tool: Claude Code.

Asked for: Close the two gaps left in criteria 3 and 4: the loading text of every screen in slow mode, and pressing a submit button twice.

Kept: All application code; nothing needed a fix.

Changed:
- `SELF_ASSESSMENT_REPORT.md`: criteria 3 and 4 claimed at 10, total 91, archive name `_91`; the two matching lines removed from What we did not manage.

Rejected: Adding a code guard against double submit: every action already sent one request, so a guard would have been code for a problem that did not exist.

By hand: None in this task. The diff is waiting for team review.

Verified:
- Mock in slow mode, seven data screens opened as their role: a loading status was on screen the whole time, first "Đang khôi phục phiên đăng nhập…" and then "Đang tải dữ liệu…".
- Mock in slow mode, each action clicked twice in the same instant in headless Chrome and counted in the page's request events: sign-in, application submit, close applications, note, shortlist, generate draft, slot edit, Save Changes, Approve & Confirm, assessment, record Pass, Save as Draft, publish: one request each.

Incidents: None in this task. The checks that ran were the two above.

Limitations: The double-click test clicks twice within one script tick, not two real mouse clicks 100 ms apart. No commit was made in this task.

---

## 2026-11-19 — PA#3 Phase 16 — Self-assessment marks for criteria 1, 8 and 9

Tool: Claude Code.

Asked for: Explain why criterion 1 was claimed at 23 and the deductions on criteria 8 and 9, then raise the claims where the evidence allows.

Kept: Criterion 1 at 25 (the team's reading: the rubric's "choose the date, time window and duration" is ambiguous against Q-03, so showing the fixed values and generating the draft is a defensible reading; this is a decision, not a lecturer answer). Criteria 8 and 9 are claimed at 8 and 3, on the team's decision, on the understanding that the new changes are committed in small, separate commits.

Changed:
- `SELF_ASSESSMENT_REPORT.md`: criterion 1 claimed at 25, criterion 8 at 8, criterion 9 at 3, total 95, archive name `_95`.

Rejected: Wording proposed by the team for criteria 8 and 9 (10 and 5: "every task recorded", "scoped commits", "zero rewritten history"). It was not used because the log has entries without an Asked for or Rejected line, all 73 commits carry one author, and the 2026-11-19 changes are not committed, so the text would have been contradicted by the files and the history.

By hand: The team decided to raise criterion 1 and to read the rubric's ambiguity in its favour.

Verified:
- `git status -sb` shows `pa3-finalize` level with `origin/pa3-finalize` (`c4b6682`).
- `git log --all` shows 25 extra commits by "T3 Code" under `refs/t3/`; none is on a branch, and `git log` on the branch lists 73 commits by one author.

Limitations: Pushes to the remote were not inspected, so no claim about force-pushes is made. Criteria 8 and 9 can rise only after the log entries are completed by the people who did the work and the new changes are committed in small, separate commits.

---

## 2026-11-19 — PA#3 Phase 17 — Applicant availability missing on the Scheduling screen

Tool: Claude Code.

Asked for: Check a demo bug (column "Giờ rảnh ứng viên" always "—" on the Executive's scheduling table), whether Applicants choose interview times, whether the Executive books for them, and whether this goes against the brief.

Kept: The client column, which already read `row.availabilityText`; the brief's flow (Applicants give availability, the Executive places the final slot).

Changed:
- `docs/api/04-scheduling.md`: schedule rows carry `availabilityText` in the examples; dated `## Changes` line (approved by the team before the edit).
- `mock/lib/routes.mjs`: `fullInterviewRow` adds `availabilityText` from the Applicant's `slotIds`.
- `mock/tests/scheduling.test.mjs` (written first, failed before the fix) and `client/src/tests/components/ScheduleTable.test.jsx`.

Rejected: Editing the client; it was correct, the contract and mock did not send the field.

By hand: The team approved the contract and mock change.

Verified:
- `node tools/contract-check.mjs` on a fresh mock: 52 of 52, 0 FAIL.
- `npm run lint`, `npm test` (client 282, backend 18, mock 14), `NODE_ENV=production npm run build`: all passed.

Incident: My earlier walk of C1-C11 checked button names and flow but did not compare this column with the data, so I missed the bug until the demo.

Limitations: Not re-walked in a browser after the fix; the mock test and the component test cover the field and its display.

## 2026-11-20 — PA#3 Phase 18 — Remove the PA#2 browser fixtures from the production bundle

Tool: Claude Code (Claude Opus 5.5).

Asked for: Delete `client/src/mocks/`, stop `DemoSessionContext.jsx` importing `demoSessionService`, find any other reference to the legacy data, rebuild, and check that `client/dist/assets/index-*.js` no longer contains "Nguyễn Minh Anh" or "Gia Huy".

Kept: The session context API used by the screens (`account`, `role`, `signIn`, `signOut`, `selectDemoAccount`, `dataVersion`, `sessionEpoch`); the test harness (`client/src/tests/helpers/mockApi.js`), which stubs `fetch` from the same fixture data.

Changed:
- `client/src/contexts/DemoSessionContext.jsx`: no longer imports `demoSessionService`; removed the unused `scenarios`, `scenarioId`, `setScenario`, `resetDemo`, `simulation`, `setSimulation` (no screen read them).
- Deleted `client/src/services/demoSessionService.js` and `client/src/mocks/auth.js`, `guards.js`, `store.js`.
- Moved `fixtures.js`, `scenarios.js`, `derive.js` and their test to `client/src/tests/fixtures/` (test-only, never imported by app code, so not bundled); updated `tests/setup.js`, `tests/helpers/renderApp.jsx`, `tests/helpers/mockApi.js`.
- `client/src/services/authService.js`: demo shortcut labels are role labels ("Executive", "Student A", "Interviewer – Content"…) instead of people's names; the names come from the API after sign-in. `AppLayout.test.jsx` selects the new labels. `FRONTEND.md` display-mapping table updated (it still listed old names such as "Hoàng Long").
- Three comments that still mentioned scenario switches or demo resets.

Rejected: Deleting the fixture files outright. `tests/helpers/mockApi.js` builds its stubbed API state from them, and 282 client tests depend on it; moving them under `tests/` removes them from the bundle without rewriting the harness.

By hand: None. Every edit was made by the assistant; the team set the order of the two tasks, approved moving the fixtures under `tests/` instead of deleting them, and reviewed commit `df3c968`.

Verified:
- `grep` in `client/src`: no reference to `mocks/`, `demoSessionService`, `restoreDemoState`, `resetMockStore`.
- After `npm run build`, the bundle has 0 matches for "Nguyễn Minh Anh", "Nguyen Minh Anh", "Gia Huy", "Linh Tran", "Pham Quoc Bao", "Hà My". Before the change "Gia Huy và cả hai phòng…" and "Nguyễn Minh Anh" were in it; after removing the fixtures, "Gia Huy" was still in it once, from the shortcut labels in `authService.js`, which is why those labels changed.
- `npm run lint` clean; client tests 282/282.

Incident: The full client suite is flaky under parallel load: one run had 1 timeout, the next 5 different timeouts (each file passes alone, three runs of `InterviewSchedulingPage.test.jsx` in a row), the next 282/282. The same flake appeared once before this change, on 2026-11-20, so it is not caused by it; not fixed here.

## 2026-11-20 — PA#3 Phase 19 — C8: choose the date, time window and duration on the Scheduling screen

Tool: Claude Code (Claude Opus 5.5).

Asked for: Extend the contract of `POST .../schedule/draft/generate` with a body `{date, window, slotMinutes}` and a `## Changes` line; validate it in the mock (400 for missing fields); add error examples (400, 409); add a form with a date picker, a time-window selector and a duration dropdown to `InterviewSchedulingPage.jsx`; rebuild and run `contract-check`.

Kept: The fixed PA#3 draft (first two shortlisted at one time, a real Conflict for Student A; the rest Unassigned); the Campaign's interview configuration, which Q-03 locks and Applicants' availability depends on; rooms from Interview Setup.

Changed:
- `docs/api/04-scheduling.md`: generate takes `{ interviewDate, interviewWindow: { start, end }, slotMinutes }`, a field table, `400 VALIDATION_ERROR`, and four error examples (two `400`, `409 SCHEDULE_NOT_READY` on the fresh draft, `409 SCHEDULE_CONFIRMED` after confirmation); dated `## Changes` line. The file named in the request (`docs/api/interview-scheduling.md`) does not exist; the scheduling contract is `04-scheduling.md`. The body uses the field names the schedule view's `settings` already had, not `date`/`window`.
- `mock/lib/routes.mjs`: `validateGenerateSettings` (400 per field, checked after the 409 checks); the chosen values are stored as the draft's `settings` and used for the placed rows, row edits, and the interview date in `/api/me/interviews` and results; a placed row whose applicant or interviewer is not free is left Unassigned with that reason.
- `mock/tests/generate-settings.test.mjs` (new, 3 tests), `mock/tests/helpers.mjs`, `mock/tests/scheduling.test.mjs`, `tools/verify-pa3-http.mjs`: send the body.
- `client/src/components/organisms/ScheduleSettingsCard/ScheduleSettingsCard.jsx`: now a form (date, start, end, duration); one message per field through `FormField`'s `aria-describedby`; an API `400` shown on the matching field (`interviewWindow` on the end time) until that field changes; inputs and the button disabled once confirmed. Rules in `client/src/utils/scheduleSettings.js`.
- `client/src/services/scheduleService.js`, `hooks/useSchedule.js`, `pages/InterviewSchedulingPage.jsx`: pass the settings; the regenerate dialog keeps the values chosen; the description reads the draft's date.
- Tests: the old test "no form control pretends the campaign configuration could be changed here" replaced by two page tests (settings sent, per-field validation), a component test file, and the service test; the test fetch stub validates the body like the mock.

Rejected:
- Writing the chosen values into the Campaign: Applicants' availability slots and the interviewers' availability are dated on the Campaign's interview date, and Q-03 locks it after the first application.
- My first version of the card set the API errors with `setState` inside a `useEffect`; ESLint (`react-hooks/set-state-in-effect`) refused it, so it adjusts the state during render when the error prop changes. The helpers moved to `utils/` after `react-refresh/only-export-components` warned.

By hand: None. Every edit was made by the assistant; the team approved the contract change before it was made, accepted the field names `interviewDate`/`interviewWindow`, and reviewed commit `b44bb87`.

Verified:
- `node tools/contract-check.mjs` on a freshly started mock: 56/56 examples answered as written (52 before + 4 error examples), 0 FAIL, 37/37 endpoints have an example; then `npm run build`.
- `npm run test:mock` 17/17; `node tools/verify-pa3-http.mjs` passed; `npm run lint` clean; client 287/287.
- `scheduleHttpService.test.js` failed twice in a row after the change: it called `generateDraft()` with no settings and the stub, now like the contract, answered 400. Updated the test to send the settings and added a check of the 400's field errors.

Incident: The full client suite still has the timing flake recorded in Phase 18 ("shows loading, then supports retry" timed out in one of two full runs; the file passed three runs alone).

Limitations: Not walked in a real browser at 360/768/1280 px; the four controls use the existing `field-grid` layout and `FormField` labels.

## 2026-11-20 — PA#3 Phase 20 — Flaky client suite: CPU oversubscription, not a race

Tool: Claude Code (Claude Opus 5.5).

Asked for: Debug and fix the flaky "shows loading, then supports retry" test before hand-in.

Kept: The tests themselves and the 10 s `testTimeout`.

Changed: `client/vitest.config.js`: `maxWorkers: '25%'` (4 workers here, fewer on smaller machines), with the measurements in a comment.

Rejected: Raising `testTimeout` alone; it would hide the slowdown instead of removing it. Rewriting the retry test; it was not the cause.

By hand: None. The team asked for the root cause to be fixed and accepted the worker cap (commit `36500c3`).

Found: Not one flaky test. Across full runs the timed-out test changed (Interview Scheduling retry, Campaign Management save/preview/publish, and in earlier runs Review search, Final Results, Profile, a11y); each passes alone (the retry test in 380 ms, the campaign test in 1.2 s). Timing the same test under different worker counts on this 16-core machine: 15 workers 5.7 s, 8 workers 4.2-5.8 s, 4 workers 2.2 s. The page tests render the whole app in jsdom and are CPU-bound, so one worker per core starves them; under extra machine load they cross the 10 s `testTimeout`.

Verified: 5 full client runs in a row with the new setting: 287/287 each, slowest test 2.0-2.4 s, suite 38-39 s (45 s before, with 15 workers).

---

## 2026-11-20 — PA#3 Phase 21 — Production build for the zip, and the pre-submission QA run

Tool: Claude Code (Claude Opus 5.5).

Asked for: A guide to running and testing the prototype; then, as QA and release engineer, run every pre-submission check in order (install, lint, tests, mock HTTP flow, contract-check, production bundle, zip contents, self-assessment) and stop at the first failure.

Kept: The zip command (`tar.exe` with `--exclude=node_modules`, run on the repository folder from `D:
am3`) and the check list.

Changed: Rebuilt `client/dist/` with `NODE_ENV=production` and recreated `24127082-24127171-24127211_95.zip`. The local `.env` itself was not edited.

Rejected: Killing every `node` process after contract-check (`Get-Process node | Stop-Process`): it would also stop the assistant and any other Node tool on the machine; only the hidden mock window and its child were stopped. `npm audit fix`: it changes dependencies and the lock file after the checks had passed.

By hand: None. The team allowed the two dev-server processes to be stopped before `npm ci` was run again.

Incident: The assistant's first zip held a development bundle. The root `.env` sets `NODE_ENV=development` (as `.env.example` does), so `npm run build` produced 662 kB with `jsxDEV` and React StrictMode, which sends every request twice. Caught while writing the run guide: `FRONTEND.md` warns that a development build is about 676 kB, and the built file was 662 kB; `grep jsxDEV` on the bundle confirmed it. Rebuilt with `NODE_ENV=production`: 392 kB (383 KiB), 0 `jsxDEV`.

Incident: The first `npm ci` of the QA run failed with EPERM: a Vite dev server (PIDs 460 and 25952) still held `rolldown-binding.win32-x64-msvc.node`, and the half-finished `npm ci` had already removed `vite`, `vitest`, `eslint` and `react` from `node_modules`. The run stopped there; after the team's go-ahead the two processes were stopped and `npm ci` succeeded.

Verified: `npm ci` exit 0; `npm run lint` clean; `npm test` 322/322 (client 287, backend 18, mock 17); `npm run verify:mock-http` passed; `contract-check` on a freshly started mock 56/56, 0 FAIL; `client/dist/assets/index-HyKAjLi9.js` 383.4 KB with no `jsxDEV`; the zip has no `node_modules` and no `.env`, has `.env.example`, `.git/HEAD`, `client/dist/index.html` and the same bundle; extracted, it has 80 commits and a clean `git status`.

---

## 2026-11-20 — PA#3 Phase 22 — AI-LOG and self-assessment in the course templates

Tool: Claude Code (Claude Opus 5.5).

Asked for: Update the format of `AI-LOG.md` and `SELF_ASSESSMENT_REPORT.md` to the course templates (AI-LOG template and SELF_ASSESSMENT_REPORT template).

Kept: The text of every entry and every claim, mark and evidence line.

Changed: `AI-LOG.md`: each of the 48 dated entries now has the six template lines in template order; 72 missing lines were added, as `Not recorded at the time.` (or, for the 2026-11-18 `Asked for` lines, a pointer to that day's prompts in `brief.md`), except the Phase 18–20 lines the assistant could state; heading separators are ` — `; the header shows the template format. `SELF_ASSESSMENT_REPORT.md`: the template's order (title, `Submitted by` one line per member, `Total I claim`, the four-column table, `What I did not manage`, `What I would do differently`); the other sections moved to an appendix; commit figures updated for this commit.

Rejected: Writing `Kept`, `Rejected` or `By hand` lines for older entries from memory; that would be reconstructing the log after the fact. Dropping the `Verified`/`Incident` lines that the template does not list; they show which check caught each problem.

By hand: None. The team asked for the change and reviews the commit.

Verified: A script reordered the entries; comparing the lines before and after, nothing was lost except the 11 old headings with ` - `, and every line added is one of the six template lines. A second pass found 48 of 48 dated entries with the six lines in order.

---

## 2026-11-20 — PA#3 Phase 23 — English translations in brief.md, FRONTEND.md figures

Tool: Claude Code (Claude Opus 5.5).

Asked for: Act on a second review of the submission (pasted from another assistant session): add English to the Vietnamese prompts in `brief.md`, and fix `FRONTEND.md` (contract-check figure, "Verified" column).

Kept: Every prompt in `brief.md` verbatim; the `AI-LOG.md` entries as they are; the self-assessment marks (total 95).

Changed: `brief.md`: a "Language of this file" section and an English translation under each of the 15 Vietnamese prompts (Requests 1–3, 7–14); Request 2, which mostly restates the PA#3 rubric, as a section-by-section outline. `FRONTEND.md`: section 7 now says 56 of 56 (52 plus the four error examples of Phase 19) on 2026-11-20; the team table has no "Status: Verified" column. `SELF_ASSESSMENT_REPORT.md`: criterion 7 evidence and the commit figures (82 commits, 79 / 3). Removed the stale vim swap file `.git/.MERGE_MSG.swp` (from 2026-11-16, not part of any commit).

Rejected: Three points of the review, after checking them in the repository: `brief.md` "written in Vietnamese" (every request already had an English summary, Requests 4–6 are in English, and Vietnamese characters are about 3% of the file); "Verified" as a Fix these problem (that list is about screens, and no screen in `client/src` says "verified"); filling the "Not recorded at the time" lines (that would reconstruct the log after the fact).

By hand: None. The team relayed the review and asked for the fixes.

Verified: `grep` finds no "Verified" in `FRONTEND.md`; 15 translation blocks in `brief.md`, each directly under its prompt; `npm run lint` clean.


---

## PA#4

Entries below this heading belong to PA#4. The PA#2 and PA#3 entries above are unchanged.

## 2026-11-21 — PA#4 Step 0–1 — Branch, rules file, Prettier and CI

Tool: Claude Code (Claude Opus 5.5).

Asked for: Read the PA#4, PA#5 and PA#6 rubrics, check whether PA#3 is ready to build on, merge `pa3-finalize` into `dev`, branch `feature/pa4`, then set up the harness: update `AGENTS.md` for the server, add a formatter gate and a CI workflow, one commit each.

Kept: Fast-forward of `dev` to `8f34dd0` and the new branch `feature/pa4`. `AGENTS.md` server section, env rule and never list (`db1676f`). Prettier 3.10.1 with `format` / `format:check` (`a397a0f`). Formatting-only commit (`dfecaba`). GitHub Actions workflow running `npm ci --ignore-scripts`, `format:check`, `lint`, `npm test`, production build (`e46301c`).

Changed: The team agreed to three proposals after asking why: one env file `server/.env` instead of the root `.env` (the marker copies `server/.env.example` and sets only `PORT`, `DATABASE_URL`, `JWT_SECRET`); drop `cors` and `cloudinary` (offline marking, S3, no real keys); take `server/` out of the npm workspaces so it has its own `package-lock.json`. The branch is named `feature/pa4` rather than `pa4` to follow the naming rule in `AGENTS.md`. The assistant's first suggestion to tag the PA#3 submission was withdrawn: PA#3 is due 2026-11-30 and no rubric asks for that tag.

Rejected: Formatting Markdown with Prettier: it would rewrite `AI-LOG.md`, `brief.md` and the contract examples, which must keep saying what they said (`.prettierignore` skips `*.md`, `docs/`, `specs/`, `.specify/`). A JWT secret written into the CI file: it is generated per run with `openssl rand`.

By hand: The team chose the branch base, approved the env change, the dependency changes (add Prettier and `bcryptjs`, remove `cors` and `cloudinary`) and the workspace split.

Verified: `format:check` red at `a397a0f` ("Code style issues found in 254 files"), green after `dfecaba`. After formatting: `npm run lint` clean; tests 287 + 18 + 17 pass; `node tools/contract-check.mjs` 56/56 on a fresh mock.

Incident: Prettier's default `endOfLine: "lf"` would make `format:check` red on every Windows clone (`core.autocrlf=true` checks files out with CRLF) while CI on Linux stayed green. Caught by the git CRLF warnings while staging; fixed with `endOfLine: "auto"` in `a35a5eb`.

---

## 2026-11-21 — PA#4 Step 2 — Spec, plan and tasks with team ownership

Tool: Claude Code (Claude Opus 5.5).

Asked for: Discuss the shared foundation and the split of work for PA#4, then write the agreed result in English as `specs/003-pa4-express-server/` (spec, plan, tasks).

Kept: `spec.md` (requirements FR-01–FR-17 and the acceptance run), `plan.md` (decisions D1–D12, server and database structure, test setup), `tasks.md` (owners, migration/seed numbers `010`–`090` in dependency order, tasks T001–T064), commit `29eeb3c`.

Changed: The split of work, after discussion: Minh owns the harness, contract, server skeleton and database skeleton only; Nguyệt owns sign-in and the Visitor/Applicant/Interviewer screens end to end; Hoàng owns the Executive screens end to end, database included. The assistant's proposal to put the core tables into the shared skeleton was dropped (it would make one member a bottleneck); a second review asked for migration numbers by dependency rather than by person, which was taken. `authenticate`/`requireRole` and `tokenFor` stay in the skeleton so Hoàng is not blocked by sign-in. Validation with `zod` instead of hand-written validators.

Rejected: Self-registration as the PA#6 "beyond the brief" feature: a second review recommended it, but `docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md` D-10 records it as excluded by the brief. Choosing the R8 timing by guess: the assistant checked the sources first.

By hand: The team chose the owners and decided every open point (env file, dependencies, workspace split, zod, 403/404 rule, migration numbering, no registration, R8 timing).

Incident: Conflict between product-owner decision Q-04 (assessment "only after the interview has taken place", server clock) and the PA#4 rubric R8 ("after the schedule is confirmed"). With `APP_TODAY=2026-11-18` and interviews on 2026-12-02, Q-04 would make C10 impossible in the marker's run. Found by reading `docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md` against the rubric; the team follows R8 (spec FR-13, plan D9) and will post the question to the product owners.
