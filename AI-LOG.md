# AI Usage Log

## How to use this file

Add one entry for each task where AI was used.

Keep each entry short and clear. Record what AI was asked to do, what was kept, what was changed or rejected, and what the team did manually.

Do not include passwords, API keys, private data, or other students' work.

The team must review and understand all AI-assisted work before accepting it.

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

Verified: `npm run lint`, `npm test`, `npm run build`, `npm run verify`, and `git diff --check` passed; no active source file references the old component name.

By hand: A team member confirmed team approval of the constitution title change before it was edited. The team reviews the diff, checks the preview page in a browser, and commits; this entry does not mean the phase has been committed.

---

## 2026-11-14 — Phase 0B — Documentation Integration

Tool: Claude Code

Asked for: Integrate and review the prepared ClubFlow requirements documentation under `docs/` (`docs/requirements/`, `docs/requirements/sources/`, `docs/course/`): check the structure, check for conflicts with `AGENTS.md`, the constitution, `docs/ARCHITECTURE.md`, and `docs/QUALITY-GATE.md`, verify Markdown links, and confirm coverage of BR-01 through BR-14, without rewriting the documentation unless a concrete factual inconsistency was found.

Kept: All prepared documentation as supplied; no wording was changed. Frontend, backend, database, Docker, and dependencies were not touched.

Checked:

- BR-01 to BR-14 in `BUSINESS_RULES.md` match the source Business Description v1.1; each BR has at least one acceptance criterion and one traceability row.
- Sample claims citing the Final Project Brief and meeting notes (Product Owner channel, PA weights, Cloudinary history) match the source files.
- No conflict was found with `AGENTS.md`, the constitution, `docs/ARCHITECTURE.md`, or `docs/QUALITY-GATE.md`. The documents leave schema, endpoints, and libraries to later phases and mark all requirements `Not verified`.
- Markdown links: 31 relative links checked, 1 broken.

Finding (not fixed): `docs/README.md` (the "Documentation Hub") does not exist, but `docs/requirements/README.md` links to it as `../README.md`. Its contents were not invented; the team should add the prepared hub file or remove the link.

Verified: `git diff --check` passed. `npm run verify` passed (lint, frontend 3 tests, backend 18 tests, build) when run from an uppercase `D:` drive path (`D:\nam3\clubflow`). When run from a lowercase `d:` drive path, the frontend Vitest run failed with `Cannot read properties of undefined (reading 'config')`. This is a Windows drive-letter casing issue in the local environment, not a documentation issue.

Rejected: Writing a replacement `docs/README.md` or rewording any prepared document.

By hand: The team reviews the documentation and this entry, resolves the missing hub file, and commits; this entry does not mean the phase has been committed.

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

Found: `reference.js` gives CF-030 and CF-031 an unpublished Pass, while `UI_REFERENCE_NOTES.md` and the Final Results preview show them awaiting assessment; the fixtures will follow the notes (recorded in `research.md`).

Rejected: Editing `reference.js` to satisfy lint, ignoring all JavaScript, installing the router in UI-0, placeholder pages, and running the optional Spec Kit agent-context hook (it would edit agent files outside this phase).

Verified: `npm run lint`, `npm test` (frontend 3, backend 18), `npm run build`, `npm run verify`, and `git diff --check` all exited 0 (run from `D:` uppercase path); 49 relative Markdown links in the new and hub documents resolve.

By hand: The team reviews and approves the spec, plan, and the router dependency before UI-1, and commits; this entry does not mean the phase has been committed.

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

Verified:

- `npm run lint`, `npm test` (frontend 29, backend 18), `npm run build`, and `npm run verify` exited 0 (run from the uppercase `D:` path).
- Browser (headless Microsoft Edge against the Vite dev server): all six paths rendered the expected `<h1>`; `/` showed the real "API unavailable" state because the backend was not running. Headless Edge cannot shrink its window below 492 px, so widths were tested by loading each route in an iframe of exact width (360, 640, 768, 853, 1024, 1280 CSS px) through a same-origin local proxy: no horizontal overflow on any route. 640/853/1024 approximate a 1280 px window at 200/150/125% zoom; real browser zoom was not tested.

By hand: The team reviews the diff, opens the routes in a browser, and commits; this entry does not mean the phase has been committed.

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

Verified: `npm run lint` 0, frontend tests 43 passed, `npm run build` 0, no React `act()` warnings. Headless Edge (same-origin iframe at exact widths): `/`, `/executive/review`, and a not-found path at 360/768/1280 px have one `<h1>` and no horizontal overflow; screenshots at 360 and 1280 checked against the reference header.

By hand: The team reviews the commit.

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

Verified: `npm run lint` 0; `npm run verify` 0 (frontend 92 tests, backend 18); no `act()` warnings.

By hand: The team reviews the commit; backend developers should treat `mocks/derive.js` and `mocks/guards.js` as descriptions of expected responses, not as reusable business logic.

---

## 2026-11-14 — UI-2.1 — Campaign Management UI

Tool: Claude Code

Asked for: Implement `/executive/campaign` from `index.html` and SCREEN_REQUIREMENTS Screen 1 (BR-01, BR-02, BR-04, BR-14) against the mock services.

Changed:

- `pages/CampaignManagementPage.jsx` + `hooks/useCampaign.js`: campaign information, timeline, departments/positions with quotas and requirements, interview preparation, Save Draft, Preview (modal), Publish (confirmation dialog), "Lưu thay đổi" once published, inline errors with an error banner and focus on the first invalid field, published state with a link to Application Review, read-only state after schedule confirmation, BR-04 block when removing a position that has applications.
- New components: molecules `AsyncContent` (loading / error + retry), `Timeline`, `PositionCard`; organisms `ConfirmDialog`, `CampaignPreview`, `CampaignDetailsCard`, `PositionsEditor`, `InterviewSetupCard`. `routes/RoleGate.jsx` shows a restricted state for other demo roles (UI only, not access control).
- Self-review fixes after the browser check: native date inputs showed the browser's US order (11/05/2026 for 5 Nov), so each date field now also shows "Ngày đã chọn: dd/MM/yyyy"; the header showed "Ban tuyển dụng · Ban tuyển dụng" and now shows the club; the demo bar took about 300 px on mobile and is now a collapsed `<details>` summary.

Assumptions: interview date/window/duration are locked once applications exist (pending Q-03); a published campaign stays editable until schedule confirmation, as the reference states.

Verified: lint 0; frontend tests 99 passed. Headless Edge as the demo Executive (`draft` scenario): one `<h1>`, no horizontal overflow at 360/640/768/853/1024/1280/1600 px; screenshots at 360 and 1280 compared with `index-360.png`/`index-1280.png`.

By hand: The team reviews the commit.

---

## 2026-11-15 — UI-2.2 — Application Review: CV Screening tab

Tool: Claude Code

Asked for: Implement `/executive/review?tab=screening` from `review.html` and SCREEN_REQUIREMENTS Screen 2 (BR-06…BR-09, BR-14). Work resumed after a pause; the uncommitted UI-2.2 changes were re-verified before committing.

Changed:

- `pages/ApplicationReviewPage.jsx` with URL-synced tabs (`?tab=screening|results`, no separate routes). CV Screening: campaign-wide statistics with applications and distinct applicants counted separately and the scope stated (BR-06); search (accent-insensitive), position/status filters, sort, pagination (5 per page) with a "filtered" summary; a detail panel beside the list (student info, availability, link to the fictional sample CV, full SOP, Executive-only private note); Shortlist / Reject for the selected application only, with a confirmation before rejecting (BR-07); CSV export of the current filter without private notes or CV files (BR-09); empty, filtered-empty, loading, and error-with-retry states; decisions read-only after schedule confirmation (BR-14). The Final Results tab shows a labeled interim state until UI-2.3.
- New components: molecules `StatCard`, `Tabs` (WAI-ARIA keyboard pattern), `Pagination`; organisms `ApplicationFilters`, `ApplicationList`, `ApplicationDetail`; hook `hooks/useApplications.js`; badge tone maps in `constants/labels.js`; the detail service response now includes the applicant's other application IDs and the lock flag.
- Decision hint follows the reference ("Áp dụng riêng cho CF-026; hồ sơ CF-027 được duyệt độc lập") and adds the reason when the buttons are unavailable (already decided — reversal is not defined by WORKFLOWS §3 — or locked by BR-14).
- Test timing: `tests/setup.js` raises the Testing Library async timeout from 1 s to 3 s, and `frontend/vitest.config.js` sets `testTimeout: 10000`. On resume, `npm run verify` failed twice intermittently (a full-page test still loading after 1 s when all files ran in parallel; the slowest page test takes about 3.4 s against the 5 s default). Both passed when rerun; no assertion was changed.

Verified: `npm run verify` 0 twice in a row (frontend 110 tests after adding the Tabs test, backend 18); no `act()` warnings. Headless Edge as the demo Executive (`screening`): one `<h1>`, no horizontal overflow at 360/640/768/853/1024/1280/1600 px for both tabs; screenshots at 360 and 1280 compared with `review-360.png`/`review-1280.png`. The detail-panel-open state is covered by tests but was not captured in the browser (the headless check cannot click).

By hand: The team reviews the commit.

---

## 2026-11-15 — UI-2.3 — Application Review: Final Results tab

Tool: Claude Code

Asked for: Implement `/executive/review?tab=results` from `review-final-results-preview.html` (F6; BR-08, BR-14): results per application, assessment viewing, Executive Pass/Fail, publication with confirmation, in-app notifications.

Changed:

- `ApplicationReviewPage.jsx` Final Results panel: info alert (Shortlisted ≠ Pass; CV-rejected applications listed as excluded from the service data), results table, selected-application panel with "View Assessment" (advisory, `aria-expanded`), Record Pass / Record Fail (only with a submitted assessment and before publication), "Công bố kết quả" card with a confirmation dialog; empty state with a link to scheduling before the schedule is confirmed.
- New: organism `DataTable` (stacked label/value cards below 48rem so status and actions stay visible; explicit table roles so the semantics survive the card layout; `data-selected` instead of the invalid `aria-selected` on table rows), organisms `FinalResultsTable`, `FinalDecisionPanel`, `PublishResultsCard`, hook `hooks/useFinalResults.js`; `resultService.list()` also returns the interview date and the CV-rejected IDs.
- Tests: `tests/pages/FinalResults.test.jsx` (visibility rules, assessment view, Pass/Fail gating, publish → notification only for that applicant, pre-confirmation state).

Verified: `npm run verify` 0 (frontend 116, backend 18). Headless Edge as the demo Executive (`confirmed`): one `<h1>`, no horizontal overflow at 360/640/768/853/1024/1280/1600 px; screenshots at 1280 (table + side-by-side panels) and 360 (stacked result cards) compared with `review-final-results-1280.png`/`-360.png`.

By hand: The team reviews the commit.

---

## 2026-11-15 — UI-2.4 — Interview Scheduling UI

Tool: Claude Code

Asked for: Implement `/executive/scheduling` from `scheduling.html` and SCREEN_REQUIREMENTS Screen 3 (BR-07, BR-08, BR-10…BR-14) using verified mock responses, without a frontend scheduling algorithm.

Changed:

- `pages/InterviewSchedulingPage.jsx` + `hooks/useSchedule.js`: draft parameters (one interview date and window from the campaign; common duration; available rooms), Generate / Regenerate (confirmation before replacing a draft), summary counts taken from the same rows as the table, interviewer assignments and availability, draft table with Proposed / Conflict / Unassigned and the reason for each, a conflict alert listing the real overlaps (including the same applicant across positions), manual Edit / Resolve / Assign Slot dialog, Save Changes with an unsaved-changes badge, timetable CSV export, BR-13 conditions with ✓/✗ text, confirmation dialog, confirmed read-only state (export still allowed), and the BR-13 "no shortlisted applications → skip confirmation" state.
- New components: molecule `ChoiceGroup`; organisms `ScheduleSettingsCard`, `InterviewerAssignmentsCard`, `ScheduleTable`, `ScheduleRowDialog`, `ConfirmationChecklist`.
- Self-review fixes from the browser check: short table values were breaking mid-word ("A-" / "201") because the global `overflow-wrap: anywhere` let columns shrink below a word — tables now use `break-word`; the 8-column tables overflowed their containers at 768–1024 px and hid the action column, so `DataTable` stacks rows as cards below 80rem (recorded in `research.md` D-UI-04); after confirmation the disabled button read "Tạo lịch nháp" and now reads "Tạo lại lịch nháp".
- Tests: `tests/pages/InterviewSchedulingPage.test.jsx` (counts equal rows, conflict reasons, blocked confirmation with each condition, room double-booking, resolve → save → confirm → read-only, regenerate confirmation, confirmed scenario, zero-shortlisted skip).

Verified: `npm run verify` 0 three times in a row (frontend 124, backend 18). One earlier `verify` run, started right after the headless-browser checks, had 1 intermittent frontend test failure that could not be reproduced in 4 later full runs; its name was not captured. Open item for UI-5: find the flaky test under load (logs are now kept for every verify run). Headless Edge as the demo Executive: one `<h1>`, no page overflow and no table-container overflow (`scrollWidth == clientWidth`) at 360/640/768/853/1024/1280/1600 px in the `screening` and `confirmed` scenarios; screenshot at 1280 compared with `scheduling-1280.png`.

By hand: The team reviews the commit.

---

## 2026-11-15 — UI-3 — Applicant Portal (and a session data fix)

Tool: Claude Code

Asked for: Implement the Applicant Portal on `/` from `applicant.html` (F2, F6, F7; BR-02, BR-03, BR-05, BR-08): public campaign, Apply, My Applications, Notifications, shared sign-in, no registration or recovery.

Changed:

- `pages/ApplicantPortalPage.jsx` replaces the UI-1.1 `HomePage` on `/`. URL-driven tabs (`?tab=campaign|apply|mine|notifications`) with an unread count; public campaign (timeline, submission-window message per phase, positions, Apply Now → shared demo sign-in for visitors); a drafts-are-not-public state (BR-02); Apply form (read-only name/student ID, email, faculty, PDF CV ≤ 5 MB, SOP ≤ 300 words with live counter, club slots, summary, duplicate-position notice "(đã nộp)", field errors with banner and focus, disabled outside the submission window); My Applications (each application tracked separately; interview only once confirmed; result only once published, otherwise "Chưa công bố"); in-app notifications with "Mới" and mark-all-read; sign-in gates on private tabs and a notice for non-applicant demo roles.
- New: molecule `FileField`; organisms `PublicCampaignPanel`, `ApplicationForm`, `MyApplicationsTable`, `NotificationList`; hook `hooks/useApplicantPortal.js`; `utils/campaignPhase.js`. Removed the unused `FACULTIES` export from the fixtures (the form owns the option list).
- Separate commit `fix: never show another account's data while reloading`: found while testing the portal — the demo session learned the role only after the account list loaded, so a restored applicant session briefly loaded as a visitor and showed that data during the refresh. The provider now restores the account synchronously and `useServiceData` never returns data loaded for another account.
- Tests: `tests/pages/ApplicantPortalPage.test.jsx` (public access and sign-in prompt, private-tab gates, before-open state, draft hidden, validation and preserved input with focus, 300/301-word boundary, 6 MB CV, successful submission appearing as Pending Review, duplicate notice, BR-08 visibility in screening vs confirmed, notification and mark-as-read).

Not done as suggested: the two suggested UI-3 commits are one, because the tracking and notification tabs live in the same page file as the form.

Verified: `npm run verify` 0 (frontend 134, backend 18); the isolated fix commit also passed verify (frontend 124, backend 18); no `act()` warnings. Headless Edge: one `<h1>`, no page or table-container overflow for visitor `/` and `?tab=apply` (accepting) at 360/768/1280, applicant `?tab=apply` (accepting) at 360/640/768/1024/1280/1600, and `?tab=mine` / `?tab=notifications` (confirmed) at 360/768/1024/1280; screenshots of Apply at 1280 and My Applications at 360 compared with `applicant-1280.png` / `applicant-results-360.png`. The native file button shows the browser's own language ("Choose File"); the Vietnamese status line under it states the chosen file.

By hand: The team reviews both commits.

---

## 2026-11-15 — UI-4 — Interviewer Workspace

Tool: Claude Code

Asked for: Implement `/interviewer` from `interviewer.html` (F6, F7; BR-14): assigned interviews only, details and CV access, one assessment per completed interview, submitted / upcoming / empty / restricted states, no Executive notes, no Pass/Fail publishing.

Changed:

- `pages/InterviewerWorkspacePage.jsx` + `hooks/useInterviewerWorkspace.js`: interviewer identity badge, campaign and interview-date context, four stats, "Assigned Interviews" table (only the signed-in interviewer's confirmed interviews, with Confirmed + assessment status), selected application details (faculty/year, interview time and room, SOP, link to the fictional sample CV), Interview Assessment form, success message that Pass/Fail is recorded by the Executive elsewhere.
- New organisms: `AssignedInterviewsTable`, `InterviewDetailCard`, `AssessmentForm` (states: form, submitted read-only, not-yet-held locked). `/interviewer` now goes through `RoleGate`; the temporary `RoutePlaceholderPage` is no longer routed (removal is part of the UI-5 cleanup).
- Assumption (Q-04 open): the assessment has the reference fields only — notes (required) and a three-option overall recommendation (required); no numeric scores. The form is a single organism so the fields are easy to change once Q-04 is answered.
- Tests: `tests/pages/InterviewerWorkspacePage.test.jsx` (own interviews only, no private notes, submitted read-only, validation then submit → locked, upcoming interview locked after confirming a schedule in the `screening` scenario, empty state, restricted state for other roles).

Verified: `npm run verify` 0 (frontend 141, backend 18), run with the QA servers stopped. Headless Edge as Hà My (`confirmed`): one `<h1>`, no page or table-container overflow at 360/640/768/853/1024/1280/1600 px; empty state (`screening`) at 360 and 1280; screenshot at 1280 compared with `interviewer-1280.png`.

By hand: The team reviews the commit.

---

## 2026-11-15 — UI-5 — Responsive, accessibility and integration readiness

Tool: Claude Code

Asked for: Review the finished UI for responsiveness, browser zoom, and accessibility; prepare `apiClient` for backend integration; document the integration boundary; remove scaffold code only after confirming it is unused.

Changed (four commits):

- `chore: remove unused scaffold pages and components` — `HomePage`, `RoutePlaceholderPage`, `ClubFlowOverview` (+ test), `constants/project.js`; each had no remaining references. `useApiHealth` and `StatusBadge` are kept for the footer health check.
- `fix: improve frontend responsiveness and accessibility` — found by the browser matrix at 200 % root text: `overflow-wrap: anywhere` was applied only to a list of elements, so text in spans/badges/`dd` could not wrap and overflowed at 360 px; it is now inherited from `<body>`. Stacked table cells now wrap the value under its label instead of using a fixed 7rem label column; desktop tables keep `break-word`. `useServiceData` gained `{ enabled }`, so optional detail/assessment loads no longer start empty requests. `CampaignPreview` no longer spreads a `key` prop. New `tests/a11y/screens.a11y.test.jsx` checks every screen for one `<h1>`, one `<main>`, header/footer landmarks, accessible names on all controls, and unique ids.
- `feat: prepare api client for integration` — query strings, JSON bodies, `FormData` without a forced content type (CV upload), optional Bearer token provider, 204/empty → `null`, failures as `UiError` keeping the backend `{ error }` message with a status-based kind and optional `fieldErrors`/`details`; tests in `tests/services/apiClient.test.js`.
- `docs: document frontend backend integration contracts` — `docs/frontend/INTEGRATION.md` (route ownership, layer boundary, every service function with what the backend must enforce, error/loading conventions, auth replacement, CV boundary, mock-only code not to reuse, open questions), linked from `docs/README.md`; `quickstart.md` results log; `tasks.md` T025, T027, T060–T064.

Checked:

- Contrast of all text/background token pairs: all pass WCAG AA (lowest 6.53:1; most AAA).
- No hard-coded colors outside `tokens.css`, no `overflow-x: hidden`, no page-scaling transforms, no positive `tabIndex`; every form control is labelled.
- Browser matrix (headless Edge, same-origin iframe at exact CSS widths): 117/117 checks pass — 17 screen/state combinations at 360, 640, 768, 853, 1024, 1280, 1600 px, plus 200 % root text at 360 and 768 px — no page overflow, no table-container overflow, one `<h1>`.

Limitations stated plainly: real browser zoom was not driven; 640/853/1024 px approximate a 1280 px window at 200/150/125 % zoom. Injecting a 200 % root font does not move `rem` media-query breakpoints (a real browser text-size setting does), so 200 % text at 1280 px is not a valid test of the desktop table and was not counted. A manual keyboard pass in a real browser is still recommended.

Correction to earlier entries: the UI-1.2…UI-4 entries say "no `act()` warnings". Those counts were taken from the default reporter output and missed two warnings that the verbose reporter showed (`ScreeningPanel`, `ResultsPanel`) and one React key-spread warning (`CampaignPreview`). All three were fixed in UI-5; the suite now prints no stderr at all (checked with `--reporter=verbose`).

Open item from UI-2.4 (intermittent failure after browser QA): not reproduced in 2 runs under concurrent headless-browser load and 6 further verify runs; the slowest test now takes about 2.2 s against the 10 s limit. Every verify run since UI-3 keeps a full log.

Verified: `npm run verify` 0 (frontend 156, backend 18, build OK); `--reporter=verbose` run with 0 stderr blocks; 57 relative Markdown links in the hub, the guide, and the spec folder resolve.

By hand: The team reviews the four UI-5 commits and does the manual keyboard pass.

Follow-up (2026-11-15, after the UI-5 docs commit): the final verification failed once more with no browser load, so the earlier "CPU load" explanation was wrong. Code review found the cause: in `ApplicationReviewPage.test.jsx`, "shows the reference header…" waited for the screening panel's request and then synchronously read the campaign context, which comes from the page header's separate `useCampaign()` request. A throwaway experiment that delayed only the header request made the old assertion fail and the awaited version pass. The test now awaits that text (`test: await the separately loaded campaign context`). No product change; the page shows the context as soon as its own request finishes.

Follow-up 2 (2026-11-15): the final gate failed once more (`npm test` and `verify` in the same run; the failing test name was not captured because that run was not logged — every later run is). A review of all page tests for "act on something found before its data arrived" found a **product bug**: when a different application or interview is selected, `useServiceData` kept showing the previous detail until the new one loaded, while the Shortlist / Reject / Save note / Submit Assessment handlers used the newly selected ID. With real network latency a user could act on the wrong application. Fixed (`fix: never show or act on a previous selection while it loads`): the CV-screening detail panel and the interviewer detail/assessment panel render only when the loaded data matches the selection (loading state otherwise), and the handlers use the ID of the displayed data. Two regression tests assert synchronously that the previous item disappears right after another is selected; both failed with the old page code and pass with the fix. The interviewer test that took the stale "Submit Assessment" button now waits for the new item, which is the most likely cause of the remaining intermittent failure. Verified: lint/test/build/verify sequence twice in a row, all exit 0 (frontend 157, backend 18), `--reporter=verbose` with 0 stderr blocks.

---

## 2026-11-15 — UI-6 — Pre-integration audit and cleanup

Tool: Claude Code (implementation); Codex using the `speckit-analyze` skill (read-only audit).

Asked for: A read-only audit of the repository before backend integration (unused files, code quality, CSS, mocks, backend scaffold, docs, quality gate), then the approved cleanup batches 1–5. Batch 6 (code splitting) is deferred, as the audit recommended.

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

By hand: The team reviews the five UI-6 commits, especially the `studentInfo` snapshot (the backend must store the submitted values too) and the Executive-only `getCampaign()`.

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

Verified:

- Recovery baseline before edits: `npm run verify` exit 0 — frontend 191/191, backend 18/18, lint and build passed.
- Targeted tests: 23/23 passed across `ApplicationReviewPage.test.jsx` and `InterviewerWorkspacePage.test.jsx`.
- Full `npm run verify` exit 0 — frontend 193/193 (18 files), backend 18/18 (5 files), lint and build passed; the existing Vite >500 kB chunk warning remains.
- Headless Microsoft Edge against the Vite dev server: Shortlist and assessment confirmation dialogs checked at 360, 768 and 1280 CSS px. In all six checks the page and dialog had no horizontal overflow, the dialog fit the 900 px viewport, and Cancel had initial focus. Escape/cancel caused no screening mutation; assessment cancel preserved its draft. This was real-browser viewport simulation, not real browser zoom.

By hand: The team must review and understand the immutable-workflow policy and code before accepting it; Product Owner confirmation is still pending.

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

Verified:

- Q-02 boundary and five-screen date audit suite: 135/135 tests passed (8 files). All JSX date/timestamp displays use the shared `formatDate`/`formatDateTime`; native date inputs retain ISO values and show an explicit `dd/MM/yyyy` hint.
- Q-01 targeted lint and scheduling tests: lint exit 0; 38/38 tests passed (2 files).
- Full `npm run verify` exit 0: frontend 194/194 (18 files), backend 18/18 (5 files), lint and build passed; the existing Vite >500 kB chunk warning remains.
- No browser check was repeated in this phase because the default fixture order and rendered UI did not change; only order stability under rearranged service input changed.

By hand: The team reviews the first-fit ordering and accepts its intentionally non-optimal/no-backtracking limitation before backend implementation.

---

## 2026-11-16 — UI-7.3 — Q-05 Brevo notification readiness

Tool: Codex using the `speckit-implement` skill.

Asked for: Preserve the in-app result notification flow, make mock-mode email claims accurate, and document a future Brevo delivery/retry contract without integrating Brevo or modifying the backend.

Kept: `Publish Results` as the only trigger; confirmation before publication; unpublished result/notification privacy; one Applicant Portal notification list with unread state; no SMS, push, realtime or marketing feature.

Changed:

- Publication success now says the mock creates in-app notifications but sends no real email, and identifies the future one-template Brevo integration. React still makes no Brevo call and no credential/configuration was added.
- Added service and page regressions proving repeat publication is rejected and cannot duplicate an application's in-app notification.
- Added the complete Q-05 decision record and integration contract: atomic result publication + unique in-app notification + unique email outbox record; server-side Brevo worker; delivery status and provider ID; retry the failed record without republishing or duplicating side effects. Tasks T077–T079 are complete. Product Owner confirmation remains pending because email is excluded by the supplied product scope.

Verified:

- Targeted lint and notification tests: lint exit 0; 48/48 tests passed (3 files).
- Full `npm run verify` exit 0: frontend 195/195 (18 files), backend 18/18 (5 files), lint and build passed; the existing Vite >500 kB chunk warning remains.
- Headless Microsoft Edge at 360, 768 and 1280 CSS px: Publish Results confirmation fit the viewport with Cancel initially focused; after confirmation, the updated success alert containing the Brevo/mock disclaimer fit the viewport and the page had no horizontal overflow at all three widths. This was viewport simulation, not real browser zoom. No external email was sent.

By hand: Backend developers must review the outbox/idempotency model and verify the Brevo account, sender, template, retry policy and credential handling before implementation.

---

## 2026-11-16 — UI-7.4 — Q-07 protected Cloudinary readiness

Tool: Codex using the `speckit-implement` skill.

Asked for: Preserve the existing FileField, FormData and mock PDF behavior; verify PDF/5 MB boundaries; document protected Cloudinary upload/retrieval and authorization without integrating Cloudinary or exposing secrets.

Kept: `FileField`, `ApplicationForm`, `portalService.submitApplication(FormData)`, the shared `apiClient` FormData behavior, the fictional sample PDF and all current layouts. No backend, dependency, environment or Cloudinary SDK change was made.

Changed:

- Added a service regression proving an exact 5 MB PDF is accepted while 6 MB is rejected; existing page tests continue to reject non-PDF input and preserve form data.
- Added the Q-07 decision record and integration contract: Express/Multer one-file/size enforcement, actual PDF content inspection, protected Cloudinary storage, PostgreSQL asset metadata, JWT plus Executive/assigned-interviewer authorization, short-lived signed delivery or backend streaming, and orphan cleanup.
- Explicitly documented that a public `secure_url` is not authorization, Cloudinary secrets must never use `VITE_`, the repository's fictional PDF is not a real-data delivery model, and account delivery capabilities must be verified. Tasks T080–T082 are complete; Product Owner/team confirmation remains pending.

Verified:

- Targeted lint and upload tests: lint exit 0; 49/49 tests passed (3 files: API client, Applicant Portal, mock services).
- Full `npm run verify` exit 0: frontend 195/195 (18 files), backend 18/18 (5 files), lint and build passed; the existing Vite >500 kB chunk warning remains.
- No browser check was repeated because this phase changed only a service boundary test and documentation; the upload UI and rendered copy were unchanged from the previously verified screen.

By hand: Backend developers must verify the Cloudinary account's protected/authenticated PDF delivery features and review retention, malware scanning, applicant self-access and recovery policy before implementation.

---

## 2026-11-16 — UI-7.5 — Q-01…Q-07 acceptance and cleanup audit

Tool: Codex using the `speckit-implement` skill.

Asked for: Complete the Q-01…Q-07 frontend and documentation work, audit the requested UI cleanups, verify all five screens, keep backend production work deferred, and leave a clean phase-by-phase Git history.

Completed:

- Audited the requested cleanup points: all user-visible campaign/application/interview dates use Vietnamese `dd/MM/yyyy` or `dd/MM/yyyy HH:mm` formatting; Scheduling renders campaign interview configuration as a concise, control-free summary; Campaign Preview has no read-only badge.
- Recorded the final UI-7 browser evidence in `quickstart.md` and closed tasks T083–T085. All Q-01…Q-07 choices remain explicitly team-selected and pending Product Owner confirmation.
- Confirmed the implementation range changes only frontend, tests, specifications and documentation. No backend source, migration, dependency, environment file or production integration was changed; `.env` remains ignored and untracked.

Verified:

- Final standalone commands: `npm run lint`, `npm test` and `npm run build` all exited 0; frontend 195/195 tests passed (18 files), backend 18/18 tests passed (5 files), and the production build completed. The existing Vite >500 kB chunk warning remains non-blocking.
- Final `npm run verify` exited 0 with the same 195 frontend and 18 backend tests, lint and build success.
- Headless Microsoft Edge at 360, 768 and 1280 CSS px: 24/24 checks across 8 key states and all 5 screens passed with one h1, no page/data-table overflow and no raw ISO date text. Dialog-specific checks for Q-05 and Q-06 also passed at all three widths. This was viewport simulation, not real browser zoom.
- `git diff --check` passed; the relevant local Markdown links resolved; the branch remained `feature/q01-q07-decisions`; scope and ignored-file checks found no backend or `.env` change.

By hand: Product Owner confirmation is still required for Q-01…Q-07. Backend engineers must implement and review the documented production contracts, migrations, authorization, provider configuration and failure handling before the UI can replace mock services.

---

## 2026-11-16 — UI-8 — Sign In and My Profile prototypes (simulated authentication)

Tool: Claude Code.

Asked for: Finish, debug, test and document the partially implemented UI-8 screens using React and mock data only; no backend, token, database, registration or password features; no commit.

Completed:

- Registered `/login` and the protected `/profile`; the header now links to "Đăng nhập" and, when signed in, offers an account menu with "Hồ sơ cá nhân" and "Đăng xuất". The account-picker `SignInDialog` was removed; a development-only account switch remains in the Demo controls.
- Mock Sign In matches the account by its current profile email, so an edited email signs into the same account; duplicate emails are rejected; the password stays a development fixture and is never stored in the browser.
- Fixed: profile email and credential email could disagree; a profile save could be shown stale after saving; Sign Out from a protected screen could end on `/login` instead of `/`; a service field error could miss focus because the field was still disabled; redirect after Sign In could race with the "already signed in" redirect; a late profile result could replace a newly selected account in the header.
- An in-flight profile save is cancelled without writing when the account, scenario or demo data changes; unsaved edits are discarded on any session change.

Verified:

- From the repository root: `npm run lint`, `npm test`, `npm run build` and `npm run verify` all exited 0; frontend 295/295 tests passed (23 files), backend 18/18 (5 files, unchanged). `git diff --check` reported no whitespace errors. The existing Vite >500 kB chunk warning remains.
- Headless Microsoft Edge on the production build at 360, 640, 768 and 1280 CSS px: 28/28 state checks passed (details in `specs/001-frontend-ui/quickstart.md`). Viewport simulation only; real browser zoom and a screen reader were not used.

Limitations: authentication and profile changes are simulated in browser memory and reset on reload, scenario switch or demo reset; route guards are UI convenience, not security; lists that resolve a person's name by account ID still show the fixture name after a profile rename.

By hand: The team must review this AI-assisted change before committing, and should repeat a keyboard-only pass in a real browser. Backend engineers own real authentication, authorization and profile persistence.

---

## 2026-11-16 — Final frontend documentation synchronization after UI-8

Tool: Codex.

Asked for: Audit the current React implementation and synchronize frontend documentation only; cover five business screens plus shared Sign In and My Profile, align service contracts and backend handoff guidance, preserve canonical requirements, validate links/diff, and stop before commit.

Changed:

- Updated the detailed frontend walkthrough to describe all seven product screens, the current `/login` and `/profile` flows, role-safe redirects, account menu/Sign Out, `AuthGate`/`RoleGate`, `dataVersion`/`sessionEpoch`, mock reset/isolation, immutable application snapshots, loading/error/empty states, and current limitations.
- Rebuilt the walkthrough service map from the actual pages, hooks and service signatures, separated input/output/mock/backend responsibilities, and removed the unapproved proposed endpoint-path table.
- Synchronized `docs/frontend/INTEGRATION.md`, the UI service contracts, data model, routing research, plan, spec, tasks, quickstart and root README. Historical references to five screens now say five **business** screens where needed; historical `SignInDialog` work is explicitly marked as superseded by UI-8.
- Preserved `docs/requirements/` unchanged. Flagged the Q-05 conflict instead of silently resolving it: canonical scope excludes email/SMS/push, while the team's Brevo idea is provisional and still lacks Product Owner approval.
- Added a complete UI-8 manual checklist for all three roles, invalid credentials, Profile Save/Cancel/duplicate email, changed-email sign-in, account switching/reset, Sign Out, protected routes, responsive navigation, five-business-screen regressions, real zoom and screen-reader review.

Evidence used:

- Existing UI-8 records: frontend 295/295 (23 files), backend 18/18 (5 files), and 28/28 headless responsive/state checks at 360/640/768/1280 CSS px. These checks were **not rerun** for this documentation-only task.
- Manual real-browser zoom and screen-reader verification remain outstanding, as already recorded in `specs/001-frontend-ui/quickstart.md`.
- Documentation verification for this task: all relative Markdown targets in the modified files resolve; Markdown table column counts pass; stale-term search leaves only clearly historical five-business-screen/`SignInDialog` references; `git diff --check` passes; the changed-file scope contains documentation only.

Scope: Documentation only. No file under `frontend/src/`, `backend/`, database, environment, dependency or canonical requirement documentation was modified. No branch, commit, add or push operation was performed.
