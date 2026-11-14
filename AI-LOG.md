# AI Usage Log

## How to use this file

Add one entry for each task where AI was used.

Keep each entry short and clear. Record what AI was asked to do, what was kept, what was changed or rejected, and what the team did manually.

Do not include passwords, API keys, private data, or other students' work.

The team must review and understand all AI-assisted work before accepting it.

---

## 2026-10-04 — Initial project setup

Tool: ChatGPT

Asked for: Help set up the initial full-stack project structure.

Kept: The basic frontend, backend, database, and project folder structure.

Changed: Some project rules and structure were adjusted later as the project requirements became clearer.

Rejected: Not recorded at the time.

By hand: The team reviewed the project structure and continued configuring the project.

---

## Earlier AI-assisted work

Some earlier development tasks were completed before the team started using this AI-LOG format consistently.

These may include work related to authentication, file upload, and ESLint setup.

Detailed AI usage for those tasks was not recorded at the time, so missing information will not be recreated.

Future AI-assisted tasks will be recorded using the format below.

---

## 2026-10-11 — PA#5 documentation

Tool: Codex

Asked for: Review and improve the project documentation required for PA#5.

Kept: The existing project architecture, ESLint, testing setup, build process, and local verification commands.

Changed: Updated the project conventions, README, AI-LOG, Quality Gate, and Self-Assessment structure to better match the PA#5 requirements.

Rejected: CI and other unnecessary tools because they are not required for the current project.

By hand: The team reviewed the changes and decided which parts to accept.

---

## 2026-11-14 — Phase 0A: rebrand framework to ClubFlow

Tool: Claude Code

Asked for: Rebrand the existing reusable web application framework to ClubFlow (names, metadata, visible branding, documentation) without adding business features.

Kept: Architecture, API routes, authentication and upload infrastructure, database schema, ports, Docker Compose configuration, and earlier entries in this log.

Changed: npm package names (`clubflow`, `clubflow-frontend`, `clubflow-backend`) and the matching lockfile entries, frontend title and displayed branding, `DB_NAME` in `.env.example`, README description, and README URLs that contradicted the configured ports.

Rejected: Renaming the Docker Compose project, container, or existing local database, and editing the constitution title, because these need a manual migration or team approval.

By hand: The team reviews the diff before committing; repository, directory, remote, and database renames are left as manual follow-up actions.

---

## 2026-11-14 — Phase 0A.2 — Docker & PostgreSQL Migration

Tool: Claude Code

Asked for: Migrate the local Docker Compose project, PostgreSQL container, database, user, and volume from the earlier scaffold names to ClubFlow names without losing data or touching unrelated Docker resources.

Kept: PostgreSQL 16 (`postgres:16-alpine`), the local port, all passwords and secrets, application code, and the old container and volume (stopped, kept as rollback resources).

Changed: `docker-compose.yml` (explicit project name `clubflow`, container `clubflow_postgres`), `DB_USER` in `.env.example`, `DB_NAME` and `DB_USER` in the local `.env`, and the README note about database naming. A new volume `clubflow_postgres_data` was initialized and the old database was restored into it from a verified `pg_dump` backup stored outside the repository.

Rejected: Reusing the old data directory under the new names, and deleting the old container, volume, or network.

By hand: The migration plan was approved by the team before any Docker resource was created; the team reviews the diff before committing and decides when to remove the old rollback resources.

Cleanup follow-up (2026-11-14):

- Legacy container `webapp_postgres` was removed.
- Legacy volume `web-application-development_postgres_data` and network `web-application-development_default` were removed after verification.
- The temporary bind-mount stub was removed.
- The new ClubFlow PostgreSQL environment remains healthy.
- The verified database backup was retained.
- Rollback now requires restoring the backup rather than restarting the old container.

---

## 2026-11-14 — Phase 0A.3 — Constitution & Frontend Branding

Tool: Claude Code

Asked for: Rename the constitution to ClubFlow, rename the remaining scaffold-named frontend component, and align the development preview branding with ClubFlow, without adding business features.

Kept: All constitution principles, stack, governance rules, and ratification date; the Atomic Design structure; the API health status display; the layout and styling; dependencies; backend code; and earlier entries in this log.

Changed: Constitution title to `ClubFlow Constitution` with a PATCH amendment (1.0.0 to 1.0.1, wording only). Renamed the `ProjectOverview` organism to `ClubFlowOverview` (files, CSS class names, import in `HomePage.jsx`). Set the displayed description to `Student Club Recruitment Management System` in `constants/project.js` and the `index.html` meta description. Added a component test for `ClubFlowOverview`.

Rejected: Fake dashboards or placeholder controls for features that do not exist yet, new pages or routes, new dependencies, edits to Spec Kit templates, and rewording historical references to the earlier scaffold name.

Verified: `npm run lint`, `npm test`, `npm run build`, `npm run verify`, and `git diff --check` passed; no active source file references the old component name.

By hand: A team member confirmed team approval of the constitution title change before it was edited. The team reviews the diff, checks the preview page in a browser, and commits; this entry does not mean the phase has been committed.
