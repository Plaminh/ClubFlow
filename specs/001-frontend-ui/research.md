# Research & Decisions: ClubFlow UI-First Frontend

**Feature**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md) · **Date**: 2026-11-14

Each decision records what was chosen, why, and what was rejected. Decisions D-UI-01…D-UI-07 are **proposed** in UI-0 and become binding when the team approves this plan.

## D-UI-01 — Language

- **Decision**: Vietnamese user-facing text; English for code, internal status identifiers, file names, and comments. All status labels live in one mapping module (`frontend/src/constants/labels.js`). No internationalization framework.
- **Rationale**: All six reference pages are `lang="vi"`; requirements use English status names (`Pending Review`, `Shortlisted`…). Separating identifiers from labels keeps code aligned with the requirements and makes later localization a data change.
- **Rejected**: English UI (diverges from approved references); an i18n library (unneeded dependency for one language).
- **Note**: `index.html` is `lang="en"` today; switching it to `vi` is part of UI-1.
- **Implementation note (UI-1.2)**: The reference screens keep their page titles and a few action names in English ("Create Recruitment Campaign", "Application Review", "Shortlist Candidate", "Sign In"…) and the workflow terms Proposed/Conflict/Unassigned/Confirmed/Pass/Fail. The React UI keeps those exact strings for visual fidelity; all other text is Vietnamese. All of them live in `constants/labels.js` or the page that owns them.

## D-UI-02 — Routing

- **Decision**: Use `react-router-dom` (installed in UI-1, not UI-0). Minimal routes:

  | Path | Screen | Demo role |
  |---|---|---|
  | `/` | Applicant Portal — public campaign by default; tabs via `?tab=campaign\|apply\|mine\|notifications` | Visitor / Applicant |
  | `/executive/campaign` | Campaign Management | Executive |
  | `/executive/review` | Application Review — `?tab=screening\|results` | Executive |
  | `/executive/scheduling` | Interview Scheduling | Executive |
  | `/interviewer` | Interviewer Workspace | Interviewer |
  | `/login` | Shared Sign In | Visitor; authenticated accounts redirect to a role-safe destination |
  | `/profile` | Shared My Profile | Executive / Applicant / Interviewer (`AuthGate`) |
  | `*` | Not found | Any |

  Eight route targets in total: five business screens, two shared account screens, and Not found. Route constants live in `frontend/src/routes/paths.js`.
- **Rationale**: Seven product screens, deep-linkable business tabs (UI-FR-004), protected profile/intended destinations, and browser back/forward. A hand-written router would duplicate a well-known library and be harder for teammates to explain.
- **Rejected**: State-only page switching (no URLs or back button); Next.js or a framework change (prohibited by `AGENTS.md`).
- **Approval needed**: Adding a dependency requires team approval per `AGENTS.md` ("Change Safety"). Recording it here is the justification required by the constitution (§IX).

## D-UI-03 — Styling and design tokens

- **Decision**: One token file, `frontend/src/styles/tokens.css`, based on the **mobile-first, rem-based** tokens of `docs/reference/ui/assets/css/styles.css` (original PA#2). Component patterns missing there are adapted from `assets/reference.css`: tabs, modal, stacked table rows, and the result/assessment badge tones. Component CSS stays co-located (`Component/Component.css`) as in the current scaffold. Plain CSS only.
- **Do not carry over**: `body { overflow-x: hidden }` and fixed `px` font sizes from `reference.css`, or its desktop-first `max-width` px breakpoints.
- **Breakpoints**: `48rem` (tablet) and `80rem` (desktop), mobile-first `min-width` queries. Because they are rem/em-based, browser zoom moves layouts between breakpoints naturally (for example, 1280 px at 200% ≈ 640 CSS px → mobile layout).
- **Rejected**: Tailwind, Bootstrap, MUI, and CSS-in-JS (no concrete need, new dependencies); importing either reference stylesheet wholesale (two conflicting global systems); `transform: scale` (breaks reflow and hit-testing).

## D-UI-04 — Responsive and zoom strategy

- **Decision**: Target 360 / 768 / 1280+ px and 100 / 125 / 150 / 200% zoom. Use flexbox, grid with `minmax(0, 1fr)`, `max-width` containers, `overflow-wrap: anywhere` for names, and `clamp()` only for headings. Data tables render as **stacked cards below 48rem** (label + value per cell), keeping ID, status, and actions visible. Above 48rem, tables may scroll horizontally inside their container only when no key column or action is pushed out of view.
- **Evidence**: `docs/reference/ui/screenshots/scheduling-360.png` shows the 8-column schedule table hiding time, interviewer, room, status, and actions off-screen at 360 px; `styles.css` sets `th, td { min-width: 8rem }`, giving ≈64rem minimum table width.
- **Implementation update (UI-2.4)**: Measured in the browser, the 8-column Final Results and schedule tables overflowed their containers at 768–1024 px (e.g. 948 px of content in an 893 px box), hiding the action column. `DataTable` therefore uses stacked cards below **80rem** (not 48rem) and a normal table from 80rem, where both tables fit without internal scrolling. This also covers a 1280 px window at 125–200% zoom.
- **Date display**: Show dates formatted as `dd/MM/yyyy` next to native date inputs, because native inputs display in the browser locale (the reference screenshot shows `11/05/2026` for 5 Nov 2026).

## D-UI-05 — Mock data and demo scenarios

- **Decision**: One fixture module set under `frontend/src/mocks/`, normalized by ID, taken from `UI_REFERENCE_NOTES.md`. Scenarios are derived from the base records rather than duplicated:

  | Scenario ID | Demo clock | Matches reference |
  |---|---|---|
  | `before-open` | 2026-10-10 09:00 | `applicant.html?phase=notopen` |
  | `accepting` | 2026-10-20 09:00 | `applicant.html?phase=open` |
  | `screening` | 2026-10-31 09:00 | `review.html`, `scheduling.html` draft |
  | `confirmed` | 2026-11-05 13:00 | `review-final-results-preview.html`, `interviewer.html`, applicant results |

  The demo clock is read from the scenario, never from `Date.now()`, because the reference dates are in the past.
- **In-session mutations**: Demo actions update an in-memory store owned by the mock service layer, so a change on one screen is visible on others. Reloading the page resets to the scenario's base state.
- **Reference conflict resolved**: `assets/reference.js` gives CF-030 and CF-031 an unpublished `Pass`, but `UI_REFERENCE_NOTES.md` and `review-final-results-preview.html` show both as **awaiting assessment with no decision**. The fixtures follow the notes, which also match [WORKFLOWS_AND_STATES §5](../../docs/requirements/WORKFLOWS_AND_STATES.md) (the Executive reviews the assessment before recording Pass/Fail).
- **Not implemented in the UI**: first-fit scheduling, conflict detection, confirmation-rule evaluation, and authorization. Scenario data carries precomputed statuses and reasons; the UI only displays them and applies scripted demo transitions (for example, "resolve conflict" moves CF-027 to 09:15 as in the reference).
- **Q-01 implementation update (UI-7)**: The team selected submission time then Application ID, chronological session starts, stable interviewer ID, and stable room ID as the future server generator order, with no backtracking. The frontend still does not generate a schedule. Its mock only sorts the reference rows and resource lists by those keys so fixture-array order cannot change the displayed/service contract order.
- **Rejected**: Separate fixtures per page (they drift and contradict each other); a mock HTTP server (adds a dependency and invents endpoints).
- **Implementation update (UI-1.3)**:
  - A fifth scenario, `draft` (2026-10-05 09:00, campaign not yet published), was added so Save Draft → Publish and the "drafts are not public" rule (BR-02) can be demonstrated. The spec requires "at least" four scenarios.
  - Instead of hard-coded transitions, the mock layer (`frontend/src/mocks/derive.js`) re-evaluates Proposed / Conflict / Unassigned after each manual edit, so any edit stays consistent. It is a demo stand-in for backend validation, not a scheduler: "Generate draft" still returns the verified reference draft. The backend remains the source of truth for BR-10…BR-14.
  - Reference conflict resolved: `scheduling.html` shows CF-031's availability as 09:00–09:15, but applicants choose hourly club slots (`applicant.html`). The fixture uses the hourly slot 09:00–10:00, and the CF-031 Unassigned reason is reworded to be true for that data ("Gia Huy và cả hai phòng đã được xếp trong ca 09:00–09:15…").
  - Screening decisions can only be recorded for Pending Review applications. Whether a decision may be reversed before confirmation is not settled by the sources (WORKFLOWS §3), so the UI does not offer reversal.
  - Interview date, window, and duration in Campaign Management are editable only while no application exists, because applicants pick slots from them (UI assumption pending Q-03).
  - **Implementation update (UI-7, supersedes the preceding Q-03 planning assumption):** the team selected a stricter rule: the entire campaign configuration becomes read-only immediately on publication. Scheduling can change only selected room IDs. This remains pending Product Owner confirmation.

## D-UI-06 — Demo identity

- **Decision**: `DemoSessionContext` (React context, allowed by `AGENTS.md`) holds the selected demo account and scenario. The header shows a visible "Demo" label. Route-level role checks only choose which UI to show and render a restricted state otherwise; they are never described as security.
- **Later**: Replaced by a real authentication context during backend integration (Phase 1 of `TRACEABILITY.md`).
- **Rejected**: Redux or another global store (prohibited without approval).

## D-UI-07 — Integration boundaries

- **Decision**: `components` (props + callbacks only) ← `pages` (compose and own UI state) ← `hooks` (`{ data, status, error, reload }` plus action functions) ← `services` (Promise-returning functions; demo implementation now). No component imports from `mocks/` or `services/` directly. Service function names and shapes are listed in [contracts/ui-services.md](contracts/ui-services.md); **no HTTP paths are defined**.
- **Rationale**: Teammates replace service bodies with `apiClient` calls without touching pages.
- **Known gap at planning time (resolved in UI-5, T062)**: `frontend/src/services/apiClient.js` always set `Content-Type: application/json` (breaking `FormData` CV upload), discarded the backend error body (`{ error }` from `backend/src/middleware/errorHandler.js`), and did not attach `Authorization: Bearer`. UI-5 fixed all three; the field-level error format the backend should return is proposed in `docs/frontend/INTEGRATION.md` §5.

## D-UI-08 — Mock Sign In and editable profile boundary

- **Decision**: Keep `DemoSessionContext` as the single current-account source. A dedicated `/login` form calls `authService.signIn({ email, password })`; the normal UI no longer opens an account-picker dialog. The Demo bar retains a clearly labeled direct account selector only for development review.
- **Credential safety**: All emails use fictional `.example` addresses and passwords exist only in a source fixture explicitly labeled development-only. Browser storage keeps only account/scenario IDs, never a password. This is not security and does not issue a token.
- **Redirect safety**: Preserve intended destinations as router state, not a free-form query URL. Restore only known paths allowed for the authenticated role; otherwise use `HOME_BY_ROLE`.
- **Profile state**: Scenario state owns one mutable profile copy per account. Editing is limited to `displayName` and `email`; application `studentInfo` remains the immutable submission snapshot. Scenario switch/reset rebuilds profiles from fixtures, and context/account version changes prevent stale cross-account rendering.
- **Password management**: UI-8 shows the requested account-security section but does not simulate password changes. Adding another mutation with no persistence or backend contract would create misleading security behavior and extra credential state.
- **Rejected**: a second auth context/store (duplicate identity source), localStorage profile/password persistence (stale and unsafe), free-form return URLs (open-redirect risk), and updating fixture applications from the current profile (breaks submission history).
