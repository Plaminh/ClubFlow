# ClubFlow PA#3 Self-Assessment Report

**Project:** ClubFlow, CSC13008, 24KTPM1
**Milestone:** PA#3 React Frontend
**Date:** November 19, 2026
**Branch:** `pa3-finalize`

Submitted by:

- 24127082 - Phan Lê Anh Minh
- 24127171 - Huỳnh Thái Hoàng
- 24127211 - Hồ Phan Như Nguyệt

**Total I claim: 95 / 100**

Criteria 1 to 4 and 6 are marked by running the app in a browser. On 2026-11-19 we drove the app in headless Chrome as the course script would (see the evidence column), ran the W3C checker and the course contract-check. Claims are kept below the maximum where something was not exercised.

---

## 1. Rubric Assessment

| # | Criterion | Max | I claim | Evidence |
|---|---|---:|---:|---|
| 1 | The whole main flow, in React | 25 | 25 | Walked in headless Chrome on `vite preview` of `client/dist/` against a freshly started mock, through the screens' own links and buttons, with the brief's names (`Save as Draft`, `Preview Campaign`, `Publish Campaign`, `Shortlist Candidate`, `Reject`, `Continue to Interview Scheduling`, `+ Assign Slot`, `Resolve`, `Edit`, `Save Changes`, `Approve & Confirm Schedule`): C1 and C2 (four roles, sign-out, role refusal), C3 and C4 (draft, preview, refused publish naming the setup problems, publish after choosing a room and an interviewer), C5 and C6 (A01 and A02, duplicate opens A01, ownership), C7 (note, A01 shortlisted while A02 stays pending, filters kept, CSV), C8 and C9 (Conflict between A01 and A02 named, refusal naming them, Resolve, Save Changes, confirm, read-only), C10 (assigned-only, one assessment, other interviewer's interview and CV answer 403), C11 (Pass on A01, Fail on A02, publish, applicant sees both results and two notifications). Gap: on `/executive/scheduling` the date, time window and duration are shown, not chosen, because they are fixed in Campaign Management (Q-03). |
| 2 | Routing, sign-in and shared state | 10 | 10 | Headless Chrome: every route reloaded and still open; a header link then Back returns; a signed-out `/executive/scheduling` goes to `/login` and back after sign-in; an unknown path shows the not-found screen; an applicant on an executive route gets the role message; token and user in `client/src/contexts/DemoSessionContext.jsx`; review filters survive closing the drawer. Tests: `client/src/tests/routes/AppRoutes.test.jsx`. |
| 3 | Data from the API: loading, errors, empty lists | 10 | 10 | Empty mode: every data screen read in Chrome, with an empty message and counts of 0. Error mode: Thử lại (Retry) on all six data screens tested; on `/executive/review` Retry loaded the data after the mock was back to normal, no page reload. Slow mode showed the loading text. Mock request log: each screen sends each request once; review search is debounced (one request for two keystrokes). Slow mode (2 s): all seven data screens opened as the signed-in role showed a loading status the whole time, "Đang khôi phục phiên đăng nhập…" while the session is restored and then "Đang tải dữ liệu…" until the data arrived. |
| 4 | Forms | 10 | 10 | Walked in Chrome: sign-in; campaign form (empty form, close-before-open dates, empty position rows: messages sit on their fields via `aria-describedby`, nothing is sent); application form (empty, non-PDF, 20 MB PDF, 301 words, duplicate position keeps the form); note; assessment (empty refused, one submit, then read-only); result decisions; a publish refused by the API shows its messages on the interview-setup fields. Inputs have labels (tests in `screens.a11y.test.jsx`). Double submit, on a mock in slow mode, each action clicked twice at once: sign-in, application, close applications, note, shortlist, generate draft, slot edit, Save Changes, Approve & Confirm, assessment, record Pass, Save as Draft and publish each sent exactly one request. |
| 5 | The contract and the mock | 15 | 15 | `tools/contract-check.mjs` (course script) on a freshly started mock: 52 of 52 examples answered as written, exit 0, 37 of 37 table endpoints have an example, 3 notes (CSV and PDF bodies, by design). Every request the mock logged during the browser walk is in the contract table. Contract commit `5ba9f3e` and mock commit `c624603` come before the first client commit that calls the API (`b82728b`). Every changed file has a dated `## Changes` line, including a late entry for commit `85c3419`. `mock/` uses only Node built-ins and has the four modes. |
| 6 | Responsive, semantic, valid | 5 | 5 | Headless Chrome, every route for each role at 360, 768 and 1280 px, also with data in the lists: no horizontal scroll, one `h1`, one `main`, no skipped heading level, labelled inputs, no console message; at 360 px every button, link, input and checkbox is at least 44 px high on the six screens measured (the checkbox rule is in `InterviewSetupCard.css` and `ChoiceGroup.css`). The review drawer and list stay readable at 768 px (side by side) and 360 px (stacked). W3C Nu checker on the rendered HTML: 17 screens of the first pass and 13 data-rich states (list, drawer, final results, assessment, confirmed schedule, interviewer, applicant tabs, preview): 0 errors, 0 warnings, after removing the redundant `role` attributes of `DataTable.jsx`, which gave 27 errors on every populated table. |
| 7 | The brief and the rules file | 10 | 9 | `brief.md` holds the prompts given to the assistants, in order, including the contract-first request; `AGENTS.md` records the stack (React Router, plain CSS, no new dependency), the relative `/api` rule, call only contract endpoints and stop when one is missing, no edits to `docs/api/` or `mock/` without approval and a `## Changes` line, loading/error/empty states, and the acceptance gates (C1-C11, four modes, direct routes, three widths, production build, contract-check). The prompts are in Vietnamese. |
| 8 | AI-LOG.md | 10 | 8 | `AI-LOG.md` has a `## PA#3` heading and one entry per task. Incidents are recorded in the Phase 2B/2C, Phase 3 and Phase 10 entries. Several earlier entries have `Rejected: None` and no `By hand` line. |
| 9 | Commit history | 5 | 3 | Contract, then mock, then client integration, in separate commits with specific messages. All 73 commits carry one author name, so the history does not show who did which part, and the changes of 2026-11-19 are not committed yet. |
| | **Total** | **100** | **95** | |

## What we did not manage

- The scheduling screen shows the interview date, time window and duration instead of letting the Executive choose them (they are fixed in Campaign Management after publication, Q-03).
- A saved draft campaign can only be edited in the session that created it: after a reload the page opens the current (confirmed) campaign.
- The mock answers a fixed draft schedule rather than computing the first-fit schedule of Q-01.
- Git history shows one author for all 73 commits although three members are named.

## What we would do differently

- Send every contract example to the mock when the mock was written, not at the end. The 12 mismatches found on 2026-11-19 would have shown up on day one.
- Log the incidents in `AI-LOG.md` as they happened, with the check that caught each one.
- Commit under each member's own name from the first day.

---

## 2. Team Members

| Member | Student ID | Role |
| --- | --- | --- |
| Phan Lê Anh Minh | 24127082 | Full-Stack / React Frontend / QA Lead |
| Huỳnh Thái Hoàng | 24127171 | Full-Stack / HTTP Mock & Contracts / QA |
| Hồ Phan Như Nguyệt | 24127211 | Full-Stack / UI & Accessibility / QA |

---
## 3. C1-C11 Flow Verification Matrix

| Step | User Story / Role | UI Component / Page | HTTP API Endpoint(s) | Status | Verification Evidence |
|---|---|---|---|:---:|---|
| **C1** | Visitor: View Public Campaign | `ApplicantPortalPage.jsx` (`PublicCampaignPanel`) | `GET /api/campaigns/current` | **PASS** | `portalHttpService.test.js`, `ApplicantPortalPage.test.jsx`, `verify-pa3-http.mjs` |
| **C2** | All: Sign-in, Roles, Sign-out, Profile | `SignInPage.jsx`, `ProfilePage.jsx`, `AppLayout.jsx` | `POST /api/auth/login`<br>`GET /api/auth/me`<br>`POST /api/auth/logout`<br>`GET/PATCH /api/me/profile` | **PASS** | `authService.test.js`, `profileService.test.js`, `SignInPage.test.jsx`, `ProfilePage.test.jsx`, `AppRoutes.test.jsx` |
| **C3** | Executive: Create, Edit Draft, Preview, Publish | `CampaignManagementPage.jsx` (`CampaignDetailsCard`, `PositionsEditor`) | `POST /api/campaigns`<br>`GET/PATCH /api/campaigns/{id}`<br>`POST /api/campaigns/{id}/publish`<br>`POST .../close-applications` | **PASS** | `campaignHttpService.test.js`, `CampaignManagementPage.test.jsx`, `verify-pa3-http.mjs` |
| **C4** | Executive: Composite Interview Setup | `CampaignManagementPage.jsx` (`InterviewSetupCard`) | `PATCH /api/campaigns/{id}/interview-setup` | **PASS** | Rooms, interviewers, 15/20/30-min validation, and lock rules tested in `CampaignManagementPage.test.jsx` |
| **C5** | Applicant: Multi-position Application Submission | `ApplicantPortalPage.jsx` (`ApplicationForm`) | `POST /api/applications` (multipart/form-data) | **PASS** | 5 MiB PDF, SOP, slot selection, independent A01/A02, and 409 duplicate tested in `ApplicantPortalPage.test.jsx` |
| **C6** | Applicant: My Applications & Tracking | `ApplicantPortalPage.jsx` (`MyApplicationsTable`) | `GET /api/me/applications` | **PASS** | Status tracking, confirmed interview details, and own-data visibility tested in `ApplicantPortalPage.test.jsx` |
| **C7** | Executive: Application Review & Screening | `ApplicationReviewPage.jsx` (`ScreeningPanel`, `ApplicationDetail`) | `GET /api/campaigns/{id}/applications`<br>`POST .../screening-decision`<br>`PUT .../note`<br>`GET /api/applications/{id}/cv`<br>`GET .../applications/csv` | **PASS** | Debounced search (~300 ms), filters, independent shortlist/reject, CSV export, and protected CV download tested in `ApplicationReviewPage.test.jsx` |
| **C8** | Executive: Draft Interview Scheduling | `InterviewSchedulingPage.jsx` (`ScheduleTable`, `ScheduleSettingsCard`) | `GET /api/campaigns/{id}/schedule`<br>`POST .../schedule/draft/generate`<br>`PATCH .../draft/rows/{id}`<br>`POST .../draft/save`<br>`GET .../schedule/csv` | **PASS** | Deterministic draft generation, conflict/unassigned calculation, row edits, and meaningful save tested in `InterviewSchedulingPage.test.jsx` |
| **C9** | Executive: Approve & Confirm Schedule | `InterviewSchedulingPage.jsx` (`ConfirmationChecklist`) | `POST /api/campaigns/{id}/schedule/confirm` | **PASS** | Refusal on conflict/unassigned, successful confirmation, and post-confirmation read-only lock tested in `InterviewSchedulingPage.test.jsx` |
| **C10** | Interviewer: Workspace & Assessments | `InterviewerWorkspacePage.jsx` (`AssignedInterviewsTable`, `AssessmentForm`) | `GET /api/me/interviews`<br>`GET /api/interviews/{id}`<br>`POST /api/interviews/{id}/assessment`<br>`GET /api/applications/{id}/cv` | **PASS** | Assigned-only privacy, authorized CV download, immutable single assessment per completed interview tested in `outcomeHttpService.test.js` & `InterviewerWorkspacePage.test.jsx` |
| **C11** | Executive / Applicant: Final Results & Notifications | `ApplicationReviewPage.jsx` (`ResultsPanel`), `ApplicantPortalPage.jsx` (`NotificationList`) | `GET /api/campaigns/{id}/results`<br>`GET .../applications/{id}/assessment`<br>`PUT .../final-result`<br>`POST .../results/publish`<br>`GET/PATCH /api/me/notifications` | **PASS** | Independent Pass/Fail recording, idempotent result publication, notification creation, and applicant visibility tested in `outcomeHttpService.test.js`, `FinalResults.test.jsx` |


---

## 4. Quality Gates Execution Log

| Quality Gate | Command | Expected Result | Actual Result | Status |
|---|---|---|---|:---:|
| **ESLint** | `npm run lint` | 0 errors, 0 warnings | 0 errors, 0 warnings across all workspaces | **PASS** |
| **Frontend Tests** | `npm run test:run --workspace client` | All tests pass | 281 passed across 29 test files | **PASS** |
| **Backend Tests** | `npm run test:run --workspace backend` | All tests pass | 18 passed across 5 test files | **PASS** |
| **Mock Tests** | `npm run test:mock` | All tests pass | 14 passed across 7 test files | **PASS** |
| **Full Test Suite** | `npm test` | All 313 tests pass | 313 passed across 41 test files | **PASS** |
| **Production Build** | `npm run build` | Clean client build in `client/dist/` | Built in ~310 ms; `client/dist/` created | **PASS** |
| **Contract Structural Validation** | `node tools/validate-api-docs.mjs` | 9 files, 37 endpoints, 52 examples | 9 files, 37 endpoints, 52 examples validated | **PASS** |
| **HTTP Workflow Verification** | `npm run verify:mock-http` | 24 endpoints exercised from fresh state | Passed: 24 endpoints, 3 applications, 3 confirmed interviews, 2 published results | **PASS** |
| **Official Contract Checker** | `node tools/contract-check.mjs --base http://localhost:3001` on a freshly started mock | Every example answers as written | 52 of 52 examples, exit 0; 37 of 37 endpoints have an example;  3 notes (CSV and PDF bodies, by design). Before the 2026-11-19 fixes: 44 failures | **PASS** |
| **Mock Delivery Modes** | `MOCK_MODE=normal\|slow\|error\|empty` | All 4 modes exhibit documented behavior | Verified in `mock/tests/modes.test.mjs` and UI tests | **PASS** |
| **Accessibility & Semantics** | Vitest (`screens.a11y.test.jsx`) | One `h1`, main, landmarks, unique IDs | 14 screens verified with accessible controls | **PASS** |
| **Mobile Tap Targets** | DOM Audit at 360 px | Controls >= 44 px | Brand link, skip link, checkboxes meet 44 px target | **PASS** |
| **W3C Automated Validation** | W3C Nu checker (validator.w3.org/nu) on the rendered `<html>` copied from Chrome at 1280 px | 0 errors | 17 screens, 4 applicant-portal tabs and 13 data-rich states (lists, drawer, dialogs, confirmed schedule): 0 errors, 0 warnings | **PASS** |
| **Widths and semantics in a browser** | Headless Chrome on `vite preview`, every route per role at 360, 768, 1280 px | No horizontal scroll, one `h1`, labels, targets >= 44 px | All routes pass; every control is at least 44 px high at 360 px | **PASS** |


---

## 5. Submission

- Archive name: `24127082-24127171-24127211_95.zip` (IDs ascending, total equal to the table above).
- Included: the repository folder with `.git/`, `client/` and `client/dist/` built after the last change, `mock/server.mjs` and `mock/data/`, `docs/api/`, `AGENTS.md`, `FRONTEND.md`, `brief.md`, `AI-LOG.md`, `SELF_ASSESSMENT_REPORT.md`.
- Left out: every `node_modules/`, the local `.env`.
