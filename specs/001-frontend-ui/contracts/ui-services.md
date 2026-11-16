# UI Service Contracts: ClubFlow UI-First Frontend

**Purpose**: The boundary between pages/hooks and data. Pages call only these functions. In UI-1…UI-4 they are implemented with demo data; during backend integration, teammates replace the function bodies with `apiClient` calls.

**Not defined here**: HTTP methods, URL paths, headers, or database fields. Those belong to the backend API specification ([`docs/api/README.md`](../../../docs/api/README.md)).

## Common conventions

- Every function is `async` and returns a Promise, even in demo mode.
- Lists return `{ items, total, page, pageSize }`.
- Failures reject with a `UiError`:

  ```js
  // frontend/src/services/uiError.js (created in UI-1)
  {
    kind: 'validation' | 'conflict' | 'forbidden' | 'notFound' | 'network' | 'unknown',
    message: string,            // safe to show to the user (Vietnamese)
    fieldErrors?: { [field: string]: string },
    details?: object,           // e.g. { conditions } or { existingApplicationId }; apiClient adds { status }
  }
  ```

  `apiClient` (UI-5) maps a backend `{ error, fieldErrors?, details? }` body to this shape; backend `details` keys sit directly on `error.details`. See `docs/frontend/INTEGRATION.md` §5.
- Demo implementations may accept an optional `{ simulate: 'error' | 'slow' }` argument **only through the demo controls**, so loading and error states can be reviewed.

## Demo session (UI-1)

| Function | Returns |
|---|---|
| `demoSessionService.listAccounts()` | demo accounts grouped by role |
| `demoSessionService.listScenarios()` | scenario IDs, labels, demo clock |

## Authentication prototype (UI-8, US6)

| Function | Input | Returns |
|---|---|---|
| `authService.signIn(credentials)` | `{ email, password }` | current account profile, or `UiError(forbidden)` for invalid credentials. The account is matched by its profile's **current** email (case-insensitive) plus the shared development password; a non-object argument (the old `signIn(accountId)` shape) is rejected |
| `authService.signOut()` | — | `null`; clears the selected demo account |
| `authService.getCurrentUser()` | — | current account profile or `null` |
| `authService.listDemoCredentials()` | — | three representative development logins (one per role) with each account's current email |
| `demoSessionService.signIn(accountId)` | account ID | development-only account switch used by the Demo controls; no credentials |

The prototype stores only the selected account ID in session storage. A future backend replaces these bodies with a login request/current-user request and token lifecycle; no password may be persisted by the frontend.

## Profile prototype (UI-8, US7)

| Function | Input | Returns |
|---|---|---|
| `profileService.getProfile()` | — | current account profile; `UiError(forbidden)` when signed out |
| `profileService.updateProfile(payload)` | `{ displayName, email }` (other keys are ignored) | updated current account profile; `UiError(validation, fieldErrors)` for a missing/malformed field or an email used by another demo account; `UiError(conflict)` when the account, scenario, or demo data changed while the save was pending (nothing is written) |

`id`, `role`, `studentId`, `faculty`, and `year` are response-only in UI-8. Updating a profile must not rewrite `Application.studentInfo` snapshots. Password change is not part of this prototype contract.

## Campaign (UI-2, US1)

| Function | Input | Returns |
|---|---|---|
| `campaignService.getCampaign()` | — | campaign with positions, slots, phase, lock state — **Executive only** |
| `campaignService.saveDraft(draft)` | campaign draft | saved campaign, or `UiError(forbidden)` once the campaign is published (Q-03) |
| `campaignService.publish(draft)` | campaign draft (saved, then published) | published campaign (`locked: true`, `lockReason: 'published'`), `UiError(validation)`, or `UiError(forbidden)` if it is already published |
| `campaignService.removePosition(positionId)` | id | ok, `UiError(conflict)` when applications are linked (BR-04), or `UiError(forbidden)` once the campaign is published (Q-03) |

## Applications and results (UI-2, US2)

| Function | Input | Returns |
|---|---|---|
| `applicationService.list(query)` | `{ search, positionId, status, sort, page, pageSize }` | page of application summaries |
| `applicationService.getStats(query)` | same filters | `{ applications, applicants, byStatus, scope }` |
| `applicationService.get(id)` | id | application detail (Executive view); `student` is the snapshot submitted with the application |
| `applicationService.saveNote(id, note)` | id, text | updated application |
| `applicationService.setScreening(id, status)` | id, `shortlisted` or `rejected` | updated application, or `UiError(conflict)` unless the current status is `pendingReview`; no reversal (Q-06) |
| `applicationService.exportCsv(query)` | filters | `{ fileName, rowCount }` (demo: no real file privacy) |
| `resultService.list()` | — | final-results rows |
| `resultService.getAssessment(applicationId)` | id | assessment or `null` |
| `resultService.record(applicationId, decision)` | id, `pass` or `fail` | updated row |
| `resultService.publishRecorded()` | — | `{ publishedIds }`; demo creates one in-app notification per ID and sends no email; backend also queues one idempotent common-template Brevo delivery per ID (Q-05) |

## Scheduling (UI-2, US3)

| Function | Input | Returns |
|---|---|---|
| `scheduleService.getSchedule()` | — | `{ settings, assignments, rooms, rows, summary, conditions, status }` |
| `scheduleService.generateDraft()` | — | schedule (demo: ordered reference data; backend: deterministic first-fit by submission/ID, chronological slot, stable interviewer ID, stable room ID; Q-01) |
| `scheduleService.updateSettings(settings)` | `{ roomIds }` (date, window and duration are campaign configuration, Q-03) | schedule, or `UiError(forbidden)` for a campaign-configuration field |
| `scheduleService.updateRow(applicationId, change)` | `{ start, interviewerId, roomId }` | schedule, or `UiError(validation, fieldErrors)` |
| `scheduleService.saveDraft()` | — | schedule |
| `scheduleService.confirm()` | — | confirmed schedule, or `UiError(conflict, details: unmetConditions)` |
| `scheduleService.exportTimetable()` | — | `{ fileName, rowCount }` |

## Applicant (UI-3, US4)

| Function | Input | Returns |
|---|---|---|
| `portalService.getPublicCampaign()` | — | public campaign view (no drafts) |
| `portalService.listMyApplications()` | — | own applications with screening, confirmed interview, **published** result only |
| `portalService.submitApplication(formData)` | `FormData`: `positionId`, `email`, `faculty`, `sop`, repeated `slotIds`, `cv` file | created immutable application, `UiError(validation)`, or `UiError(conflict, details: existingApplicationId)`; PDF ≤ 5 MB is revalidated server-side and stored behind protected retrieval (Q-07); no update/withdraw contract (Q-06) |
| `portalService.listNotifications()` | — | own notifications |
| `portalService.markNotificationsRead()` | — | nothing; own unread notifications become read |

## Interviewer (UI-4, US5)

| Function | Input | Returns |
|---|---|---|
| `interviewerService.listAssignedInterviews()` | — | `{ scheduleConfirmed, campaignName, interviewDate, interviews[] }` — own confirmed interviews plus the campaign context the page shows |
| `interviewerService.getInterview(id)` | id | interview + application details (no private screening note) |
| `interviewerService.submitAssessment(interviewId, assessment)` | `{ recommendation, notes }` | saved immutable assessment, or `UiError(validation)` / `UiError(conflict)` if one already exists; no update/delete contract (Q-06) |

## Hooks (one per screen area)

Hooks wrap services and return `{ data, status: 'idle'|'loading'|'success'|'error', error, reload }` plus named actions, for example `useApplications(query)` → `{ ..., setScreening, saveNote }`. Components never call services directly.
