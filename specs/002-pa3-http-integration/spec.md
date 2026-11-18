# Feature Specification: PA#3 HTTP Integration and Completion

**Feature Branch**: `pa3-finalize`

**Created**: 2026-11-18

**Status**: Ready for planning

**Input**: Complete ClubFlow PA#3 from the approved Phase 2A design through contract definition, deterministic mock-backed integration, functional completion, and submission-quality verification while preserving the existing React user experience.

## User Scenarios & Testing

### User Story 1 - Executive completes the recruitment workflow (Priority: P1)

An Executive can prepare and publish the current campaign, configure interview resources, review applications independently, build and confirm a valid schedule, record final decisions, and publish results without leaving the application or losing workflow continuity.

**Why this priority**: The Executive journey connects the campaign, review, scheduling, and result stages and is the backbone of the required main flow.

**Independent Test**: Start from deterministic campaign data, complete the Executive actions from campaign publication through result publication, and verify that every mutation is reflected by the next read and is visible only to permitted roles.

**Acceptance Scenarios**:

1. **Given** a valid draft campaign, **When** the Executive previews and publishes it, **Then** visitors see the public campaign and invalid required fields prevent publication with specific field feedback.
2. **Given** a published campaign that is not confirmed, **When** the Executive makes a permitted position, quota, or application-window change, **Then** the change is retained while linked positions and locked interview configuration remain protected.
3. **Given** Student A has separate Content and Communications applications, **When** the Executive reviews them, **Then** notes and screening decisions affect only the selected application.
4. **Given** shortlisted applications and a closed application window, **When** the Executive generates a draft schedule, **Then** proposed, conflict, and unassigned rows have accurate reasons and can be resolved and saved.
5. **Given** any shortlisted application remains invalid, conflicting, or unassigned, **When** confirmation is attempted, **Then** confirmation is refused with actionable conditions.
6. **Given** a valid confirmed schedule and submitted assessments, **When** the Executive records and publishes results, **Then** each published application produces exactly one applicant notification and becomes read-only where required.

---

### User Story 2 - Applicant applies and tracks each application (Priority: P1)

An Applicant can discover an open campaign, sign in, apply to one or more positions with a valid PDF and availability, and later track screening, confirmed interviews, published results, and notifications for only their own applications.

**Why this priority**: Applicant submissions create the records used by every later workflow stage and ownership is a core privacy requirement.

**Independent Test**: Sign in as Student A, submit two position applications, attempt a duplicate, and verify independent status, schedule, result, notification, and CV visibility for the owning account.

**Acceptance Scenarios**:

1. **Given** an open public campaign, **When** a visitor opens it, **Then** published campaign details, eligible positions, and availability choices are visible without private records.
2. **Given** a signed-in Applicant with a valid PDF no larger than 5 MiB, a statement no longer than 300 words, and at least one campaign slot, **When** they submit one application per position, **Then** each position receives a distinct stable application record.
3. **Given** an application already exists for the same campaign, Applicant, and position, **When** the Applicant submits again, **Then** no duplicate is created and the existing application is identified.
4. **Given** invalid input or a campaign that closes before submission completes, **When** submission fails, **Then** the Applicant receives specific feedback and already entered valid values remain available for correction.
5. **Given** screening, schedule, or result data at different workflow stages, **When** the Applicant views their applications, **Then** only confirmed schedules and published results are exposed.

---

### User Story 3 - Interviewer completes assigned assessments (Priority: P1)

An Interviewer can see only confirmed interviews assigned to them, open the permitted application and CV details, and submit one assessment for an assigned completed interview without seeing Executive-only notes.

**Why this priority**: Assessment data is required before the Executive can complete final decisions, and role isolation is essential.

**Independent Test**: Sign in as each canonical Interviewer, compare assigned work, attempt cross-assignment access, submit one valid assessment, and verify duplicate or unauthorized assessment attempts are refused.

**Acceptance Scenarios**:

1. **Given** a confirmed schedule, **When** an Interviewer opens their workspace, **Then** only their assigned interviews and authorized CVs are listed.
2. **Given** an assigned interview that has completed, **When** the Interviewer submits a valid assessment, **Then** it is saved once and the assessment becomes read-only.
3. **Given** an unassigned application, another Interviewer's interview, a future interview, or an already assessed interview, **When** submission or detail access is attempted, **Then** it is refused without leaking private notes or records.

---

### User Story 4 - Reviewer can exercise reliable delivery states (Priority: P2)

A reviewer can run the same product against deterministic normal, slow, error, and empty data conditions and can directly open or reload every route at phone, tablet, and desktop widths.

**Why this priority**: PA#3 grading explicitly depends on observable loading, retry, empty, routing, responsive, and state-continuity behavior rather than a success-only demonstration.

**Independent Test**: Restart from clean data for each condition, open every important route directly, and verify success, loading, retryable failure, and zero-data behavior without stale browser fixtures.

**Acceptance Scenarios**:

1. **Given** normal mode, **When** a reviewer completes the C1-C11 journey, **Then** reads and mutations remain deterministic until restart.
2. **Given** slow mode, **When** any data screen requests data, **Then** a loading state is visible without repeated requests.
3. **Given** error mode, **When** a domain request fails, **Then** a documented error and Retry control appear while sign-in remains available.
4. **Given** empty mode, **When** list-based screens open, **Then** all list and nested-list values are empty, derived counts are zero, and valid single-resource context remains visible.
5. **Given** signed-out, wrong-role, unknown, or directly reloaded routes, **When** navigation occurs, **Then** the user receives the correct redirect, access message, or not-found screen and Browser Back remains meaningful.
6. **Given** viewport widths of 360, 768, and 1280 CSS pixels, **When** important routes and dialogs are reviewed, **Then** content remains usable without horizontal page scrolling and mobile targets remain at least 44 CSS pixels.

### Edge Cases

- The campaign changes from open to closed while an Applicant is completing or submitting a form.
- The same Applicant applies for multiple positions and must never receive overlapping confirmed interviews.
- Two schedule rows overlap on an Applicant, Interviewer, or room; adjacent intervals are not conflicts.
- A draft contains no shortlisted applications, lacks an eligible Interviewer, or lacks an available room.
- The Executive saves draft schedule changes without confirming them, restarts the mock, or attempts to edit after confirmation.
- A profile email collides with another account or an authentication token is missing, malformed, or belongs to the wrong role.
- A PDF is exactly 5 MiB, larger than 5 MiB, incorrectly typed, or absent; a statement is exactly 300 words or 301 words.
- Search, filters, sorting, and pagination produce zero results or the selected detail disappears after a mutation.
- Result publication is repeated and must not duplicate notifications.
- A response contains no body, a file download, or a structured validation, conflict, forbidden, not-found, or server error.
- A request becomes stale or is aborted while the user changes query, route, or session.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST support the complete C1-C11 ClubFlow journey for Visitor, Applicant, Executive, and Interviewer roles using one coherent campaign and stable resource identities.
- **FR-002**: Every protected operation MUST authenticate the caller and enforce role, ownership, assignment, and private-field visibility rules.
- **FR-003**: The system MUST use username and password for the canonical demonstration accounts `exec`, `studentA`, `int-content`, and `int-comms`; a separate `studentB` account MAY support upload and ownership checks.
- **FR-004**: The system MUST define one reviewed interface contract for every product request, including purpose, allowed role, input constraints, success shape, applicable error shapes, deterministic examples, and change history.
- **FR-005**: Collection reads MUST return successful empty collections rather than treating no records as an error.
- **FR-006**: Errors MUST use one consistent human-readable error, machine-readable code, optional field-error, and optional detail structure.
- **FR-007**: The product MUST preserve a coherent campaign lifecycle from draft through publication, application acceptance and closure, schedule confirmation, assessment, and result publication without a test-only time-control action.
- **FR-008**: Published campaigns MUST allow only the constrained edits approved for PA#3, MUST protect linked positions and locked interview configuration, and MUST become read-only after schedule confirmation.
- **FR-009**: Applicant submission MUST validate campaign state, uniqueness, ownership, PDF type and 5 MiB limit, 300-word statement limit, and campaign-provided availability while preserving correctable form input after refusal.
- **FR-010**: Application review MUST support search, filter, sort, pagination, statistics, permitted CSV export, private notes, CV access, and independent screening decisions.
- **FR-011**: Schedule generation MAY be deterministic fixture behavior, but draft edits MUST recalculate Applicant, Interviewer, room, availability, position-eligibility, and campaign-window conflicts.
- **FR-012**: Draft generation, row editing or resolution, saving changes, export, and confirmation MUST be distinct actions with observable and coherent state transitions.
- **FR-013**: Schedule confirmation MUST be refused until every shortlisted application has one valid assignment and no conflict or unassigned row remains; confirmation MUST lock the required records.
- **FR-014**: Interviewers MUST see only assigned confirmed work and MUST be able to submit no more than one assessment for each assigned completed interview.
- **FR-015**: Executives MUST own final Pass or Fail decisions, Applicants MUST see only published results, and publication MUST create exactly one in-app notification per application.
- **FR-016**: Every API-backed screen MUST expose loading, retryable error, empty, and successful states, and mutation results MUST update the screen from returned or refetched data without a full-page reload.
- **FR-017**: Search-driven requests MUST avoid stale results and unnecessary repeated requests; filters MUST remain intact when closing an application detail view.
- **FR-018**: Runtime domain communication MUST use same-origin relative paths and shared request behavior; application components MUST NOT read domain records directly from browser fixture stores.
- **FR-019**: The deterministic demonstration service MUST reset state on process restart, retain valid canonical tokens across restart, log request method/path/status, and support normal, slow, error, and empty modes.
- **FR-020**: Forms MUST have visible labels, prevent duplicate submissions, expose accessible field feedback, and retain valid user input after correctable failures.
- **FR-021**: Direct routes, reload, Browser Back, unknown routes, signed-out protection, and cross-role protection MUST behave consistently.
- **FR-022**: Important screens MUST preserve semantic landmarks, exactly one level-one heading, correct link/button meaning, labeled controls, 44-pixel mobile targets, and no horizontal page scroll at 360, 768, or 1280 pixels.
- **FR-023**: Automated checks MUST cover changed validation, business rules, interface behavior, and critical interactions without weakening established expectations.
- **FR-024**: Delivery documentation MUST truthfully record implementation scope, real AI assistance, verified accounts and routes, evidence, limitations, and submission readiness without inventing identities, links, incidents, or results.
- **FR-025**: Work MUST preserve the existing React screens, architecture, behavior, backend scaffold, and unrelated user changes; production backend persistence, production authentication, email, real cloud upload, and optimization scheduling remain outside PA#3.

### Key Entities

- **User**: A canonical account with stable identity, role, profile, and demonstration credentials.
- **Campaign**: The single recruitment campaign, its public details, application window, interview configuration, lifecycle state, and lock state.
- **Department and Position**: Functional recruitment units and eligible positions with quotas and application linkage.
- **Availability Slot**: A campaign-provided interval selected by Applicants and compared during scheduling.
- **Application**: One Applicant's immutable submission for one campaign position, including snapshot data, CV metadata, statement, availability, screening state, and Executive-only note.
- **Interviewer Assignment**: An Interviewer's eligible positions and availability for the campaign.
- **Room**: An existing selectable interview resource.
- **Interview**: A draft or confirmed assignment linking one shortlisted application, time, Interviewer, and room with status and conflict reasons.
- **Assessment**: One immutable Interviewer submission for an assigned completed interview.
- **Final Result**: The Executive's Pass or Fail decision for one application, visible to the Applicant only after publication.
- **Notification**: One in-app message created for the owning Applicant when an application result is published.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A reviewer can complete all 11 required flow steps from campaign preparation through applicant notification using application controls, with every mutation visible on the next relevant screen.
- **SC-002**: All documented request examples produce their documented status and response structure against a freshly reset demonstration service, with zero undocumented product requests from the frontend.
- **SC-003**: The normal, slow, error, and empty conditions each produce their required user-visible state on every main data screen; empty collections yield zero displayed counts.
- **SC-004**: Automated lint, frontend and backend tests, contract-equivalent HTTP checks, and the production build complete with zero failures.
- **SC-005**: At 360, 768, and 1280 CSS pixels, all important routes have one level-one heading, no horizontal page scroll, no clipped primary action, and mobile controls at least 44 CSS pixels high.
- **SC-006**: Direct opening and reload of every route yields a meaningful screen, redirect, or access message in every authentication and role state; no route is blank.
- **SC-007**: Unauthorized role, ownership, assignment, and unpublished-result checks expose zero protected private fields in response bodies.
- **SC-008**: A clean process restart restores the same demonstration accounts, tokens, and initial records, while discarding all mutations from the prior run.
- **SC-009**: Submission documentation distinguishes PASS, FAIL, and NOT RUN evidence for every required quality gate and identifies all remaining human-supplied fields.

## Assumptions

- The master implementation prompt supplied on 2026-11-18 is the approved PA#3 delivery direction and resolves PA#3 behavior where older team-selected prototype decisions differ, especially constrained published-campaign editing.
- The existing completed React UI is the presentation baseline and is adapted through service and state integration rather than rewritten.
- One deterministic primary campaign and fictional demonstration records are sufficient for PA#3.
- Vietnam time is UTC+7, and a date-only closing date remains accepting through that calendar date and closes at 00:00 the next day.
- Fixed deterministic draft schedules are acceptable for PA#3; a production first-fit engine is deferred.
- In-app notifications are required; email is optional and not part of this feature.
- Applicant submission editing or withdrawal and assessment editing are optional and excluded unless already required to preserve approved behavior.
- The exact official contract checker may be unavailable. Equivalent checks may be used, but official checker status remains NOT RUN unless the official file is located and executed.
- Team member names and student IDs require human input and are never inferred.

## Out of Scope

- Express implementations of ClubFlow domain endpoints.
- PostgreSQL persistence or migrations for the PA#3 demonstration data.
- Production JWT lifecycle, password storage, or revocation.
- Real Cloudinary uploads or direct-URL access enforcement.
- Production schedule optimization or transactional concurrency.
- Brevo or other email delivery.
- External deployment, remote push, merge, submission, or grading decisions.
