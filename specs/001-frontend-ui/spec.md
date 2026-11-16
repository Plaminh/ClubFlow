# Feature Specification: ClubFlow UI-First Frontend

**Feature Branch**: `001-frontend-ui` (spec directory name; work currently happens on the team's own Git branch)

**Created**: 2026-11-14

**Status**: UI prototype complete with mock data; pre-integration cleanup and team-selected Q-01…Q-07 frontend/contract alignment complete through UI-7. SC-005 (replace mocks with the backend without layout changes) can only be verified during backend integration. Q-01…Q-07 remain pending Product Owner confirmation.

**Input**: User description: "UI-first React frontend for the five ClubFlow screens with mock data and integration-ready boundaries"

## Context and Scope

This feature delivers the **complete ClubFlow user interface** before backend integration. It covers exactly five main screens:

1. Campaign Management (Executive)
2. Application Review, including the Final Results tab (Executive)
3. Interview Scheduling (Executive)
4. Applicant Portal (Visitor and Applicant)
5. Interviewer Workspace (Interviewer)

**Business source of truth**: [`docs/requirements/`](../../docs/requirements/README.md). This spec **does not redefine** BR-01…BR-14, AC-01…AC-53, F1…F7, or the team-internal FR-01…FR-15; it references them. To avoid confusion with those IDs, requirements in this spec use the prefix `UI-FR-`.

**Visual reference**: [`docs/reference/ui/`](../../docs/reference/ui/README.md). Where the references are illustrative, incomplete, or contradict the requirements, the requirements win.

**Out of scope for this feature**: real authentication, backend APIs, persistence, file storage, automatic schedule generation, server-side business-rule enforcement, email/SMS/push, and anything listed as out of scope in [PRODUCT_SPEC §6](../../docs/requirements/PRODUCT_SPEC.md). Other team members integrate those later without changing page layouts.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Executive prepares and publishes a campaign (Priority: P1)

The Executive fills in campaign details, departments, positions, and quotas, plus the interview preparation settings. They save a draft, preview what applicants will see, and publish. Invalid data is explained without losing input.

**Why this priority**: Every other screen depends on a campaign existing; it is the first PA#2 screen.

**Independent Test**: Open the Campaign Management screen with demo data, edit fields, trigger validation errors, save a draft, preview, and publish — all without a backend.

**Acceptance Scenarios** (UI behavior for F1, BR-01, BR-02, BR-04, BR-14; AC-01…AC-04, AC-10, AC-42):

1. **Given** a draft with a missing required field, **When** the Executive clicks Publish, **Then** the campaign stays a draft, each invalid field shows a specific message, and all valid input remains.
2. **Given** opening time ≥ closing time, or a quota of 0, negative, or fractional, **When** Publish is clicked, **Then** publication is blocked and the offending fields are identified.
3. **Given** a valid draft, **When** Preview is clicked, **Then** a read-only view shows what applicants will see.
4. **Given** a valid draft, **When** Publish is confirmed, **Then** the screen shows the Published state and a clear "demo action" indication.
5. **Given** a position that has linked applications in demo data, **When** the Executive tries to remove it, **Then** removal is blocked with an explanation.
6. **Given** the confirmed-schedule demo scenario, **When** the screen opens, **Then** configuration is read-only and explains why.

---

### User Story 2 - Executive screens applications and manages final results (Priority: P1)

The Executive searches, filters, sorts, and pages through applications. They open a detail panel beside the list to read the SOP and CV link, add a private note, and Shortlist or Reject the selected application only. In the Final Results tab, they view assessments, record Pass/Fail per application, and publish recorded results.

**Why this priority**: Core PA#2 screen; the Final Results tab completes the Executive workflow.

**Independent Test**: In the screening scenario, filter to one position and status, open CF-026, shortlist or reject it, and confirm only that application changes. In the confirmed scenario, open the Final Results tab, view an assessment, record a decision, and publish.

**Acceptance Scenarios** (F3, F6, BR-06…BR-09, BR-14; AC-18…AC-25, AC-46…AC-49):

1. **Given** the screening scenario, **When** the screen opens, **Then** statistics show application count and distinct-applicant count separately (6 and 5), and the scope label states whether figures are campaign-wide or filtered.
2. **Given** filters are active, **When** the list updates, **Then** the visible rows, pagination, and "showing X–Y of Z" text all match.
3. **Given** a student with two applications, **When** one is rejected, **Then** the other application's status is unchanged.
4. **Given** the detail panel is open, **When** it is closed, **Then** filters and page position are preserved.
5. **Given** Export CSV is clicked, **When** no backend is connected, **Then** the UI shows it exports the current filter and that this is a demo action (no real file privacy is claimed).
6. **Given** the confirmed scenario, **When** the Final Results tab opens, **Then** only shortlisted applications with confirmed interviews are listed; CV-rejected applications are excluded.
7. **Given** an application without a submitted assessment, **When** the Executive views it, **Then** Pass/Fail actions are unavailable with a reason.
8. **Given** one or more recorded but unpublished decisions, **When** Publish Results is confirmed in a dialog, **Then** those results show as Published.
9. **Given** the confirmed scenario, **When** the CV Screening tab is viewed, **Then** screening decisions are read-only.

---

### User Story 3 - Executive prepares and confirms the interview schedule (Priority: P1)

The Executive reviews scheduling parameters, interviewer assignments, and rooms. They read a draft timetable with Proposed, Conflict, and Unassigned rows (with reasons), adjust rows manually, see which confirmation conditions are unmet, and confirm once all are satisfied. A confirmed schedule is read-only but can be exported.

**Why this priority**: Third PA#2 screen; it demonstrates the scheduling rules the backend will later enforce.

**Independent Test**: In the screening scenario, open the draft, see the CF-026/CF-027 same-applicant conflict and the unassigned CF-031, apply the demo resolution, watch the checklist update, and confirm. In the confirmed scenario, verify that editing is disabled.

**Acceptance Scenarios** (F4, F5, BR-07, BR-08, BR-10…BR-14; AC-26…AC-43):

1. **Given** the draft, **When** it renders, **Then** summary counts for Shortlisted, Proposed, Conflict, and Unassigned equal the displayed rows in the same scope.
2. **Given** a Conflict row, **When** it is shown, **Then** it names the other affected interview and the shared resource (applicant, interviewer, or room).
3. **Given** an Unassigned row, **When** it is shown, **Then** its reason is visible and its screening status remains Shortlisted.
4. **Given** Generate/Regenerate is clicked while a draft exists, **When** the action starts, **Then** a confirmation dialog asks before replacing the draft.
5. **Given** any unmet condition (applications still open, Pending Review remaining, Conflict, or Unassigned), **When** the Executive views Confirm, **Then** confirmation is disabled and each unmet condition is listed.
6. **Given** all conditions are met, **When** Confirm is accepted in a dialog, **Then** the schedule shows Confirmed, editing and regeneration are disabled, and Export remains available.
7. **Given** there are zero shortlisted applications, **When** the screen opens, **Then** it explains that schedule confirmation is skipped.

---

### User Story 4 - Visitor browses and Applicant applies and tracks results (Priority: P2)

A Visitor sees the published campaign and positions. Signing in (demo) lets an Applicant submit an application with a PDF CV, an SOP with a live word counter, and availability from club-provided slots. My Applications shows each application's screening status, confirmed interview (only after confirmation), and published result. An in-app notice appears when a result is published.

**Why this priority**: Required for the full product (PA#3–PA#6); depends on the Executive screens' data.

**Independent Test**: As a Visitor, view the campaign and be prompted to sign in when applying. As a demo Applicant, submit a valid form, trigger each validation error, and check My Applications in the screening and confirmed scenarios.

**Acceptance Scenarios** (F2, F6, F7, BR-02, BR-03, BR-05, BR-08; AC-05…AC-09, AC-11…AC-16, AC-22, AC-43, AC-46…AC-48):

1. **Given** the before-open scenario, **When** a Visitor opens the portal, **Then** campaign information is visible and submission is unavailable with an explanation.
2. **Given** a Visitor clicks Apply, **When** not signed in, **Then** the demo sign-in dialog opens; no registration or password recovery is offered.
3. **Given** the accepting scenario, **When** the CV is not a PDF or exceeds 5 MB, the SOP exceeds 300 words, or no slot is chosen, **Then** submission is blocked with a field-specific message and other input is preserved.
4. **Given** the Applicant already applied to a position, **When** they select it again, **Then** the UI points them to the existing application instead of creating another.
5. **Given** the screening scenario, **When** the Applicant opens My Applications, **Then** each application shows its own screening status and no interview time or final result.
6. **Given** the confirmed scenario, **When** CF-026's owner opens My Applications, **Then** they see their own confirmed interviews, the published Pass for CF-026, a notification for it, and **no** result for unpublished CF-027.

---

### User Story 5 - Interviewer reviews assigned interviews and submits assessments (Priority: P2)

The Interviewer sees only their assigned confirmed interviews, opens an application's details and CV link, and submits one assessment per completed interview. Already-submitted assessments are read-only.

**Why this priority**: Required for the full product; smallest screen.

**Independent Test**: As demo interviewer Hà My in the confirmed scenario, open CF-030, submit an assessment, and see it become read-only; open CF-026 and see its existing assessment read-only.

**Acceptance Scenarios** (F6, F7, BR-14; AC-43…AC-45):

1. **Given** the confirmed scenario, **When** Hà My opens the workspace, **Then** only her assigned interviews are listed.
2. **Given** an assigned completed interview without an assessment, **When** the form is submitted without a recommendation or notes, **Then** field errors appear.
3. **Given** a valid assessment, **When** it is submitted, **Then** the interview shows "submitted" and the form becomes read-only.
4. **Given** no assigned interviews (for example in the screening scenario), **When** the workspace opens, **Then** an empty state explains why.
5. **Given** the demo role is not Interviewer, **When** the workspace route is opened, **Then** a restricted-access state is shown (a UI demo only, not security).

---

### Edge Cases

- Very long campaign, position, and applicant names must wrap without horizontal page scroll.
- Lists with zero results after filtering show an empty state with a way to clear filters.
- Simulated service failure shows an error state with retry; simulated slow load shows a loading state.
- The same student appears in two applications and two interviews; the UI must never merge them.
- Unpublished results must never appear in any Applicant view, including notifications.
- At 200% browser zoom on a 1280px screen (≈640 CSS px), primary actions remain visible and reachable without horizontal page scroll.
- Reference dates (October–November 2026) are in the past relative to the real date; the UI uses a controlled demo clock instead of the system clock.

## Requirements *(mandatory)*

### Functional Requirements

**Navigation and layout**

- **UI-FR-001**: The application MUST provide one shared layout with a header showing the ClubFlow name, role-appropriate navigation, the current demo identity, and a sign-in or sign-out entry.
- **UI-FR-002**: Executive navigation MUST link Campaign Management, Application Review, and Interview Scheduling for the same campaign; the Applicant Portal and Interviewer Workspace MUST be reachable for their roles.
- **UI-FR-003**: Each of the five screens MUST have its own correct page title and campaign context (Brief §5 "Fix these" items 1–2; AC-50).
- **UI-FR-004**: Tabbed screens (Application Review, Applicant Portal) MUST reflect the active tab in the URL so it can be linked and refreshed.
- **UI-FR-005**: An unknown address MUST show a not-found state with a way back.

**Demo identity and scenarios**

- **UI-FR-006**: A clearly labeled demo control MUST let reviewers choose a role or account (Visitor, Executive, Applicant accounts, Interviewer accounts) and a workflow scenario. It MUST state that it is not real authentication.
- **UI-FR-007**: Demo scenarios MUST include at least: before-open, accepting applications, screening (applications closed, draft schedule), and confirmed (schedule confirmed, assessments and results in progress). Each scenario MUST use a fixed demo date and time.
- **UI-FR-008**: All screens MUST read one consistent set of demo records so that IDs, names, positions, times, rooms, and statuses agree across screens (references: `UI_REFERENCE_NOTES.md` demo data).
- **UI-FR-009**: Demo actions (save, publish, shortlist, confirm, submit, assess, record, publish results) MUST update the visible state consistently across screens within the session and MUST be labeled as demo where a user could mistake them for persistence.

**Screen requirements** (business behavior defined in the referenced BRs)

- **UI-FR-010**: Campaign Management MUST support the fields, actions, validation display, and states in [SCREEN_REQUIREMENTS §1 Screen 1](../../docs/requirements/SCREEN_REQUIREMENTS.md) (BR-01, BR-02, BR-04, BR-14).
- **UI-FR-011**: Application Review MUST support statistics, search, filter, sort, pagination, a detail panel beside the list, a private note, per-application Shortlist/Reject, and CSV export UI (SCREEN_REQUIREMENTS Screen 2; BR-06…BR-09).
- **UI-FR-012**: Application Review MUST include a Final Results tab (not a separate page) with assessment viewing, per-application Pass/Fail, and confirmed publication (F6; BR-08, BR-14).
- **UI-FR-013**: Interview Scheduling MUST support parameters, interviewer assignments, the draft table with Proposed/Conflict/Unassigned and reasons, manual adjustment, a confirmation-conditions list, a confirmed read-only state, and export UI (SCREEN_REQUIREMENTS Screen 3; BR-10…BR-14).
- **UI-FR-014**: The Applicant Portal MUST provide public campaign and position information, demo sign-in, an application form (student details, PDF CV ≤ 5 MB, SOP ≤ 300 words with a live counter, availability from provided slots), My Applications, published results, and in-app notifications (F2, F6; BR-02, BR-03, BR-05).
- **UI-FR-015**: The Interviewer Workspace MUST list only assigned interviews and provide application details, a CV access control, the interview information, an assessment form, a submitted read-only state, and empty and restricted states (F6, F7).
- **UI-FR-016**: The UI MUST keep CV-screening status, schedule status, and final result as separate visible milestones and never imply Pass from Shortlisted or from schedule confirmation (BR-08).

**Forms, dialogs, and states**

- **UI-FR-017**: Forms MUST validate on submit (and where helpful, on field change), show field-specific messages linked to their fields, move focus to the first error, and preserve valid input.
- **UI-FR-018**: Destructive or irreversible actions (Publish campaign, Shortlist, Reject, submit assessment, Regenerate draft, Confirm schedule, Publish results) MUST ask for confirmation in an accessible dialog. Each confirmation MUST remain bound to the entity and payload that opened it, and cancelling MUST perform no mutation.
- **UI-FR-019**: Every screen that loads data MUST show distinct loading, empty, and error states, with retry for errors.
- **UI-FR-020**: Disabled actions MUST explain why they are unavailable.

**Responsive, zoom, and accessibility**

- **UI-FR-021**: Every screen MUST be usable at 360px, 768px, 1280px, and wider viewports without horizontal page scroll.
- **UI-FR-022**: Every screen MUST remain usable at 100%, 125%, 150%, and 200% browser zoom by reflowing, never by scaling the page.
- **UI-FR-023**: Wide data tables MUST keep identifying data, status, and row actions visible on narrow screens (stacked rows on mobile); horizontal scrolling inside a table is allowed only where no key column or action is hidden.
- **UI-FR-024**: All interactive controls MUST be keyboard operable with visible focus; dialogs MUST trap focus, close on Escape, and return focus to the trigger; tabs MUST follow the tab pattern.
- **UI-FR-025**: Status MUST never be conveyed by color alone; touch targets MUST be at least 44 × 44 CSS px.

**Language and integration readiness**

- **UI-FR-026**: User-facing text MUST be Vietnamese, consistent with the references; internal status identifiers MUST be English and mapped to Vietnamese labels in one place.
- **UI-FR-027**: Screens MUST obtain data and perform actions only through replaceable service functions, so a real backend can replace demo data without changing page layouts.
- **UI-FR-028**: The UI MUST be able to display server-side validation and business-rule errors (for example a schedule conflict or a blocked confirmation) returned by a future backend, using the same message areas as client-side validation.
- **UI-FR-029**: The UI MUST NOT present client-side checks or demo roles as security; private data visibility in demo mode is illustrative only.

### Key Entities

Business meaning is defined in [PRODUCT_SPEC §5](../../docs/requirements/PRODUCT_SPEC.md). The UI demo records cover: Campaign, Department, Position, Account (Executive, Applicant, Interviewer), Application, Interview Slot (applicant availability), Interviewer Assignment and Availability, Room, Interview, Assessment, Final Result, Notification, and Demo Scenario (a named workflow phase with a fixed demo date and time).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can complete each of the five user stories' independent tests end to end using only the demo data, without developer help.
- **SC-002**: All five screens show no horizontal page scroll and no clipped primary action at 360, 768, and 1280 px, and at 125/150/200% zoom on a 1280 px window (manual checklist: 5 screens × 6 conditions = 30 checks, all passing).
- **SC-003**: For every displayed summary count (statistics, schedule counts, pagination text), the number equals the matching visible records in 100% of demo scenarios.
- **SC-004**: Every primary control in the five screens produces a visible result (navigation, tab change, dialog, validation message, or state change); zero controls do nothing silently.
- **SC-005**: Replacing the demo data source for one screen requires no change to that screen's layout or visual components (verified during the first backend integration).
- **SC-006**: All interactive flows can be completed with the keyboard alone.
- **SC-007**: The project quality gate (`npm run verify`) passes at the end of every implementation phase.

## Assumptions

- Vietnamese UI text follows the reference wording; status labels match the references (for example "Qua vòng CV" for Shortlisted).
- Assessment fields follow the interviewer reference (recommendation: three options; notes required) until Q-04 in [DECISIONS_AND_OPEN_QUESTIONS](../../docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md) is answered.
- The in-app notification is a simple list inside the Applicant Portal, not a separate notification center (Q-05).
- Applicants cannot edit submitted applications and Interviewers cannot edit availability directly (Q-06); the UI does not offer these actions.
- The first-fit generator's ordering (Q-01) is not implemented in the UI; "Generate draft" shows demo results.
- Demo data comes from `docs/reference/ui/UI_REFERENCE_NOTES.md`. Where reference files disagree, the notes and the requirements decide (see `research.md`).
- Browser support: current Chrome, Edge, and Firefox.
