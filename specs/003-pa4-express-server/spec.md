# Feature Specification: PA#4 Express Server

**Branch**: `feature/pa4` | **Created**: 2026-11-21 | **Status**: Agreed by the team (2026-11-21)

**Input**: The PA#4 rubric ("Back end in Express"), the PA#5 and PA#6 rubrics, `docs/api/` from PA#3, and `docs/requirements/`.

This file does not restate the rubric. It names what the server must do, the decisions the team took where the sources leave room or disagree, and how "done" is checked. Who does what, and in which order, is in [tasks.md](tasks.md); the technical design is in [plan.md](plan.md).

## Goal

Replace the PA#3 HTTP mock with an Express server in `server/` that implements `docs/api/` against PostgreSQL, signs users in with JWT, takes CV uploads, and enforces the ClubFlow rules on the server, so that a request sent around the front end gets the same answer as a click inside it. The PA#3 front end runs on this server unchanged, apart from the 401 handling below.

## Scope

In scope:

- Every endpoint in `docs/api/README.md`, answering as its examples show.
- PostgreSQL schema in migrations, and `npm run seed` with the demo accounts and the brief's example story.
- Sign-in with JWT and roles; passwords hashed.
- Validation of every body, path and query value, and one error shape.
- CV upload with Multer, stored on disk in `UPLOAD_DIR`.
- Rules R1–R8 and flaws S1–S5 (PA#4 rubric), each proved by a test.
- The front end on the real API: a `401` takes the user to sign-in with a message.
- `BACKEND.md`, `brief.md`, `AI-LOG.md` (`## PA#4`), `SELF_ASSESSMENT_REPORT.md`.

Out of scope:

- **Self-registration.** Excluded by the brief (decision D-10 in `docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md`). Accounts come from the seed.
- Email, SMS or push notifications; multi-club; cloud storage; a cloud database.

## Requirements

### Contract

- **FR-01** The server answers every example in `docs/api/` with the status code and field names shown.
- **FR-02** Each file of `docs/api/` works on its own on a fresh seed: where it needs a state the seed does not have, it starts with the requests that create that state through the API, and says so in a line under its `## Changes`.
- **FR-03** Every change to the contract since PA#3 has a dated line in `## Changes`, committed before the code that implements it.

### Seed and time

- **FR-04** `npm run seed` gives the same state on an empty and on a seeded database.
- **FR-05** The seed has the accounts `exec`, `studentA` (with A01 Content and A02 Communications), `studentB` (with one application of their own), `int-content` and `int-comms`, and an internal screening note on A01 whose text is written in `BACKEND.md`. No person is both an applicant and an interviewer. The seed also has `studentC`, an applicant with no application: the PA#6 demo must create the example's two applications live, which `studentA` cannot do because A01 and A02 already exist (PA#4 requires them in the seed).
- **FR-06** "Today" is read from `APP_TODAY` (example value `2026-11-18`, inside the campaign's open period 2026-11-10 to 2026-11-30). The marker keeps the example's value. The server never reads the machine clock for a business rule.
- **FR-23** `npm start` never migrates destructively, seeds or wipes data: the marker restarts the server without seeding and looks for what the walk created.

### Sign-in and access

- **FR-07** A JWT signed with `JWT_SECRET` (HS256 only), `exp` at most 24 hours ahead. A wrong password and an unknown e-mail get the same `401 INVALID_CREDENTIALS`.
- **FR-08** Every protected endpoint answers `401` to: no token, a token signed with another secret, `alg: none`, an expired token, an edited payload.
- **FR-09** **Access rule (one rule for the whole API):** a role calling an endpoint of another role gets `403 FORBIDDEN`; the right role asking for an item that is not theirs (another applicant's application, an interview not assigned to them) gets `404 NOT_FOUND`, so the answer does not reveal that the item exists. The role comes from the token, never from the request.
- **FR-10** The screening note appears in no answer to an applicant or an interviewer.

### Rules and flaws

- **FR-11** R1–R8 hold for requests sent straight to the API (PA#4 rubric, "Rules the server enforces"), each refusal giving the reason in the error shape.
- **FR-12** S1–S5 are closed (PA#4 rubric, "The five security flaws").
- **FR-13** **R8 timing (conflict resolved by the team, 2026-11-21):** an assessment may be submitted once the schedule is confirmed. The team's earlier reading of Q-04 was "only after the interview has taken place", but no single fixed `APP_TODAY` can be both inside the application period (2026-11-10 to 2026-11-30, needed by C5 and R2) and after the interview date (2026-12-02, needed by that reading of C10). The rubric is what is marked, so the server follows R8. This difference is recorded in the contract `## Changes` and in `BACKEND.md`. The product owners' answer of 2026-11-21 ([post](https://www.facebook.com/share/p/1DHPpDkB2n/)) says "one assessment per interviewed slot" without requiring a clock check. The team decided on 2026-11-21 not to post a follow-up: the answer leaves the timing open and R8 is what is marked.

### Product owner answers that shape the server

From the [product owners' post](https://www.facebook.com/share/p/1DHPpDkB2n/), recorded in `docs/requirements/DECISIONS_AND_OPEN_QUESTIONS.md`:

- **FR-18 (Q-01)** Draft generation is first-fit in a fixed order: Shortlisted applications by `submittedAt`, then Application ID; for each, the earliest slot first; within a slot, interviewers then rooms by stable ID. No backtracking. An application that fits nowhere is *Unassigned* with its reason.
- **FR-19 (Q-02)** Business time zone UTC+7. A campaign accepts applications when `opensOn <= APP_TODAY <= closesOn` (the closing day is included).
- **FR-20 (Q-03)** A published campaign stays editable until the schedule is confirmed, as `docs/api/07-campaign-management.md` already says: a position with applications cannot be deleted; the interview setup locks at the first valid application.
- **FR-21 (Q-05)** Results produce an in-app notification only; no email.
- **FR-22 (Q-07)** CV access: the owner applicant, the interviewer assigned to that application, the Executive — also when the CV URL is opened directly.

### Errors

- **FR-14** Every non-2xx answer uses `{ "error", "code", "fieldErrors"?, "details"? }` from `docs/api/README.md`. Broken JSON gets `400`, an unknown path or a missing id `404`, an unexpected failure `500`; no answer carries a stack trace.
- **FR-15** An unknown body field is ignored, never stored.

### Front end

- **FR-16** `client/` still calls relative `/api` paths; `client/dist/` is rebuilt against the server.
- **FR-17** A `401` clears the session and opens sign-in with a message. The reasons the server gives (an *Unassigned* reason, the *Conflict* at 09:00–09:20, a refused confirmation) appear on the screen.

## Acceptance (how "done" is checked)

Run what the marker runs, from a clean copy:

```sh
cd server
rm -rf node_modules && npm ci --ignore-scripts
cp .env.example .env        # set DATABASE_URL and a long random JWT_SECRET
npm test                    # offline, on an empty database, under 5 minutes
npm run seed && npm start   # answers within 30 s
```

Then, before each file and each check, seed again and restart:

- every example in `docs/api/` (`node tools/contract-check.mjs` against the server);
- every check in `BACKEND.md` "Rules and checks";
- `client/dist/` through `npx vite preview` with the network off: C1–C11 with the demo accounts, then restart the server without seeding and check that what the walk created is still there.

Root gates stay green: `npm run format:check`, `npm run lint`, `npm test`, and CI on every push.

Before hand-in, also run the install and the tests once in a `node:22-slim` container next to `postgres:17`, with the network cut after `npm ci --ignore-scripts`: the lock file is made on Windows and must carry the Linux builds of Vitest's native dependencies; developers run Node 26, the marker Node 22.
