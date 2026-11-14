# ClubFlow Business Description

*Reference document for the shared project · CSC13008 · Class 24KTPM1 · Version 1.1*

ClubFlow helps a student club manage its entire member recruitment campaign, from announcing available positions to notifying candidates of final results. When CVs live in online forms, screening decisions in spreadsheets, and interview times in chats, the recruitment team struggles to track the status and owner of each application. ClubFlow links applications, schedules, assessments, and outcomes to each specific position applied for.

## 1. Business scope

| Area | Description |
|---|---|
| Member recruitment workflow | Manage campaign → receive applications → screen applications → prepare and confirm schedule → interview assessment → publish results within the system. |
| Business limitations | One club; at most one campaign active at the same time; one interview date per campaign. Each application receives one CV-screening round, at most one interview with one interviewer, and at most one assessment. |

## 2. Roles and access permissions

| Role | Responsibilities and access |
|---|---|
| Visitor | View public campaign information. Sign in with a provided account to apply. |
| Recruitment team (Executive) | Configure campaigns, review every application in the campaign, record internal notes, assign interviewers, enter their availability, choose from existing rooms, confirm schedules, and publish outcomes. |
| Applicant | Choose a position, submit an application, select available slots, and view the screening status, confirmed schedule, and results of their own applications. |
| Interviewer | Supply availability information to the Executive, view confirmed schedules and CVs for assigned applications, and submit post-interview assessments. |

**Shared convention.** A published campaign is considered active until the recruitment process is completed. It ends when submissions have closed, all applications have been screened, and all results for applications that advanced have been published.

**Data boundaries.** CV-screening notes are for Executives only. Interview assessments are available to the assigned interviewer and Executive. Applicants see their own statuses, schedules, and published outcomes. These restrictions also apply when an application record or CV is opened directly.

## 3. Creating campaigns and receiving applications

### 3.1 Executive setup and publication

1. Enter campaign name, organizing club, description, submission opening and closing times, and application instructions.
2. Create departments and positions. Each position belongs to a department and has a name, quota, job description, and required skills or qualifications.
3. Prepare interview availability slots so applicants can select times when applying. All slots belong to one interview date after the application deadline.
4. **Save Draft** to continue configuration later, **Preview** to check what applicants will see, or **Publish** to make the campaign public.

| Code | Rule |
|---|---|
| **BR-01** | At publication, check all required fields, ensure opening precedes closing, at least one position exists, and each quota is a positive integer. On failure, keep previously entered valid data and identify what must be fixed. |
| **BR-02** | Published campaigns may be visible before the opening time. Accept applications from the opening time until strictly before the closing time. Only the Executive can view drafts. |
| **BR-03** | Quota is the planned number of recruits for a position. Use it for planning; application submissions stay open according to the campaign's submission period. |
| **BR-04** | Preserve existing application-to-position links. Block removal of a position when it would break a linked application, and explain why. |

### 3.2 Applicant submits to a position

1. Sign in, open an accepting campaign, and choose a specific position.
2. Complete the fixed student-information form, attach one CV in PDF format (maximum **5 MB**), write a motivation statement/SOP (maximum **300 words**), and select available times from the club's supplied slots.
3. Submit. A valid application is recorded with its position and submission time, initially in **Pending Review**. If the input is invalid or the deadline passed, explain the error and preserve valid information already entered.

**BR-05 — One application per position.** The business key is *applicant + campaign + position*. A student may apply to multiple positions within a campaign. Each position gets a separate application and independent decision. Resubmitting to the same position opens the existing application and does not increase the application count, even after repeated clicks.

## 4. Reviewing applications

1. The Executive opens the campaign's application list and may search, filter by position/status, and sort. Each item includes the applicant, position, submission time, and status.
2. Opening details reveals student information, SOP, CV, and submission/review timestamps. The Executive may add a private note and select **Shortlisted** or **Rejected**.
3. Saving a decision updates only the selected application and relevant aggregate statistics.
4. When at least one application is shortlisted, the Executive may start a draft interview schedule. Confirmation conditions are defined separately in section 5.

| Code | Rule |
|---|---|
| **BR-06** | Count total applications as application records, and total applicants as distinct students. A student with two applications counts as two applications but only one applicant. |
| **BR-07** | A screening decision affects only the reviewed application. Scheduling input contains only Shortlisted applications for the correct campaign. |
| **BR-08** | Shortlisted means CV screening was passed. An appointment becomes effective only after the Executive confirms the schedule. The final recruitment decision is stored separately for each application. |
| **BR-09** | The Executive can export applications matching the applied filters and only permitted fields. CVs and private screening notes remain subject to the relevant access limits. |

### CV-screening statuses

| English label | Meaning |
|---|---|
| **Pending Review** | Application received and awaiting CV-screening decision. |
| **Shortlisted** | Application passes CV screening and becomes eligible for scheduling. |
| **Rejected** | Application is rejected during CV screening and excluded from scheduling. |

The CV-screening status remains useful for lookup after the interview. Interview scheduling and final recruitment decisions have their own separate states. If figures reflect a filter, state that scope clearly so they are not confused with campaign totals.

## 5. Preparing and confirming interview schedules

### 5.1 Draft scheduling

The Executive chooses a date, time window, and common duration of **15, 20, or 30 minutes**, plus rooms from the existing list. The Executive assigns interviewers to positions and enters their availability. An interviewer may cover multiple positions.

1. The system proposes appointments for Shortlisted applications using free slots, interviewers assigned to the position, and available rooms.
2. Show **Proposed** for a valid draft assignment; **Unassigned** with a reason when no qualified interviewer, mutually available time, or room is found; and **Conflict** when an assignment violates a constraint, with the specific violated rule.
3. Permit manual assignment, time/interviewer/room changes, and revalidation after every change. Before regenerating, ask before replacing the existing draft.

| Code | Rule |
|---|---|
| **BR-10** | At most one interview per application and exactly one interviewer per interview. The interview must fit fully in the campaign time window and within both the applicant's and the assigned interviewer's availability. |
| **BR-11** | Within a campaign, time-overlapping interviews conflict when they share an applicant, interviewer, or room. Match applicants by person even when applications are for different positions. Adjacent sessions, such as 09:00–09:20 and 09:20–09:40, are allowed. |
| **BR-12** | When no schedule can be assigned, keep the application Shortlisted and mark it Unassigned. The Executive resolves the reason in the draft. |

### 5.2 Confirming the schedule

**BR-13 — Confirmation conditions.** Application submissions must be closed, all applications reviewed, every Shortlisted application must have exactly one valid appointment, and there must be **zero Unassigned and zero Conflict**. Otherwise list the unresolved items and keep the draft. When there are no Shortlisted applications, skip the interview-schedule confirmation step.

**BR-14 — After confirmation.** Display **Confirmed** appointments to the correct applicants and interviewers. Lock campaign configuration, submitted application content, CV-screening decisions, and schedules. Assessment and final-result work remains allowed in subsequent stages. The Executive may export the schedule for lookup or operations.

## 6. Assessments and publishing final outcomes

1. After an interview takes place, its assigned Interviewer submits one assessment for the relevant application. The Executive reviews it before making the final decision.
2. The Executive records **Pass** or **Fail** per application after the interview and then publishes it. The Applicant can see the published decision and receives an in-app notification.
3. A CV-screening rejection shows the CV result and ends that branch. For shortlisted applications, confirmation of the interview schedule and publication of final results are separate actions at separate times.

### Business entities and relationships

| Entity | Information and relationships |
|---|---|
| Campaign | Name, description, instructions, open/close times, interview configuration; many positions and applications. |
| Department and Position | A department has many positions. A position belongs to a campaign and has quota, description, and requirements. A department represents a functional unit. |
| Application | Belongs to one applicant, one campaign, and one position; stores student details, CV, SOP, availability, submission time, screening state, and internal note. |
| Interview assignment and availability | An interviewer may cover several positions; available time slots are recorded for scheduling. |
| Room and appointment | Each interview belongs to one application, one interviewer, one existing room, and one time interval. |
| Assessment and outcome | A completed interview has at most one assessment from its assigned interviewer. The final result and publication time belong to the application. |

## 7. Out of scope

- Multiple clubs or simultaneously active campaigns; user self-registration or password recovery; student identity verification; university SSO.
- Multiple interview rounds, multiple interviewers in one interview, editing a confirmed schedule, dynamic room creation, university room booking, cross-campaign conflict checks, or large-scale scheduling optimization.
- AI-powered CV marking/ranking, customizable forms, advanced analytics, or audit logs.
- Email, SMS, push, external calendar sync, separate notification center, chat, video calls, or a dedicated mobile application.
- Post-recruitment member management, events, internal task assignments, and payments.

*English translation of the provided “Đặc tả nghiệp vụ ClubFlow”, version 1.1. The original Markdown is preserved separately in `ClubFlow_Original_Sources.zip`.*
