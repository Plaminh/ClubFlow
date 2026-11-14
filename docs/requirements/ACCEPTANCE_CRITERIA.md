# ClubFlow — Acceptance Criteria & Test Scenarios

**Purpose:** Source-based test catalog, **not** a record of tests already executed.  
**Convention:** `AC-xx`; **Given** = precondition, **When** = action, **Then** = observable outcome. **Source** is a BR identifier or document section. Exact HTTP status codes and column names belong to later API/schema specifications and are not treated as official requirements here.

## A. Campaign and public visibility

| ID | Source | Given | When | Then |
|---|---|---|---|---|
| AC-01 | BR-01 | Draft missing a required field | Executive publishes | Remains unpublished; shows specific errors; preserves valid input |
| AC-02 | BR-01 | Opening time >= closing time | Publish | Blocked; user must correct dates |
| AC-03 | BR-01 | No position, or quota is zero/negative/fractional | Publish | Blocked; identifies missing position or invalid quota |
| AC-04 | BR-01 | Draft has all required values, ≥1 position, valid quotas | Publish | Campaign becomes Published |
| AC-05 | BR-02 | Published, opening time not yet reached | Visitor opens campaign | Public information visible, submission unavailable |
| AC-06 | BR-02 | Campaign is still a draft | Visitor/Applicant opens draft | Draft information cannot be read |
| AC-07 | BR-02 | Published and `open <= now < close` | Applicant submits valid data | Application may be accepted |
| AC-08 | BR-02 | `now < open` or `now >= close` | Applicant submits | No application created; explains submission window |
| AC-09 | BR-03 | Quota 2, already 2 applications | Third applicant submits on time | Accepted if all other requirements hold |
| AC-10 | BR-04 | Position has linked applications | Executive deletes position | Blocked; references and data remain intact |

## B. Submission and deduplication

| ID | Source | Given | When | Then |
|---|---|---|---|---|
| AC-11 | Brief §4 #2; Business §3.2 | Signed-in Applicant, campaign accepting submissions | Submit PDF ≤5 MB, SOP ≤300 words, valid availability | Application created with `Pending Review` |
| AC-12 | Brief §4 #2; Business §3.2 | CV is not a PDF or exceeds 5 MB | Submit | Reject invalid application; report specific error |
| AC-13 | Brief §4 #2; Business §3.2 | SOP exceeds 300 words | Submit | Reject; preserve valid entered fields |
| AC-14 | Business §3.2 | Selected availability is not a club-provided slot | Submit | Reject invalid availability |
| AC-15 | BR-05 | Applicant A already has an application for position P1 in campaign C | Submit again to P1 | Return/open existing application; count unchanged |
| AC-16 | BR-05 | Applicant A has application P1 in C | Apply to P2 in C | Separate P2 application exists; P1 unchanged |
| AC-17 | BR-05 | Two requests for same A/C/P arrive concurrently | Process both | At most one application for the business key |

## C. CV review, statistics, export, and privacy

| ID | Source | Given | When | Then |
|---|---|---|---|---|
| AC-18 | BR-06 | A has two applications | Executive views totals | 2 applications, 1 distinct applicant |
| AC-19 | BR-06 | Position/status filters are active | Executive reads statistics | Scope is clearly labeled as campaign-wide or filtered |
| AC-20 | BR-07 | A has P1 and P2, both Pending Review | Shortlist P1 | Only P1 changes; P2 remains unchanged |
| AC-21 | BR-07 | Applications from two campaigns exist | View campaign C scheduling | Only C's shortlisted applications included |
| AC-22 | BR-08 | Application is shortlisted; schedule unconfirmed | Applicant checks status | Not shown as Confirmed or final Pass |
| AC-23 | BR-09 | Executive filters P1 and `Shortlisted` | Export CSV | Contains only matching applications and allowed fields |
| AC-24 | BR-09; Business §2 | Applicant/Interviewer lacks access to private note/CV | Call details/CSV/CV API outside authorization | Private information is not returned |
| AC-25 | Brief §4 #3 | Large application list | Search, filter, sort, paginate | Correct records, order, and page displayed |

## D. Interview scheduling

| ID | Source | Given | When | Then |
|---|---|---|---|---|
| AC-26 | BR-10 | Applicant and interviewer available, room free, position assignment valid | Create in-window draft slot | May be Proposed with exactly one interviewer and at most one interview per application |
| AC-27 | BR-10 | Out-of-window slot, incompatible availability, or unqualified interviewer | Assign a slot | Assignment is not valid |
| AC-28 | BR-11 | Two interviews on different applications of same applicant, both 09:00–09:20 | Validate draft | Both identified as conflicting, despite different interviewer/room |
| AC-29 | BR-11 | Two simultaneous interviews share interviewer | Validate | Conflict is identified |
| AC-30 | BR-11 | Two simultaneous interviews share room | Validate | Conflict is identified |
| AC-31 | BR-11 | Interviews at 09:00–09:20 and 09:20–09:40 | Validate | No conflict solely because they are adjacent |
| AC-32 | BR-11 | Interviews overlap one minute and share applicant/interviewer/room | Validate | Conflict identified |
| AC-33 | BR-12 | No qualified interviewer, common time, or available room | Generate draft | `Unassigned` with reason, screening status still `Shortlisted` |
| AC-34 | Brief §4 #5 | Multiple valid combinations exist | Generate with first-fit | First valid combination selected by order specified in future technical spec (not yet defined by source) |
| AC-35 | Business §5.1 | Existing manually edited draft | Regenerate | Ask before replacing current draft |
| AC-36 | Business §5.1 | Draft assignment is Proposed | Edit interviewer, room, or time | Recheck affected constraints; update Conflict/Unassigned where required |

## E. Confirmation, read-only constraints, and outcomes

| ID | Source | Given | When | Then |
|---|---|---|---|---|
| AC-37 | BR-13 | Application deadline not reached | Confirm | Blocked, explains why, retains draft |
| AC-38 | BR-13 | One Pending Review application remains | Confirm | Blocked, lists application needing screening |
| AC-39 | BR-13 | Unassigned or Conflict remains | Confirm | Blocked, identifies items to fix |
| AC-40 | BR-13 | All prerequisites satisfied and Shortlisted applications exist | Confirm | Valid schedule becomes Confirmed |
| AC-41 | BR-13 | No shortlisted applications | Proceed through scheduling stage | Skip schedule confirmation |
| AC-42 | BR-14 | Schedule Confirmed | Edit campaign config, submitted application, screening decision, schedule, or regenerate | Backend rejects mutations to locked data |
| AC-43 | BR-14 | Confirmed appointments for Applicant A/Interviewer I | A or I views schedule | Only own or assigned appointments visible |
| AC-44 | BR-14; Business §6 | Confirmed interview already occurred | Assigned Interviewer submits assessment | Exactly one assessment allowed for own completed interview |
| AC-45 | Business §6 | Different, unassigned Interviewer | Access that interview's CV/assessment | Access denied |
| AC-46 | Business §6 | Executive has recorded but not published Pass/Fail | Applicant opens results | Unpublished decision is not visible |
| AC-47 | Business §6 | Executive publishes an application's final result | Applicant opens My Applications | Sees correct published decision and in-app notification |
| AC-48 | BR-08; Business §6 | Executive just confirmed schedule | Applicant checks final result | Not automatically marked Pass/Fail |
| AC-49 | Business §6 | Application Rejected during CV screening | Process later interview phase | No interview/assessment/post-interview decision required for that application |

## F. PA#2 UI quality (not a substitute for full-product behavior)

| ID | Source | Given | When | Then |
|---|---|---|---|---|
| AC-50 | Brief §5 Fix these | Three screens belong to one campaign | Review dates and titles | Timeline agrees and Screen 2 has correct title |
| AC-51 | Brief §5 Fix these | Review screen on mobile/tablet/desktop | Open details | Both list and details remain readable; most of list is not obscured |
| AC-52 | Brief §5 Fix these | Schedule has rows with statuses | Check summary and conflict banner | Counts match real rows; conflict has actual overlap evidence |
| AC-53 | Brief §5 Fix these | Mock data is displayed | Review people and messages | No Applicant/Interviewer identity overlap, university-verification claims, or irrelevant template footer |

## Using these cases

- For each test, select AC ID → inspect BR/source → create fixture → exercise API/database/UI behavior.
- Security cases must test direct endpoint/file access, not merely disabled or hidden controls.
- One automated test may cover several ACs, but never rewrite an acceptance criterion just to fit current code.
- **Current status:** No ClubFlow domain-specific test was verified as implemented while compiling these documents. Do not mark them passing without evidence.
