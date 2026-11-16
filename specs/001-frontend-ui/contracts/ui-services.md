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
| `applicationService.setScreening(id, status)` | id, `shortlisted` or `rejected` | updated application |
| `applicationService.exportCsv(query)` | filters | `{ fileName, rowCount }` (demo: no real file privacy) |
| `resultService.list()` | — | final-results rows |
| `resultService.getAssessment(applicationId)` | id | assessment or `null` |
| `resultService.record(applicationId, decision)` | id, `pass` or `fail` | updated row |
| `resultService.publishRecorded()` | — | `{ publishedIds }` |

## Scheduling (UI-2, US3)

| Function | Input | Returns |
|---|---|---|
| `scheduleService.getSchedule()` | — | `{ settings, assignments, rooms, rows, summary, conditions, status }` |
| `scheduleService.generateDraft()` | — | schedule (demo: scenario data) |
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
| `portalService.submitApplication(formData)` | `FormData`: `positionId`, `email`, `faculty`, `sop`, repeated `slotIds`, `cv` file | created application, `UiError(validation)`, or `UiError(conflict, details: existingApplicationId)` |
| `portalService.listNotifications()` | — | own notifications |
| `portalService.markNotificationsRead()` | — | nothing; own unread notifications become read |

## Interviewer (UI-4, US5)

| Function | Input | Returns |
|---|---|---|
| `interviewerService.listAssignedInterviews()` | — | `{ scheduleConfirmed, campaignName, interviewDate, interviews[] }` — own confirmed interviews plus the campaign context the page shows |
| `interviewerService.getInterview(id)` | id | interview + application details (no private screening note) |
| `interviewerService.submitAssessment(interviewId, assessment)` | `{ recommendation, notes }` | saved assessment, or `UiError(validation)` / `UiError(conflict)` if one already exists |

## Hooks (one per screen area)

Hooks wrap services and return `{ data, status: 'idle'|'loading'|'success'|'error', error, reload }` plus named actions, for example `useApplications(query)` → `{ ..., setScreening, saveNote }`. Components never call services directly.
