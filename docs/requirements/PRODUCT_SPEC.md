# ClubFlow — Product Specification

**Status:** Consolidated functional specification for future implementation, not a report of completed features.  
**Sources:** Final Project Brief §§1–6; Business Description v1.1 §§1–7.

## 1. Problem to solve

Student clubs often collect CVs through forms, screen candidates in spreadsheets, and arrange interviews in chats. As a result, records for a single application are scattered. One student may apply for several positions and one interviewer may cover several positions, raising the risk of mixing up CVs, losing submissions, creating schedule clashes, sharing unapproved schedules, or attaching feedback to the wrong application. ClubFlow links each position-specific application to its owner, approved schedule, assessment, and final result in one coordinated workflow.

## 2. Users and basic permissions

- **Visitor (not signed in):** May view published campaigns; cannot create an account through the system or apply without signing in.
- **Executive:** Creates, configures, and publishes campaigns and positions; reviews applications; enters interviewers' availability; chooses existing rooms; prepares/confirms schedules; reviews assessments; publishes outcomes.
- **Applicant:** Applies to individual positions; selects available slots provided by the club; follows screening, confirmed schedule, and results separately for each application. May access only their own application data.
- **Interviewer:** Provides availability to the Executive, sees assigned interviews and CVs, and submits one assessment for each completed assigned interview; may not see other applications or Executive screening notes.

A `Department` is a functional unit, **not an access role**. The three authenticated roles receive pre-created accounts. Visitors are not a fourth account role.

## 3. Mandatory limits

| Area | Constraint |
|---|---|
| Club | One club |
| Campaigns | At most one **active** campaign at a time; historical campaigns may exist |
| Interview date | One interview date for each campaign |
| Login | Pre-created accounts for three roles; no self-registration or account recovery |
| Applications | One CV-screening round; at most one application for an applicant–campaign–position combination |
| Interviews | At most one interview per application; exactly one interviewer per interview |
| Assessments | At most one assessment for a completed interview |
| CV | PDF, maximum 5 MB |
| Motivation statement (SOP) | Maximum 300 words |
| Slot duration | 15, 20, or 30 minutes, the same duration throughout a campaign |
| Rooms | Select existing rooms; a room cannot host overlapping interviews |

**Active campaign:** Business Description §2 defines a published campaign as active until its process finishes. Completion requires applications to be closed, screening finished, and results published for all applications that advanced.

## 4. Functional capabilities

### F1. Campaign Management

The Executive enters campaign name, host club, description, opening/closing times, application instructions, and departments/positions (name, quota, job description, requirements). Interview date and club-provided slots are prepared for applicants to indicate availability. Support **Save Draft**, **Preview**, and **Publish** with validation (BR-01–BR-04). A published campaign may be visible before applications open but must not accept early submissions.

### F2. Application Submission

A signed-in Applicant opens an accepting campaign, selects one position, and submits student information, PDF CV, SOP, and availability. Store the correct position and submission time, initially `Pending Review`. Invalid fields or timing must be explained without discarding valid input. Duplicate submission for the same position directs the applicant to the existing application without inserting another record (BR-05). Quotas are recruitment targets, not submission caps.

### F3. Application Review

For a campaign, the Executive can search, filter by position/status, sort, paginate, distinguish application versus unique-applicant counts, and export permitted data as CSV. A detail panel/drawer alongside the list shows the CV/SOP; the Executive may add a private note and decide `Shortlisted` or `Rejected` **for the selected application only**. Only shortlisted applications proceed to scheduling (BR-06–BR-09).

### F4. Interview Preparation and Scheduling

The Executive assigns interviewers to one or more positions, enters availability, and selects pre-existing rooms. The system sequentially proposes the **first valid combination** of slot, interviewer, and room for each shortlisted application. Draft labels are `Proposed`, `Unassigned` (with reason), and `Conflict`. The Executive may change time/interviewer/room, resolve conflicts, manually assign slots, regenerate after an overwrite warning, save the draft, and export the timetable (BR-10–BR-12).

### F5. Schedule Confirmation

The schedule may be confirmed only after applications close, every application is reviewed, every shortlisted application has exactly one valid interview, and there are no Unassigned or Conflict records. After confirmation, assigned applicants/interviewers can see their own schedules; campaign configuration, submitted application content, CV-screening decisions, and schedules are locked. If there are zero shortlisted applications, skip confirmation (BR-13–BR-14).

### F6. Assessments and Final Decisions

After a completed interview, its assigned Interviewer submits at most one assessment for the corresponding application. The Executive reviews assessments, records `Pass` or `Fail`, and publishes each application-specific decision. The Applicant sees only published results and receives an **in-app** notification. Applications rejected during CV screening end there. Confirming an interview schedule does not publish recruitment outcomes.

### F7. Access Control

Authentication and authorization must be enforced by the backend, based on both **roles and ownership/assignment**, including direct access to API endpoints, URLs, and CV files. No unauthorized person may receive private notes or CVs. See [Roles and Permissions](ROLES_AND_PERMISSIONS.md).

## 5. Business entities (not a database schema)

- **Campaign:** Recruitment details, submission window, instructions, interview configuration, publication/completion.
- **Department / Position:** Functional department and campaign position, quota, description, requirements.
- **Account / Role:** Pre-created user identity and authenticated role.
- **Application:** Unique applicant–campaign–position association; student details, CV, SOP, availability, submission time, screening decision.
- **Interviewer Assignment / Availability:** Positions an interviewer may serve and the times they are available.
- **Room:** Pre-existing selectable interview room; not dynamically created.
- **Interview Schedule:** Application, one interviewer, one room, time interval, draft/confirmed state.
- **Assessment:** Feedback by the assigned interviewer after the interview.
- **Final Decision / In-app Notification:** Position-specific Pass/Fail, publication time, and notice visible to the appropriate Applicant.

These relationships are business constraints. Exact table names, columns, and endpoint paths are **not** settled during documentation alignment.

## 6. Out of scope

Do not implement multi-club/multi-tenant systems; simultaneous active campaigns; account registration/recovery; university identity verification/SSO; multi-level administration; multiple interview rounds/interviewers per interview; dynamic rooms or campus booking; checks across campaigns; large-scale optimization; AI CV screening/ranking; customizable forms; advanced analytics/audit trails; email/SMS/push/external calendar sync; a dedicated notification center; chat/video/payments/mobile apps; or post-recruitment member/event/task management.

## 7. PA#2 versus the final product

- **PA#2:** Three linked Executive screens — **Create Recruitment Campaign → Application Review → Interview Scheduling** — with mock submissions and illustrative states; backend/database integration was not required.
- **PA#3–PA#6:** Implement Applicant and Interviewer flows, login/authorization, actual domain operations, assessments/results, and integrated application behavior. See [PA Requirements](../course/PA_REQUIREMENTS.md).
- Sample dates and names from PA#2 are not fixed values for future campaigns.

## 8. Reference order for implementation

1. [Business Rules](BUSINESS_RULES.md) contains the canonical BR-01–BR-14 definitions.
2. [Roles](ROLES_AND_PERMISSIONS.md) and [Workflows](WORKFLOWS_AND_STATES.md) define access and state boundaries.
3. [Screens](SCREEN_REQUIREMENTS.md) defines UI behavior; [Acceptance Criteria](ACCEPTANCE_CRITERIA.md) defines testable scenarios.
4. [Decisions and Open Questions](DECISIONS_AND_OPEN_QUESTIONS.md) lists matters not settled by the sources; do not elevate a technical suggestion into lecturer policy.
