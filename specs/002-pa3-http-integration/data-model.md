# Data Model: PA#3 HTTP Integration

This model defines the deterministic PA#3 domain state and its role-specific projections. Endpoint-level field schemas belong in `docs/api/`.

## User and Session

- **User**: stable `id`, canonical `username`, role (`executive`, `applicant`, `interviewer`), display name, email, optional role fields.
- **Session token**: deterministic opaque token mapped to exactly one User; valid across process restart because it is derived from fixture identity rather than mutable memory.
- Passwords are accepted only by login and never returned or stored in response objects.

## Campaign Aggregate

- **Campaign**: identity, name, host, description, instructions, opening date, closing date, interview date/window/duration, publication status and timestamps.
- **Department**: identity and name.
- **Position**: identity, Department relation, name, quota, description, requirements, derived application count.
- **Availability Slot**: identity and start/end instant; Applicants choose one or more campaign slots.
- **Interviewer Assignment**: Interviewer relation, eligible Position relations, and availability intervals.
- **Room**: identity and display name; pre-existing and selectable.

### Campaign lifecycle

`draft -> published/before-open -> open -> closed -> schedule-confirmed -> assessments -> results-published`

- The calendar derives before-open/open/closed; there is no time-manipulation endpoint.
- Closing dates use Vietnam time and close at the next day's 00:00.
- Published detail/position/window edits are constrained.
- The first valid Application locks interview date/window/duration and campaign availability slots.
- Schedule confirmation locks the required campaign and schedule records.

## Application

- Stable identity, Campaign relation, Applicant relation, Position relation, submission timestamp.
- Immutable Student snapshot, statement, selected slot relations, and CV metadata/content reference.
- Screening state: `pendingReview -> shortlisted | rejected`.
- Executive-only private note and review timestamp.
- Unique tuple: Campaign + Applicant + Position.
- A01 and A02 are distinct even when owned by Student A.

## Schedule and Interview

- **Schedule**: Campaign relation, state (`none`, `draft`, `confirmed`), generated/saved/confirmed timestamps, dirty flag, selected rooms, Interview rows.
- **Interview**: Application, Applicant, Position, Interviewer, Room, start/end, status, reasons, and conflicting row identities.
- Draft status is `proposed`, `conflict`, or `unassigned`; confirmed rows use `confirmed`.
- Overlap is strict interval intersection; adjacent intervals do not overlap.
- A valid row must fit the campaign window, Applicant availability, Interviewer availability, Interviewer position eligibility, and selected room set.

### Schedule transitions

1. Generate replaces the draft with deterministic rows for current shortlisted Applications.
2. Edit/Resolve changes one row and recalculates every row affected by Applicant, Interviewer, and Room overlap.
3. Save clears the draft dirty state and records `savedAt`.
4. Confirm requires a saved, complete, conflict-free draft after applications close and reviews finish, then changes all rows to confirmed.

## Assessment

- Stable identity, Interview relation, Interviewer owner, required notes, optional recommendation, submission timestamp.
- Unique Interview relation; one immutable record per assigned completed Interview.
- Does not create or change the Final Result.

## Final Result and Notification

- **Final Result**: Application relation, Executive decision (`pass` or `fail`), recorded timestamp, nullable published timestamp.
- Requires an Assessment for the Application's confirmed Interview.
- **Notification**: stable identity, Applicant owner, Application relation, message, created timestamp, nullable read timestamp.
- Publication sets `publishedAt` and creates exactly one Notification; repeat publication is idempotent.

## Visibility Matrix

| Resource data | Visitor | Applicant owner | Executive | Assigned Interviewer |
| --- | --- | --- | --- | --- |
| Published campaign and public positions | Yes | Yes | Yes | Context only |
| Draft campaign and application counts | No | No | Yes | No |
| Application statement and Student snapshot | No | Own | Yes | Assigned only |
| CV | No | Own | Campaign applications | Assigned only |
| Private note | No | No | Yes | No |
| Screening decision | No | Own | Yes | Assigned context when permitted |
| Draft schedule/conflict details | No | No | Yes | No |
| Confirmed interview | No | Own | Yes | Assigned only |
| Assessment | No | No | Yes | Own submitted record |
| Final Result | No | Published own only | Yes | No |
| Notification | No | Own | No | No |

## Empty-mode projection

After normal validation and authorization, every array-valued JSON field becomes `[]`. Derived counts become zero. Stable single-resource objects, scalar lifecycle context, and nullable fields remain valid. Mutations still execute against normal in-memory state so switching modes by restart remains deterministic.
