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
    details?: unknown,          // e.g. unmet confirmation conditions
  }
  ```

  The backend currently returns only `{ error: message }`; mapping that (and any future field-level format) to `UiError` is a backend-integration task.
- Demo implementations may accept an optional `{ simulate: 'error' | 'slow' }` argument **only through the demo controls**, so loading and error states can be reviewed.

## Demo session (UI-1)

| Function | Returns |
|---|---|
| `demoSessionService.listAccounts()` | demo accounts grouped by role |
| `demoSessionService.listScenarios()` | scenario IDs, labels, demo clock |

## Campaign (UI-2, US1)

| Function | Input | Returns |
|---|---|---|
| `campaignService.getCampaign()` | — | campaign with departments, positions, slots |
| `campaignService.saveDraft(draft)` | campaign draft | saved campaign |
| `campaignService.publish(campaignId)` | id | published campaign, or `UiError(validation)` |
| `campaignService.removePosition(positionId)` | id | ok, or `UiError(conflict)` when applications are linked (BR-04) |

## Applications and results (UI-2, US2)

| Function | Input | Returns |
|---|---|---|
| `applicationService.list(query)` | `{ search, positionId, status, sort, page, pageSize }` | page of application summaries |
| `applicationService.getStats(query)` | same filters | `{ applications, applicants, byStatus, scope }` |
| `applicationService.get(id)` | id | application detail (Executive view) |
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
| `scheduleService.updateRow(interviewId, change)` | `{ start?, interviewerId?, roomId? }` | schedule (demo: scripted transitions only) |
| `scheduleService.saveDraft()` | — | schedule |
| `scheduleService.confirm()` | — | confirmed schedule, or `UiError(conflict, details: unmetConditions)` |
| `scheduleService.exportTimetable()` | — | `{ fileName, rowCount }` |

## Applicant (UI-3, US4)

| Function | Input | Returns |
|---|---|---|
| `portalService.getPublicCampaign()` | — | public campaign view (no drafts) |
| `portalService.listMyApplications()` | — | own applications with screening, confirmed interview, **published** result only |
| `portalService.submitApplication(formData)` | `FormData` (student fields, `cv` file, `sop`, `slotIds`) | created application, `UiError(validation)`, or `UiError(conflict, details: existingApplicationId)` |
| `portalService.listNotifications()` | — | own notifications |

## Interviewer (UI-4, US5)

| Function | Input | Returns |
|---|---|---|
| `interviewerService.listAssignedInterviews()` | — | own confirmed interviews |
| `interviewerService.getInterview(id)` | id | interview + application details (no private screening note) |
| `interviewerService.submitAssessment(interviewId, assessment)` | `{ recommendation, notes }` | saved assessment, or `UiError(validation)` / `UiError(conflict)` if one already exists |

## Hooks (one per screen area)

Hooks wrap services and return `{ data, status: 'idle'|'loading'|'success'|'error', error, reload }` plus named actions, for example `useApplications(query)` → `{ ..., setScreening, saveNote }`. Components never call services directly.
