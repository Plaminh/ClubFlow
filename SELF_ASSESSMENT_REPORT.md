# ClubFlow PA#3 Self-Assessment Report

**Project:** ClubFlow — CSC13008, 24KTPM1
**Milestone:** PA#3 React Frontend
**Date:** November 18, 2026
**Branch:** `pa3-finalize`

---

## 1. Team Members

| Member | Student ID | Role / Contribution | Status |
| --- | --- | --- | --- |
| Phan Lê Anh Minh | 24127082 | Full-Stack / React Frontend / QA Lead | Verified |
| Huỳnh Thái Hoàng | 24127171 | Full-Stack / HTTP Mock & Contracts / QA | Verified |
| Hồ Phan Như Nguyệt | 24127211 | Full-Stack / UI & Accessibility / QA | Verified |

---

## 2. Rubric Assessment Summary

**Total Score Claimed: 99.5 / 100**

| Criterion | Max | Claimed | Evidence & Verification |
|---|---:|---:|---|
| **1. Whole Main Flow (C1–C11)** | 25 | 25 | End-to-end integration across all 11 steps over relative `/api` endpoints. Verified via `tools/verify-pa3-http.mjs` (24 endpoints, 3 applications, 3 confirmed interviews, 2 published results) and 280 frontend Vitest integration tests. |
| **2. Routing, Sign-in, Shared State** | 10 | 10 | React Router DOM v7 declarative routes, `AuthGate`, `RoleGate`, persistent session restored via `/api/auth/me`, logout via `/api/auth/logout`, intended destination redirect, and Error + Retry support on session reload. |
| **3. API Data States** | 10 | 10 | Every data screen provides Loading, Error with Retry, Empty, and Success states. Verified in dedicated tests under `normal`, `slow`, `error`, and `empty` mock modes (`mock/tests/modes.test.mjs`, `AppRoutes.test.jsx`, page test suites). |
| **4. Forms & Validation** | 10 | 10 | Accessible labelled form controls (`screens.a11y.test.jsx`), client/server error mapping, focus on first error, preservation of user input on 400/409 errors (duplicate application retains form and links to existing application), 5 MiB PDF limit, and SOP constraints. |
| **5. Contract & HTTP Mock** | 15 | 15 | Contract in `docs/api/` (9 files, 37 endpoints, 52 request examples, validated by `tools/validate-api-docs.mjs`). Standalone Node HTTP mock in `mock/server.mjs` implementing all endpoints and four modes (`normal`, `slow`, `error`, `empty`). Official checker reported truthfully as **NOT RUN**. |
| **6. Responsive, Semantic, W3C** | 5 | 4.5 | Semantic HTML (one `h1`, landmarks, unique IDs, accessible names) verified across 14 screens in `screens.a11y.test.jsx`. Mobile tap targets >= 44 px (commit `78bfa84`). Responsive breakpoints at 360 px, 768 px, 1280 px without horizontal scroll. -0.5 deducted because offline W3C validator was **NOT RUN**. |
| **7. Brief & Rules Compliance** | 10 | 10 | `brief.md` preserves all 6 prompts verbatim. Strict adherence to `AGENTS.md` and `client/AGENTS.md`: Atomic Design (`atoms -> molecules -> organisms -> templates -> pages`), relative `/api` paths, no Redux, no foreign ORMs, zero secrets in repo. |
| **8. AI Usage Log (AI-LOG.md)** | 10 | 10 | `AI-LOG.md` maintained systematically from project inception through Phase 9. Records tool, prompt, kept/changed/rejected items, manual actions, and verified evidence for every task. |
| **9. Commit History & Git Policy** | 5 | 5 | Scoped, conventional commits following contract-first, mock-first, then consumer integration. Local branch `pa3-finalize` kept in fast-forward sync with `origin/pa3-finalize`. Zero force-pushes or rewritten history. |
| **Total** | **100** | **99.5** | High confidence backed by automated test suites and reproducible scripts. |

---

## 3. C1–C11 Flow Verification Matrix

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
| **Frontend Tests** | `npm run test:run --workspace client` | All tests pass | 280 passed across 29 test files | **PASS** |
| **Backend Tests** | `npm run test:run --workspace backend` | All tests pass | 18 passed across 5 test files | **PASS** |
| **Mock Tests** | `npm run test:mock` | All tests pass | 14 passed across 7 test files | **PASS** |
| **Full Test Suite** | `npm test` | All 312 tests pass | 312 passed across 41 test files | **PASS** |
| **Production Build** | `npm run build` | Clean client build in `client/dist/` | Built in ~260 ms; `client/dist/` created | **PASS** |
| **Contract Structural Validation** | `node tools/validate-api-docs.mjs` | 9 files, 37 endpoints, 52 examples | 9 files, 37 endpoints, 52 examples validated | **PASS** |
| **HTTP Workflow Verification** | `npm run verify:mock-http` | 24 endpoints exercised from fresh state | Passed: 24 endpoints, 3 applications, 3 confirmed interviews, 2 published results | **PASS** |
| **Official Contract Checker** | `node tools/contract-check.mjs` | Course-provided automated check | Script not provided by instructor | **NOT RUN** |
| **Mock Delivery Modes** | `MOCK_MODE=normal\|slow\|error\|empty` | All 4 modes exhibit documented behavior | Verified in `mock/tests/modes.test.mjs` and UI tests | **PASS** |
| **Accessibility & Semantics** | Vitest (`screens.a11y.test.jsx`) | One `h1`, main, landmarks, unique IDs | 14 screens verified with accessible controls | **PASS** |
| **Mobile Tap Targets** | DOM Audit at 360 px | Controls >= 44 px | Brand link, skip link, checkboxes meet 44 px target | **PASS** |
| **W3C Automated Validation** | Offline HTML/CSS validator | HTML5 compliant | Offline W3C tooling not bundled in repo | **NOT RUN** |

---

## 5. Submission Readiness Audit

### Included in Submission
- Full Git repository including `.git/` with intact, linear, conventional commit history.
- `client/` React frontend source and production build in `client/dist/`.
- `mock/server.mjs`, `mock/lib/`, and deterministic fixture files in `mock/data/`.
- API Contract documentation in `docs/api/`.
- Project documentation: `FRONTEND.md`, `brief.md`, `AI-LOG.md`, `SELF_ASSESSMENT_REPORT.md`, `AGENTS.md`.
- Automated tooling: `tools/validate-api-docs.mjs` and `tools/verify-pa3-http.mjs`.

### Excluded from Submission
- `node_modules/` in root, `client/`, and `backend/`.
- Local `.env` secrets.
- Temporary scratch files.
- Real student CVs or personal data.

### Archive Packaging Details
- Team members and student IDs are fully verified.
- Target archive naming format: `24127082_24127171_24127211_PA3.zip` (order by Student ID ascending, or per instructor announcement).
