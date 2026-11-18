# ClubFlow PA#3 API Contract

This directory is the authoritative HTTP contract for the PA#3 mock and the later PA#4 Express implementation. A documented endpoint is not evidence that either provider has been implemented; verification status is recorded separately.

## Base Path and Formats

- Every application path is relative and begins with `/api`.
- Runtime browser code must not hardcode a host or port.
- Requests and responses use JSON unless an endpoint explicitly documents multipart input, CSV output, PDF output, or `204 No Content`.
- Instants use ISO 8601. Date-only business fields use `YYYY-MM-DD` in `Asia/Ho_Chi_Minh` (UTC+7).
- A closing date is inclusive: `closesOn: 2026-11-30` accepts submissions until `2026-12-01T00:00:00+07:00` unless the Executive closes applications early.

## Authentication

Protected requests use:

```text
Authorization: Bearer <token>
```

Login accepts `username` and `password`; it never accepts `handle` as the request field. User DTOs may expose `handle` as a stable display/example identifier. Executable examples use `{{token:exec}}`, `{{token:studentA}}`, `{{token:studentB}}`, `{{token:int-content}}`, and `{{token:int-comms}}`; [01-auth-profile.md](01-auth-profile.md) initializes every alias.

## Success Conventions

Success DTOs are returned directly without a generic `data` envelope.

| Status | Convention |
| --- | --- |
| `200 OK` | Reads and ordinary updates. |
| `201 Created` | New Campaign, Application, or Assessment. |
| `204 No Content` | Successful operation with no response body. |

- Bounded collections use `{ "items": [...] }` plus documented context fields where needed.
- Paginated collections use `{ "items", "total", "page", "pageSize", "pageCount" }`.
- Empty collections return `200`, never `404`, and contain `[]`.
- Unauthorized projections omit private fields completely; they do not return private fields as `null`.

## Error Convention

Every non-2xx JSON error uses:

```json
{
  "error": "The schedule cannot be confirmed.",
  "code": "SCHEDULE_NOT_READY",
  "fieldErrors": {
    "roomId": "The selected room conflicts with another interview."
  },
  "details": {
    "conditions": []
  }
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `error` | Yes | User-safe message. |
| `code` | Yes | Stable machine-readable identifier. |
| `fieldErrors` | No | Object keyed by documented input field names. |
| `details` | No | Structured recovery, conflict, or ownership information. |

| Status | Use |
| --- | --- |
| `400` | Invalid JSON, query, multipart body, or field validation. |
| `401` | Missing, malformed, or unknown bearer token. |
| `403` | Authenticated caller lacks role, ownership, or assignment. |
| `404` | Resource does not exist within the caller's permitted scope. |
| `409` | Duplicate record, locked transition, stale action, or unmet workflow precondition. |
| `500` | PA#3 error mode or unexpected provider failure, using the same error shape. |

## Deterministic Example Journey

The examples describe one primary campaign, `cmp-2026-hk1`.

1. Fresh state is published and accepting applications at deterministic workflow time `2026-11-17T09:00:00+07:00`.
2. Student A submits A01 for Content and A02 for Communications. Student B submits A03 to exercise ownership and Unassigned scheduling.
3. The Executive closes applications early through the documented business action. There is no clock-control endpoint.
4. A01, A02, and A03 are reviewed independently. Draft generation demonstrates Conflict and Unassigned rows; row edits resolve them; Save Changes persists the clean draft; Confirm locks it.
5. The PA#3 mock advances only its internal deterministic workflow timestamps as business actions succeed so the confirmed interviews can be demonstrated as completed for assessment examples. Callers cannot set or advance time. PA#4 must replace this fixture behavior with actual time enforcement.
6. Assigned Interviewers submit assessments, the Executive records A01/A02 decisions, publication creates one notification per application, and Student A sees only published own results.
7. Campaign-management examples finally create a future non-active draft, `cmp-2027-hk1`, so create/publish/constrained-edit capabilities can be exercised without replacing the primary campaign.

All mutations are in memory and reset when the mock process restarts. Deterministic tokens remain valid after restart.

## Endpoint Inventory

Static paths are matched before parameterized paths.

| Method | Path | Allowed role | Resource document |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | This file |
| POST | `/api/auth/login` | Public | [01-auth-profile.md](01-auth-profile.md) |
| GET | `/api/auth/me` | Authenticated | [01-auth-profile.md](01-auth-profile.md) |
| POST | `/api/auth/logout` | Authenticated | [01-auth-profile.md](01-auth-profile.md) |
| GET | `/api/me/profile` | Authenticated | [01-auth-profile.md](01-auth-profile.md) |
| PATCH | `/api/me/profile` | Authenticated | [01-auth-profile.md](01-auth-profile.md) |
| GET | `/api/campaigns/current` | Public | [02-public-applicant.md](02-public-applicant.md) |
| POST | `/api/applications` | Applicant | [02-public-applicant.md](02-public-applicant.md) |
| GET | `/api/me/applications` | Applicant | [02-public-applicant.md](02-public-applicant.md) |
| POST | `/api/campaigns/{campaignId}/close-applications` | Executive | [02-public-applicant.md](02-public-applicant.md) |
| GET | `/api/campaigns/{campaignId}/applications` | Executive | [03-review-files.md](03-review-files.md) |
| GET | `/api/campaigns/{campaignId}/applications/{applicationId}` | Executive | [03-review-files.md](03-review-files.md) |
| PATCH | `/api/campaigns/{campaignId}/applications/{applicationId}/private-note` | Executive | [03-review-files.md](03-review-files.md) |
| POST | `/api/campaigns/{campaignId}/applications/{applicationId}/screening-decision` | Executive | [03-review-files.md](03-review-files.md) |
| GET | `/api/campaigns/{campaignId}/applications.csv` | Executive | [03-review-files.md](03-review-files.md) |
| GET | `/api/applications/{applicationId}/cv` | Applicant owner, assigned Interviewer, Executive | [03-review-files.md](03-review-files.md) |
| GET | `/api/campaigns/{campaignId}/schedule` | Executive | [04-scheduling.md](04-scheduling.md) |
| POST | `/api/campaigns/{campaignId}/schedule/draft/generate` | Executive | [04-scheduling.md](04-scheduling.md) |
| PATCH | `/api/campaigns/{campaignId}/schedule/draft/rows/{applicationId}` | Executive | [04-scheduling.md](04-scheduling.md) |
| POST | `/api/campaigns/{campaignId}/schedule/draft/save` | Executive | [04-scheduling.md](04-scheduling.md) |
| GET | `/api/campaigns/{campaignId}/schedule.csv` | Executive | [04-scheduling.md](04-scheduling.md) |
| POST | `/api/campaigns/{campaignId}/schedule/confirm` | Executive | [04-scheduling.md](04-scheduling.md) |
| GET | `/api/me/interviews` | Interviewer | [05-interviewer.md](05-interviewer.md) |
| GET | `/api/interviews/{interviewId}` | Assigned Interviewer | [05-interviewer.md](05-interviewer.md) |
| POST | `/api/interviews/{interviewId}/assessment` | Assigned Interviewer | [05-interviewer.md](05-interviewer.md) |
| GET | `/api/campaigns/{campaignId}/results` | Executive | [06-results-notifications.md](06-results-notifications.md) |
| GET | `/api/campaigns/{campaignId}/applications/{applicationId}/assessment` | Executive | [06-results-notifications.md](06-results-notifications.md) |
| PUT | `/api/campaigns/{campaignId}/applications/{applicationId}/final-result` | Executive | [06-results-notifications.md](06-results-notifications.md) |
| POST | `/api/campaigns/{campaignId}/results/publish` | Executive | [06-results-notifications.md](06-results-notifications.md) |
| GET | `/api/me/notifications` | Applicant | [06-results-notifications.md](06-results-notifications.md) |
| PATCH | `/api/me/notifications` | Applicant | [06-results-notifications.md](06-results-notifications.md) |
| GET | `/api/campaigns/{campaignId}` | Executive | [07-campaign-management.md](07-campaign-management.md) |
| POST | `/api/campaigns` | Executive | [07-campaign-management.md](07-campaign-management.md) |
| PATCH | `/api/campaigns/{campaignId}` | Executive | [07-campaign-management.md](07-campaign-management.md) |
| POST | `/api/campaigns/{campaignId}/publish` | Executive | [07-campaign-management.md](07-campaign-management.md) |
| DELETE | `/api/campaigns/{campaignId}/positions/{positionId}` | Executive | [07-campaign-management.md](07-campaign-management.md) |
| PATCH | `/api/campaigns/{campaignId}/interview-setup` | Executive | [07-campaign-management.md](07-campaign-management.md) |

## C1-C11 Coverage

| Step | UI/service capability | HTTP contract |
| --- | --- | --- |
| C1 | Public campaign | Current published campaign, positions, quotas, slots, and acceptance state. |
| C2 | Sign-in and roles | Login, current user, logout, own profile, deterministic bearer tokens. |
| C3 | Campaign create/draft/preview/publish | Create/read/update, nested position upsert, removal, validation, publish; preview remains local unsaved rendering. |
| C4 | Interview setup | Composite Interviewer-position assignments, availability, rooms, date/window, and 15/20/30-minute duration. |
| C5 | Applicant submission | Multipart PDF submission, statement/slot validation, duplicate/closed refusal, independent position applications. |
| C6 | My applications | Own screening status, confirmed interview only, published result only. |
| C7 | Application review | Search/filter/sort/page/stats, detail, protected CV, private note, independent screening, CSV. |
| C8 | Draft scheduling | View, deterministic generation, staged edit/resolve, conflict reasons, meaningful save, CSV. |
| C9 | Confirmation | Readiness conditions, invalid refusal, atomic confirmation, confirmed read-only lock. |
| C10 | Interviewer assessment | Assigned-only list/detail/CV and one assessment per completed assigned interview. |
| C11 | Results and notifications | Executive assessment view/decision/publication and Applicant published result/notification visibility. |

## Health Example

```http
GET /api/health HTTP/1.1
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "ok",
  "mode": "normal"
}
```

## Changes

- 2026-11-18: Finalized direct response/error conventions, one coherent primary-campaign journey, early-close business action, complete inventory, C1-C11 trace, mock restart semantics, and official-checker-independent wording.
- 2026-11-17: Replaced the health-only scaffold with the initial PA#3 contract outline.
