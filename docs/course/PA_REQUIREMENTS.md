# CSC13008 — Course PA Requirements Summary

**Sources:** `Meeting_Notes_11_10.md` (meeting notes, **not** a substitute for official course rubrics/announcements); opening and §§5–6 of the Final Project Brief.  
**Distinction:** The following is a **summary of notes and the brief**. Confirm weights, requirements, and deadlines against the instructor's Moodle announcements before submission.

## 1. PA assignments mentioned in the meeting notes

| PA | Topic | Requirements/deliverables described | Stated weight |
|---|---|---|---:|
| PA#1 | Idea & wireframe | Problem, users, scope, feature list, user flow, initial wireframes and UI theme | 3% |
| PA#2 | Responsive static prototype | HTML/CSS, mobile/tablet/desktop layouts, consistent navigation, mock data permitted; backend/database not required | 3% |
| PA#3 | Frontend | ReactJS, reusable components, state/forms, frontend interactions, readiness for API integration | 7% |
| PA#4 | Backend | Node.js/Express REST APIs, CRUD, JWT, upload, database integration | 7% |
| PA#5 | Harness & AI | Project conventions, lint/test quality gates, AI-LOG, self-assessment | 5% |
| PA#6 | Final & individual defense | Demonstrate product, explain code/architecture/technology; every member understands major code paths | 15% |
| **Total** | | | **40%** |

**From the Brief:** Every team builds ClubFlow during PA#2–PA#6. PA#2 must cover the three screen capabilities in Brief §5 and the *Fix these* list. The lecturer, not the Product Owners, decides deadlines, grading, rubrics, and PA#2 requirements.

## 2. Technical direction from meeting notes — not business rules

The notes describe the shared framework at the time:

- Frontend: **React + Vite**, Atomic Design; API calls in `src/services` via `apiClient`.
- Backend: **Node.js + Express**, Route → Validator/Middleware → Controller → Service → Repository → PostgreSQL.
- Database: PostgreSQL, domain SQL in repositories; the notes recommend avoiding an ORM without approval.
- Authentication: JWT. Upload: Multer, with Cloudinary described as the framework's storage service.
- Lint/tests: ESLint and Vitest; `npm run verify` runs lint → test → build.
- Environment: one root `.env`; frontend variables prefixed `VITE_`; no secrets exposed to frontend.
- Git/AI: shared conventions, AI-assisted code review, `AI-LOG.md` records.

**Important:** This is a **description or development direction**, not proof that login, upload endpoints, or any ClubFlow domain feature works. Inspect current source and run tests to verify implementation.

## 3. Evidence to preserve proactively

- PA#2: Static HTML/CSS, responsive screenshots, *Fix these* checks.
- PA#3: React components, working UI flows, state, forms, client navigation, validation/tests.
- PA#4: API routes, JWT/RBAC, PDF upload, PostgreSQL schema/migrations, service/repository/tests.
- PA#5: `AGENTS.md`, `.specify/memory/constitution.md`, `docs/QUALITY-GATE.md`, `AI-LOG.md`, self-assessment, lint/test/build evidence.
- PA#6: End-to-end workflows across roles, meaningful demo fixtures, ability to explain the code.

This is an internal readiness checklist, **not** a claim that the course requires each evidence file in every PA without a detailed rubric.

## 4. Information not found in these three references

- Official submission deadlines for each PA.
- Criterion-level grading rubrics beyond the meeting notes.
- Specific deployment/hosting rules for the final project.
- Mandatory endpoint names, database table names, routing libraries, or state-management libraries.

Do not guess these. Consult instructor announcements if needed.

## 5. Relationship to ClubFlow technical phases

The team may organize implementation as **Phase 0B / 1…6** (documentation → identity → campaign → application → review → scheduling → outcomes). These are **not the same numbering** as official **PA#3 React frontend** and **PA#4 Backend**. Submission planning must cover actual deliverables for each PA.
