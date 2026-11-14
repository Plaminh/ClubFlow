# ClubFlow — Screen & Interaction Requirements

**Sources:** Final Brief §§3.1–3.3 and §5 (the PA#2 screens and *Fix these* list); Business v1.1 §§3–6.  
**Distinction:** **PA#2** is three illustrative static HTML/CSS Executive screens; **Full product** adds Applicant/Interviewer, authentication, assessment, and results. The sources **do not mandate** exact URL routes, React component trees, or final layout.

## 1. PA#2 flow (Executive already signed in)

`Create Recruitment Campaign → Application Review → Interview Scheduling`

- Keep the **same club and campaign** throughout.
- Navigating from Screen 1 to Screen 2 **does not automatically create applicants or shortlist them**. Mock records represent applications submitted after publication.
- `Shortlisted` permits **draft** scheduling; it is not a final recruitment result.
- The demonstration ends at a **Confirmed schedule**, not published recruitment outcomes.

### Screen 1 — Create Recruitment Campaign

**Role:** Executive. **Purpose:** Prepare and publish a campaign.

| Area | Requirement |
|---|---|
| Campaign overview | Campaign name, host club, description, opening/closing time, submission instructions |
| Departments and positions | Department/position list, quota, job description, requirements; add/configure within scope |
| Interview preparation | One interview date after submissions close; club-provided availability slots; duration 15/20/30 minutes |
| Actions | Save Draft, Preview Campaign (what Applicants will see), Publish Campaign |
| Validation | Required fields; `open < close`; at least one position; positive integer quotas; retain entered data on error |
| Alternative states | Draft; invalid publication; read-only preview; Published (publication alone does not immediately lock all edits) |
| Navigation | Once published and applications arrive, continue to Application Review for the **same campaign** |

**Do not infer:** Example campaign names/dates in the static prototype are not required seeds. After confirmation, configuration is read-only under BR-14.

### Screen 2 — Application Review

**Role:** Executive. **Purpose:** Screen each submitted application.

| Area | Requirement |
|---|---|
| Header and statistics | Correct page title; same campaign; application count and distinct applicant count; Pending Review/Shortlisted/Rejected counts |
| List | Applicant, application ID, position, submission time, status; search, filter, sort, paginate |
| Details beside list | Student information, SOP, PDF CV, submission/review times, status; details must not obscure most of the list |
| Actions | Record/save private note; Shortlist Candidate or Reject **the selected application**; closing details preserves filters |
| Export | CSV reflecting selected filters and permitted fields |
| Navigation | When at least one application is Shortlisted, continue to Interview Scheduling for the same campaign; a draft may be prepared before all screening finishes, but confirmation requires BR-13 |

**Permissions:** Private notes are for Executive only. Do not label students `Verified Student` because university verification is out of scope. A decision on one application must not change another application from the same student.

### Screen 3 — Interview Scheduling

**Role:** Executive. **Purpose:** Generate, review, adjust, and confirm interviews.

| Area | Requirement |
|---|---|
| Parameters | One interview date, time window, common duration 15/20/30, existing rooms, assigned interviewers/availability |
| Summary | Shortlisted, Proposed, Conflict, Unassigned counts; **counts must match the displayed rows in the same scope** |
| Draft table | Application, applicant, position, availability, date/time, interviewer, room, status, reasons for Unassigned/Conflict |
| Actions | Generate/Regenerate (confirm before overwrite), Edit, Resolve, Assign Slot, Save Changes (draft), Export Timetable |
| Conflict display | Report actual conflicts and affected interviews, including shared applicants applying to different positions |
| Confirm | Approve & Confirm Schedule is available only when BR-13 is satisfied; explain unmet conditions |
| Confirmed | Read-only, no edit/regenerate; export allowed; authorized people see only their own assignments |

**No automatic final result:** Confirming the schedule is not publishing `Pass/Fail` recruitment results.

## 2. *Fix these* — Final Brief §5

New screens and mock fixtures must **not reproduce equivalent problems**:

1. **Timeline:** Opening/closing/interview dates must agree across screens; interviews are after submissions close.
2. **Page title:** Application Review must use its own correct title/top bar, not Screen 1's title.
3. **Drawer/list:** Both details and the list must remain readable at each viewport width; the drawer cannot hide most of the list.
4. **Schedule counts:** Proposed/Conflict/Unassigned summary counts must match the actual records within the stated scope.
5. **Real conflicts:** An overlap warning must correspond to at least two interviews that genuinely conflict by applicant/interviewer/room and time.
6. **Distinct sample identities:** Do not show the same sample person as both Applicant and Interviewer on Screen 3.
7. **No unsupported verification:** Avoid `Verified Student`, `100% verified`, `Verified Attachments`, or claims of university verification.
8. **No template footer:** Remove irrelevant `© 2025`, `Privacy Policy`, `Terms of Service`, and `Support Center` boilerplate.

**Responsive checking:** PA#2 must support desktop, tablet, and mobile. Source-prototype checks used widths 360/768/1280; these are useful test sizes, not a substitute for any separate detailed accessibility/contrast rubric.

## 3. Full-product capabilities beyond the three PA#2 screens

These are **required capabilities**, not mandated counts of routes/pages:

| Capability | Role | Required content / flow |
|---|---|---|
| Public campaign browsing | Visitors/signed-in users | Published campaign, positions, deadlines; publicly visible even before applications open |
| Sign In / Sign Out | Three authenticated roles | Pre-created accounts, role-aware navigation; **no** registration/recovery |
| Application submission | Applicant | Choose position; student fields, PDF ≤ 5 MB, SOP ≤ 300 words, availability from provided slots; handle duplicate/time window |
| My applications | Applicant | Per-position application list, screening state, personal Confirmed schedule, published final result |
| My assigned interviews | Interviewer | Assigned Confirmed schedule and authorized CVs |
| Interview assessment | Interviewer | Evaluate completed assigned interview; one assessment per interview |
| Final outcome management | Executive | Review assessment, record Pass/Fail, publish by application |
| In-app result notice | Applicant | Notice of published outcome; no email/SMS/push or separate notification center required |

## 4. Screen and state principles

- Page labels and campaign context must be clear; do not present illustrative states as actual final results.
- Show meaningful errors and preserve valid input when a submission/publication fails.
- Forms and lists reflect permissions, but server-side enforcement remains mandatory.
- Loading/empty/error states are **reasonable React implementation practices**; the sources do not mandate exact text, skeletons, or component libraries.
- Do not import entire static HTML/CSS files into the React runtime. Use PA#2 to guide layout, flow, responsive behavior, and fixtures.

## 5. Related rules and tests

- Screen 1: BR-01–BR-04 and BR-14.
- Submit Application: BR-02, BR-03, BR-05.
- Screen 2: BR-06–BR-09 and BR-14.
- Screen 3: BR-07/08 and BR-10–BR-14.
- Interviewer/results views: Business §2 access boundaries and §6 outcomes.

See [Acceptance Criteria](ACCEPTANCE_CRITERIA.md) for test cases.
