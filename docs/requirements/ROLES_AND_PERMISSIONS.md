# ClubFlow — Roles, Resource Access & Privacy

**Sources:** Brief §2 and §4 Building #6; Business v1.1 §2, §4 BR-09, §5 BR-14, §6.  
**Principle:** The backend must enforce access restrictions on APIs, records, and **CV files opened through direct URLs**. Hiding a frontend control does not grant or revoke authorization.

## 1. Roles

- **Visitor:** Not signed in; may view a public `Published` campaign. Not a fourth authenticated account role.
- **Executive:** Manages recruitment for **one club** and may access all applications in the campaign within their stated workflow permissions.
- **Applicant:** Uses a pre-created account; may manage and view only their own applications as allowed by the workflow.
- **Interviewer:** Assigned to position-related interviews; may view assigned CVs/schedules and submit an assessment after the applicable interview. Cannot view Executive screening notes or unrelated applications.
- **Department:** A functional classification, **not** an authorization role.

## 2. Permission matrix

Legend: **✓** = allowed under applicable conditions; **Own** = only the user's own records; **Assigned** = only assigned applications/interviews; **—** = prohibited; **TBD** = details require clarification, not automatic permission.

| Resource / action | Visitor | Executive | Applicant | Interviewer |
|---|---:|---:|---:|---:|
| View published campaigns | ✓ | ✓ | ✓ | ✓ |
| View draft campaigns | — | ✓ | — | — |
| Create/edit/preview/publish campaigns | — | ✓* | — | — |
| Configure departments/positions/quotas | — | ✓* | — | — |
| View all campaign applications | — | ✓ | — | — |
| Submit an application while accepting submissions | — | — | Own | — |
| Read application information and CV | — | ✓ | Own | Assigned |
| Record internal CV-screening notes | — | ✓* | — | — |
| Shortlist/reject applications | — | ✓* | — | — |
| Search/filter/stats/CSV application export | — | ✓ | — | — |
| Assign interviewers, enter availability, choose rooms | — | ✓* | — | — |
| Generate/edit/save/confirm/export schedules | — | ✓* | — | — |
| View `Confirmed` schedules | — | ✓ | Own | Assigned |
| View full campaign draft schedule | — | ✓ | — | — |
| Submit post-interview assessment | — | — | — | Assigned |
| Read assigned interview assessment | — | ✓ | — | Assigned |
| Record/publish final Pass/Fail | — | ✓ | — | — |
| View final result | — | ✓ | Own (published only) | — |
| Receive in-app outcome notification | — | — | Own | — |

`*` **State-dependent locks apply:** After schedule confirmation, campaign configuration, submitted application content, CV-screening decisions, and schedules cannot be modified. **Assessments and final decisions are not locked** by schedule confirmation. Other time-based and business-rule checks still apply.

**Unspecified permissions:** Whether an Applicant may edit a submission after sending it, whether an Interviewer can directly edit availability instead of providing it to the Executive, and whether an Interviewer can view draft schedules are not fully specified. Do not enable them by default. If needed, record questions in [Decisions and Open Questions](DECISIONS_AND_OPEN_QUESTIONS.md).

## 3. Record-level data protection

- **Application ownership:** Authorize against the authenticated applicant who actually owns the record, not a user ID supplied by the frontend.
- **Assignment:** An Interviewer must be assigned to the specific interview/application. Being qualified for a position alone **does not** grant access to every application for that position.
- **Notes:** Private Executive screening notes must not appear in Applicant/Interviewer responses, including hidden JSON fields.
- **CV:** Authorize at the endpoint that provides the file or delivery URL. Do not return a public file URL that bypasses these restrictions. Storage/delivery implementation is chosen during the upload phase, but privacy is mandatory.
- **Schedule:** The full draft is for Executive review; Applicant/Interviewer see only their own **Confirmed** records.
- **Result:** An Applicant may see their screening state and **published** final decision for their application; unpublished internal decisions are not public.
- **CSV:** Apply the same allowed-record/field boundaries as the corresponding query, and preserve the requested filters.

## 4. Security throughout the workflow

1. After authentication, enforce role and scope checks on every protected request.
2. On each application read/update, verify campaign and ownership/assignment.
3. After confirmation, reject mutations to locked configuration, submitted content, screening decisions, and schedules.
4. Do not treat frontend visibility checks as authoritative.
5. Do not build account self-registration/recovery, university SSO/verification, or multi-level administrators.

Implementation details (JWT, middleware, repository filters, private asset delivery) belong to subsequent technical phases. This document **does not prescribe** endpoint names, token storage, or database schema.
