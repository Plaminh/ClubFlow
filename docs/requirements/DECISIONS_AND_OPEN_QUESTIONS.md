# ClubFlow — Decisions, Source Differences & Open Questions

**Compiled:** 2026-11-14.  
**Principle:** Technical proposals, mock UI examples, and meeting notes are not Product Owner decisions. Any decision that changes interpretation of the brief must be supported by an authoritative public source.

## 1. Confirmed source requirements

| Internal ID | Confirmed requirement | Source |
|---|---|---|
| D-01 | One club, at most one active campaign, one interview date per campaign | Brief §4; Business §§1–2 |
| D-02 | Three pre-created account roles; Visitor can see public content; Department is not a role | Brief §2; Business §2 |
| D-03 | Position-specific applications; duplicate applicant/campaign/position cannot create a new record | Brief §4; BR-05 |
| D-04 | PDF CV ≤5 MB, SOP ≤300 words, availability selected from club slots | Brief §4; Business §3.2 |
| D-05 | Shortlisted, Confirmed schedule, and final Pass/Fail are separate milestones | BR-08; Business §6 |
| D-06 | Schedule only Shortlisted; one interviewer per interview; common duration 15/20/30 | Brief §4; BR-10 |
| D-07 | Conflicts by shared applicant (across positions), interviewer or room when times overlap; adjacent slots are allowed | BR-11 |
| D-08 | Confirmation conditions, post-confirmation locks, and zero-shortlisted skip branch | BR-13/14 |
| D-09 | Interviewer assesses assigned interview; Executive publishes Pass/Fail with in-app notification | Business §6; Brief §3.3 |
| D-10 | Multi-club, registration, SSO, student verification, AI CV assessment, email/SMS/push are excluded | Brief §4; Business §7 |

## 2. Existing clarifications in Business Description v1.1

These elaborate the brief; they are **not** newly discovered contradictions:

- The Brief allows `one active recruitment campaign`; Business §2 defines active as **published until the recruitment workflow completes**, with explicit completion criteria.
- The Brief forbids duplicate applications; BR-05 clarifies that re-submission must **open the existing application**, not increase the record count.
- The Brief requires conflict checks; BR-11 clarifies that **adjacent slots do not overlap**.
- The Brief requires no remaining conflicts for confirmation; BR-13 explicitly says **skip confirmation if there are no shortlisted applications**.
- The Brief makes confirmed schedules read-only; BR-14 identifies the exact locked data and confirms that **assessment/final results can still be recorded**.
- The Brief mentions interviewer availability; Business §§3/5 specify that the **Executive enters it**, while the Interviewer *provides* availability information. Do not infer an Interviewer self-service availability editor.

## 3. Matters to decide at the relevant implementation phase

These are not blockers for documentation. **The supplied three documents do not provide authoritative answers.**

| ID | Practical question | Why it matters | Follow-up |
|---|---|---|---|
| Q-01 | What is the generator's precise `first available` ordering of applications, slots, interviewers, and rooms? | Generated results and tests must be deterministic | Specify a stable order during Scheduling; document/test it; seek Product Owner input if it affects user-visible policy |
| Q-02 | What date/time representation, time zone, and precision are used for `open`/`close`? | Submission boundary `open <= now < close`, one interview date, local times | Decide in the API/data spec before coding time logic |
| Q-03 | Which individual campaign/position fields are editable after Published but before Confirmed? | Prevent broken application links or selected slots | Respect BR-04/14; ask through Product Owner channel for additional policy |
| Q-04 | Which fields belong in the interview assessment, and can an assessment be edited before the final decision? | Assessment form and persistence design | Start from the minimum of one assessment per completed interview; get clarification if changing workflow |
| Q-05 | What shape and placement of the in-app notification are sufficient without a separate notification center? | Meet the notice requirement without scope creep | Design a minimal result notice; ask Product Owners if UI expectation matters |
| Q-06 | Can Applicants edit submissions, or Interviewers directly edit availability/assessments, in exceptional cases not described? | Avoid granting unnecessary permissions or introducing unsupported features | Do not enable additional rights without an authoritative decision |
| Q-07 | Which storage and delivery strategy will protect private CVs? | CVs are private; public `secure_url` may violate access rules | Make a technical decision during Upload; record-level authorization is non-negotiable |

## 4. Things that are not product conflicts

- Dates `12 Oct → 30 Oct → 5 Nov 2026` and IDs `CF-026` etc. in PA#2 are **sample fixtures**, not official deadlines or mandatory constants.
- Screenshots in Brief §5 depict the authors' design with defects. The *Fix these* list requires **avoiding equivalent defects**, not copying their screens or preserving inconsistent example counts.
- Meeting Notes describe `Cloudinary`, JWT, and `backend/...` paths from a point in time. This is **team/framework history and guidance**, not additional mandatory product scope.

## 5. Process for new decisions

1. Find evidence in the two authoritative sources; check whether the issue is truly omitted or contradictory.
2. Determine authority: the **lecturer** controls PA#2 requirements/rubrics/deadlines; **Product Owners** can clarify or narrow unspecified product scope (Brief §6).
3. For a Product Owner answer, use the class ClubFlow post beginning with `#WAD24KTPM1`; private messages are not class-wide decisions.
4. Record date, public URL/evidence, answer, decision-maker, and affected files/BRs.
5. Only after valid evidence exists may you change canonical behavior in `BUSINESS_RULES`, `WORKFLOWS_AND_STATES`, `ACCEPTANCE_CRITERIA`, or `TRACEABILITY`.

### Record template for an authoritative answer

```text
Decision ID:
Date:
Public source / URL:
Authority: Lecturer / Product Owner
Question:
Confirmed answer:
Impact: BR/AC/Screen/DB/API
Updated by:
```

**Current state:** None of the three supplied documents contains a public Product Owner clarification. Do not mark Q-01…Q-07 `Approved` on speculation. The team has selected a working direction for each question so that development can continue; those selections are recorded in §6 and are **not** Product Owner answers.

## 6. Team-selected implementation decisions (Q-01…Q-07)

**Selected:** 2026-11-16, by the development team. **Evidence of Product Owner approval:** none in this repository.

How to read this section:

- Every record has the status `TEAM-SELECTED — PENDING PRODUCT OWNER CONFIRMATION`. It becomes `Approved` only through the process in §5, with a public source.
- These records do **not** change the canonical requirements (`BUSINESS_RULES`, `WORKFLOWS_AND_STATES`, `ACCEPTANCE_CRITERIA`, `TRACEABILITY`, `SCREEN_REQUIREMENTS`). Where a selection is stricter than, or conflicts with, those documents, the record says so and the canonical text stays as it is.
- "Frontend behavior" describes the React prototype, which runs on an in-memory mock layer. "Backend responsibility" is **not implemented**; it is the contract the Express/PostgreSQL work has to meet.
- Paths are relative to `frontend/src/` unless they start with `docs/` or `specs/`.

### Q-02 — Date, time and time zone convention

- **Status:** TEAM-SELECTED — PENDING PRODUCT OWNER CONFIRMATION.
- **Selected decision:**
  - Business time zone: `Asia/Ho_Chi_Minh` (UTC+7, no daylight saving).
  - An absolute instant is stored and sent in UTC as an ISO 8601 string, for example `2026-11-05T02:00:00.000Z`. PostgreSQL target type: `TIMESTAMPTZ`.
  - Display: dates as `dd/MM/yyyy`, times as 24-hour `HH:mm`, always in the business time zone, whatever the browser's locale or time zone is.
  - Date-only fields (`opensOn`, `closesOn`, `interviewDate`) are calendar dates in the business time zone, not instants. PostgreSQL target type: `DATE`. The interview window (`09:00`–`12:00`) is a wall-clock time range on the interview date.
  - Submission window: the opening date is inclusive and the closing date is inclusive as a calendar day. `openAt` = 00:00 on the opening date; `closeAt` = 00:00 on the day after the closing date; a submission is accepted when `openAt <= now < closeAt` (BR-02).
  - Example: closing date 30/10/2026 → `closeAt` = 31/10/2026 00:00 Vietnam time = `2026-10-30T17:00:00.000Z`. A submission at 30/10/2026 23:59:59 is accepted; one at 31/10/2026 00:00:00 is rejected.
- **Business rationale:** The club, its applicants and its interviewers are all in Vietnam, so one fixed zone avoids "which midnight?" disputes at the deadline. Executives enter dates, not times, so "until the end of the closing day" is what they expect. UTC storage keeps instants unambiguous for the database and the API.
- **Implementation scope:** Frontend display, mock data and tests. No time zone library was added (`Intl.DateTimeFormat` is enough).
- **Frontend behavior (prototype):**
  - `utils/format.js` formats instants in `Asia/Ho_Chi_Minh`; date-only strings are reformatted as written and never pass through a time zone conversion. A date-only string that is not a real date (`2026-02-30`) gives the fallback text.
  - Mock instants are UTC ISO strings (`mocks/fixtures.js` → `at()`), so the UI is exercised with the format the API will send. Mock comparisons use instants, not strings; `scheduleService.updateRow` accepts any ISO 8601 offset for the same moment and returns UTC.
  - The demo clock of each scenario is fixed (`mocks/scenarios.js`) and is never read from the system clock, so the October–November 2026 campaign keeps working whatever today's date is.
  - Native date inputs follow the browser's locale, so each one has a hint with the chosen date as `dd/MM/yyyy`; the opening and closing hints state the 00:00 rule and "giờ Việt Nam".
  - Campaign validation requires the closing date to be **after** the opening date (`validateCampaignForPublish`). A same-day opening and closing would be a valid 24-hour window under this decision, but the stricter check is kept so that BR-01's "`open == close` is invalid" still holds for date inputs.
- **Backend responsibility (not implemented):**
  - Store instants in `TIMESTAMPTZ` and return them in UTC ISO 8601; store the three campaign dates as `DATE`.
  - Compute `openAt`/`closeAt` from the dates in `Asia/Ho_Chi_Minh` and check `openAt <= now < closeAt` with the **server** clock when an application is submitted; never trust a client time.
  - Compute interview start and end instants from the interview date, the wall-clock window and the slot duration in the business time zone.
- **Known limitations:** One hard-coded time zone (the product serves one club). Seconds are not displayed. The prototype has no server clock; its time-dependent behavior uses the scenario clock only.
- **Relation to source requirements:** Consistent with BR-01 and BR-02. The sources do not name a time zone or a storage format, so this adds detail and contradicts nothing.
- **Source files and tests:** `utils/format.js`, `utils/campaignPhase.js`, `mocks/fixtures.js`, `mocks/scenarios.js`, `mocks/derive.js` (`submissionWindow`, `campaignPhase`), `services/scheduleService.js` (`updateRow`), `components/organisms/CampaignDetailsCard`. Tests: `tests/utils/format.test.js`, `tests/mocks/fixtures.test.js` ("date and time convention (Q-02)"), `tests/services/mockServices.test.js` (opening/closing boundary, UTC row edit).

### Q-03 — Lock the campaign configuration when the campaign is published

- **Status:** TEAM-SELECTED — PENDING PRODUCT OWNER CONFIRMATION.
- **Selected decision:**
  - `Draft`: the Executive edits the whole configuration; Save Draft and Preview are available; Publish is available after validation (BR-01) and asks for confirmation.
  - `Published`: the campaign configuration is read-only. The Executive still reviews applications, enters interviewer availability, chooses rooms and prepares the draft schedule.
  - `Confirmed` schedule: configuration, submitted applications, screening decisions and the schedule stay locked (BR-14).
  - "Campaign configuration" means: name, host club, description, instructions, opening and closing dates, departments and positions with their quotas, and the campaign-level interview configuration (interview date, interview window, common slot duration).
- **Business rationale:** Applicants decide whether to apply, and which availability slots to choose, from the published information. Changing a position, a deadline or the interview window afterwards would change what they agreed to and could invalidate slots they already chose. A single rule ("published = fixed") is also easier to explain and to enforce than a per-field list.
- **Implementation scope:** Campaign Management and Interview Scheduling screens, the mock campaign and schedule services, and tests.
- **Frontend behavior (prototype):**
  - Campaign Management in a draft is an editable form. After publication the same three cards show the values as text (no disabled fields), the header offers only Preview, and an alert explains why the configuration is locked. After schedule confirmation the alert gives the BR-14 reason.
  - The Publish confirmation dialog states that the configuration becomes read-only and that this cannot be undone.
  - The small "Xem trước chiến dịch" summary card no longer carries a "Chỉ đọc" badge: it is informational in every state, and the badge could be read as a campaign-wide lock. The full Preview dialog is unchanged.
  - Interview Scheduling shows the interview date, window and duration as a short text summary labelled as campaign configuration. Rooms stay editable until the schedule is confirmed; after confirmation they are text too. Draft generation, manual row edits, conflict and Unassigned reasons, Save Changes and confirmation are unchanged.
  - Three things that share the interview window are kept apart: the campaign configuration (Campaign Management), the availability each applicant chose (Applicant Portal, shown per row in the schedule table), and the interview assignment (Interview Scheduling).
- **Backend responsibility (not implemented):** Reject every write to the campaign configuration unless the campaign is a draft, including a second publish, position changes and a change of date, window or duration sent to a scheduling endpoint. Keep the BR-04 constraint in the database and the service. Keep the BR-14 guards.
- **Known limitations:**
  - There is no way to correct a published campaign (see Q-06). A mistake found after publication cannot be fixed in the product.
  - The prototype has no editor for interviewer–position assignments and interviewer availability; the Scheduling screen displays fixture values. That editor is part of the scheduling work, not of this decision.
  - BR-04 ("explain why a position cannot be removed") can no longer be reached from the UI, because no position can be removed after publication and a draft has no applications. The mock service still enforces it and a test covers it.
- **Relation to source requirements — needs Product Owner confirmation:**
  - The sources lock the configuration at schedule **confirmation** (Brief §3.2 Step 5, BR-14). They do not say that it must stay editable between publication and confirmation, so locking earlier is **stricter than, not contrary to,** the sources. `SCREEN_REQUIREMENTS.md` Screen 1 currently says "publication alone does not immediately lock all edits"; that sentence is the team's earlier reading and was **not changed**. If the Product Owners confirm this decision, update it through the §5 process.
  - Brief §3.2 Step 4 and Business §5 describe the Executive choosing the date, time window and duration when generating the draft. Under this decision those three values are chosen in Campaign Management before publication and are only displayed on the Scheduling screen. The single common duration (BR-10) is unaffected. This placement should be confirmed with the Product Owners.
- **Source files and tests:** `pages/CampaignManagementPage.jsx`, `pages/InterviewSchedulingPage.jsx`, `components/organisms/CampaignDetailsCard`, `PositionsEditor`, `InterviewSetupCard`, `ScheduleSettingsCard`, `services/campaignService.js`, `services/scheduleService.js` (`updateSettings`), `mocks/guards.js` (`assertCampaignConfigEditable`). Tests: `tests/pages/CampaignManagementPage.test.jsx`, `tests/pages/InterviewSchedulingPage.test.jsx`, `tests/services/mockServices.test.js` (campaign and scheduling groups).
