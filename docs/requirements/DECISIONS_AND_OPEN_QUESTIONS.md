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

**Current state:** None of the three supplied documents contains a public Product Owner clarification. Do not mark Q-01…Q-07 `Approved` on speculation.
