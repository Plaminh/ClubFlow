# Data Model (UI Demo Records): ClubFlow UI-First Frontend

**Purpose**: Shape of the frontend demo records and view state. This is **not** a database schema; backend tables and columns are decided in later phases ([PRODUCT_SPEC §5](../../docs/requirements/PRODUCT_SPEC.md)). Field names are English camelCase; display labels come from `constants/labels.js`.

## Status identifiers (English, internal)

| Group | Values | Vietnamese label source |
|---|---|---|
| `CampaignStatus` | `draft`, `published` | labels.js |
| `ScreeningStatus` | `pendingReview`, `shortlisted`, `rejected` | labels.js ("Chờ duyệt", "Qua vòng CV", "Loại ở vòng CV") |
| `ScheduleRowStatus` | `proposed`, `conflict`, `unassigned`, `confirmed` | labels.js |
| `AssessmentStatus` | `awaiting`, `submitted` | labels.js ("Chờ đánh giá", "Đã gửi") |
| `ResultDecision` | `null`, `pass`, `fail` | labels.js |
| `Recommendation` | `recommend`, `consider`, `notRecommend` | labels.js ("Đề xuất tiếp nhận", "Cần cân nhắc", "Không đề xuất") |
| `ScenarioId` | `before-open`, `accepting`, `screening`, `confirmed` | labels.js |
| `Role` | `visitor`, `executive`, `applicant`, `interviewer` | labels.js |

Screening, schedule, assessment, and result are **separate fields** (BR-08); none is derived from another.

## Records

| Record | Key fields | Relationships / notes |
|---|---|---|
| `Campaign` | `id`, `name`, `hostClub`, `description`, `instructions`, `opensAt`, `closesAt`, `interviewDate`, `interviewWindow {start,end}`, `slotMinutes` (15/20/30), `status` | One campaign in the demo |
| `Department` | `id`, `name` | "Digital Product", "Communications" |
| `Position` | `id`, `departmentId`, `name`, `quota`, `description`, `requirements` | UX Design, Content Creation; quota 2 each |
| `AvailabilitySlot` | `id`, `campaignId`, `start`, `end` | 09:00–10:00, 10:00–11:00, 11:00–12:00 on 05/11/2026 |
| `Account` | `id`, `role`, `displayName`, `studentId?`, `email?`, `faculty?` | Applicants: minhanh, quocbao, khanhlinh, baongoc, thaovy, haidang; Interviewers: hamy, giahuy; one Executive |
| `Application` | `id` (CF-026…CF-031), `applicantId`, `campaignId`, `positionId`, `submittedAt`, `reviewedAt?`, `studentInfo`, `sop`, `cvFileName`, `availabilitySlotIds[]`, `screeningStatus`, `privateNote?` | Unique per applicant + campaign + position (BR-05) |
| `Room` | `id`, `name` | A-201, B-105 |
| `InterviewerAssignment` | `interviewerId`, `positionIds[]`, `availability [{start,end}]` | Hà My → UX; Gia Huy → Content |
| `Interview` | `id`, `applicationId`, `interviewerId?`, `roomId?`, `start?`, `end?`, `status`, `reason?`, `conflictWithIds[]` | At most one per application (BR-10) |
| `Assessment` | `id`, `interviewId`, `interviewerId`, `recommendation`, `notes`, `submittedAt` | At most one per interview |
| `FinalResult` | `applicationId`, `decision`, `recordedAt?`, `publishedAt?` | Hidden from Applicant views until `publishedAt` is set |
| `Notification` | `id`, `accountId`, `applicationId`, `message`, `createdAt` | Created only when a result is published |
| `DemoScenario` | `id`, `now` (fixed date-time), `overrides` | Applied on top of base records |

## Scenario states (from UI_REFERENCE_NOTES.md)

| Application | Applicant | Position | `screening` scenario | `confirmed` scenario |
|---|---|---|---|---|
| CF-026 | Nguyễn Minh Anh | UX Design | shortlisted; conflict 09:00 Hà My A-201 | confirmed 09:00–09:15 Hà My A-201; assessment submitted; **Pass, published** |
| CF-027 | Nguyễn Minh Anh | Content Creation | shortlisted; conflict 09:00 Gia Huy B-105 (same applicant) | confirmed 09:15–09:30 Gia Huy B-105; assessment submitted ("consider"); **Fail, not published** |
| CF-028 | Trần Bảo Ngọc | Content Creation | pendingReview | rejected |
| CF-029 | Lê Hoàng Thảo Vy | UX Design | rejected | rejected |
| CF-030 | Phạm Quốc Bảo | UX Design | shortlisted; proposed 09:15 Hà My A-201 | confirmed 09:15–09:30 Hà My A-201; awaiting assessment; no decision |
| CF-031 | Vũ Khánh Linh | Content Creation | shortlisted; unassigned (Gia Huy and both rooms busy in the only shared slot) | confirmed 09:00–09:15 Gia Huy B-105; awaiting assessment; no decision |

In `before-open` and `accepting`, the campaign is published and the applications that exist are those whose `submittedAt` is before the demo clock (all six are Pending Review in `accepting`). Trương Hải Đăng has no application in any scenario. The `draft` scenario (added in UI-1.3) has an unpublished campaign and no applications.

Applicant availability uses the hourly club slots: CF-026, CF-027, CF-031 → 09:00–10:00; CF-028 → 10:00–11:00; CF-029 → 11:00–12:00; CF-030 → 09:00–10:00 and 10:00–11:00. Fixtures live in `frontend/src/mocks/fixtures.js`; scenarios in `frontend/src/mocks/scenarios.js`.

## Consistency invariants (tested in UI-1)

1. Every foreign key (`applicantId`, `positionId`, `interviewerId`, `roomId`, `applicationId`) resolves to an existing record.
2. No two interviews in the `confirmed` scenario overlap on the same applicant, interviewer, or room (BR-11), and every confirmed interview has exactly one interviewer and lies in the interview window (BR-10).
3. No rejected application has an interview, assessment, or result.
4. Every non-null `FinalResult.decision` has a submitted assessment.
5. Notifications exist only for published results.
6. Statistics derived from the records give 6 applications and 5 distinct applicants.

These checks test **fixture integrity**. They are not a frontend implementation of the business rules.

## View state (owned by pages, not stored in mocks)

Filters, search text, sort, page number, selected application, open dialog, active tab, form values, and form errors.
