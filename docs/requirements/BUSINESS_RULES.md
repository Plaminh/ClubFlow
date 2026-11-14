# ClubFlow — Business Rules (BR-01…BR-14)

**Canonical source:** Business Description v1.1 §§3.1, 3.2, 4, 5.1, 5.2. Also read Final Project Brief §§3–4.  
**Convention:** **Required** means prescribed by the sources; **Implementation/testing guidance** describes a possible control, **not** a mandated architecture. Times are examples, not required seed data.

## Campaign: publication and applications

### BR-01 — Validation before publication

- **Source:** Business v1.1 §3.1.
- **Precondition:** The Executive has a draft campaign.
- **Required:** All required campaign information is present; opening time is **before** closing time; the campaign has at least one position; each position's quota is a **positive integer**. On failure, identify the specific errors, retain valid entered data, and **do not publish**.
- **Boundary cases:** Quota `0`, negative, or fractional is invalid; `open == close` is invalid.
- **Implementation guidance:** Validate in the UI for timely feedback and in the service to reject requests bypassing the UI. Publishing is a separate state change, not the same as saving a draft.
- **Test:** Missing required names/descriptions/dates, no positions, invalid quotas, `open >= close`; verify draft and previously valid input remain after failure.

### BR-02 — Public visibility and submission window

- **Source:** Business v1.1 §3.1.
- **Required:** A `Published` campaign may appear publicly **before opening time**. Applications may be accepted **from opening until strictly before closing**, `open <= now < close`. Drafts are visible only to the Executive.
- **Implementation guidance:** Check the submission time on the backend and restrict reading drafts.
- **Test:** Reject submissions before opening, exactly at closing, and after closing; allow submission at opening if all other requirements are met; visitors cannot view drafts.

### BR-03 — Position quotas do not cap application submissions

- **Source:** Business v1.1 §3.1.
- **Required:** A quota is the **planned number of recruits**, not a maximum number of applications. Accept eligible submissions within the submission window **regardless of whether the application count has reached the quota**.
- **Test:** With quota 2, a third applicant may still submit successfully within the deadline.

### BR-04 — Preserve position–application references

- **Source:** Business v1.1 §3.1.
- **Required:** Do not delete a position when doing so would sever an existing application's link to it. Explain why the operation is blocked.
- **Implementation guidance:** Protect referential integrity in both the database and service; do not cascade-delete existing applications.
- **Test:** Deleting a position with applications fails and leaves all applications linked to that position.

## Application: submission

### BR-05 — One application per applicant, campaign, and position

- **Source:** Business v1.1 §3.2; Brief §4, Building #2.
- **Required:** Business key = **Applicant + Campaign + Position**. A student may apply for multiple positions in one campaign; each position has a separate application and decision. Re-submitting to the same position **opens the existing application** and does not create another record, even after repeated clicks.
- **Implementation guidance:** Use a uniqueness constraint on `(applicant_id, campaign_id, position_id)` and handle duplicate requests in the service, including concurrent requests; do not rely solely on disabling a button.
- **Test:** Two duplicate requests produce one record; two distinct positions produce separate records; a repeat returns or opens the existing application.
- **Related submission conditions (§3.2):** The applicant is signed in; the campaign is accepting submissions; the fixed form contains student information, one PDF CV ≤ 5 MB, an SOP ≤ 300 words, and availability selected from provided slots. Valid applications begin in `Pending Review`. Errors must be specific and preserve valid entered values.

## Review: CV screening and export

### BR-06 — Application count differs from applicant count

- **Source:** Business v1.1 §4.
- **Required:** Total applications = number of application records; total applicants = number of distinct students. State clearly whether statistics cover the entire campaign or a filtered subset.
- **Test:** One applicant with two applications yields `2 applications` but `1 applicant`; filtering must not misleadingly mix campaign totals and filtered counts.

### BR-07 — Independent per-application decisions and campaign-specific scheduling

- **Source:** Business v1.1 §4.
- **Required:** `Shortlist` or `Reject` changes **only the selected application**. The scheduling input consists solely of `Shortlisted` applications from the **same campaign**.
- **Test:** If a student has A01 and A02, rejecting A01 does not alter A02. Shortlisted applications from a different campaign never enter the current campaign's schedule.

### BR-08 — Three distinct milestones

- **Source:** Business v1.1 §4.
- **Required:** `Shortlisted` means the application passed CV screening only. An interview appointment is effective for the relevant people **only after schedule confirmation**. Final `Pass/Fail` is stored **separately for each application**. Never infer final acceptance from shortlisting or schedule confirmation.
- **Implementation guidance:** Keep CV-screening, schedule, and final-result states separate and label each milestone accurately in the UI.
- **Test:** A shortlisted application is not displayed as having a confirmed interview or a final Pass unless those later steps actually occurred.

### BR-09 — Export respects filters and permissions

- **Source:** Business v1.1 §4.
- **Required:** The Executive can export applications matching the **current filter** and only fields they are permitted to export. CVs and private screening notes retain their access restrictions.
- **Implementation guidance:** Enforce filtering and permissions on the backend; do not expose public CV URLs or private notes to unauthorized users.
- **Test:** Export by position/status contains only matching applications; unauthorized users cannot retrieve private files or datasets.

## Scheduling: drafts and conflict resolution

### BR-10 — At most one interview, exactly one interviewer, valid availability

- **Source:** Business v1.1 §5.1.
- **Required:** Each application has **at most one** interview; each interview has **exactly one** interviewer. The interview must lie fully within the campaign's interview window, and both the **applicant and assigned interviewer** must be available. The interviewer must be assigned to the relevant position.
- **Implementation guidance:** Validate each draft assignment/edit; enforce one interview per application. All interviews in a campaign use the selected common duration (15/20/30 minutes).
- **Test:** An unqualified interviewer, unavailable person, or out-of-window time must not be treated as a valid assignment.

### BR-11 — Conflict detection for people and rooms

- **Source:** Business v1.1 §5.1; Brief §3.4.
- **Required:** In the same campaign, time-overlapping interviews conflict if they share an **applicant**, **interviewer**, or **room**. Compare applicants by **person**, including applications for different positions. Adjacent non-overlapping slots are allowed.
- **Canonical example:** `[09:00, 09:20)` and `[09:20, 09:40)` are valid. Two interviews for the same applicant both at `[09:00, 09:20)` conflict even if they use different interviewers and rooms.
- **Implementation guidance:** For intervals on the same resource, `start1 < end2 && start2 < end1` tests overlap. Half-open intervals explain why adjacent slots are allowed; no specific library is mandated.
- **Test:** A one-minute overlap conflicts; a shared boundary does not; same applicant across positions conflicts; simultaneous interviews without any shared applicant/interviewer/room do not conflict.

### BR-12 — Unassigned does not mean rejected

- **Source:** Business v1.1 §5.1.
- **Required:** If no qualified interviewer, common available time, or room exists, the application remains `Shortlisted` and receives `Unassigned` **with a reason**. The Executive must be able to adjust the draft. Never automatically change such an application to `Rejected`.
- **Test:** No valid slot results in `Unassigned` plus an explanation while screening status stays `Shortlisted`.

## Confirmation: finalizing the interview schedule

### BR-13 — Prerequisites for confirmation

- **Source:** Business v1.1 §5.2; Brief §3.2, Step 5.
- **Required:** Confirm only when **(a)** applications have closed, **(b)** all applications have been screened, **(c)** each `Shortlisted` application has exactly one valid interview, and **(d)** there are **zero Unassigned** and **zero Conflict** records. Otherwise list outstanding issues, preserve the draft, and block confirmation. **If there are no shortlisted applications, skip schedule confirmation.**
- **Implementation guidance:** Recheck all conditions in the confirmation service rather than relying on a disabled frontend button.
- **Test:** Each unmet prerequisite independently blocks confirmation; all met prerequisites permit confirmation; zero-shortlisted cases take the skip branch rather than fabricating an empty schedule.

### BR-14 — Confirmed schedule and read-only data

- **Source:** Business v1.1 §5.2; Brief §3.2, Step 5.
- **Required:** Show `Confirmed` schedules only to the correct applicant and assigned interviewer. Lock changes to **campaign configuration**, **submitted application content**, **CV-screening decisions**, and **the schedule**. Do not edit or regenerate confirmed schedules. **Assessments and final outcomes remain possible after confirmation.** The Executive may still export the schedule.
- **Implementation guidance:** Backend guards must cover all affected write paths, not only disabled UI controls.
- **Test:** Post-confirmation changes to campaign/application/screening/schedule are rejected, while valid assessments and result publication are still accepted.

## Requirements outside BR-01…BR-14

The numbered business rules **do not exhaust the product requirements**. The following also remain mandatory under Brief §4 / Business v1.1 §§2, 6:

- Sign-in with pre-created accounts; role- and ownership/assignment-based authorization, including direct access to CV files.
- Fixed application form: student details, PDF ≤ 5 MB, SOP ≤ 300 words, club-provided availability slots.
- Application listing with search, filters, sorting, pagination, statistics, and basic CSV export.
- Scheduling by the **sequential first available valid combination** of slot + interviewer + room; revalidation after edits; confirmation before replacing a draft on regeneration.
- Interviewer assessment after the assigned interview; Executive records and publishes application-specific `Pass/Fail`; Applicant sees published outcomes and an **in-app notification**.
- No email/SMS/push notifications or separate notification center.

## Matters not determined by the sources

The exact first-fit tie-breaking order, representation of timestamps/time zones, which campaign fields may be edited after publication but before confirmation, and the technical method for private CV delivery need decisions at the relevant implementation stage. See [Decisions and Open Questions](DECISIONS_AND_OPEN_QUESTIONS.md). Do not treat any suggested technical choice as lecturer policy.
