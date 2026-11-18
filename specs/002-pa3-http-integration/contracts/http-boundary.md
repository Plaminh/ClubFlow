# HTTP Boundary Contract Map

The authoritative endpoint schemas, errors, examples, and change histories are in `docs/api/`. This artifact maps product journeys and existing frontend service functions to that contract so planning does not duplicate endpoint definitions.

## Shared conventions

- Base path: `/api`.
- Protected requests carry `Authorization: Bearer <token>`.
- Successful reads return direct DTOs; empty collections return `200` with empty arrays.
- Errors use `{ error, code, fieldErrors?, details? }`.
- Runtime consumers call only documented endpoints through `apiClient`.

## Journey map

| C-step | Existing service area | Contract capability |
| --- | --- | --- |
| C1 | `portalService.getPublicCampaign` | Current published campaign and public positions/slots |
| C2 | `authService`, `profileService` | Login, current user, logout, own profile read/update |
| C3 | `campaignService` | Campaign create/read/update, position changes, publish |
| C4 | `campaignService` | Composite interview setup read/update |
| C5 | `portalService.submitApplication` | Multipart Applicant submission and duplicate/closed validation |
| C6 | `portalService.listMyApplications` | Own application status, confirmed schedule, published result |
| C7 | `applicationService` | Executive list/stats/detail/note/screening/CV/CSV |
| C8 | `scheduleService` | Draft schedule read/generate/edit/save/export |
| C9 | `scheduleService.confirm` | Confirmation readiness, refusal, lock, confirmed read-only state |
| C10 | `interviewerService` | Assigned interview list/detail/CV/assessment |
| C11 | `resultService`, portal notifications | Assessment read, final decision, publication, own notifications |

## Consumer compatibility rules

- Keep current exported service function names unless a contract capability makes a redundant function unnecessary; adapt response DTOs inside services rather than rewriting page composition.
- Paginated UI reads retain `{ items, total, page, pageSize, pageCount }`.
- Schedule views retain settings, assignments, rooms, rows, summary, conditions, status, and confirmation readiness.
- UI errors retain the existing `UiError` categories while preserving HTTP status, machine code, field errors, and contract details.
- File downloads are handled by service adapters and must not be parsed as JSON.
- Authentication context is the only source of current HTTP user/token; browser fixtures cannot supply runtime role or domain records.

## Contract review gate

No mock route or frontend request may be added until its method/path, role, fields, status, error, and paired executable example exist in `docs/api/` and the relevant document records the actual change under `## Changes`.
