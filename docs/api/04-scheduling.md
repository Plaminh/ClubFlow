# Interview Scheduling

These Executive endpoints cover C8 and C9. Generate Draft, Edit/Resolve, Save Changes, export, and Confirm are distinct actions.

**Starting state (PA#4).** Runs alone on a fresh seed. The seed has A01–A03 pending review and applications still open, so the file must start with requests that, through the API, close applications (`POST /api/campaigns/cmp-2026-hk1/close-applications`) and shortlist A01, A02 and A03 (`POST …/applications/{id}/screening-decision`). Those opening requests are written by the owner of this file before the server code (tasks.md T013, T054).

## Schedule View Shape

The canonical `GET` schedule view contains:

- `settings`: `{ interviewDate, interviewWindow, slotMinutes, roomIds }`. Before the first Generate, the date, window and duration are the Campaign's; after it, they are the values chosen for the current draft. `roomIds` are the Campaign's rooms.
- `assignments`: Interviewer Assignment array.
- `rooms`: available Room array.
- `rows`: Interview array with `status`, `reasons`, and `conflictWith` arrays.
- `summary`: `{ total, proposed, conflict, unassigned }`.
- `conditions`: `{ code, label, met, detail }[]` confirmation conditions.
- `status`: `none`, `draft`, or `confirmed`.
- `dirty`, `generatedAt`, `savedAt`, `confirmedAt`, `canConfirm`, and `zeroShortlisted`.

Mutation responses return the canonical view: each example shows the main fields and ends with `…` for the remaining fields of that view. The frontend may use that result immediately and refetch this canonical `GET` view. Empty mode sets every array in either projection to `[]` and all summary counts to zero while retaining valid settings/status scalars.

## GET /api/campaigns/{campaignId}/schedule

**Purpose**: Read current settings, resources, draft/confirmed rows, summary, and confirmation readiness.

**Allowed roles**: Executive.

**Success**: `200`. Errors: `401 INVALID_TOKEN`; `403 ROLE_FORBIDDEN`; `404 CAMPAIGN_NOT_FOUND`.

```http
GET /api/campaigns/cmp-2026-hk1/schedule HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "settings": {
    "interviewDate": "2026-12-02",
    "interviewWindow": { "start": "09:00", "end": "12:00" },
    "slotMinutes": 30,
    "roomIds": ["room-a201", "room-b105"]
  },
  "assignments": [
    {
      "interviewerId": "iv-giahuy",
      "interviewerName": "Gia Huy",
      "positionIds": ["pos-content"],
      "positionNames": ["Content"],
      "availability": [
        { "start": "2026-12-02T09:00:00+07:00", "end": "2026-12-02T12:00:00+07:00" }
      ],
      "availabilityText": "09:00-12:00"
    },
    {
      "interviewerId": "iv-comms",
      "interviewerName": "Linh Tran",
      "positionIds": ["pos-comms"],
      "positionNames": ["Communications"],
      "availability": [
        { "start": "2026-12-02T09:00:00+07:00", "end": "2026-12-02T12:00:00+07:00" }
      ],
      "availabilityText": "09:00-12:00"
    }
  ],
  "rooms": [
    { "id": "room-a201", "name": "A-201" },
    { "id": "room-b105", "name": "B-105" }
  ],
  "rows": [],
  "summary": { "total": 0, "proposed": 0, "conflict": 0, "unassigned": 0 },
  "conditions": [
    { "code": "APPLICATIONS_CLOSED", "label": "Applications are closed", "met": true, "detail": "Closed." },
    { "code": "ALL_REVIEWED", "label": "All applications are reviewed", "met": true, "detail": "3 of 3 applications reviewed." },
    { "code": "DRAFT_SAVED", "label": "Draft changes are saved", "met": false, "detail": "Generate and save a draft." },
    { "code": "ALL_ASSIGNED", "label": "Every shortlisted application is assigned", "met": false, "detail": "3 shortlisted applications need assignments." },
    { "code": "NO_CONFLICTS", "label": "No conflicts remain", "met": false, "detail": "Generate and review a draft." }
  ],
  "status": "none",
  "dirty": false,
  "generatedAt": null,
  "savedAt": null,
  "confirmedAt": null,
  "canConfirm": false,
  "zeroShortlisted": false
}
```

## POST /api/campaigns/{campaignId}/schedule/draft/generate

**Purpose**: Replace any unconfirmed draft with the deterministic PA#3 draft for current shortlisted Applications, on the date, time window and duration the Executive chooses (C8).

**Allowed roles**: Executive.

| Request field | Type | Rules |
| --- | --- | --- |
| `interviewDate` | string `YYYY-MM-DD` | Required; a real date after the Campaign's `closesOn`. |
| `interviewWindow` | object `{ start, end }` | Required; `start` and `end` are `HH:MM` (24-hour), `start` before `end`, and the window fits at least one interview of `slotMinutes`. Errors use the key `interviewWindow`. |
| `slotMinutes` | integer | Required; `15`, `20` or `30`. |

**Behavior**: Only shortlisted Applications enter. Generation is first-fit in the product owners' order (Q-01): Applications by `submittedAt`, then Application ID; for each, the earliest start time in the window first; at that time, Interviewers assigned to the Application's Position, then Rooms, each by stable ID; the first combination where the Applicant, the Interviewer and the Room are all free and none overlaps an interview already placed is taken. No backtracking. An Application that fits nowhere is `Unassigned` with its reason, never rejected. The chosen values become the draft's `settings`; row edits must then fall inside that date and window, and every interview lasts `slotMinutes`. The Campaign's own interview configuration is not changed.

**Success**: `200` canonical schedule view with recalculated rows, summary, readiness, and timestamps. Errors: `400 VALIDATION_ERROR` with `fieldErrors` keyed `interviewDate`, `interviewWindow`, `slotMinutes`; `401`; `403`; `404`; `409 APPLICATIONS_STILL_OPEN`; `409 UNREVIEWED_APPLICATIONS`; `409 SCHEDULE_CONFIRMED`; `409 NO_SHORTLISTED_APPLICATIONS`. The `409` checks run before the body is validated.

A body without the settings is refused field by field:

```http
POST /api/campaigns/cmp-2026-hk1/schedule/draft/generate HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json

{}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Schedule settings are invalid.",
  "code": "VALIDATION_ERROR",
  "fieldErrors": {
    "interviewDate": "Interview date is required.",
    "interviewWindow": "A start and an end time are required.",
    "slotMinutes": "Duration is required."
  }
}
```

Impossible values are refused the same way:

```http
POST /api/campaigns/cmp-2026-hk1/schedule/draft/generate HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json

{"interviewDate": "2026-11-20", "interviewWindow": {"start": "12:00", "end": "09:00"}, "slotMinutes": 45}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Schedule settings are invalid.",
  "code": "VALIDATION_ERROR",
  "fieldErrors": {
    "interviewDate": "Interview date must be after the campaign closes.",
    "interviewWindow": "Start must be before end.",
    "slotMinutes": "Must be 15, 20, or 30."
  }
}
```

A valid request generates the draft:

```http
POST /api/campaigns/cmp-2026-hk1/schedule/draft/generate HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{"interviewDate": "2026-12-02", "interviewWindow": {"start": "09:00", "end": "12:00"}, "slotMinutes": 30}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "rows": [
    {
      "interviewId": "int-A01",
      "applicationId": "A01",
      "applicantId": "ap-minhanh",
      "applicantName": "Nguyen Minh Anh",
      "positionId": "pos-content",
      "positionName": "Content",
      "availabilityText": "09:00-10:00, 10:00-11:00",
      "start": "2026-12-02T09:00:00+07:00",
      "end": "2026-12-02T09:30:00+07:00",
      "interviewerId": "iv-giahuy",
      "interviewerName": "Gia Huy",
      "roomId": "room-a201",
      "roomName": "A-201",
      "status": "conflict",
      "reasons": ["Applicant Nguyen Minh Anh overlaps with application A02."],
      "conflictWith": ["A02"]
    },
    {
      "interviewId": "int-A02",
      "applicationId": "A02",
      "applicantId": "ap-minhanh",
      "applicantName": "Nguyen Minh Anh",
      "positionId": "pos-comms",
      "positionName": "Communications",
      "availabilityText": "09:00-10:00, 10:00-11:00",
      "start": "2026-12-02T09:00:00+07:00",
      "end": "2026-12-02T09:30:00+07:00",
      "interviewerId": "iv-comms",
      "interviewerName": "Linh Tran",
      "roomId": "room-b105",
      "roomName": "B-105",
      "status": "conflict",
      "reasons": ["Applicant Nguyen Minh Anh overlaps with application A01."],
      "conflictWith": ["A01"]
    },
    {
      "interviewId": "int-A03",
      "applicationId": "A03",
      "applicantId": "ap-quocbao",
      "applicantName": "Pham Quoc Bao",
      "positionId": "pos-comms",
      "positionName": "Communications",
      "availabilityText": "09:00-10:00, 10:00-11:00",
      "start": null,
      "end": null,
      "interviewerId": null,
      "interviewerName": null,
      "roomId": null,
      "roomName": null,
      "status": "unassigned",
      "reasons": ["The deterministic draft left this application for manual assignment."],
      "conflictWith": []
    }
  ],
  "summary": { "total": 3, "proposed": 0, "conflict": 2, "unassigned": 1 },
  "status": "draft",
  "dirty": true,
  "generatedAt": "2026-11-17T10:20:00+07:00",
  "savedAt": null,
  "confirmedAt": null,
  "canConfirm": false,
  "zeroShortlisted": false,
  "conditions": [
    { "code": "APPLICATIONS_CLOSED", "label": "Applications are closed", "met": true, "detail": "Closed." },
    { "code": "ALL_REVIEWED", "label": "All applications are reviewed", "met": true, "detail": "3 of 3 applications reviewed." },
    { "code": "DRAFT_SAVED", "label": "Draft changes are saved", "met": false, "detail": "Unsaved generated draft." },
    { "code": "ALL_ASSIGNED", "label": "Every shortlisted application is assigned", "met": false, "detail": "A03 is unassigned." },
    { "code": "NO_CONFLICTS", "label": "No conflicts remain", "met": false, "detail": "A01 and A02 conflict." }
  ],
  …
}
```

On this fresh draft, `POST .../schedule/confirm` (C9, described below) is refused and names the applications that block it:

```http
POST /api/campaigns/cmp-2026-hk1/schedule/confirm HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": "Schedule cannot be confirmed.",
  "code": "SCHEDULE_NOT_READY",
  "details": {
    "conditions": [
      { "code": "APPLICATIONS_CLOSED", "label": "Applications are closed", "met": true, "detail": "Closed." },
      { "code": "ALL_REVIEWED", "label": "All applications are reviewed", "met": true, "detail": "3 of 3 applications reviewed." },
      { "code": "DRAFT_SAVED", "label": "Draft changes are saved", "met": false, "detail": "Unsaved generated draft." },
      { "code": "ALL_ASSIGNED", "label": "Every shortlisted application is assigned", "met": false, "detail": "A03 is unassigned." },
      { "code": "NO_CONFLICTS", "label": "No conflicts remain", "met": false, "detail": "A01 and A02 conflict." }
    ]
  }
}
```

## PATCH /api/campaigns/{campaignId}/schedule/draft/rows/{applicationId}

**Purpose**: Edit or resolve one draft row, then recalculate every row affected by Applicant, Interviewer, and Room conflicts.

**Allowed roles**: Executive.

| Request field | Type | Rules |
| --- | --- | --- |
| `start` | timestamp | Required; on the draft's `interviewDate`, the interview (`slotMinutes` long) inside the draft's `interviewWindow` and Applicant/Interviewer availability. |
| `interviewerId` | string | Required; Interviewer is eligible for the Position. |
| `roomId` | string | Required selected Campaign Room. |

All three fields are required for a manual assignment. **Success**: `200` draft action projection with all recalculated rows and `dirty: true`. Errors: `400 VALIDATION_ERROR` with field keys; `401`; `403`; `404 APPLICATION_NOT_FOUND`; `409 NO_DRAFT`; `409 APPLICATION_NOT_SHORTLISTED`; `409 SCHEDULE_CONFIRMED`.

```http
PATCH /api/campaigns/cmp-2026-hk1/schedule/draft/rows/A02 HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{
  "start": "2026-12-02T09:30:00+07:00",
  "interviewerId": "iv-comms",
  "roomId": "room-b105"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "rows": [
    { "applicationId": "A01", "start": "2026-12-02T09:00:00+07:00", "end": "2026-12-02T09:30:00+07:00", "interviewerId": "iv-giahuy", "roomId": "room-a201", "status": "proposed", "reasons": [], "conflictWith": [], … },
    { "applicationId": "A02", "start": "2026-12-02T09:30:00+07:00", "end": "2026-12-02T10:00:00+07:00", "interviewerId": "iv-comms", "roomId": "room-b105", "status": "proposed", "reasons": [], "conflictWith": [], … },
    { "applicationId": "A03", "start": null, "end": null, "interviewerId": null, "roomId": null, "status": "unassigned", "reasons": ["The deterministic draft left this application for manual assignment."], "conflictWith": [], … }
  ],
  "summary": { "total": 3, "proposed": 2, "conflict": 0, "unassigned": 1 },
  "status": "draft",
  "dirty": true,
  "canConfirm": false,
  …
}
```

```http
PATCH /api/campaigns/cmp-2026-hk1/schedule/draft/rows/A03 HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{
  "start": "2026-12-02T10:00:00+07:00",
  "interviewerId": "iv-comms",
  "roomId": "room-b105"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "rows": [
    { "applicationId": "A01", "start": "2026-12-02T09:00:00+07:00", "end": "2026-12-02T09:30:00+07:00", "interviewerId": "iv-giahuy", "roomId": "room-a201", "status": "proposed", "reasons": [], "conflictWith": [], … },
    { "applicationId": "A02", "start": "2026-12-02T09:30:00+07:00", "end": "2026-12-02T10:00:00+07:00", "interviewerId": "iv-comms", "roomId": "room-b105", "status": "proposed", "reasons": [], "conflictWith": [], … },
    { "applicationId": "A03", "start": "2026-12-02T10:00:00+07:00", "end": "2026-12-02T10:30:00+07:00", "interviewerId": "iv-comms", "roomId": "room-b105", "status": "proposed", "reasons": [], "conflictWith": [], … }
  ],
  "summary": { "total": 3, "proposed": 3, "conflict": 0, "unassigned": 0 },
  "status": "draft",
  "dirty": true,
  "canConfirm": false,
  …
}
```

## POST /api/campaigns/{campaignId}/schedule/draft/save

**Purpose**: Persist the current staged draft in mock process state by clearing `dirty` and setting `savedAt`. It does not confirm or notify anyone.

**Allowed roles**: Executive.

**Request body**: None.

**Success**: `200` saved-draft action projection. Errors: `401`; `403`; `404`; `409 NO_DRAFT`; `409 SCHEDULE_CONFIRMED`.

```http
POST /api/campaigns/cmp-2026-hk1/schedule/draft/save HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "draft",
  "dirty": false,
  "savedAt": "2026-11-17T10:30:00+07:00",
  "summary": { "total": 3, "proposed": 3, "conflict": 0, "unassigned": 0 },
  "canConfirm": true,
  "conditions": [
    { "code": "APPLICATIONS_CLOSED", "label": "Applications are closed", "met": true, "detail": "Closed." },
    { "code": "ALL_REVIEWED", "label": "All applications are reviewed", "met": true, "detail": "3 of 3 applications reviewed." },
    { "code": "DRAFT_SAVED", "label": "Draft changes are saved", "met": true, "detail": "Saved." },
    { "code": "ALL_ASSIGNED", "label": "Every shortlisted application is assigned", "met": true, "detail": "3 of 3 assigned." },
    { "code": "NO_CONFLICTS", "label": "No conflicts remain", "met": true, "detail": "No conflicts." }
  ],
  "rows": [
    { "applicationId": "A01", "status": "proposed", "reasons": [], "conflictWith": [], … },
    { "applicationId": "A02", "status": "proposed", "reasons": [], "conflictWith": [], … },
    { "applicationId": "A03", "status": "proposed", "reasons": [], "conflictWith": [], … }
  ],
  …
}
```

## GET /api/campaigns/{campaignId}/schedule.csv

**Purpose**: Export current draft or confirmed timetable without private notes, CV content, or assessments.

**Allowed roles**: Executive.

**Success**: `200 text/csv; charset=utf-8`; no rows produces the header only. Errors: `401`; `403`; `404`; `409 NO_SCHEDULE`.

```http
GET /api/campaigns/cmp-2026-hk1/schedule.csv HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: text/csv
```

```http
HTTP/1.1 200 OK
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="clubflow-schedule.csv"
```

Body of that answer (CSV, so the answer block above has no body for the checker):

```text
Application ID,Applicant,Position,Start,End,Interviewer,Room,Status
A01,Nguyen Minh Anh,Content,2026-12-02T09:00:00+07:00,2026-12-02T09:30:00+07:00,Gia Huy,A-201,proposed
A02,Nguyen Minh Anh,Communications,2026-12-02T09:30:00+07:00,2026-12-02T10:00:00+07:00,Linh Tran,B-105,proposed
A03,Pham Quoc Bao,Communications,2026-12-02T10:00:00+07:00,2026-12-02T10:30:00+07:00,Linh Tran,B-105,proposed
```

## POST /api/campaigns/{campaignId}/schedule/confirm

**Purpose**: Atomically validate and confirm the saved schedule. Confirmation locks Campaign, setup, screening, and schedule records and makes own/assigned interviews visible.

**Allowed roles**: Executive.

**Request body**: None.

**Success**: `200` confirmation action projection with every row `confirmed`. Errors: `401`; `403`; `404`; `409 SCHEDULE_NOT_READY` with `details.conditions`; `409 SCHEDULE_ALREADY_CONFIRMED`.

```http
POST /api/campaigns/cmp-2026-hk1/schedule/confirm HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "confirmed",
  "dirty": false,
  "confirmedAt": "2026-11-17T10:40:00+07:00",
  "summary": { "total": 3, "proposed": 0, "conflict": 0, "unassigned": 0 },
  "canConfirm": false,
  "conditions": [
    { "code": "APPLICATIONS_CLOSED", "label": "Applications are closed", "met": true, "detail": "Closed." },
    { "code": "ALL_REVIEWED", "label": "All applications are reviewed", "met": true, "detail": "3 of 3 applications reviewed." },
    { "code": "DRAFT_SAVED", "label": "Draft changes are saved", "met": true, "detail": "Saved." },
    { "code": "ALL_ASSIGNED", "label": "Every shortlisted application is assigned", "met": true, "detail": "3 of 3 assigned." },
    { "code": "NO_CONFLICTS", "label": "No conflicts remain", "met": true, "detail": "No conflicts." }
  ],
  "rows": [
    { "interviewId": "int-A01", "applicationId": "A01", "status": "confirmed", "reasons": [], "conflictWith": [], … },
    { "interviewId": "int-A02", "applicationId": "A02", "status": "confirmed", "reasons": [], "conflictWith": [], … },
    { "interviewId": "int-A03", "applicationId": "A03", "status": "confirmed", "reasons": [], "conflictWith": [], … }
  ],
  …
}
```

After confirmation the schedule is read-only, so generating again is refused:

```http
POST /api/campaigns/cmp-2026-hk1/schedule/draft/generate HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json

{"interviewDate": "2026-12-02", "interviewWindow": {"start": "09:00", "end": "12:00"}, "slotMinutes": 30}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": "Schedule is already confirmed.",
  "code": "SCHEDULE_CONFIRMED"
}
```

## Changes

- 2026-11-21 (PA#4): Added the PA#4 starting state: this file runs alone on a fresh seed and must first close applications and shortlist A01–A03 through the API (opening requests still to be written by the file's owner, tasks.md T013). Generation is now first-fit in the product owners' Q-01 order with no backtracking, replacing the PA#3 mock's fixed placement; the example rows will be updated with the opening requests. Why: PA#4 runs each contract file on a fresh seed, and rule R5.
- 2026-11-20: `POST .../schedule/draft/generate` now takes a required body `{ interviewDate, interviewWindow: { start, end }, slotMinutes }`, validated field by field (`400 VALIDATION_ERROR`). Before, it took no body and the draft always used the Campaign's date, window and duration, so the Executive could not choose them on the Scheduling screen as step C8 requires. The chosen values are kept as the draft's `settings` (row edits are checked against them); the Campaign's configuration, which Q-03 locks and Applicants' availability depends on, is unchanged. Added error examples: two `400` for generate (missing fields, impossible values), `409 SCHEDULE_NOT_READY` for a confirmation refused on the fresh draft, and `409 SCHEDULE_CONFIRMED` for a generate after confirmation. Requested by the team (2026-11-20); the front end is changed in the same commit.

- 2026-11-19: Schedule rows now carry `availabilityText` (the Applicant's chosen slots, for example `09:00-10:00, 10:00-11:00`). The Scheduling screen has a column for it that was always empty because the contract and the mock did not send it; the Executive needs it to place an interview inside the Applicant's availability.
- 2026-11-19: The mock now names the applications in the confirmation conditions (`ALL_ASSIGNED`: "A03 is unassigned.", `NO_CONFLICTS`: "A01 and A02 conflict.") and uses the example texts for the unsaved and no-draft cases, as the examples already showed; it said "Resolve draft conflicts." and "0 of 3 assigned." before, so a refused confirmation did not name the applications. The `APPLICATIONS_CLOSED` example detail is now `Closed.`, which is what the mock answers.
- 2026-11-19: The schedule CSV example no longer carries its body inside the `http` answer block (see the same change in `03-review-files.md`).
- 2026-11-19: Mutation examples (generate, row edit, save, confirm) now end with `…`, and the prose says mutation responses return the canonical schedule view. The mock already returned the full view, so the earlier "action projection" wording and the shorter examples did not match it; found by sending every example to a freshly started mock.
- 2026-11-18: Defined complete schedule DTOs, deterministic Conflict/Unassigned generation, recalculated row edits, meaningful dirty/save semantics, CSV, readiness conditions, refusal behavior, confirmation, and locks.
