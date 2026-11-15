# ClubFlow Frontend — Backend Integration Guide

**Audience:** team members who connect the React UI to the Express API.
**Status:** All five screens are built UI-first against an in-memory mock layer. No backend endpoint is called except `GET /api/health` (footer status). Business rules are **not** enforced by the frontend; the backend must enforce BR-01…BR-14 ([Business Rules](../requirements/BUSINESS_RULES.md)).

Related: [UI spec](../../specs/001-frontend-ui/spec.md) · [Service contracts (planned)](../../specs/001-frontend-ui/contracts/ui-services.md) · [Decisions](../../specs/001-frontend-ui/research.md) · [Manual QA checklist](../../specs/001-frontend-ui/quickstart.md) · [Open questions](../requirements/DECISIONS_AND_OPEN_QUESTIONS.md)

## 1. How a screen gets its data

```text
Page (layout + UI state) → hook (loading / error / data) → service (Promise) → mock store   ← today
Page (layout + UI state) → hook (loading / error / data) → service (Promise) → apiClient → Express   ← target
```

- **Components** (`components/atoms|molecules|organisms`) only receive props and call callbacks. None imports a service or the mocks.
- **Pages** (`pages/`) compose components and keep UI state (filters, selection, dialogs, form values).
- **Hooks** (`hooks/`) call services through `useServiceData` (reads) and `useAction` (mutations).
- **Services** (`services/`) are the replacement point. Each function is `async`, returns plain objects, and rejects with a `UiError`. **Replace the body, keep the signature and return shape**, and no page or component needs to change.
- **Mock layer** (`mocks/`) is only imported by services. Delete a service's mock imports once it calls the API.

## 2. Route ownership

| Route | Page | Demo role (UI only) | Hooks | Services |
|---|---|---|---|---|
| `/` (`?tab=campaign\|apply\|mine\|notifications`) | `ApplicantPortalPage` | Visitor / Applicant | `useApplicantPortal` | `portalService` |
| `/executive/campaign` | `CampaignManagementPage` | Executive | `useCampaign` | `campaignService` |
| `/executive/review?tab=screening` | `ApplicationReviewPage` (CV Screening) | Executive | `useApplications`, `useApplicationDetail`, `useCampaign` | `applicationService`, `campaignService` |
| `/executive/review?tab=results` | `ApplicationReviewPage` (Final Results) | Executive | `useFinalResults`, `useAssessment` | `resultService` |
| `/executive/scheduling` | `InterviewSchedulingPage` | Executive | `useSchedule` | `scheduleService`, `campaignService` |
| `/interviewer` | `InterviewerWorkspacePage` | Interviewer | `useAssignedInterviews`, `useInterviewDetail`, `useCampaign` | `interviewerService` |
| `*` | `NotFoundPage` | any | — | — |

`routes/RoleGate.jsx` hides screens from other **demo** roles. It is presentation only; the API must authorize every request.

## 3. Services to connect

HTTP methods and paths are **not decided here** (they belong to the API spec in [`docs/api/`](../api/README.md)). The "Backend must" column lists the rules the server has to enforce, because the mock versions only imitate them.

| Service function | Returns (see the function's JSDoc for fields) | Backend must |
|---|---|---|
| `campaignService.getCampaign()` | `{ campaign, phase, positions[], slots[], locked, hasApplications }` | Executive only; drafts never public |
| `campaignService.saveDraft(draft)` | same view | reject after schedule confirmation (BR-14) |
| `campaignService.publish(draft)` | same view, or `UiError('validation', fieldErrors)` | validate BR-01 server-side |
| `campaignService.removePosition(id)` | same view, or `UiError('conflict')` | BR-04: block when applications exist |
| `applicationService.list(query)` | `{ items[], total, page, pageSize, pageCount }` | filter/sort/paginate server-side; Executive only |
| `applicationService.getStats(query)` | `{ campaign, filtered, isFiltered }` counts | BR-06: applications vs distinct applicants |
| `applicationService.get(id)` | detail incl. `student` (the `{ name, studentId, email, faculty, year }` submitted with the application, not the current profile), `sop`, `cv`, `privateNote`, `siblingIds`, `locked` | private note Executive-only; CV via authorized URL |
| `applicationService.saveNote(id, note)` | detail | Executive only |
| `applicationService.setScreening(id, status)` | detail | BR-07 one application only; BR-14 lock |
| `applicationService.exportCsv(query)` | `{ fileName, content, rowCount }` | BR-09: current filter, permitted fields only (no notes, no CV) |
| `resultService.list()` | `{ scheduleConfirmed, interviewDate, rejectedIds[], rows[] }` | only shortlisted + confirmed interviews |
| `resultService.getAssessment(applicationId)` | assessment or `null` | Executive or the assigned interviewer only |
| `resultService.record(applicationId, 'pass'\|'fail')` | row | needs a submitted assessment; not after publication |
| `resultService.publishRecorded()` | `{ publishedIds[] }` | create one in-app notification per application |
| `scheduleService.getSchedule()` | settings, rooms, assignments, `rows[]` (status + reasons), `summary`, `conditions[]`, `canConfirm`, `zeroShortlisted` | compute statuses with BR-10/BR-11; first-fit order is Q-01 |
| `scheduleService.generateDraft()` | schedule view | first-fit generation (server); ask-before-replace is in the UI |
| `scheduleService.updateSettings({ slotMinutes, roomIds })` | schedule view | one common duration (BR-10) |
| `scheduleService.updateRow(applicationId, { start, interviewerId, roomId })` | schedule view, or `UiError('validation', fieldErrors)` | revalidate BR-10/BR-11 after every edit |
| `scheduleService.saveDraft()` | schedule view | — |
| `scheduleService.confirm()` | schedule view, or `UiError('conflict', details.conditions)` | BR-13 recheck; then BR-14 locks |
| `scheduleService.exportTimetable()` | `{ fileName, content, rowCount }` | — |
| `portalService.getPublicCampaign()` | `{ campaign\|null, phase, window, positions[], slots[] }` | published campaigns only (BR-02) |
| `portalService.listMyApplications()` | own applications; `interview` only if confirmed; `result` only if published | ownership from the token, never from the client (BR-08) |
| `portalService.submitApplication(formData)` | created application, or `UiError` (`validation` / `conflict` with `details.existingApplicationId`) | store the submitted `email`/`faculty` with the application; BR-02 window, BR-03 no quota cap, BR-05 uniqueness incl. concurrent requests, PDF ≤ 5 MB, SOP ≤ 300 words |
| `portalService.listNotifications()` / `markNotificationsRead()` | own notifications | own records only |
| `interviewerService.listAssignedInterviews()` | `{ scheduleConfirmed, campaignName, interviewDate, interviews[] }` | assigned + confirmed only; this is the Interviewer page's only campaign context (it must not call `getCampaign()`) |
| `interviewerService.getInterview(id)` | detail **without** `privateNote` | assignment check; never return screening notes |
| `interviewerService.submitAssessment(id, { recommendation, notes })` | assessment | one per completed interview; fields are Q-04 |

## 4. Replacing a mock body

```js
// services/applicationService.js — before: reads the mock store.
// After (example; use the path agreed in the API spec, none is defined here):
import { apiClient } from './apiClient.js';

export async function list(query = {}) {
  return apiClient(API_PATHS.applications, { query });   // must resolve to { items, total, page, pageSize, pageCount }
}
```

If the API returns a different shape, **map it inside the service** so pages stay unchanged.

## 5. Errors, loading and empty states

- `apiClient` rejects with `UiError { kind, message, fieldErrors?, details? }`. Kinds: `validation` (400/422), `forbidden` (401/403), `notFound` (404), `conflict` (409), `network`, `unknown`. `details` always has the HTTP `status`; the keys of a backend `details` object are placed next to it (so `{ error, details: { conditions } }` → `error.details.conditions`), the same shape the mock services produce.
- The current backend returns `{ error: message }`; that message is shown as is. For field-level messages, return `{ error, fieldErrors: { field: message } }` with these field names:
  - Campaign: `name`, `hostClub`, `description`, `instructions`, `opensOn`, `closesOn`, `interviewDate`, `positions`, `position:<positionId>:<field>`.
  - Application: `positionId`, `email`, `faculty`, `cv`, `sop`, `slotIds`.
  - Schedule row: `start`, `interviewerId`, `roomId`.
  - Assessment: `notes`, `recommendation`.
- `useServiceData` exposes `status: 'idle' | 'loading' | 'success' | 'error'`; pages render `AsyncContent` (spinner, or error + "Thử lại") and their own empty states. `useAction().run()` never throws: it resolves `{ ok, value }` or `{ ok: false, error }`.
- To preview these states without a backend, use the demo bar: **Mạng → Chậm / Lỗi mạng**.
- While refreshing, `useServiceData` keeps the previous data on screen (no flicker). For a **detail of a selected item**, only render it when the loaded data's ID matches the current selection, and take IDs for actions from the displayed data (see `current` in `ApplicationReviewPage.jsx` and `InterviewerWorkspacePage.jsx`). Otherwise, with real latency, a user can act on the previous item.

## 6. Authentication and authorization

- `contexts/DemoSessionContext.jsx` (demo accounts, scenarios, reset) is **not** authentication. Replace it with an auth provider that exposes the same `useDemoSession()` fields the pages use: `account`, `accountId`, `role`, `signIn`, `signOut`, and keep `dataVersion` constant.
- Register the token once: `setAuthTokenProvider(() => currentAccessToken)`; every request then sends `Authorization: Bearer <token>`.
- Remove `organisms/DemoBar` from `layouts/AppLayout.jsx` (or show it only in a demo build) once real data is used.
- The shared `SignInDialog` must become a real credential form; there is no registration or recovery (out of scope).
- The backend decides every permission (ROLES_AND_PERMISSIONS). Frontend checks (`RoleGate`, disabled buttons) are convenience only.

## 7. CV upload and viewing

- Upload boundary: `ApplicationForm` builds `FormData` with `positionId`, `email`, `faculty`, `sop`, repeated `slotIds`, and `cv` (the `File`). `apiClient` sends it without a JSON content type.
- Client checks (`.pdf`, ≤ 5 MB) are for feedback only; the server must re-check type and size.
- Viewing: the demo links to one fictional file, `/demo/fictional-sample-cv.pdf` (`SAMPLE_CV_URL` in `mocks/fixtures.js`). Real CVs must come from an endpoint that checks the Executive role or the interview assignment; never return a public storage URL (Q-07).

## 8. Mock-only logic — do not reuse as business rules

| File | What it does | Why not reuse |
|---|---|---|
| `mocks/derive.js` → `evaluateSchedule` | recomputes Proposed / Conflict / Unassigned so demo edits stay consistent | demo stand-in; the server owns BR-10/BR-11 and the first-fit generator |
| `mocks/guards.js` | role checks and BR-14 locks for demo responses | not security |
| `utils/validation.js` | instant form feedback | the server must validate every request |
| `mocks/scenarios.js` | fixed demo clocks (`now`) | the server uses the real time; time zone is Q-02 |
| `mocks/store.js` → `mockRequest` | cancels a demo call (`UiError('conflict')`) when the demo account or scenario changed while it waited | demo-only consistency; a real backend has no scenario switch, and auth changes are handled by the auth provider |

## 9. Tests after switching a service

Page tests (`src/tests/pages/`) currently exercise the mock services. When a service calls the API, keep the tests by mocking that service module in the test (`vi.mock('../../services/applicationService.js', …)`) with the old mock behaviour, or by stubbing `fetch` as in `src/tests/services/apiClient.test.js`.

## 10. Open questions and UI assumptions

| ID | Topic | Current UI assumption |
|---|---|---|
| Q-01 | First-fit order | Not implemented in the UI; "Generate draft" shows the server's (today: demo) result |
| Q-02 | Time zone / precision | Display fixed to `Asia/Ho_Chi_Minh`, `dd/MM/yyyy` and `HH:mm` (`utils/format.js`) |
| Q-03 | Editable fields after publication | Campaign stays editable until confirmation; interview date/window/duration locked once applications exist |
| Q-04 | Assessment fields | Notes + three-option recommendation, both required; no scores |
| Q-05 | Notification UI | List in the Applicant Portal with unread badge and "mark all read" |
| Q-06 | Editing submissions / availability | Not offered |
| Q-07 | Private CV delivery | Demo uses one fictional file; see §7 |
| — | Screening reversal | Only Pending Review applications can be decided (WORKFLOWS §3 does not settle reversal) |

## 11. Integration checklist (per service)

1. Agree the endpoint and response shape in `docs/api/`.
2. Replace the service body with `apiClient` (map the response if needed).
3. Make sure server errors carry `error` (and `fieldErrors` for forms).
4. Run `npm run verify` and the manual checks in `specs/001-frontend-ui/quickstart.md`.
5. Remove the service's mock imports; delete `mocks/` once no service uses it.
