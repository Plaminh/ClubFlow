# Public Campaign and Applicant Applications

These endpoints cover C1, C5, C6, and the business transition from accepting applications to review/scheduling.

## GET /api/campaigns/current

**Purpose**: Return the one public primary campaign. Draft Campaigns are never returned.

**Allowed roles**: Public.

**Success**: `200` with Campaign, derived phase, public Positions, Applicant availability slots, and `acceptingApplications`. The endpoint returns `404 NO_PUBLIC_CAMPAIGN` only when no published campaign exists; empty Position/slot arrays remain a `200` response.

```http
GET /api/campaigns/current HTTP/1.1
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
    "applicationsClosedAt": null,
    "interviewDate": "2026-12-02",
    "interviewWindow": { "start": "09:00", "end": "12:00" },
    "slotMinutes": 30,
    "status": "published",
    "publishedAt": "2026-11-09T09:00:00+07:00"
  },
  "phase": "open",
  "acceptingApplications": true,
  "positions": [
    {
      "id": "pos-content",
      "departmentId": "dep-comms",
      "departmentName": "Communications",
      "name": "Content",
      "quota": 2,
      "description": "Create campaign content.",
      "requirements": "Clear writing and collaboration."
    },
    {
      "id": "pos-comms",
      "departmentId": "dep-comms",
      "departmentName": "Communications",
      "name": "Communications",
      "quota": 2,
      "description": "Coordinate recruitment communications.",
      "requirements": "Clear speaking and dependable coordination."
    }
  ],
  "slots": [
    {
      "id": "slot-0900",
      "start": "2026-12-02T09:00:00+07:00",
      "end": "2026-12-02T10:00:00+07:00"
    },
    {
      "id": "slot-1000",
      "start": "2026-12-02T10:00:00+07:00",
      "end": "2026-12-02T11:00:00+07:00"
    }
  ]
}
```

## POST /api/applications

**Purpose**: Create one immutable Application for the authenticated Applicant and one Position.

**Allowed roles**: Applicant.

**Content type**: `multipart/form-data`.

| Field | Type | Rules |
| --- | --- | --- |
| `campaignId` | string | Required; published and accepting. |
| `positionId` | string | Required; belongs to Campaign. |
| `email` | string | Required valid email, maximum 254 characters; stored in Student snapshot. |
| `faculty` | string | Required trimmed string, 1-120 characters; stored in Student snapshot. |
| `sop` | string | Required; 1-300 whitespace-delimited words. |
| `slotIds` | repeated string | At least one unique Campaign slot ID. |
| `cv` | file | Exactly one PDF, maximum `5 * 1024 * 1024` bytes. |

**Success**: `201` with the Applicant-safe Application DTO.

**Errors**: `400 VALIDATION_ERROR` with field keys above; `401 INVALID_TOKEN`; `403 ROLE_FORBIDDEN`; `404 CAMPAIGN_NOT_FOUND` or `POSITION_NOT_FOUND`; `409 APPLICATIONS_CLOSED`; `409 DUPLICATE_APPLICATION` with `details.existingApplicationId`.

The first successful Application locks interview date/window/duration and Campaign slots; in the seed, A01–A03 already exist, so the setup is locked from the start.

These examples start from the seed (README, Seed State): Student C has no application, so their Content application gets the next id, `A04`. `submittedAt` is the server's time of submission and is shown as `"…"`.

```sh
curl -i -X POST http://localhost:3001/api/applications \
  -H "Authorization: Bearer {{token:studentC}}" \
  -F "campaignId=cmp-2026-hk1" \
  -F "positionId=pos-content" \
  -F "email=lan.chi@demo.example" \
  -F "faculty=Business Administration" \
  -F "sop=I would like to write clear posts that help new members find the right team." \
  -F "slotIds=slot-0900" \
  -F "slotIds=slot-1000" \
  -F "cv=@{{file:cv.pdf:200KB}};type=application/pdf"
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "A04",
  "campaignId": "cmp-2026-hk1",
  "applicantId": "ap-lanchi",
  "positionId": "pos-content",
  "positionName": "Content",
  "submittedAt": "…",
  "slotIds": ["slot-0900", "slot-1000"],
  "sop": "I would like to write clear posts that help new members find the right team.",
  "cv": { "fileName": "cv.pdf", "sizeBytes": 204800 },
  "screeningStatus": "pendingReview",
  "confirmedInterview": null,
  "result": null
}
```

The same Applicant may create an independent Application for another Position:

```sh
curl -i -X POST http://localhost:3001/api/applications \
  -H "Authorization: Bearer {{token:studentC}}" \
  -F "campaignId=cmp-2026-hk1" \
  -F "positionId=pos-comms" \
  -F "email=lan.chi@demo.example" \
  -F "faculty=Business Administration" \
  -F "sop=I can keep announcements consistent across the club's channels." \
  -F "slotIds=slot-1000" \
  -F "cv=@{{file:cv.pdf:200KB}};type=application/pdf"
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "A05",
  "campaignId": "cmp-2026-hk1",
  "applicantId": "ap-lanchi",
  "positionId": "pos-comms",
  "positionName": "Communications",
  "submittedAt": "…",
  "slotIds": ["slot-1000"],
  "sop": "I can keep announcements consistent across the club's channels.",
  "cv": { "fileName": "cv.pdf", "sizeBytes": 204800 },
  "screeningStatus": "pendingReview",
  "confirmedInterview": null,
  "result": null
}
```

Student A already has A01 for Content (seed); a second Content application is refused, names A01 and stores nothing:

```sh
curl -i -X POST http://localhost:3001/api/applications \
  -H "Authorization: Bearer {{token:studentA}}" \
  -F "campaignId=cmp-2026-hk1" \
  -F "positionId=pos-content" \
  -F "email=minh.anh@demo.example" \
  -F "faculty=Information Technology" \
  -F "sop=I want to contribute clear and useful recruitment content for the club." \
  -F "slotIds=slot-0900" \
  -F "cv=@{{file:cv.pdf:200KB}};type=application/pdf"
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": "You have already applied for this position.",
  "code": "DUPLICATE_APPLICATION",
  "details": { "existingApplicationId": "A01" }
}
```

## GET /api/me/applications

**Purpose**: List only the authenticated Applicant's Applications.

**Allowed roles**: Applicant.

**Query**: Optional `campaignId` stable ID.

**Visibility**: `confirmedInterview` is non-null only after Schedule confirmation; `result` is non-null only after result publication. CV content and Executive private notes are not returned.

**Success**: `200` with `{ items }`, including `items: []` when none. Errors: `400 INVALID_QUERY`; `401 INVALID_TOKEN`; `403 ROLE_FORBIDDEN`.

```http
GET /api/me/applications?campaignId=cmp-2026-hk1 HTTP/1.1
Authorization: Bearer {{token:studentA}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "items": [
    {
      "id": "A01",
      "campaignId": "cmp-2026-hk1",
      "campaignName": "ClubFlow 2026 Recruitment",
      "positionId": "pos-content",
      "positionName": "Content",
      "submittedAt": "2026-11-17T09:10:00+07:00",
      "screeningStatus": "pendingReview",
      "confirmedInterview": null,
      "result": null
    },
    {
      "id": "A02",
      "campaignId": "cmp-2026-hk1",
      "campaignName": "ClubFlow 2026 Recruitment",
      "positionId": "pos-comms",
      "positionName": "Communications",
      "submittedAt": "2026-11-17T09:12:00+07:00",
      "screeningStatus": "pendingReview",
      "confirmedInterview": null,
      "result": null
    }
  ]
}
```

## POST /api/campaigns/{campaignId}/close-applications

**Purpose**: Close a published accepting Campaign early through a real Executive business action so review and scheduling can begin. This is not a clock-control endpoint.

**Allowed roles**: Executive.

**Path field**: `campaignId`, required stable Campaign ID.

**Request body**: None.

**Success**: `200` with the updated Campaign summary. Errors: `401 INVALID_TOKEN`; `403 ROLE_FORBIDDEN`; `404 CAMPAIGN_NOT_FOUND`; `409 CAMPAIGN_NOT_ACCEPTING`; `409 CAMPAIGN_LOCKED` after confirmation.

```http
POST /api/campaigns/cmp-2026-hk1/close-applications HTTP/1.1
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
    "status": "published",
    "applicationsClosedAt": "…"
  },
  "phase": "closed",
  "acceptingApplications": false
}
```

## Changes

- 2026-11-21 (PA#4): This file runs alone on a fresh seed, where A01 and A02 (Student A) and A03 (Student B) already exist. The submission examples now use Student C: Content creates `A04` and Communications `A05` (was Student A creating A01 and A02 and Student B creating A03). Added the refused duplicate: Student A applying for Content again gets `409 DUPLICATE_APPLICATION` with `details.existingApplicationId: "A01"` (rule R3). `submittedAt` and `applicationsClosedAt` are server times, shown as `"…"`. `GET /api/me/applications` for Student A still lists the seeded A01 and A02. Why: the PA#4 seed state and the rule that each contract file runs on its own.
- 2026-11-18: Added the final public campaign projection, three coherent multipart examples with supported token/file placeholders, own-application visibility rules, duplicate/closed errors, and the Executive early-close bridge used by the main flow.
