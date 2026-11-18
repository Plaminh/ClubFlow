# Quickstart: PA#3 HTTP Integration Verification

This guide is the runnable validation path for the completed feature. It does not replace the detailed endpoint examples in `docs/api/` or the task checklist.

## Prerequisites

- Node.js 22.12 or newer and the repository's existing installed dependencies.
- One terminal at the repository root for the mock and one for checks/client.
- No local `.env` is required for the mock defaults.

## Baseline gates

```powershell
npm run lint
npm test
npm run build
```

## Start normal mode

```powershell
$env:MOCK_MODE = 'normal'
node mock/server.mjs
```

The service listens on `http://localhost:3001` by default. Restart it before every complete state-mutating contract or C1-C11 run.

## Run the client

```powershell
npm run dev:frontend
```

Open `http://localhost:3000`. Domain requests remain relative `/api` and are proxied to the mock.

## Automated verification

```powershell
npm run test:mock
npm test
npm run lint
npm run build
```

If the exact official checker is present at `tools/contract-check.mjs`, run it against a freshly restarted normal mock:

```powershell
node tools/contract-check.mjs --base http://localhost:3001
```

Otherwise run the repository's clearly labeled equivalent verifier and record the official checker as NOT RUN.

## Mode matrix

Restart the process for each value:

```powershell
$env:MOCK_MODE = 'slow'  # approximately 2 seconds; loading is visible
$env:MOCK_MODE = 'error' # login works; domain requests return structured 500
$env:MOCK_MODE = 'empty' # arrays and nested arrays empty; object context remains
node mock/server.mjs
```

For every mode, directly open the public portal, campaign management, application review, scheduling, interviewer workspace, profile, and sign-in routes. Verify Retry by restarting from `error` to `normal` and using the existing control.

## C1-C11 run

1. Sign in as `exec`; create or update and publish the primary campaign.
2. Sign out; confirm the visitor sees the published campaign.
3. Sign in as `studentA`; submit A01 Content and A02 Communications.
4. Sign in as `exec`; review and shortlist A01 and A02 independently.
5. Close applications through the allowed business action, then generate the draft schedule.
6. Observe conflict/unassigned reasons, resolve rows, save changes, and confirm only when valid.
7. Sign in as each assigned Interviewer; verify own-only work and submit required assessments.
8. Sign in as `exec`; record and publish A01/A02 results.
9. Sign in as `studentA`; verify published results and exactly one notification per published application.

Run each independent negative case from a fresh server: duplicate application, invalid PDF/statement/slots, forbidden role/ownership, invalid confirmation, duplicate assessment, and repeat publication.

## Route and responsive review

- Direct-open and reload every route; exercise Browser Back, unknown route, signed-out redirect, and cross-role access.
- Review important routes at 360, 768, and 1280 CSS pixels.
- Record page overflow, table containment, dialog fit, one `h1`, landmarks, labels, focus, and 44-pixel mobile targets.
- Treat automated viewport checks, real browser zoom, keyboard/screen-reader checks, and W3C validation as separate evidence. Mark any unexecuted category NOT RUN.

## Submission audit

Confirm the latest source and build include `.git/`, `client/`, `client/dist/`, `mock/`, `docs/api/`, project rules, `FRONTEND.md`, `brief.md`, `AI-LOG.md`, and `SELF_ASSESSMENT_REPORT.md`, while excluding `node_modules/`, secrets, temporary files, and real CVs. Do not create the final ZIP until team names, student IDs, and evidence-based score/filename fields are supplied.
