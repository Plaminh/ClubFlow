# ClubFlow — Requirements Traceability Matrix

**Document status:** Planning map, **not proof that existing source implements these features**. A previous framework audit found only health/JWT/upload foundations; re-check the current repository before updating statuses.

**Identifiers:** `BR-*` are **official** rule IDs from Business Description v1.1. `FR-*` below are **team-internal tracking identifiers**, not lecturer-assigned IDs. `F1…F7` refer to [Product Specification](PRODUCT_SPEC.md). Technical Phases 1–6 are the team's **proposed implementation sequence**, distinct from official PA#1–PA#6 assessments.

## 1. BR-01 through BR-14

| Rule | Source | Module | Role / Screen | Backend / data obligation | AC | Planned phase | Status |
|---|---|---|---|---|---|---|---|
| BR-01 | Business §3.1 | F1 Campaign | Executive / Create | Validate publication, dates, position quotas | AC-01–04 | 2 | Not verified |
| BR-02 | Business §3.1 | F1/F2 | Visitor, Applicant | Public vs draft, submission window | AC-05–08 | 2–3 | Not verified |
| BR-03 | Business §3.1 | F1/F2 | Applicant / Submit | Do not block at quota | AC-09 | 2–3 | Not verified |
| BR-04 | Business §3.1 | F1/F2 | Executive / Position | Referential guard against deleting positions with applications | AC-10 | 2–3 | Not verified |
| BR-05 | Business §3.2 | F2 | Applicant / Submit | Unique applicant–campaign–position and duplicate handling | AC-15–17 | 3 | Not verified |
| BR-06 | Business §4 | F3 Review | Executive / Review | Count applications vs distinct applicants | AC-18–19 | 4 | Not verified |
| BR-07 | Business §4 | F3/F4 | Executive / Review, Schedule | Per-application decisions; shortlist filtered by campaign | AC-20–21 | 4–5 | Not verified |
| BR-08 | Business §4 | F3–F6 | All roles / Status | Separate CV, schedule, final states | AC-22, 48 | 4–6 | Not verified |
| BR-09 | Business §4 | F3/F7 | Executive / Export | Filter-aware, permission-aware CSV; CV/note privacy | AC-23–24 | 4 | Not verified |
| BR-10 | Business §5.1 | F4 | Executive / Schedule | ≤1 interview/application, 1 interviewer, valid availability | AC-26–27 | 5 | Not verified |
| BR-11 | Business §5.1 | F4 | Executive / Schedule | Conflict by applicant/person, interviewer, room; adjacency allowed | AC-28–32 | 5 | Not verified |
| BR-12 | Business §5.1 | F4 | Executive / Schedule | Unassigned reason; preserve Shortlisted | AC-33 | 5 | Not verified |
| BR-13 | Business §5.2 | F5 | Executive / Confirm | Closed, all reviewed, valid complete schedule, zero conflicts/unassigned | AC-37–41 | 5 | Not verified |
| BR-14 | Business §5.2 | F5/F6 | Executive, Applicant, Interviewer | Lock after confirmation while permitting later assessments/outcomes | AC-42–44 | 5–6 | Not verified |

## 2. Important requirements beyond the 14 BRs

| Internal ID | Source | Requirement / Scope | Work area | AC | Planned phase | Status |
|---|---|---|---|---|---|---|
| FR-01 | Brief §2; Business §2 | Pre-created three-role accounts, login and RBAC | Auth, backend authorization, frontend access | AC-24, 43, 45 | 1 | Not verified |
| FR-02 | Brief §2, §4; Business §2 | Visitors may view Published; drafts private | Public / Campaign queries | AC-05–06 | 1–2 | Not verified |
| FR-03 | Brief §4 #1; Business §3.1 | Save Draft, Preview, Publish | Campaign | AC-01–04 | 2 | Not verified |
| FR-04 | Brief §4 #2; Business §3.2 | PDF ≤5 MB, SOP ≤300 words, fixed form, availability | Application/upload/private assets | AC-11–14 | 3 | Not verified |
| FR-05 | Brief §4 #3; Business §4 | Search, filter, sort, paginate, statistics | Review list | AC-18–25 | 4 | Not verified |
| FR-06 | Brief §4 #4–5; Business §5 | Assign interviewer to positions, availability, pre-existing rooms | Scheduling setup | AC-26–27 | 5 | Not verified |
| FR-07 | Brief §4 #5 | First available valid combination sequentially | Generator; tie-break TBD in technical spec | AC-34 | 5 | Not verified |
| FR-08 | Brief §3 Step 4; Business §5.1 | Edit, Resolve, Assign Slot, regeneration confirmation, Save Draft | Scheduling UI/service | AC-35–36 | 5 | Not verified |
| FR-09 | Brief §4 #5; Business §5.2 | Export interview timetable | Schedule export | AC-40–43 (add export-specific tests during API spec) | 5 | Not verified |
| FR-10 | Brief §4 #6; Business §2 | Ownership/assignment, private notes and CV security | RBAC, private file access | AC-24, 43, 45 | 1–6 | Not verified |
| FR-11 | Brief §4 #7; Business §6 | Interviewer assessment after interview | Assessment | AC-44–45 | 6 | Not verified |
| FR-12 | Brief §3.3, §4 #7; Business §6 | Executive Pass/Fail and publication, in-app notices | Outcome | AC-46–49 | 6 | Not verified |
| FR-13 | Brief §5 | Three PA#2 screens and *Fix these* | Design/React | AC-50–53 | PA#2 / PA#3 | Prototype reference; React UI-first prototype implemented with mock data and frontend tests (`specs/001-frontend-ui`); not verified against a backend |
| FR-14 | Brief §4 Not Building; Business §7 | Respect out-of-scope boundaries | Scope checks across phases | Scope review | All phases | No code status |
| FR-15 | Meeting Notes PA#3–#6 | React frontend, Express+JWT+Upload+DB, harness, demo/defense | Course planning | Quality-gate/demo evidence | PA#3–#6 | Subject to official course requirements |

## 3. Proposed technical phases

| Technical phase | Focus | Major requirements |
|---|---|---|
| 0B | Documentation foundation | Preserve sources, rules, states, UI, test matrix, traceability |
| 1 | Identity and RBAC | Foundation for FR-01/02/10; schema not decided here |
| 2 | Campaign and positions | BR-01–04; FR-03 |
| 3 | Application submission and private CV | BR-02/03/05; FR-04/10 |
| 4 | CV review | BR-06–09; FR-05 |
| 5 | Scheduling and confirmation | BR-07/08/10–14; FR-06–09 |
| 6 | Assessments, outcomes, notifications | FR-11/12; BR-08/14 |

**Important:** Official **PA#3** requires React frontend and **PA#4** requires backend. Plan work in parallel as necessary for those submissions; the team's technical phase numbers are **not** lecturer PA numbers.

## 4. Updating requirement status

- Initially mark `Not verified` because this documentation was compiled **without inspecting the user's current local checkout**.
- Mark `Implemented` only with verifiable code paths and behavior/tests; link real PRs, commits, or evidence.
- You may use `Planned`, `In Progress`, `Implemented`, `Blocked`, but apply them consistently and never infer grades from this matrix.
- If an official clarification changes a requirement, update Business Rules, acceptance criteria, traceability, and [Decisions](DECISIONS_AND_OPEN_QUESTIONS.md) together, with evidence.
