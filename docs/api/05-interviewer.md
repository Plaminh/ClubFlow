# Interviewer Workspace and Assessments

These endpoints cover C10. Every response is assignment-scoped and omits Executive private notes and unpublished final decisions.

**Starting state (PA#4).** Runs alone on a fresh seed. Interviews exist only after confirmation, so the file must start with requests that, through the API, close applications, shortlist A01–A03, generate, resolve, save and confirm the schedule (as in [04-scheduling.md](04-scheduling.md)). Interview ids are those that the confirmation creates. An Interviewer asking for an interview not assigned to them gets `404 INTERVIEW_NOT_FOUND` (README, Access Rule). Those opening requests are written by the owner of this file before the server code (tasks.md T013, T047).

## GET /api/me/interviews

**Purpose**: List confirmed Interviews assigned to the authenticated Interviewer.

**Allowed roles**: Interviewer.

**Query**: Optional `campaignId` stable ID.

**Success**: `200` with Campaign context and `interviews`. Before confirmation or with no assignments, `interviews` is `[]`; that is not an error.

**Errors**: `400 INVALID_QUERY`; `401 INVALID_TOKEN`; `403 ROLE_FORBIDDEN`.

```http
GET /api/me/interviews?campaignId=cmp-2026-hk1 HTTP/1.1
Authorization: Bearer {{token:int-content}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "scheduleConfirmed": true,
  "campaignId": "cmp-2026-hk1",
  "campaignName": "ClubFlow 2026 Recruitment",
  "interviewDate": "2026-12-02",
  "interviews": [
    {
      "interviewId": "int-A01",
      "applicationId": "A01",
      "applicantName": "Nguyen Minh Anh",
      "positionId": "pos-content",
      "positionName": "Content",
      "start": "2026-12-02T09:00:00+07:00",
      "end": "2026-12-02T09:30:00+07:00",
      "roomId": "room-a201",
      "roomName": "A-201",
      "completed": true,
      "assessmentSubmitted": false
    }
  ]
}
```

## GET /api/interviews/{interviewId}

**Purpose**: Return one assigned Interview with permitted Application, Student snapshot, statement, availability, and CV metadata.

**Allowed roles**: Assigned Interviewer only.

**Visibility**: `privateNote`, sibling Applications, other Interviewers' details, and final result are absent.

**Success**: `200`. Errors: `401 INVALID_TOKEN`; `403 ROLE_FORBIDDEN`; `404 INTERVIEW_NOT_FOUND`.

```http
GET /api/interviews/int-A01 HTTP/1.1
Authorization: Bearer {{token:int-content}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "interviewId": "int-A01",
  "applicationId": "A01",
  "applicantName": "Nguyen Minh Anh",
  "positionId": "pos-content",
  "positionName": "Content",
  "start": "2026-12-02T09:00:00+07:00",
  "end": "2026-12-02T09:30:00+07:00",
  "roomId": "room-a201",
  "roomName": "A-201",
  "completed": true,
  "student": {
    "name": "Nguyen Minh Anh",
    "studentId": "26DEMO0142",
    "email": "minh.anh@demo.example",
    "faculty": "Information Technology",
    "year": "Year 2"
  },
  "availabilityText": "09:00-10:00, 10:00-11:00",
  "sop": "I want to contribute clear and useful recruitment content for the club.",
  "cv": {
    "fileName": "cv.pdf",
    "sizeBytes": 204800,
    "downloadPath": "/api/applications/A01/cv"
  },
  "assessment": null
}
```

## POST /api/interviews/{interviewId}/assessment

**Purpose**: Submit the one immutable Assessment for an assigned Interview, once the schedule is confirmed (rule R8; README, Business Date).

**Allowed roles**: Assigned Interviewer only.

| Request field | Type | Rules |
| --- | --- | --- |
| `notes` | string | Required trimmed value, 1-2000 characters. |
| `recommendation` | string or null | Optional `pass`, `fail`, or `null`. |

**Success**: `201` Assessment. Errors: `400 VALIDATION_ERROR`; `401`; `403 ROLE_FORBIDDEN`; `404 INTERVIEW_NOT_FOUND`; `409 SCHEDULE_NOT_CONFIRMED`; `409 ASSESSMENT_ALREADY_SUBMITTED`.

Submitting an Assessment does not create or change a Final Result.

```http
POST /api/interviews/int-A01/assessment HTTP/1.1
Authorization: Bearer {{token:int-content}}
Content-Type: application/json
Accept: application/json

{
  "notes": "Clear examples and good collaboration across teams.",
  "recommendation": "pass"
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "as-A01",
  "interviewId": "int-A01",
  "interviewerId": "iv-giahuy",
  "notes": "Clear examples and good collaboration across teams.",
  "recommendation": "pass",
  "submittedAt": "2026-12-02T13:00:00+07:00"
}
```

Communications Interviewer assessment for A02:

```http
GET /api/interviews/int-A02 HTTP/1.1
Authorization: Bearer {{token:int-comms}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "interviewId": "int-A02",
  "applicationId": "A02",
  "applicantName": "Nguyen Minh Anh",
  "positionId": "pos-comms",
  "positionName": "Communications",
  "start": "2026-12-02T09:30:00+07:00",
  "end": "2026-12-02T10:00:00+07:00",
  "roomId": "room-b105",
  "roomName": "B-105",
  "completed": true,
  "student": {
    "name": "Nguyen Minh Anh",
    "studentId": "26DEMO0142",
    "email": "minh.anh@demo.example",
    "faculty": "Information Technology",
    "year": "Year 2"
  },
  "availabilityText": "09:00-10:00, 10:00-11:00",
  "sop": "I can coordinate messages and work with different recruitment teams.",
  "cv": { "fileName": "cv.pdf", "sizeBytes": 204800, "downloadPath": "/api/applications/A02/cv" },
  "assessment": null
}
```

```http
POST /api/interviews/int-A02/assessment HTTP/1.1
Authorization: Bearer {{token:int-comms}}
Content-Type: application/json
Accept: application/json

{
  "notes": "Strong coordination examples; final decision remains with the Executive.",
  "recommendation": "fail"
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "as-A02",
  "interviewId": "int-A02",
  "interviewerId": "iv-comms",
  "notes": "Strong coordination examples; final decision remains with the Executive.",
  "recommendation": "fail",
  "submittedAt": "2026-12-02T13:02:00+07:00"
}
```

## Changes

- 2026-11-21 (PA#4): Added the PA#4 starting state (close, shortlist, generate, resolve, save and confirm through the API first; opening requests still to be written by the file's owner, tasks.md T013). An unassigned Interviewer now gets `404 INTERVIEW_NOT_FOUND` instead of `403 INTERVIEW_NOT_ASSIGNED` (README, Access Rule). Assessment is allowed once the schedule is confirmed; removed `409 INTERVIEW_NOT_COMPLETED` (rule R8; README, Business Date). Why: PA#4 seed state, S4 and R8.
- 2026-11-18: Defined assignment-scoped list/detail DTOs, explicit private-field omissions, completed-interview state, assessment limits, immutable submission, and A01/A02 deterministic examples.
