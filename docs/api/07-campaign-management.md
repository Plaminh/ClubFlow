# Campaign Management and Interview Setup

These Executive endpoints cover C3 and C4. Campaign preview is intentionally client-side because it renders unsaved form values; no preview endpoint is needed. `GET /campaigns/{campaignId}` returns the composite read model, so a redundant `GET /interview-setup` endpoint is not exposed.

## Campaign Write Fields

| Field | Type | Rules |
| --- | --- | --- |
| `name` | string | Required to publish; trimmed 1-120 characters. |
| `hostClub` | string | Required to publish; trimmed 1-120 characters. |
| `description` | string | Required to publish; trimmed 1-4000 characters. |
| `instructions` | string | Required to publish; trimmed 1-2000 characters. |
| `opensOn` | date | Required to publish. |
| `closesOn` | date | Required to publish; `opensOn <= closesOn < interviewDate`. |
| `positions` | array | Required to publish with at least one Position. |

Position input fields are optional stable `id` for update, required `departmentName` (1-120), required `name` (1-120), positive integer `quota`, required `description` (1-2000), and required `requirements` (1-2000). A draft may temporarily contain incomplete values, but publish validates all fields.

## GET /api/campaigns/{campaignId}

**Purpose**: Return the Executive Campaign view, Position application counts, derived phase/locks, public slots, and composite Interview Setup read model.

**Allowed roles**: Executive.

**Success**: `200`. Errors: `401 INVALID_TOKEN`; `403 ROLE_FORBIDDEN`; `404 CAMPAIGN_NOT_FOUND`.

```http
GET /api/campaigns/cmp-2026-hk1 HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "campaign": {
    "id": "cmp-2026-hk1",
    "name": "ClubFlow 2026 Recruitment",
    "hostClub": "Technology and Innovation Club",
    "description": "Recruitment for the club's 2026 team.",
    "instructions": "Submit one application per position.",
    "opensOn": "2026-11-10",
    "closesOn": "2026-11-30",
    "applicationsClosedAt": "2026-11-17T10:00:00+07:00",
    "interviewDate": "2026-12-02",
    "interviewWindow": { "start": "09:00", "end": "12:00" },
    "slotMinutes": 30,
    "status": "published",
    "publishedAt": "2026-11-09T09:00:00+07:00"
  },
  "phase": "closed",
  "positions": [
    {
      "id": "pos-content",
      "departmentId": "dep-comms",
      "departmentName": "Communications",
      "name": "Content",
      "quota": 2,
      "description": "Create useful club content.",
      "requirements": "Clear writing.",
      "applicationCount": 1
    },
    {
      "id": "pos-comms",
      "departmentId": "dep-comms",
      "departmentName": "Communications",
      "name": "Communications",
      "quota": 2,
      "description": "Coordinate recruitment communications.",
      "requirements": "Clear speaking and dependable coordination.",
      "applicationCount": 2
    }
  ],
  "slots": [
    { "id": "slot-0900", "start": "2026-12-02T09:00:00+07:00", "end": "2026-12-02T10:00:00+07:00" },
    { "id": "slot-1000", "start": "2026-12-02T10:00:00+07:00", "end": "2026-12-02T11:00:00+07:00" }
  ],
  "interviewSetup": {
    "interviewers": [
      { "id": "iv-giahuy", "name": "Gia Huy" },
      { "id": "iv-comms", "name": "Linh Tran" }
    ],
    "rooms": [
      { "id": "room-a201", "name": "A-201" },
      { "id": "room-b105", "name": "B-105" }
    ],
    "assignments": [
      { "interviewerId": "iv-giahuy", "interviewerName": "Gia Huy", "positionIds": ["pos-content"], "positionNames": ["Content"], "availability": [{ "start": "2026-12-02T09:00:00+07:00", "end": "2026-12-02T12:00:00+07:00" }], "availabilityText": "09:00-12:00" },
      { "interviewerId": "iv-comms", "interviewerName": "Linh Tran", "positionIds": ["pos-comms"], "positionNames": ["Communications"], "availability": [{ "start": "2026-12-02T09:00:00+07:00", "end": "2026-12-02T12:00:00+07:00" }], "availabilityText": "09:00-12:00" }
    ],
    "roomIds": ["room-a201", "room-b105"],
    "locked": true,
    "lockReason": "scheduleConfirmed"
  },
  "locked": true,
  "lockReason": "scheduleConfirmed"
}
```

## POST /api/campaigns

**Purpose**: Create a new draft Campaign with Positions. PA#3 permits only one public primary Campaign at a time; a future draft is not returned by `/campaigns/current`.

**Allowed roles**: Executive.

**Request fields**: Campaign Write Fields. Initial `interviewDate`, `interviewWindow`, and `slotMinutes` are also required so availability slots can be previewed; Interviewer/room selections are configured by the setup endpoint.

**Success**: `201` composite Campaign view. Errors: `400 VALIDATION_ERROR`; `401`; `403`; `409 ACTIVE_CAMPAIGN_CONFLICT` only if dates would create two simultaneously active published Campaigns.

```http
POST /api/campaigns HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{
  "name": "ClubFlow 2027 Recruitment",
  "hostClub": "Technology and Innovation Club",
  "description": "Recruit the next club cohort.",
  "instructions": "Choose a position and submit one PDF CV.",
  "opensOn": "2027-01-10",
  "closesOn": "2027-01-25",
  "interviewDate": "2027-02-01",
  "interviewWindow": { "start": "09:00", "end": "12:00" },
  "slotMinutes": 30,
  "positions": [
    {
      "departmentName": "Communications",
      "name": "Content",
      "quota": 2,
      "description": "Create useful club content.",
      "requirements": "Clear writing."
    }
  ]
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "campaign": {
    "id": "cmp-2027-hk1",
    "name": "ClubFlow 2027 Recruitment",
    "hostClub": "Technology and Innovation Club",
    "description": "Recruit the next club cohort.",
    "instructions": "Choose a position and submit one PDF CV.",
    "opensOn": "2027-01-10",
    "closesOn": "2027-01-25",
    "applicationsClosedAt": null,
    "interviewDate": "2027-02-01",
    "interviewWindow": { "start": "09:00", "end": "12:00" },
    "slotMinutes": 30,
    "status": "draft",
    "publishedAt": null
  },
  "phase": "draft",
  "positions": [
    { "id": "pos-2027-content", "departmentId": "dep-comms", "departmentName": "Communications", "name": "Content", "quota": 2, "description": "Create useful club content.", "requirements": "Clear writing.", "applicationCount": 0 }
  ],
  "slots": [
    { "id": "slot-2027-0900", "start": "2027-02-01T09:00:00+07:00", "end": "2027-02-01T10:00:00+07:00" },
    { "id": "slot-2027-1000", "start": "2027-02-01T10:00:00+07:00", "end": "2027-02-01T11:00:00+07:00" },
    { "id": "slot-2027-1100", "start": "2027-02-01T11:00:00+07:00", "end": "2027-02-01T12:00:00+07:00" }
  ],
  "interviewSetup": {
    "interviewers": [
      { "id": "iv-giahuy", "name": "Gia Huy" },
      { "id": "iv-comms", "name": "Linh Tran" }
    ],
    "rooms": [
      { "id": "room-a201", "name": "A-201" },
      { "id": "room-b105", "name": "B-105" }
    ],
    "assignments": [],
    "roomIds": [],
    "locked": false,
    "lockReason": null
  },
  "locked": false,
  "lockReason": null
}
```

## PATCH /api/campaigns/{campaignId}

**Purpose**: Save Campaign details and upsert Positions. Omitted fields are unchanged.

**Allowed roles**: Executive.

**Draft behavior**: Any Campaign Write Field may be updated; Position entries with `id` update, entries without `id` are added.

**Published behavior before confirmation**: Name, host, description, instructions, `opensOn`, `closesOn`, Position additions, and quotas/descriptions/requirements may change when resulting dates remain valid. Interview date/window/duration are not accepted here. Linked Position deletion uses DELETE and is refused.

**Success**: `200` composite view. Errors: `400 VALIDATION_ERROR`; `401`; `403`; `404`; `409 CAMPAIGN_CONFIRMED`; `409 ACTIVE_CAMPAIGN_CONFLICT`.

```http
PATCH /api/campaigns/cmp-2027-hk1 HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{
  "description": "Recruit the next club cohort with practical project work.",
  "positions": [
    {
      "id": "pos-2027-content",
      "departmentName": "Communications",
      "name": "Content",
      "quota": 2,
      "description": "Create useful club content.",
      "requirements": "Clear writing and collaboration."
    },
    {
      "departmentName": "Operations",
      "name": "Event Operations",
      "quota": 1,
      "description": "Coordinate recruitment-day logistics.",
      "requirements": "Reliable planning."
    }
  ]
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "campaign": { "id": "cmp-2027-hk1", "description": "Recruit the next club cohort with practical project work.", "status": "draft" },
  "positions": [
    { "id": "pos-2027-content", "name": "Content", "quota": 2, "applicationCount": 0 },
    { "id": "pos-2027-operations", "name": "Event Operations", "quota": 1, "applicationCount": 0 }
  ],
  "locked": false,
  "lockReason": null
}
```

## DELETE /api/campaigns/{campaignId}/positions/{positionId}

**Purpose**: Remove an unlinked Position.

**Allowed roles**: Executive.

**Success**: `200` composite Campaign view. Errors: `401`; `403`; `404 POSITION_NOT_FOUND`; `409 POSITION_HAS_APPLICATIONS`; `409 CAMPAIGN_CONFIRMED`.

```http
DELETE /api/campaigns/cmp-2027-hk1/positions/pos-2027-operations HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "campaign": { "id": "cmp-2027-hk1", "status": "draft" },
  "positions": [
    { "id": "pos-2027-content", "name": "Content", "quota": 2, "applicationCount": 0 }
  ],
  "locked": false,
  "lockReason": null
}
```

## PATCH /api/campaigns/{campaignId}/interview-setup

**Purpose**: Save the composite C4 setup: interview date/window/duration, selected existing rooms, Interviewer Position eligibility, and Interviewer availability.

**Allowed roles**: Executive.

| Request field | Type | Rules |
| --- | --- | --- |
| `interviewDate` | date | Required; after Campaign closing date. |
| `interviewWindow` | object | Required `{ start, end }`; valid local times with start before end. |
| `slotMinutes` | integer | Required exactly 15, 20, or 30; at least one interval fits window. |
| `roomIds` | string array | At least one unique existing Room ID. |
| `assignments` | array | At least one; unique `interviewerId`, non-empty valid `positionIds`, non-empty valid availability intervals inside interview date. |

**Success**: `200` composite Campaign view. Errors: `400 VALIDATION_ERROR` with nested field paths; `401`; `403`; `404`; `409 INTERVIEW_SETUP_LOCKED` after first valid Application; `409 CAMPAIGN_CONFIRMED`.

```http
PATCH /api/campaigns/cmp-2027-hk1/interview-setup HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{
  "interviewDate": "2027-02-01",
  "interviewWindow": { "start": "09:00", "end": "12:00" },
  "slotMinutes": 30,
  "roomIds": ["room-a201", "room-b105"],
  "assignments": [
    {
      "interviewerId": "iv-giahuy",
      "positionIds": ["pos-2027-content"],
      "availability": [
        { "start": "2027-02-01T09:00:00+07:00", "end": "2027-02-01T12:00:00+07:00" }
      ]
    }
  ]
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "campaign": { "id": "cmp-2027-hk1", "interviewDate": "2027-02-01", "interviewWindow": { "start": "09:00", "end": "12:00" }, "slotMinutes": 30, "status": "draft" },
  "interviewSetup": {
    "interviewers": [
      { "id": "iv-giahuy", "name": "Gia Huy" },
      { "id": "iv-comms", "name": "Linh Tran" }
    ],
    "rooms": [
      { "id": "room-a201", "name": "A-201" },
      { "id": "room-b105", "name": "B-105" }
    ],
    "assignments": [
      { "interviewerId": "iv-giahuy", "interviewerName": "Gia Huy", "positionIds": ["pos-2027-content"], "positionNames": ["Content"], "availability": [{ "start": "2027-02-01T09:00:00+07:00", "end": "2027-02-01T12:00:00+07:00" }], "availabilityText": "09:00-12:00" }
    ],
    "roomIds": ["room-a201", "room-b105"],
    "locked": false,
    "lockReason": null
  },
  "locked": false,
  "lockReason": null
}
```

## POST /api/campaigns/{campaignId}/publish

**Purpose**: Validate and publish one draft Campaign.

**Allowed roles**: Executive.

**Request body**: None. The caller must save current form values first.

**Validation**: Required Campaign and Position fields, date order, at least one Room, at least one valid Interviewer assignment for every Position, valid availability, and slot duration.

**Success**: `200` composite view with `status: published`. Errors: `400 VALIDATION_ERROR`; `401`; `403`; `404`; `409 CAMPAIGN_ALREADY_PUBLISHED`; `409 ACTIVE_CAMPAIGN_CONFLICT`.

```http
POST /api/campaigns/cmp-2027-hk1/publish HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "campaign": {
    "id": "cmp-2027-hk1",
    "name": "ClubFlow 2027 Recruitment",
    "status": "published",
    "publishedAt": "2026-12-02T13:30:00+07:00",
    "opensOn": "2027-01-10",
    "closesOn": "2027-01-25"
  },
  "phase": "before-open",
  "positions": [
    { "id": "pos-2027-content", "name": "Content", "quota": 2, "applicationCount": 0 }
  ],
  "locked": false,
  "lockReason": null
}
```

Constrained published edit before any Application:

```http
PATCH /api/campaigns/cmp-2027-hk1 HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{
  "closesOn": "2027-01-26",
  "positions": [
    {
      "id": "pos-2027-content",
      "departmentName": "Communications",
      "name": "Content",
      "quota": 3,
      "description": "Create useful club content.",
      "requirements": "Clear writing and collaboration."
    }
  ]
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "campaign": { "id": "cmp-2027-hk1", "status": "published", "closesOn": "2027-01-26" },
  "phase": "before-open",
  "positions": [
    { "id": "pos-2027-content", "name": "Content", "quota": 3, "applicationCount": 0 }
  ],
  "locked": false,
  "lockReason": null
}
```

## Changes

- 2026-11-18: Defined minimized composite Campaign/setup reads, draft creation/save/publish, Position upsert/removal, exact C4 validation, constrained Q-03 published edits, first-Application setup lock, and confirmed lock.
