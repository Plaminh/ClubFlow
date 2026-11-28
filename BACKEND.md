# ClubFlow Back End (PA#4)

The Express server in `server/` implements the contract in `docs/api/`. The sections follow the PA#4 rubric ("What BACKEND.md must contain"). Each owner writes the rows of their own screens (`specs/003-pa4-express-server/tasks.md`, T061); a section with no rows yet is still to be written.

## 1. Team

To be written (T061).

## 2. How to run it

To be written (T061).

## 3. Demo accounts

To be written (T061).

## 4. Data model

| Table | Main fields | Links | Migration |
| --- | --- | --- | --- |
| `departments` | `id`, `name` (unique) | Positions belong to one department; a new position reuses the department with the same name. | `020-campaigns.sql` |
| `campaigns` | `id`, `name`, `host_club`, `description`, `instructions`, `opens_on`, `closes_on`, `applications_closed_at`, `interview_date`, `interview_window_start`, `interview_window_end`, `slot_minutes` (15, 20 or 30), `status` (`draft`/`published`), `published_at` | Has many positions. A draft may miss its text fields and dates; a check constraint keeps a published row complete and in date order. | `020-campaigns.sql` |
| `positions` | `id`, `campaign_id`, `department_id`, `name`, `quota`, `description`, `requirements`, `sort_order` | Belongs to a campaign (deleted with it) and a department. `quota`, `description` and `requirements` may be missing in a draft. | `030-positions.sql` |

## 5. Rules and checks

| Rule | Where the server enforces it | Test that proves it |
| --- | --- | --- |
| R1 A campaign publishes only when it is complete | `server/src/services/campaign.service.js` (`publishCampaign`, `campaignErrors`, `positionErrors`); a published row is also kept complete by the check constraint in `server/migrations/020-campaigns.sql` | `server/test/integration/api/campaigns.test.js`: `R1 publishing a campaign with a required field missing returns 400 and it stays a draft`, `R1 publishing a campaign whose closing date is before its opening date returns 400 and it stays a draft`, `R1 publishing a campaign with a position with no quota returns 400 and it stays a draft`, `R1 publishing an already published campaign returns 409 CAMPAIGN_ALREADY_PUBLISHED`, `R1 publishing a campaign whose dates overlap the active one returns 409 ACTIVE_CAMPAIGN_CONFLICT` |

### R1 check

On a fresh seed. The first request creates the state the seed does not have: a draft with a required field missing (`instructions`), its closing date before its opening date, and a position with no quota. A draft may hold incomplete values (`docs/api/07-campaign-management.md`).

```http
POST /api/campaigns HTTP/1.1
Authorization: Bearer {{token:exec}}
Content-Type: application/json
Accept: application/json

{
  "name": "ClubFlow 2027 Recruitment",
  "hostClub": "Technology and Innovation Club",
  "description": "Recruit the next club cohort.",
  "opensOn": "2027-01-25",
  "closesOn": "2027-01-10",
  "interviewDate": "2027-02-01",
  "interviewWindow": { "start": "09:00", "end": "12:00" },
  "slotMinutes": 30,
  "positions": [
    {
      "departmentName": "Communications",
      "name": "Content",
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
  "campaign": { "id": "cmp-2027-hk1", "instructions": null, "opensOn": "2027-01-25", "closesOn": "2027-01-10", "status": "draft", "publishedAt": null, … },
  "phase": "draft",
  "positions": [
    { "id": "pos-2027-content", "name": "Content", "quota": null, "applicationCount": 0, … }
  ],
  …
}
```

Publishing it is refused with a message for each field, all at once:

```http
POST /api/campaigns/cmp-2027-hk1/publish HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "The campaign is not complete.",
  "code": "VALIDATION_ERROR",
  "fieldErrors": {
    "instructions": "Required to publish.",
    "closesOn": "The closing date must not be before the opening date.",
    "positions.0.quota": "Quota must be at least 1.",
    "roomIds": "Select at least one room.",
    "assignments": "Every position needs an eligible interviewer."
  }
}
```

The campaign stays a draft:

```http
GET /api/campaigns/cmp-2027-hk1 HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "campaign": { "id": "cmp-2027-hk1", "status": "draft", "publishedAt": null, … },
  "phase": "draft",
  …
}
```

The seeded campaign is already published:

```http
POST /api/campaigns/cmp-2026-hk1/publish HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": "Campaign is already published.",
  "code": "CAMPAIGN_ALREADY_PUBLISHED"
}
```

## 6. Uploads

To be written (T061).

## 7. Sign-in

To be written (T061).

## 8. Product owner decisions

To be written (T061).

## 9. Not done

| What | Why | Done by |
| --- | --- | --- |
| `POST /api/campaigns/{campaignId}/publish` never succeeds: it always reports `roomIds` and `assignments` (R1 "publish succeeds" has no test yet). | Rooms and interviewer assignments arrive with migration `040`. | T051 |
| `GET /api/campaigns/{campaignId}` returns `applicationCount: 0`, an empty, unlocked `interviewSetup`, and `locked: false`; `DELETE …/positions/{positionId}` never answers `409 POSITION_HAS_APPLICATIONS`. | Applications arrive with migration `050`. | T044, then T050 |
| `409 CAMPAIGN_CONFIRMED` is never answered by `PATCH`/`DELETE` on a campaign. | The schedule and its confirmation do not exist yet. | T055 |
| `POST /api/campaigns/{campaignId}/close-applications` never answers `409 CAMPAIGN_LOCKED`. | The schedule and its confirmation do not exist yet. | T055 |
