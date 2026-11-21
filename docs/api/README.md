# ClubFlow API Contract

This directory is the authoritative HTTP contract. Since PA#4 it is implemented by the Express server in `server/`; the PA#3 mock in `mock/` followed the version of this contract handed in with PA#3 and is not kept in step with PA#4 changes. A documented endpoint is not evidence that it has been implemented; verification status is recorded in `BACKEND.md`.

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

Login accepts `username` and `password`; it never accepts `handle` as the request field. User DTOs may expose `handle` as a stable display/example identifier. Executable examples use `{{token:exec}}`, `{{token:studentA}}`, `{{token:studentB}}`, `{{token:studentC}}`, `{{token:int-content}}`, and `{{token:int-comms}}`: the caller signs in as that account and puts its token there.

The token is a JWT signed with HS256 by the server's `JWT_SECRET`; it expires at most 24 hours after sign-in. Its payload carries the user id and role; the server reads the role from the verified token only, never from a request body, query or header. Examples show the token value as `"…"`. A token with no signature, another signature, `alg: none`, an edited payload or a past `exp` gets `401 INVALID_TOKEN`.

## Access Rule

One rule for every protected endpoint:

- No token, or a token that does not verify: `401 INVALID_TOKEN`.
- A signed-in user whose role may not call the endpoint (for example an Applicant calling an Executive endpoint): `403 ROLE_FORBIDDEN`.
- The right role asking for an item that is not theirs — another Applicant's application or CV, an interview not assigned to that Interviewer: `404` with the resource's not-found code, so the answer does not reveal that the item exists. Nothing changes.
- The Executive's private screening note appears in no answer to an Applicant or an Interviewer.

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
| `400` | Invalid JSON, query, multipart body, or field validation; a request body field that is not documented is ignored, never stored. |
| `401` | Missing, malformed, unverifiable, or expired bearer token. |
| `403` | Authenticated caller's role may not call the endpoint. |
| `404` | Unknown path, or a resource that does not exist within the caller's permitted scope (see Access Rule). |
| `409` | Duplicate record, locked transition, stale action, or unmet workflow precondition. |
| `413` | Uploaded file larger than its limit (may report only the file's field). |
| `500` | Unexpected server failure, using the same error shape and never a stack trace. |

## Business Date

The server has no clock-control endpoint and never reads the machine clock for a business rule. "Today" is the date in the server's `APP_TODAY` setting; its example value, kept when the server is marked, is `2026-11-18`.

- A campaign accepts applications when it is published, not closed early, and `opensOn <= APP_TODAY <= closesOn` (the closing day is included).
- An assigned Interviewer may submit the assessment of an interview once the schedule is confirmed (PA#4 rule R8). Product-owner decision Q-04 speaks of "interviewed slots"; with a fixed `APP_TODAY` inside the application period, that day is always before the interview date, so the server does not compare the interview time with "today". See `docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md` Q-04.

## Seed State

`npm run seed` (in `server/`) always produces this state, on an empty or on a seeded database:

| Item | Seed value |
| --- | --- |
| Accounts | `exec` (Executive), `studentA`, `studentB`, `studentC` (Applicants), `int-content`, `int-comms` (Interviewers); password `ClubFlowDemo!` for every account, stored hashed. No person is both an Applicant and an Interviewer. |
| Campaign | `cmp-2026-hk1`, published, accepting applications on `APP_TODAY`: opens `2026-11-10`, closes `2026-11-30`, interview date `2026-12-02`, window `09:00`–`12:00`, 30-minute interview slots. |
| Positions | `pos-content` (Content) and `pos-comms` (Communications), quota 2 each. |
| Interview setup | `int-content` assigned to Content, `int-comms` to Communications, with the availability, rooms and slots of `mock/data/campaigns.json`. |
| A01 | Student A, Content, submitted `2026-11-17T09:10:00+07:00`, slots `slot-0900` and `slot-1000`, pending review. Private note: `Internal screening note: strong writing sample; ask about weekly availability.` |
| A02 | Student A, Communications, submitted `2026-11-17T09:12:00+07:00`, slots `slot-0900` and `slot-1000`, pending review. |
| A03 | Student B, Communications, submitted `2026-11-17T09:14:00+07:00`, slot `slot-1000`, pending review. |
| Student C | No application. Used by examples that create a new application (next id `A04`) and by the PA#6 live demo. |

Statements, faculties and e-mails of A01–A03 are those of the PA#3 examples in [02-public-applicant.md](02-public-applicant.md). Each seeded application has a CV file (a fictional sample PDF). No schedule, assessment, result or notification exists in the seed.

## Running the Examples

Each file of this directory is run on its own, against a freshly seeded and restarted server, from top to bottom. A file that needs a state the seed does not have — applications closed, applications shortlisted, a saved or confirmed schedule, an assessment — starts with the requests that create that state through the API, and says so under its `## Changes`. Ids created inside a file (`A04`, interview ids) are those that file creates.

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
| C2 | Sign-in and roles | Login, current user, logout, own profile, JWT bearer tokens. |
| C3 | Campaign create/draft/preview/publish | Create/read/update, nested position upsert, removal, validation, publish; preview remains local unsaved rendering. |
| C4 | Interview setup | Composite Interviewer-position assignments, availability, rooms, date/window, and 15/20/30-minute duration. |
| C5 | Applicant submission | Multipart PDF submission, statement/slot validation, duplicate/closed refusal, independent position applications. |
| C6 | My applications | Own screening status, confirmed interview only, published result only. |
| C7 | Application review | Search/filter/sort/page/stats, detail, protected CV, private note, independent screening, CSV. |
| C8 | Draft scheduling | View, deterministic generation, staged edit/resolve, conflict reasons, meaningful save, CSV. |
| C9 | Confirmation | Readiness conditions, invalid refusal, atomic confirmation, confirmed read-only lock. |
| C10 | Interviewer assessment | Assigned-only list/detail/CV and one assessment per assigned interview, once the schedule is confirmed. |
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
  "status": "ok"
}
```

## Changes

- 2026-11-21 (PA#4): The contract is now implemented by the Express server in `server/`; the PA#3 mock is not updated with PA#4 changes. Added **Access Rule** (`401 INVALID_TOKEN` / `403 ROLE_FORBIDDEN` for a wrong role / `404` for an item that is not the caller's, no screening note for Applicants or Interviewers), JWT tokens shown as `"…"`, `413` for an oversized upload, `500` without stack trace, undocumented body fields ignored. Replaced the PA#3 "Deterministic Example Journey" (one journey across all files, mock-advanced time) with **Business Date** (`APP_TODAY`, example `2026-11-18`; assessment allowed once the schedule is confirmed, rule R8), **Seed State** (A01, A02, A03 and the note on A01 come from the seed; new account `studentC` without application) and **Running the Examples** (each file runs alone on a fresh seed and creates the state it needs through the API). Why: the PA#4 rubric requires seeded A01/A02, an application of `studentB` and a note on A01, and runs each contract file on a fresh seed.
- 2026-11-19 (late entry for commit `85c3419` of 2026-11-18, which changed `mock/server.mjs` without a line here): the mock modes follow the PA#3 brief: `normal` answers after about 150 ms, `slow` after 2 s, `error` answers 500 with the error shape for every request except `POST /api/auth/login`, and `empty` makes every list in an answer `[]`, nested lists included. No endpoint, field or status of this contract changed.
- 2026-11-19: Removed `mode` from the `GET /api/health` example; the mock answers `{ "status": "ok" }` only. The mock now reads its port from `PORT` (default 3001) instead of `MOCK_PORT`, as the PA#3 brief requires.
- 2026-11-18: Finalized direct response/error conventions, one coherent primary-campaign journey, early-close business action, complete inventory, C1-C11 trace, mock restart semantics, and official-checker-independent wording.
- 2026-11-17: Replaced the health-only scaffold with the initial PA#3 contract outline.
