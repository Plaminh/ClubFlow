# Final Results and Applicant Notifications

These endpoints cover C11. Interviewer recommendations are advisory; only the Executive records a Pass/Fail Final Result. Applicants see only published own results.

## GET /api/campaigns/{campaignId}/results

**Purpose**: Return the Executive result workspace for reviewed Applications after Schedule confirmation.

**Allowed roles**: Executive.

**Success**: `200` with schedule context, rejected Application IDs, and result rows. Empty mode returns `rejectedIds: []` and `rows: []`.

**Errors**: `401 INVALID_TOKEN`; `403 ROLE_FORBIDDEN`; `404 CAMPAIGN_NOT_FOUND`.

```http
GET /api/campaigns/cmp-2026-hk1/results HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "scheduleConfirmed": true,
  "interviewDate": "2026-12-02",
  "rejectedIds": [],
  "rows": [
    {
      "applicationId": "A01",
      "applicantName": "Nguyen Minh Anh",
      "positionId": "pos-content",
      "positionName": "Content",
      "interviewId": "int-A01",
      "assessmentSubmitted": true,
      "decision": null,
      "recordedAt": null,
      "publishedAt": null
    },
    {
      "applicationId": "A02",
      "applicantName": "Nguyen Minh Anh",
      "positionId": "pos-comms",
      "positionName": "Communications",
      "interviewId": "int-A02",
      "assessmentSubmitted": true,
      "decision": null,
      "recordedAt": null,
      "publishedAt": null
    },
    {
      "applicationId": "A03",
      "applicantName": "Pham Quoc Bao",
      "positionId": "pos-comms",
      "positionName": "Communications",
      "interviewId": "int-A03",
      "assessmentSubmitted": false,
      "decision": null,
      "recordedAt": null,
      "publishedAt": null
    }
  ]
}
```

## GET /api/campaigns/{campaignId}/applications/{applicationId}/assessment

**Purpose**: Return the submitted Assessment used by the Executive when considering a Final Result.

**Allowed roles**: Executive.

**Success**: `200` Assessment or `200` with `null` when the assigned Interview has no Assessment yet.

**Errors**: `401`; `403`; `404 APPLICATION_NOT_FOUND`.

```http
GET /api/campaigns/cmp-2026-hk1/applications/A01/assessment HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
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

## PUT /api/campaigns/{campaignId}/applications/{applicationId}/final-result

**Purpose**: Create or replace the unpublished Executive Pass/Fail decision for one assessed Application. Published decisions are immutable.

**Allowed roles**: Executive.

| Request field | Type | Rules |
| --- | --- | --- |
| `decision` | string | Required `pass` or `fail`. |

**Success**: `200` Final Result. Errors: `400 VALIDATION_ERROR`; `401`; `403`; `404 APPLICATION_NOT_FOUND`; `409 SCHEDULE_NOT_CONFIRMED`; `409 ASSESSMENT_REQUIRED`; `409 RESULT_ALREADY_PUBLISHED`.

```http
PUT /api/campaigns/cmp-2026-hk1/applications/A01/final-result HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{ "decision": "pass" }
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "applicationId": "A01",
  "decision": "pass",
  "recordedAt": "2026-12-02T13:10:00+07:00",
  "publishedAt": null
}
```

```http
PUT /api/campaigns/cmp-2026-hk1/applications/A02/final-result HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{ "decision": "fail" }
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "applicationId": "A02",
  "decision": "fail",
  "recordedAt": "2026-12-02T13:12:00+07:00",
  "publishedAt": null
}
```

## POST /api/campaigns/{campaignId}/results/publish

**Purpose**: Publish every recorded, unpublished Final Result for the Campaign and atomically create one in-app Notification per published Application.

**Allowed roles**: Executive.

**Request body**: None.

**Idempotency**: Repeating the call does not duplicate Notifications. If no unpublished recorded result remains, `publishedIds` is `[]`.

**Success**: `200` with `publishedIds`. Errors: `401`; `403`; `404 CAMPAIGN_NOT_FOUND`; `409 NO_RECORDED_RESULTS` only when the Campaign has never had a recorded result.

```http
POST /api/campaigns/cmp-2026-hk1/results/publish HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "publishedIds": ["A01", "A02"]
}
```

## GET /api/me/notifications

**Purpose**: List only the authenticated Applicant's in-app Notifications, newest first.

**Allowed roles**: Applicant.

**Query fields**: Optional `unreadOnly=true|false` (default `false`).

**Success**: `200` with `items` and `unreadCount`; empty returns `items: []`, `unreadCount: 0`. Errors: `400 INVALID_QUERY`; `401`; `403 ROLE_FORBIDDEN`.

```http
GET /api/me/notifications HTTP/1.1
Authorization: Bearer {{token:studentA}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "items": [
    {
      "id": "nt-A02",
      "accountId": "ap-minhanh",
      "applicationId": "A02",
      "message": "The result for application A02 has been published: Fail.",
      "createdAt": "2026-12-02T13:20:00+07:00",
      "readAt": null
    },
    {
      "id": "nt-A01",
      "accountId": "ap-minhanh",
      "applicationId": "A01",
      "message": "The result for application A01 has been published: Pass.",
      "createdAt": "2026-12-02T13:20:00+07:00",
      "readAt": null
    }
  ],
  "unreadCount": 2
}
```

Applicant Application visibility after publication:

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
      "positionId": "pos-content",
      "positionName": "Content",
      "screeningStatus": "shortlisted",
      "confirmedInterview": { "interviewId": "int-A01", "start": "2026-12-02T09:00:00+07:00", "end": "2026-12-02T09:30:00+07:00", "roomName": "A-201" },
      "result": { "decision": "pass", "publishedAt": "2026-12-02T13:20:00+07:00" },
      …
    },
    {
      "id": "A02",
      "positionId": "pos-comms",
      "positionName": "Communications",
      "screeningStatus": "shortlisted",
      "confirmedInterview": { "interviewId": "int-A02", "start": "2026-12-02T09:30:00+07:00", "end": "2026-12-02T10:00:00+07:00", "roomName": "B-105" },
      "result": { "decision": "fail", "publishedAt": "2026-12-02T13:20:00+07:00" },
      …
    }
  ]
}
```

## PATCH /api/me/notifications

**Purpose**: Mark every unread Notification owned by the authenticated Applicant as read.

**Allowed roles**: Applicant.

**Request body**: None.

**Success**: `204 No Content`, including when none are unread. Errors: `401`; `403 ROLE_FORBIDDEN`.

```http
PATCH /api/me/notifications HTTP/1.1
Authorization: Bearer {{token:studentA}}
Accept: application/json
```

```http
HTTP/1.1 204 No Content
```

## Changes

- 2026-11-19: The `GET /api/me/applications` example now ends each item with `…`; the mock also returns `campaignId`, `campaignName` and `submittedAt`, which the example did not show.
- 2026-11-18: Defined Executive result workspace, nullable assessment read, assessed-only decisions, idempotent atomic publication, published-only Applicant visibility, notification ownership, and mark-all-read semantics.
