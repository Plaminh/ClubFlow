# ClubFlow Frontend — Backend Integration Guide

**Audience:** team members who connect the React UI to the Express API.
**Status:** Five business screens plus the shared Sign In and My Profile screens are built UI-first against an in-memory mock layer. No backend endpoint is called except `GET /api/health` (footer status). Business rules are **not** enforced by the frontend; the backend must enforce BR-01…BR-14 ([Business Rules](../requirements/BUSINESS_RULES.md)).

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
| `/interviewer` | `InterviewerWorkspacePage` | Interviewer | `useAssignedInterviews`, `useInterviewDetail` | `interviewerService` |
| `/login` | `SignInPage` (simulated Sign In) | Visitor; a signed-in account is redirected to its role home | `useSignIn` | `authService` |
| `/profile` | `ProfilePage` (My Profile) behind `AuthGate` | Executive, Applicant, Interviewer | `useProfile` | `profileService` |
| `*` | `NotFoundPage` | any | — | — |

`routes/RoleGate.jsx` hides screens from other **demo** roles. It is presentation only; the API must authorize every request.

## 3. Services to connect

HTTP methods and paths are **not decided here** (they belong to the API spec in [`docs/api/`](../api/README.md)). The "Backend must" column lists the rules the server has to enforce, because the mock versions only imitate them.

| Service function | Returns (see the function's JSDoc for fields) | Backend must |
|---|---|---|
| `campaignService.getCampaign()` | `{ campaign, phase, positions[], slots[], locked, lockReason }` (`lockReason`: `null` for a draft, `'published'`, or `'scheduleConfirmed'`) | Executive only; drafts never public |
| `campaignService.saveDraft(draft)` | same view, or `UiError('forbidden')` | only while the campaign is a draft (Q-03, §12.3); also rejected after schedule confirmation (BR-14) |
| `campaignService.publish(draft)` | same view, or `UiError('validation', fieldErrors)` / `UiError('forbidden')` | validate BR-01 server-side; only a draft can be published; publishing locks the configuration (Q-03) |
| `campaignService.removePosition(id)` | same view, or `UiError('conflict')` / `UiError('forbidden')` | BR-04: block when applications exist; only while the campaign is a draft (Q-03) |
| `applicationService.list(query)` | `{ items[], total, page, pageSize, pageCount }` | filter/sort/paginate server-side; Executive only |
| `applicationService.getStats(query)` | `{ campaign, filtered, isFiltered }` counts | BR-06: applications vs distinct applicants |
| `applicationService.get(id)` | detail incl. `student` (the `{ name, studentId, email, faculty, year }` submitted with the application, not the current profile), `sop`, `cv`, `privateNote`, `siblingIds`, `locked` | private note Executive-only; CV via authorized URL |
| `applicationService.saveNote(id, note)` | detail | Executive only |
| `applicationService.setScreening(id, status)` | detail | BR-07 one application only; BR-14 lock |
| `applicationService.exportCsv(query)` | `{ fileName, content, rowCount }` | BR-09: current filter, permitted fields only (no notes, no CV) |
| `resultService.list()` | `{ scheduleConfirmed, interviewDate, rejectedIds[], rows[] }` | only shortlisted + confirmed interviews |
| `resultService.getAssessment(applicationId)` | assessment or `null` | Executive or the assigned interviewer only |
| `resultService.record(applicationId, 'pass'\|'fail')` | row | needs a submitted assessment; not after publication |
| `resultService.publishRecorded()` | `{ publishedIds[] }` | publish idempotently and create one in-app notification per application; email is not authorized by canonical scope (Q-05 conflict, §12.5) |
| `scheduleService.getSchedule()` | settings, rooms, assignments, `rows[]` (status + reasons), `summary`, `conditions[]`, `canConfirm`, `zeroShortlisted` | compute statuses with BR-10/BR-11; first-fit order is Q-01 |
| `scheduleService.generateDraft()` | schedule view | first-fit generation (server); ask-before-replace is in the UI |
| `scheduleService.updateSettings({ roomIds })` | schedule view, or `UiError('validation')` / `UiError('forbidden')` | rooms only, at least one; the date, window and common duration (BR-10) are campaign configuration and must be rejected here (Q-03) |
| `scheduleService.updateRow(applicationId, { start, interviewerId, roomId })` | schedule view, or `UiError('validation', fieldErrors)` | revalidate BR-10/BR-11 after every edit |
| `scheduleService.saveDraft()` | schedule view | — |
| `scheduleService.confirm()` | schedule view, or `UiError('conflict', details.conditions)` | BR-13 recheck; then BR-14 locks |
| `scheduleService.exportTimetable()` | `{ fileName, content, rowCount }` | — |
| `portalService.getPublicCampaign()` | `{ campaign\|null, phase, window, positions[], slots[] }` | published campaigns only (BR-02) |
| `portalService.listMyApplications()` | own applications; `interview` only if confirmed; `result` only if published | ownership from the token, never from the client (BR-08) |
| `portalService.submitApplication(formData)` | created application, or `UiError` (`validation` / `conflict` with `details.existingApplicationId`) | store the submitted `email`/`faculty` with the application; BR-02 window, BR-03 no quota cap, BR-05 uniqueness incl. concurrent requests, PDF ≤ 5 MB, SOP ≤ 300 words |
| `portalService.listNotifications()` / `markNotificationsRead()` | own notifications | own records only |
| `authService.signIn({ email, password })` | account profile, or `UiError('forbidden')` | real login; issue and manage the token server-side contract; never return or store a password |
| `authService.signOut()` / `getCurrentUser()` | `null` / profile or `null` | end the session / return the token's user |
| `authService.listDemoCredentials()` | fictional example logins | **remove** with the mock; never expose credentials |
| `profileService.getProfile()` | `{ id, role, displayName, email, description?, studentId?, faculty?, year? }` | own profile only, identity from the token |
| `profileService.updateProfile({ displayName, email })` | profile, or `UiError('validation', fieldErrors)` | accept only these two fields; enforce email uniqueness; never rewrite the student snapshot stored on submitted applications |
| `interviewerService.listAssignedInterviews()` | `{ scheduleConfirmed, campaignName, interviewDate, interviews[] }` | assigned + confirmed only; this is the Interviewer page's only campaign context (it must not call `getCampaign()`) |
| `interviewerService.getInterview(id)` | detail **without** `privateNote` | assignment check; never return screening notes |
| `interviewerService.submitAssessment(id, { recommendation, notes })` | assessment `{ id, interviewId, interviewerId, notes, recommendation, submittedAt }` | assigned interviewer only; interview already ended; one per interview, never editable; `notes` required, `recommendation` is `'pass'`, `'fail'` or `null` and must not create or change the final result (Q-04, §12.4) |

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
  - Sign In: `email`, `password` (current mock returns one form-level invalid-credential error).
  - My Profile: `displayName`, `email`.
- `useServiceData` exposes `status: 'idle' | 'loading' | 'success' | 'error'`; pages render `AsyncContent` (spinner, or error + "Thử lại") and their own empty states. `useAction().run()` never throws: it resolves `{ ok, value }` or `{ ok: false, error }`.
- To preview these states without a backend, use the demo bar: **Mạng → Chậm / Lỗi mạng**.
- While refreshing, `useServiceData` keeps the previous data on screen (no flicker). For a **detail of a selected item**, only render it when the loaded data's ID matches the current selection, and take IDs for actions from the displayed data (see `current` in `ApplicationReviewPage.jsx` and `InterviewerWorkspacePage.jsx`). Otherwise, with real latency, a user can act on the previous item.

## 6. Authentication and authorization

- `contexts/DemoSessionContext.jsx` (demo accounts, scenarios, reset) is **not** authentication. Replace it with an auth provider that exposes the same identity fields the pages/routes use: `account`, `accountId`, `role`, `signIn`, `signOut`. Keep `dataVersion`/`sessionEpoch` stable during ordinary requests and change the relevant key when identity or the loaded dataset genuinely changes.
- Register the token once: `setAuthTokenProvider(() => currentAccessToken)`; every request then sends `Authorization: Bearer <token>`.
- Remove `organisms/DemoBar` from `layouts/AppLayout.jsx` (or show it only in a demo build) once real data is used.
- UI-8 added the credential form (`/login`, `SignInForm`) and My Profile (`/profile`). Both are **simulated**: `authService` and `profileService` read and write the in-memory mock store. There is no token/JWT, hashing, backend auth/profile call or durable profile persistence, and no registration, forgot/reset password, or change-password flow. The old account-picker `SignInDialog` was removed.
- Simulated Sign In: the account is found by its profile's current email and the single fictional development password in `mocks/auth.js` (shown on the Sign In page; example logins: `executive@clubflow.demo.example`, `minh.anh@demo.example`, `ha.my@clubflow.demo.example`). Only the selected account ID and scenario ID are kept in `sessionStorage`; the password is never stored. Replace the `authService` bodies with real requests and delete `mocks/auth.js` and `listDemoCredentials`.
- Redirects: Executive → `/executive/campaign`, Applicant → `/`, Interviewer → `/interviewer`. A guest opening a protected route goes to `/login` and returns to that route after Sign In only if `routes/navigation.js` → `canAccessProtectedPath(role, pathname)` allows it (a fixed allow-list of in-app paths; anything else falls back to the role home). Sign Out ("Đăng xuất" in the header account menu) clears the session and returns to `/`.
- My Profile edits only `displayName` and `email`; account ID, role, student ID, faculty, and academic year are read-only. A changed email becomes the Sign In email for that account within the current scenario; an email of another demo account is rejected. Edits live in memory only: a page reload, scenario switch, or "Đặt lại dữ liệu demo" restores the fixture values (and the original Sign In email). Submitted applications keep the student snapshot taken at submission; lists that show a person's name by account ID (`mocks/derive.js` → `accountName`) keep showing the fixture name.
- The Demo controls keep a development-only "Đổi tài khoản nhanh" select (`demoSessionService.signIn(accountId)`, no credentials) for scenario review. It disappears together with `DemoBar`.
- `useDemoSession().sessionEpoch` changes on sign-in/out, account switch, scenario switch, and reset; `ProfilePage` keys its local state on it so unsaved edits never carry over. A real auth provider can keep it constant or bump it on user change.
- The backend decides every permission (ROLES_AND_PERMISSIONS). Frontend checks (`RoleGate`, disabled buttons) are convenience only.

## 7. CV upload and viewing

- Upload boundary: `ApplicationForm` builds `FormData` with `positionId`, `email`, `faculty`, `sop`, repeated `slotIds`, and `cv` (the `File`). `apiClient` sends it without a JSON content type.
- Client checks (`.pdf`, ≤ 5 MB) are for feedback only. Express/Multer must accept one file with a 5 MB limit and the backend must inspect the actual PDF signature/content rather than trust the extension or MIME header.
- Upload the validated file to a non-public/protected Cloudinary delivery/access mode supported by the team's account. Store the asset/public identifier, version, resource/delivery type, format, byte size and safe original name against the application. Never store a permanent public URL as the authorization boundary.
- Viewing: the demo links to one fictional file, `/demo/fictional-sample-cv.pdf` (`SAMPLE_CV_URL` in `mocks/fixtures.js`). A real retrieval endpoint authenticates with JWT and authorizes the Executive or the interviewer assigned to the application, then streams the file or returns a short-lived signed/authenticated delivery URL. Verify the exact Cloudinary delivery mode and account capability during backend integration (Q-07, §12.7).
- Keep Cloudinary API secret/key material server-side. Do not introduce a `VITE_` Cloudinary secret. If upload succeeds but the application transaction fails, delete the orphaned asset.

## 8. Mock-only logic — do not reuse as business rules

| File | What it does | Why not reuse |
|---|---|---|
| `mocks/derive.js` → `evaluateSchedule` | recomputes Proposed / Conflict / Unassigned so demo edits stay consistent | demo stand-in; the server owns BR-10/BR-11 and the first-fit generator |
| `mocks/guards.js` | role checks and BR-14 locks for demo responses | not security |
| `utils/validation.js` | instant form feedback | the server must validate every request |
| `mocks/scenarios.js` | fixed demo clocks (`now`) | the server uses the real time; see §12 for the date and time convention (Q-02) |
| `mocks/store.js` → `mockRequest` | cancels a demo call (`UiError('conflict')`) when the demo account or scenario changed while it waited | demo-only consistency; a real backend has no scenario switch, and auth changes are handled by the auth provider |

## 9. Tests after switching a service

Page tests (`src/tests/pages/`) currently exercise the mock services. When a service calls the API, keep the tests by mocking that service module in the test (`vi.mock('../../services/applicationService.js', …)`) with the old mock behaviour, or by stubbing `fetch` as in `src/tests/services/apiClient.test.js`.

## 10. Open questions and UI assumptions

| ID | Topic | Current UI assumption |
|---|---|---|
| Q-01 | First-fit order | Team-selected deterministic order; not implemented as a frontend generator. "Generate draft" displays the service result. See §12.1 |
| Q-02 | Time zone / precision | Team-selected: instants are UTC ISO 8601 (`TIMESTAMPTZ`), shown in `Asia/Ho_Chi_Minh` as `dd/MM/yyyy` and `HH:mm` (`utils/format.js`); `opensOn`/`closesOn`/`interviewDate` are date-only; window is `openAt <= now < closeAt` with `closeAt` = 00:00 after the closing date. See §12.2 |
| Q-03 | Editable fields after publication | Team-selected: none. The whole campaign configuration is read-only from publication; Scheduling shows date/window/duration as text and edits rooms only. See §12.3 |
| Q-04 | Assessment fields | Team-selected: required notes + optional advisory recommendation (`pass` / `fail` / `null`); no scores, no criteria, no editing. See §12.4 |
| Q-05 | Notification UI and email | Canonical scope requires in-app notification and excludes email/SMS/push. The mock implements only the in-app list. The team's Brevo proposal conflicts with that scope and must not be implemented without Product Owner confirmation. See §12.5 |
| Q-06 | Editing submissions / availability | Not offered. See §12.6 |
| Q-07 | Private CV delivery | Demo uses one fictional file; backend uses Multer + protected Cloudinary storage + authorized short-lived retrieval. See §7 and §12.7 |
| — | Screening reversal | Only Pending Review applications can be decided (WORKFLOWS §3 does not settle reversal) |

## 11. Integration checklist (per service)

1. Agree the endpoint and response shape in `docs/api/`.
2. Replace the service body with `apiClient` (map the response if needed).
3. Make sure server errors carry `error` (and `fieldErrors` for forms).
4. Run `npm run verify` and the manual checks in `specs/001-frontend-ui/quickstart.md`.
5. Remove the service's mock imports; delete `mocks/` once no service uses it.

## 12. Contracts from the team-selected decisions (Q-01…Q-07)

These decisions are team-selected and still wait for Product Owner confirmation; the full records are in [Decisions §6](../requirements/DECISIONS_AND_OPEN_QUESTIONS.md). This section only states what the API has to send and accept so that the current pages work unchanged.

### 12.1 Deterministic first-fit scheduling (Q-01)

The backend generator owns this algorithm. The React page only calls `scheduleService.generateDraft()` and renders the returned rows.

1. Query Shortlisted applications ordered by `submitted_at ASC, application_id ASC`.
2. Enumerate session starts by instant ascending inside the campaign window.
3. For each application, enumerate qualified and available interviewers by stable ID ascending, then selected available rooms by stable ID ascending.
4. Accept the first combination that is inside the applicant's chosen availability and has no overlap for the applicant, interviewer or room. Adjacent sessions are allowed under BR-11.
5. Persist that assignment before continuing to the next application. If none is valid, return an `Unassigned` row with a safe reason and continue.
6. Do not backtrack, globally reschedule, or optimize. Revalidate the draft and every BR-13 condition when confirming.

Use explicit `ORDER BY`; database row order and JavaScript array insertion order are not contracts. Generation and confirmation also need transactional/concurrency protection against double-booking. The mock service only keeps its reference rows and exposed resource lists in this order so contract tests are deterministic; it is not reusable backend scheduling logic.

### 12.2 Dates and times (Q-02)

| Kind | Fields (service objects) | Wire format | PostgreSQL |
|---|---|---|---|
| Instant | `submittedAt`, `reviewedAt`, `publishedAt`, `confirmedAt`, `savedAt`, `recordedAt`, `createdAt`, `readAt`, interview and slot `start`/`end`, `window.opensAt`/`closesAt` | UTC ISO 8601, e.g. `2026-11-05T02:00:00.000Z` | `TIMESTAMPTZ` |
| Calendar date | `campaign.opensOn`, `closesOn`, `interviewDate` | `YYYY-MM-DD`, a day in `Asia/Ho_Chi_Minh` | `DATE` |
| Wall-clock time | `campaign.interviewWindow.start`/`end` | `HH:mm` in `Asia/Ho_Chi_Minh` | `TIME` |

- The frontend only **displays** these values (`utils/format.js`); it does not decide whether the window is open. The server compares its own clock with `openAt <= now < closeAt`, where `openAt` is 00:00 on `opensOn` and `closeAt` is 00:00 on the day after `closesOn`, both in `Asia/Ho_Chi_Minh`.
- Send instants with `Z` or an explicit offset. A string without an offset would be read in the browser's local time.
- `scheduleService.updateRow` sends back one of the `sessionStarts` values it received, so the server can match it by instant.

### 12.3 Campaign configuration lock (Q-03)

| Campaign state | `locked` / `lockReason` | Campaign Management | Interview Scheduling |
|---|---|---|---|
| Draft | `false` / `null` | editable form; Save Draft, Preview, Publish (with confirmation) | no schedule yet |
| Published, schedule not confirmed | `true` / `'published'` | text only + the reason; Preview only | date, window, duration as text; rooms, draft generation, row edits, save and confirm are available |
| Schedule confirmed | `true` / `'scheduleConfirmed'` | text only + the BR-14 reason; Preview only | everything is text; export only |

- "Campaign configuration" = name, host club, description, instructions, opening and closing dates, departments and positions (including quota), interview date, interview window, and slot duration.
- The server must reject `saveDraft`, `publish`, `removePosition` and any change of date/window/duration for a campaign that is not a draft, whatever the UI shows. The pages only hide the controls.
- Three different things use the interview window and must stay separate in the API: the **campaign configuration** (owned by Campaign Management), the **applicant's chosen availability slots** (stored with each application, collected by the Applicant Portal), and the **interview assignment** (start, interviewer, room; owned by Interview Scheduling).
- BR-04 still needs a database constraint and a service check. In the UI it can no longer be reached, because positions cannot be removed after publication and a draft has no applications.

### 12.4 Interview assessment (Q-04)

- Request: `{ notes: string (required, non-blank), recommendation: 'pass' | 'fail' | null }`. The form sends `null` when the interviewer chooses "Không nêu đề xuất".
- The server accepts it only when the caller is the interviewer assigned to that interview, the schedule is confirmed, the interview's end time has passed (server clock), and no assessment exists for the interview yet (unique per interview). There is no update or delete endpoint.
- `recommendation` is advice for the Executive. It is stored on the assessment and shown as text. The final result is a separate record written only by `resultService.record` (Executive) and may differ from the recommendation.
- Read access: the assigned interviewer and the Executive (Business §2). Applicants never receive assessments or recommendations.
- Field errors use the names `notes` and `recommendation`.

### 12.5 Result notifications; unresolved Brevo proposal (Q-05)

- Canonical requirements require an in-app notification and explicitly exclude email/SMS/push. Therefore `resultService.publishRecorded()` must at minimum publish each result and insert exactly one applicant notification in one transaction; repeating publication must not duplicate either record.
- The development team recorded a provisional Brevo common-template/outbox design, but there is no Product Owner approval and it conflicts with the canonical exclusion. **Do not implement or treat Brevo as part of the backend contract until that conflict is authoritatively resolved.**
- If Product Owner confirmation later adds email, use an idempotent outbox/worker with server-side credentials, delivery state and retry controls. Email failure must never hide or duplicate the published result or in-app notification, and no provider secret may use a `VITE_` variable.

### 12.6 Immutable workflow transitions (Q-06)

| Transition | Accepted current state | Server result | Later update/delete |
|---|---|---|---|
| Submit application | campaign open; no existing applicant/campaign/position record | one immutable application snapshot, including CV metadata and availability | none |
| Save screening decision | `pendingReview` | exactly one of `shortlisted` / `rejected` | none |
| Submit assessment | assigned interview completed; no assessment exists | one immutable assessment | none |
| Confirm schedule | every BR-13 condition met; schedule not confirmed | confirmed schedule locked under BR-14 | none |
| Publish final result | recorded, unpublished decision | published result plus one in-app notification | none |

- The frontend confirmations improve intent and prevent accidental duplicate clicks; they are not concurrency control. The server must check the expected state and authorization in the same transaction as each write and return `409 Conflict` for stale or duplicate transitions.
- The application ID or interview ID in the request is the action target. Never infer it from a previously selected browser row. Idempotency keys may be added for network retries, but they must not enable a second domain record.
- No override, correction, undo, update or delete endpoint is part of the selected contract. A future exception workflow requires Product Owner approval and an audit trail.

### 12.7 Protected CV upload and retrieval (Q-07)

```text
React FileField → FormData → Express/Multer limit → PDF content validation
  → protected Cloudinary upload → PostgreSQL asset metadata linked to Application

Authorized CV request → JWT role/assignment check → short-lived signed URL or backend stream
```

- Upload request fields stay exactly as the current `portalService.submitApplication(formData)` contract. Respond with application data, not Cloudinary credentials or a permanent public URL.
- Enforce one file, PDF-only content and `bytes <= 5 * 1024 * 1024` on the server. Return `UiError(validation)`-compatible `fieldErrors.cv` for rejected files.
- The metadata record needs enough information to address and verify the asset without treating its URL as permission: asset/public ID, version, resource type, delivery/access type, format, bytes and safe original filename.
- Retrieval authorization is record-level: Executive access or the interviewer assigned to that application's confirmed interview. The frontend's hidden controls are not security. Applicant-owner retrieval is not in the current UI contract and needs an explicit decision if added.
- Verify Cloudinary protected/authenticated PDF delivery, signed-URL support and account restrictions before fixing an implementation. If short-lived URLs are used, keep expiry brief and do not expose them in logs; proxy streaming is the fallback when account delivery features are insufficient.
