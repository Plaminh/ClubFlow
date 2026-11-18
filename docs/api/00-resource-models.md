# Resource Models

This document defines the canonical PA#3 resource vocabulary. Endpoint documents may return role-specific projections; unauthorized private fields are omitted rather than returned as `null`.

## Shared Scalars

| Type | Representation |
| --- | --- |
| Identifier | Stable opaque JSON string. |
| Date | `YYYY-MM-DD` in `Asia/Ho_Chi_Minh`. |
| Time | `HH:mm` in `Asia/Ho_Chi_Minh`. |
| Timestamp | ISO 8601 offset or equivalent UTC `Z` instant. |
| Optional value | Present as `null` only when the endpoint explicitly documents nullability. |

## User

```json
{
  "id": "exec-recruitment",
  "handle": "exec",
  "role": "executive",
  "displayName": "Recruitment Executive",
  "email": "executive@clubflow.demo.example",
  "description": "Technology and Innovation Club"
}
```

Required: `id`, `handle`, `role`, `displayName`, `email`. `role` is `executive`, `applicant`, or `interviewer`. Applicant profiles additionally expose `studentId`, `faculty`, and `year`. Passwords never appear in a response.

## Campaign

```json
{
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
}
```

- Stored `status` is `draft` or `published`; derived `phase` is `draft`, `before-open`, `open`, or `closed`.
- `applicationsClosedAt` is nullable and records the Executive early-close action.
- Normal date order is `opensOn <= closesOn < interviewDate`; the effective close is the earlier of next-day midnight after `closesOn` and `applicationsClosedAt`.
- `slotMinutes` is exactly `15`, `20`, or `30`.
- Published campaigns allow documented name/description/instructions/position/quota/window changes until confirmation. A linked Position cannot be deleted.
- The first valid Application locks `interviewDate`, `interviewWindow`, `slotMinutes`, and generated Applicant availability slots.
- Confirmed Schedule locks Campaign and interview configuration.

## Department and Position

```json
{
  "id": "pos-content",
  "departmentId": "dep-comms",
  "departmentName": "Communications",
  "name": "Content",
  "quota": 2,
  "description": "Create campaign content.",
  "requirements": "Clear writing and collaboration.",
  "applicationCount": 1
}
```

Department requires `id`, `name`. Position requires all fields except Executive-only derived `applicationCount`. `quota` is a positive integer target and does not cap submissions.

## Availability Slot

```json
{
  "id": "slot-0900",
  "start": "2026-12-02T09:00:00+07:00",
  "end": "2026-12-02T10:00:00+07:00"
}
```

Applicants select one or more campaign-provided slot IDs. Selection expresses availability, not a confirmed assignment.

## Application

```json
{
  "id": "A01",
  "campaignId": "cmp-2026-hk1",
  "applicantId": "ap-minhanh",
  "positionId": "pos-content",
  "submittedAt": "2026-11-17T09:10:00+07:00",
  "slotIds": ["slot-0900", "slot-1000"],
  "sop": "Applicant statement.",
  "cv": { "fileName": "cv.pdf", "sizeBytes": 204800 },
  "screeningStatus": "pendingReview",
  "reviewedAt": null,
  "privateNote": "",
  "studentInfo": {
    "name": "Nguyen Minh Anh",
    "studentId": "26DEMO0142",
    "email": "minh.anh@demo.example",
    "faculty": "Information Technology",
    "year": "Year 2"
  }
}
```

- `screeningStatus`: `pendingReview`, `shortlisted`, or `rejected`.
- `studentInfo` is an immutable submission snapshot, not a live profile join.
- Unique tuple: `(campaignId, applicantId, positionId)`.
- SOP contains 1-300 words. CV is exactly one PDF no larger than `5 * 1024 * 1024` bytes.
- `privateNote` is Executive-only and absent from Applicant and Interviewer JSON.
- A01 and A02 are independent records even though Student A owns both.

## Interviewer Assignment

```json
{
  "interviewerId": "iv-giahuy",
  "interviewerName": "Gia Huy",
  "positionIds": ["pos-content"],
  "positionNames": ["Content"],
  "availability": [
    { "start": "2026-12-02T09:00:00+07:00", "end": "2026-12-02T12:00:00+07:00" }
  ],
  "availabilityText": "09:00-12:00"
}
```

`availability` is machine-readable; `availabilityText` is a display DTO. The Executive manages availability. PA#3 has no Interviewer self-service availability endpoint.

## Room

```json
{ "id": "room-a201", "name": "A-201" }
```

Rooms are pre-existing selectable resources; PA#3 has no room-management endpoint.

## Interview

```json
{
  "interviewId": "int-A01",
  "applicationId": "A01",
  "applicantId": "ap-minhanh",
  "applicantName": "Nguyen Minh Anh",
  "positionId": "pos-content",
  "positionName": "Content",
  "start": "2026-12-02T09:00:00+07:00",
  "end": "2026-12-02T09:30:00+07:00",
  "interviewerId": "iv-giahuy",
  "interviewerName": "Gia Huy",
  "roomId": "room-a201",
  "roomName": "A-201",
  "status": "proposed",
  "reasons": [],
  "conflictWith": []
}
```

Draft status is `proposed`, `conflict`, or `unassigned`; confirmed rows use `confirmed`. Unassigned nullable resource fields are `null`. `reasons` is always an array. Conflict evaluation covers overlapping Applicant, Interviewer, or Room intervals; adjacent intervals do not overlap.

## Schedule

```json
{
  "status": "draft",
  "dirty": false,
  "generatedAt": "2026-11-17T10:20:00+07:00",
  "savedAt": "2026-11-17T10:30:00+07:00",
  "confirmedAt": null
}
```

Status is `none`, `draft`, or `confirmed`. Row edits set `dirty: true`; Save Changes sets `dirty: false` and updates `savedAt`; Confirm requires a saved clean valid draft.

## Assessment

```json
{
  "id": "as-A01",
  "interviewId": "int-A01",
  "interviewerId": "iv-giahuy",
  "notes": "Clear examples and good collaboration.",
  "recommendation": "pass",
  "submittedAt": "2026-12-02T13:00:00+07:00"
}
```

`notes` is required, trimmed, 1-2000 characters. `recommendation` is `pass`, `fail`, or `null`. One immutable Assessment belongs to one completed assigned Interview and does not create a Final Result.

## Final Result

```json
{
  "applicationId": "A01",
  "decision": "pass",
  "recordedAt": "2026-12-02T13:10:00+07:00",
  "publishedAt": null
}
```

`decision` is `pass` or `fail`. Executive records it only after an Assessment exists. Applicant sees it only when `publishedAt` is non-null. Publication is immutable.

## Notification

```json
{
  "id": "nt-A01",
  "accountId": "ap-minhanh",
  "applicationId": "A01",
  "message": "The result for application A01 has been published: Pass.",
  "createdAt": "2026-12-02T13:20:00+07:00",
  "readAt": null
}
```

Publication creates exactly one Notification per application. Only the owner lists or marks it read.

## Canonical Fixture Mapping

| Contract identity | Meaning | Existing browser fixture relationship |
| --- | --- | --- |
| `exec` | Executive | Maps to `exec-recruitment`. |
| `studentA` | Applicant Nguyen Minh Anh | Maps to `ap-minhanh`. |
| `studentB` | Applicant Pham Quoc Bao | Maps to `ap-quocbao`. |
| `int-content` | Content Interviewer | Maps to `iv-giahuy`. |
| `int-comms` | Communications Interviewer | HTTP identity; legacy `iv-hamy` remains UX-focused and is not silently renamed. |
| `A01` | Student A -> Content | Canonical HTTP record; legacy `CF-027` remains historical. |
| `A02` | Student A -> Communications | Canonical HTTP record. |
| `A03` | Student B -> Communications | Ownership and Unassigned/conflict coverage. |

## Changes

- 2026-11-18: Finalized campaign/application/schedule lifecycles, constrained published edits, early close, field limits, visibility, stable canonical identities, and empty-mode-safe array conventions.
- 2026-11-17: Added the initial PA#3 resource vocabulary and browser-to-HTTP mapping.
