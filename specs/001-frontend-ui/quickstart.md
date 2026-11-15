# Quickstart & Manual Verification: ClubFlow UI-First Frontend

How to run the UI and check what automated tests cannot (layout, zoom, focus). Use it at the end of every UI phase; UI-5 records the full results.

## Run

From the repository root (on Windows, use the uppercase drive path, for example `D:\nam3\clubflow`; a lowercase `d:\` path has caused a Vitest module-loading error on this machine):

```bash
npm run dev:frontend      # http://localhost:3000
npm run verify            # lint → test → build
```

No backend or database is needed; all screens use demo data. Choose the account and scenario from the "Demo" control in the header.

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

For each of the 5 screens × conditions {360 px, 768 px, 1280 px, 1280 px @125%, @150%, @200%}:

- [ ] No horizontal page scroll (`document.documentElement.scrollWidth <= innerWidth`).
- [ ] Page title, campaign context, and primary actions visible without horizontal scrolling.
- [ ] Tables: ID, status, and row actions visible (stacked rows below 48rem).
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

## Results log

| Phase | Date | Screens checked | Result | Notes |
|---|---|---|---|---|
| UI-1.1…UI-4 | 2026-11-14/15 | Each screen as it was built | Pass | Per-phase results in AI-LOG.md |
| UI-5 | 2026-11-15 | All 5 screens, all tabs, key states (visitor, applicant, Executive draft/screening/confirmed, interviewer) | Pass (117/117 automated checks) | Headless Edge, each route in a same-origin iframe of exact CSS width: 360, 640, 768, 853, 1024, 1280, 1600 px → no page overflow, no table-container overflow, one h1. 640/853/1024 approximate a 1280 px window at 200/150/125% zoom (real browser zoom not driven). 200% root text at 360 and 768 px → no overflow after the UI-5 fixes. Keyboard/focus/dialog/tab behaviour covered by automated tests; a manual keyboard pass in a real browser is still recommended. |
