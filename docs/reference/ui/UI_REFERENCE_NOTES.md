# ClubFlow — UI reference drafts (PA#2 extension)

Static visual references. Not part of the React app. All data is fictional and held in memory only.

## Files
- `applicant.html` — Applicant Portal (tabs: Campaign, Apply, My Applications, Notifications; Sign In modal)
- `interviewer.html` — Interviewer Workspace (Assigned Interviews, details, Interview Assessment, alternative states)
- `review-final-results-preview.html` — Application Review with tabs CV Screening / Final Results. A tab of the existing screen, **not** a sixth page.
- `assets/reference.css`, `assets/reference.js` — shared styles and minimal vanilla JS.

## Source of the visual language
Original HTML/CSS was not available. Tokens were rebuilt by eye from the three screenshots (index, review, scheduling): colors, 8px/6px radii, 44px inputs, badge semantics (green/amber/red/navy/gray), dashed dark-bar "alternative state" containers, step strip, 1152px content width at 1280. Values are approximations; compare against the real stylesheet before React work.

## Review URL parameters (reference only)
- `?all` — show every tab panel stacked (used for screenshots)
- `applicant.html?as=minhanh|quocbao|khanhlinh|baongoc|thaovy|haidang` and `&phase=notopen|open|closed`
- `?tab=campaign|apply|mine|notes` (applicant), `?tab=screening` (review), `?sel=CF-026` (interviewer)

## Demo data
Campaign 12/10–30/10/2026, interviews 05/11/2026 09:00–12:00, 15 min.
Confirmed: CF-026 09:00–09:15 Hà My A-201 · CF-027 09:15–09:30 Gia Huy B-105 · CF-030 09:15–09:30 Hà My A-201 · CF-031 09:00–09:15 Gia Huy B-105. CF-028 and CF-029 rejected at CV.
Minh Anh's two back-to-back interviews do not overlap. Final state: CF-026 Pass (Published), CF-027 Fail (recorded, **not published**, hidden from applicant), CF-030/CF-031 awaiting assessment (no decision possible).

## Rules reflected
Shortlisted ≠ Pass · decisions per application · rejected-at-CV never enter Final Results · assessments are advisory and separate from Executive Pass/Fail · one assessment per interview · unpublished results never shown to applicants · publishing creates an in-app notification only · screening is read-only after schedule confirmation · one application per position, multiple positions allowed.

## Limitations
Mock auth only (authorization is for the backend, PA#4). No real files, storage, scheduling or notifications. Status labels follow the existing screens ("Qua vòng CV" for shortlisted).
