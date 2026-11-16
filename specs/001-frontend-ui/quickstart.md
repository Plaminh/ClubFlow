# Quickstart & Manual Verification: ClubFlow UI-First Frontend

How to run the UI and check what automated tests cannot (layout, zoom, focus). Use it at the end of every UI phase; UI-5 records the full results.

## Run

From the repository root (on Windows, use the uppercase drive path, for example `D:\nam3\clubflow`; a lowercase `d:\` path has caused a Vitest module-loading error on this machine):

```bash
npm run dev:frontend      # http://localhost:3000
npm run verify            # lint → test → build
```

No backend or database is needed; all seven product screens use demo data. Use `/login` for the normal credential flow. The "Đổi tài khoản nhanh" selector inside the Demo controls is development-only and exists only for rapid scenario review.

## Demo walkthrough (matches the user stories in spec.md)

| Story | Scenario | Account | Check |
|---|---|---|---|
| US1 | accepting / confirmed | Executive | Validation messages, Save Draft, Preview, Publish; read-only when confirmed |
| US2 | screening | Executive | Stats 6 / 5; filters and pagination agree; shortlist/reject one application only |
| US2 | confirmed | Executive | Final Results lists CF-026, CF-027, CF-030, CF-031 only; publish CF-027 after confirmation |
| US3 | screening → confirm | Executive | Conflict CF-026/CF-027, Unassigned CF-031; conditions list; confirm after demo resolution |
| US4 | before-open / accepting / confirmed | Visitor, Nguyễn Minh Anh | Phase messages; form validation; My Applications; only published CF-026 result and its notification |
| US5 | confirmed / screening | Hà My, Gia Huy, Executive | Own interviews only; submit assessment; empty state; restricted state |

## Responsive and zoom checklist

Use browser DevTools device mode for widths, and real browser zoom (Ctrl + / Ctrl −) on a 1280 px wide window for zoom. Do not use CSS transforms or DevTools "scale" options to simulate zoom.

For each of the five business screens × conditions {360 px, 768 px, 1280 px, 1280 px @125%, @150%, @200%}, and for both shared account screens (`/login`, `/profile`) at the same conditions:

- [ ] No horizontal page scroll (`document.documentElement.scrollWidth <= innerWidth`).
- [ ] Page title, campaign context, and primary actions visible without horizontal scrolling.
- [ ] Tables: ID, status, and row actions visible (stacked rows below 80rem).
- [ ] Detail panel and list both readable; the panel never covers most of the list (Fix these #3).
- [ ] Dialogs fit the viewport and scroll internally when taller than the screen.
- [ ] Header and navigation wrap without overlap.
- [ ] Long names wrap; no clipped text.
- [ ] Buttons wrap to new lines instead of overflowing.

## Accessibility checklist

- [ ] Every flow completes with keyboard only; focus is always visible.
- [ ] Dialogs trap focus, close with Escape, and return focus to the trigger.
- [ ] Tabs: arrow keys move between tabs; the active tab is announced.
- [ ] Form errors are linked to fields (`aria-describedby`) and focus moves to the first error.
- [ ] Status badges include text, not color alone.
- [ ] Touch targets are at least 44 × 44 CSS px.

## UI-8 Sign In and My Profile (simulated)

1. Open `/login`. Try empty fields, malformed email, wrong password and simulated slow/network-error states. Then sign in with each fictional login listed on the page (password `ClubFlowDemo!`): `executive@clubflow.demo.example` → `/executive/campaign`, `minh.anh@demo.example` → `/`, `ha.my@clubflow.demo.example` → `/interviewer`.
2. As a guest, open `/profile` and `/executive/review?tab=results`: each lands on `/login`. Sign in with a role that may open the requested pathname and confirm its query string is restored; sign in with the wrong role and confirm fallback to that role's home. Open `/login` while already signed in and confirm redirect away from the form.
3. Header → "Tài khoản" → "Hồ sơ cá nhân" as Executive, Applicant and Interviewer. Confirm common fields for all roles and `studentId`/`faculty`/`year` only for Applicant.
4. Edit name/email: Cancel must discard the draft; Save must update the profile and header. Try empty name/email, malformed email and another account's email. During a simulated slow save, switch account/scenario and confirm no stale update lands on the new account.
5. After Save, "Đăng xuất", then sign in with the changed email; the old email is rejected. Confirm a previously submitted application's student snapshot is unchanged.
6. Demo controls → "Đổi tài khoản nhanh" switches accounts without credentials (development only). "Đặt lại dữ liệu demo", a scenario switch, and a page reload restore fixture profile values and discard unsaved edit state.
7. Sign out from `/profile`, `/executive/review`, and `/interviewer`; each ends at the public `/` portal. Confirm later protected access returns to `/login`.
8. At 360/640/768/1280 CSS px and real browser zoom 125/150/200%, check responsive navigation/account menu, visible focus, 44 px targets, Escape close/return-focus, keyboard-only form completion and screen-reader labels/live errors.
9. Re-run the existing five-business-screen walkthrough in the table above to catch authentication/profile regressions.

Nothing here is real authentication: no JWT/token, no backend auth/profile request, and no durable profile persistence. There is no registration, forgot/reset password, or change-password flow.

## Results log

| Phase | Date | Screens checked | Result | Notes |
|---|---|---|---|---|
| UI-1.1…UI-4 | 2026-11-14/15 | Each screen as it was built | Pass | Per-phase results in AI-LOG.md |
| UI-5 | 2026-11-15 | All 5 business screens, all tabs, key states (visitor, applicant, Executive draft/screening/confirmed, interviewer) | Pass (117/117 automated checks) | Headless Edge, each route in a same-origin iframe of exact CSS width: 360, 640, 768, 853, 1024, 1280, 1600 px → no page overflow, no table-container overflow, one h1. 640/853/1024 approximate a 1280 px window at 200/150/125% zoom (real browser zoom not driven). 200% root text at 360 and 768 px → no overflow after the UI-5 fixes. Keyboard/focus/dialog/tab behaviour covered by automated tests; a manual keyboard pass in a real browser is still recommended. |
| UI-7 | 2026-11-16 | 8 key states across all 5 business screens, Q-06/Q-05 dialogs and the 3 requested cleanup checks | Pass | Headless Edge at exact viewport widths 360, 768 and 1280 CSS px: 24/24 screen/state checks had one h1, no page or data-table overflow, and no raw ISO date text. Campaign dates showed `dd/MM/yyyy`, the Preview card had no read-only badge, and Scheduling showed campaign interview configuration as a control-free summary. Q-06 Shortlist/assessment and Q-05 Publish Results dialogs fit all three widths with Cancel initially focused; cancel preserved data. Viewport simulation only; real browser zoom was not driven. |
| UI-8 | 2026-11-16 | Sign In, My Profile (view, edit, saved with a 40-character name and 75-character email), header account menu, public portal after Sign Out | Pass (28/28 checks) | Headless Edge driven over the DevTools protocol against the production build, exact viewport widths 360, 640, 768 and 1280 CSS px (640 approximates a 1280 px window at 200% zoom; real browser zoom was not driven). At every width and in all 7 states: no horizontal page overflow, no element outside the viewport, exactly one h1, one banner/main/footer, no duplicate IDs. Account menu panel stayed inside the viewport (e.g. 136–328 px at 360), items "Hồ sơ cá nhân"/"Đăng xuất" are 44 px high, Escape closed it and returned focus to the trigger (3 px focus outline). Full flow passed in the browser: guest `/profile` → `/login` → sign in → `/profile` → edit → header updated → Đăng xuất → `/` → sign in with the new email → same account; no password in web storage. A manual keyboard and screen-reader pass in a real browser is still recommended. |
