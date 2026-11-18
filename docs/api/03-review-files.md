# Executive Application Review and Protected Files

These endpoints cover C7 and preserve per-Application independence. Every endpoint requires Executive role except the protected CV endpoint, which additionally supports owner/assignment-based access.

## GET /api/campaigns/{campaignId}/applications

**Purpose**: Return the Executive review page, including paginated summaries, filter-aware statistics, and Position filter options in one request.

**Allowed roles**: Executive.

| Query field | Type | Rules |
| --- | --- | --- |
| `search` | string | Optional, maximum 100 characters; matches Application ID or Applicant name, case-insensitive. |
| `positionId` | string | Optional Campaign Position ID. |
| `status` | string | Optional `pendingReview`, `shortlisted`, or `rejected`. |
| `sort` | string | Optional `newest` (default) or `oldest`. |
| `page` | integer | Optional, minimum 1, default 1. |
| `pageSize` | integer | Optional 1-50, default 5. |

**Success**: `200`. An empty filtered page uses `items: []`, `total: 0`, `pageCount: 0`, and zero `filtered` counts; Campaign-wide counts remain accurate.

**Errors**: `400 INVALID_QUERY`; `401 INVALID_TOKEN`; `403 ROLE_FORBIDDEN`; `404 CAMPAIGN_NOT_FOUND`.

```http
GET /api/campaigns/cmp-2026-hk1/applications?sort=oldest&page=1&pageSize=5 HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "items": [
    {
      "id": "A01",
      "applicantId": "ap-minhanh",
      "applicantName": "Nguyen Minh Anh",
      "positionId": "pos-content",
      "positionName": "Content",
      "submittedAt": "2026-11-17T09:10:00+07:00",
      "screeningStatus": "pendingReview"
    },
    {
      "id": "A02",
      "applicantId": "ap-minhanh",
      "applicantName": "Nguyen Minh Anh",
      "positionId": "pos-comms",
      "positionName": "Communications",
      "submittedAt": "2026-11-17T09:12:00+07:00",
      "screeningStatus": "pendingReview"
    },
    {
      "id": "A03",
      "applicantId": "ap-quocbao",
      "applicantName": "Pham Quoc Bao",
      "positionId": "pos-comms",
      "positionName": "Communications",
      "submittedAt": "2026-11-17T09:14:00+07:00",
      "screeningStatus": "pendingReview"
    }
  ],
  "total": 3,
  "page": 1,
  "pageSize": 5,
  "pageCount": 1,
  "stats": {
    "campaign": { "applications": 3, "applicants": 2, "pendingReview": 3, "shortlisted": 0, "rejected": 0 },
    "filtered": { "applications": 3, "applicants": 2, "pendingReview": 3, "shortlisted": 0, "rejected": 0 },
    "isFiltered": false
  },
  "positions": [
    { "id": "pos-content", "name": "Content" },
    { "id": "pos-comms", "name": "Communications" }
  ]
}
```

## GET /api/campaigns/{campaignId}/applications/{applicationId}

**Purpose**: Return one Executive Application detail with immutable Student snapshot, statement, availability text, CV metadata, private note, sibling IDs, and lock state.

**Allowed roles**: Executive.

**Success**: `200`. Errors: `401 INVALID_TOKEN`; `403 ROLE_FORBIDDEN`; `404 APPLICATION_NOT_FOUND`.

```http
GET /api/campaigns/cmp-2026-hk1/applications/A01 HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "A01",
  "applicantId": "ap-minhanh",
  "applicantName": "Nguyen Minh Anh",
  "positionId": "pos-content",
  "positionName": "Content",
  "submittedAt": "2026-11-17T09:10:00+07:00",
  "screeningStatus": "pendingReview",
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
  "reviewedAt": null,
  "privateNote": "",
  "siblingIds": ["A02"],
  "locked": false
}
```

## PATCH /api/campaigns/{campaignId}/applications/{applicationId}/private-note

**Purpose**: Save the Executive-only internal note for one Application.

**Allowed roles**: Executive.

| Request field | Type | Rules |
| --- | --- | --- |
| `note` | string | Required; may be empty; maximum 2000 characters. |

**Success**: `200` with updated detail. Errors: `400 VALIDATION_ERROR`; `401`; `403`; `404 APPLICATION_NOT_FOUND`; `409 SCHEDULE_CONFIRMED`.

```http
PATCH /api/campaigns/cmp-2026-hk1/applications/A01/private-note HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{
  "note": "Ask for a concrete example of cross-team content planning."
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "A01",
  "privateNote": "Ask for a concrete example of cross-team content planning.",
  "screeningStatus": "pendingReview",
  "locked": false
}
```

## POST /api/campaigns/{campaignId}/applications/{applicationId}/screening-decision

**Purpose**: Record the immutable CV-screening decision for exactly one Application.

**Allowed roles**: Executive.

| Request field | Type | Rules |
| --- | --- | --- |
| `decision` | string | Required `shortlisted` or `rejected`. |

**Success**: `200` with updated Application summary. Errors: `400 VALIDATION_ERROR`; `401`; `403`; `404 APPLICATION_NOT_FOUND`; `409 SCREENING_ALREADY_DECIDED`; `409 SCHEDULE_CONFIRMED`.

```http
POST /api/campaigns/cmp-2026-hk1/applications/A01/screening-decision HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{ "decision": "shortlisted" }
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "A01",
  "screeningStatus": "shortlisted",
  "reviewedAt": "2026-11-17T10:05:00+07:00"
}
```

```http
POST /api/campaigns/cmp-2026-hk1/applications/A02/screening-decision HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{ "decision": "shortlisted" }
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "A02",
  "screeningStatus": "shortlisted",
  "reviewedAt": "2026-11-17T10:07:00+07:00"
}
```

```http
POST /api/campaigns/cmp-2026-hk1/applications/A03/screening-decision HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{ "decision": "shortlisted" }
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "A03",
  "screeningStatus": "shortlisted",
  "reviewedAt": "2026-11-17T10:09:00+07:00"
}
```

## GET /api/campaigns/{campaignId}/applications.csv

**Purpose**: Export the current Executive list filter without CV content or private notes.

**Allowed roles**: Executive.

**Query fields**: `search`, `positionId`, `status`, and `sort` use the list rules; pagination is ignored.

**Success**: `200 text/csv; charset=utf-8` with `Content-Disposition`. An empty filter returns the header row only. Errors: `400 INVALID_QUERY`; `401`; `403`; `404 CAMPAIGN_NOT_FOUND`.

```http
GET /api/campaigns/cmp-2026-hk1/applications.csv?status=shortlisted&sort=oldest HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: text/csv
```

```http
HTTP/1.1 200 OK
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="clubflow-applications.csv"

Application ID,Applicant,Student ID,Email,Position,Submitted At,Status
A01,Nguyen Minh Anh,26DEMO0142,minh.anh@demo.example,Content,2026-11-17T09:10:00+07:00,shortlisted
A02,Nguyen Minh Anh,26DEMO0142,minh.anh@demo.example,Communications,2026-11-17T09:12:00+07:00,shortlisted
A03,Pham Quoc Bao,26DEMO0177,quoc.bao@demo.example,Communications,2026-11-17T09:14:00+07:00,shortlisted
```

## GET /api/applications/{applicationId}/cv

**Purpose**: Return protected PDF CV content.

**Allowed roles**: Owning Applicant; Executive for an Application in the Campaign; assigned Interviewer after confirmation. The endpoint returns `403 CV_FORBIDDEN` for a known but unauthorized record and never returns Executive private notes.

**Success**: `200 application/pdf` with safe `Content-Disposition`. Errors: `401 INVALID_TOKEN`; `403 CV_FORBIDDEN`; `404 APPLICATION_NOT_FOUND`.

```http
GET /api/applications/A01/cv HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/pdf
```

```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: inline; filename="cv.pdf"
Content-Length: 204800

[binary PDF body]
```

## Changes

- 2026-11-18: Added composite list/statistics semantics, exact query limits, independent A01/A02/A03 decisions, note limits, permitted CSV fields, protected CV authorization, and deterministic examples.
