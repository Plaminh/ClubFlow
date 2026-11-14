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
