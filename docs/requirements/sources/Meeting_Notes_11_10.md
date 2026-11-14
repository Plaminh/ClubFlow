# Meeting Notes — 11/10 (English Translation)

**Nature of this file:** Translation of the meeting-note Markdown provided by the team. It contains course PA summaries, UI planning notes, technical explanations, and a snapshot of the generic web application framework. It is **not** a replacement for the lecturer's official rubric or the ClubFlow Final Project Brief.

The original source contains conversion artifacts in some tables, lists, and file-path examples. This translation restores readable structure where the intended meaning is clear, without claiming that historical implementation details describe the present repository.

## Assessment structure

| PA | Topic | Main requirement | Share of grade |
|---|---|---|---:|
| PA#1 | Idea and Wireframe | Draft proposal and basic UI design | 3% |
| PA#2 | Prototype | Responsive static website | 3% |
| PA#3 | Frontend | Build the UI using ReactJS | 7% |
| PA#4 | Backend | Express, CRUD, JWT, upload, database | 7% |
| PA#5 | Harness and AI documentation | Conventions, quality gates, AI-LOG, self-assessment | 5% |
| PA#6 | Final and individual oral defense | Live demonstration; questions about the team's source code | 15% |
| **Total** | | | **40%** |

## PA#1 — Idea and Wireframe (3%)

**Goal:** Define the product the team intends to build and develop an initial interface design.

Required work:

- Identify the topic, the problem it addresses, and its target users.
- Define the application's goals and scope.
- List the major planned features.
- Sketch wireframes of important pages.
- Agree on a basic UI design direction.

**Deliverable:** Draft proposal and preliminary wireframes/UI.

**What is a wireframe?** A wireframe is an initial structural sketch showing the arrangement and placement of major elements on a website or application screen.

## PA#2 — Prototype (3%)

**Goal:** Convert the initial design into a complete-looking static responsive website prototype.

Required work:

- Build the designed pages.
- Implement responsive layouts for desktop, tablet, and mobile.
- Keep layout, navigation, and visual presentation consistent.
- Backend/database integration is not yet required.

**Deliverable:** A static website that can run and show the interface.

**Prototype:** A preliminary website built from wireframes to demonstrate its visual layout, structure, and basic interactions before full functionality is developed.

For PA#2:

- **HTML:** Page structure and content.
- **CSS:** Styling, layout, responsiveness.
- **JavaScript:** Simple interactions if necessary.
- **Localhost:** The website runs and is viewable in a browser.
- **Data:** Mock data is acceptable; backend/database are not necessary.

The intent is to prepare a responsive desktop/tablet/mobile interface that forms the basis for the ReactJS frontend in PA#3.

## PA#3 — Frontend (7%)

**Goal:** Build the application frontend using ReactJS.

Required work:

- Convert the prototype into React.
- Organize the UI into reusable components.
- Manage state, forms, and user interactions.
- Implement frontend feature flows.
- Prepare for integration with backend APIs.

**Deliverable:** A React application implementing frontend functionality.

## PA#4 — Backend (7%)

**Goal:** Create a backend that processes business logic, manages data, and provides APIs to the frontend.

Technical requirements described in the notes:

- **Express:** Build the backend and REST APIs.
- **CRUD:** Create, Read, Update, Delete operations.
- **JWT:** Token-based user authentication.
- **Upload:** Handle file uploads.
- **Database:** Design and connect a database.

**Deliverable:** A working backend with APIs connected to a database and supporting application features.

## PA#5 — Harness and AI (5%)

**Goal:** Demonstrate an organized development process, controlled AI use, and application quality.

Expected materials:

- **Project Conventions:** Shared rules for architecture, code structure, and team practices.
- **Quality Gates:** Lint/test and other checks required before accepting changes.
- **AI Usage Log (`AI-LOG.md`):** Record AI-assisted development and review.
- **Self-Assessment Report:** Evaluate progress, requirement coverage, and product quality.

**Note:** PA#5 preparation should happen throughout the project, not only just before submission. Maintain conventions, tests, and AI usage records while developing.

## PA#6 — Final and individual oral defense (15%)

**Goal:** Evaluate the completed product and each student's practical understanding.

Required work:

- Demonstrate the application live.
- Present implemented features.
- Explain system architecture and technologies.
- Answer questions about how the team code works.

**Important:** Every team member must be able to explain the major source-code paths of the complete application, not only the code they personally wrote.

## Wireframes and UI/theme discussion

### Page identification

Identify all pages the website needs.

### User flow

Describe user actions and navigation between pages.

### UI/theme

Agree on:

- Overall visual design style.
- Color palette.
- Typography.
- Layout.

### Suggested UI tools

| Tool | Intended use | Website |
|---|---|---|
| Figma | Wireframe/UI design and collection of the official design | https://www.figma.com |
| Google Stitch | AI-assisted interface generation and Figma support | https://stitch.withgoogle.com |
| v0 by Vercel | Code-generated UI/prototypes and layout inspiration | https://v0.app |
| Visily | Wireframes and AI-assisted UI designs | https://www.visily.ai |
| Penpot | Open-source UI/UX design alternative to Figma | https://penpot.app |

### Work allocation mentioned for PA#1

- **Idea & Feature Refinement:** Refine the product idea, MVP, and page list — **Minh**.
- **User Flow & Wireframe:** Identify the user journey and sketch page structures — **Nguyệt**.
- **UI/Theme Design:** Agree on visual style, palette, typography, and layout, potentially using Figma, Stitch, or v0 — **Hoàng**.
- **Review & Finalization:** Consolidate designs in Figma and conduct a group review.
- **PA#1 Submission:** Prepare and submit the required content.

These are historical meeting assignments, not ClubFlow role permissions.

## PA#4 — Backend technical explanations

### 1. REST APIs

A REST API is one way for frontend and backend applications to communicate over HTTP. The frontend sends a request to an endpoint; the backend receives and processes it, usually returning JSON.

Common HTTP methods:

- `GET`: retrieve data.
- `POST`: create data.
- `PUT`/`PATCH`: update data.
- `DELETE`: delete data.

Example: `GET /api/books` asks the backend for a book list.

### 2. CRUD

CRUD describes the four standard data operations:

- **Create:** Add a new record.
- **Read:** Retrieve an existing record.
- **Update:** Modify a record.
- **Delete:** Remove a record.

Examples for a book resource:

```http
POST /api/books
GET /api/books
PUT /api/books/:id
DELETE /api/books/:id
```

REST describes a way of interacting with a service; CRUD describes the data operations its endpoints perform.

### 3. JWT

JWT means **JSON Web Token**. It is commonly used to authenticate users.

After a successful login, a backend may issue a token. Later requests can send:

```http
Authorization: Bearer <token>
```

The backend verifies the token:

- Valid token: Continue to a protected operation.
- Invalid or expired token: Reject the request.

This avoids asking for a password on every request. A token functions like a pass presented with later API calls.

### 4. File uploads

Uploading means sending a file from frontend to backend. Examples include an avatar, product picture, or PDF document.

The backend should validate before storing a file:

- Is the file type allowed?
- Is the file too large?
- Does the content match the declared format?

### 5. Cloudinary

Cloudinary is described in the notes as a cloud service for storing and managing uploaded images/files. Instead of storing every file in a server folder, the backend can upload to Cloudinary, which provides metadata such as:

- File URL.
- Public ID.
- Resource type.

The backend may persist the URL/public ID in its database. The notes list benefits including less server-side file storage and easier access to media. **These are framework explanations, not permission to expose private ClubFlow CV files publicly.**

## PA#5 — Harness and AI technical explanations

### 13. Project Conventions

Project conventions specify how team members structure code and collaborate. The notes identify `AGENTS.md` as the framework's main convention file.

Rules described for that framework:

- **Stack:** React + Vite frontend; Node.js + Express backend; PostgreSQL; Vitest tests; ESLint linting.
- **Frontend:** Atomic Design; API calls in `src/services`; shared HTTP through `apiClient`; avoid placing unrelated data-access logic inside components.
- **Backend:** Route → Validator/Middleware → Controller → Service → Repository → PostgreSQL.
- **Database:** Domain SQL belongs in repositories; no ORM unless explicitly allowed.
- **Environment:** One root `.env`; frontend-exposed variables prefixed `VITE_`; never expose secrets to frontend.
- **Testing:** Frontend and backend use Vitest; tests should validate real behavior.
- **Git workflow:** Branch names such as `feature/`, `fix/`, `docs/`, `test/`, `chore/`; commit messages such as `feat: ...`, `fix: ...`, `test: ...`.
- **AI:** AI-assisted code must be reviewed and understood by the team; log AI tasks in `AI-LOG.md`.

### 14. Lint / ESLint

Linting automatically checks code for likely errors and agreed style rules before the application runs.

The framework configuration described in the notes uses `eslint.config.mjs` and the command:

```bash
npm run lint
```

Rules were organized by environment:

- Shared JavaScript/JSX rules.
- Backend Node.js globals.
- Frontend browser globals and React/React Hooks/React Refresh rules.
- Backend test Vitest globals.
- Frontend test browser + Vitest globals.

Examples of checks:

- `no-unused-vars`: Flags declarations that are not used.
- `no-undef`: Flags undeclared variables.
- React rules: Check React component conventions.
- React Hooks rules: Check correct Hook usage.
- React Refresh: Check component export patterns related to fast refresh.

Variables prefixed with `_` may be intentionally unused, e.g. `catch (_err)` in `backend/src/middleware/auth.middleware.js`, or `(err, _req, res, _next)` in an upload middleware test. The leading underscore indicates an intentionally unused required parameter.

The root `package.json` in the historical framework included:

```json
"lint": "eslint ."
```

The `npm run verify` quality gate was described as:

```text
npm run verify
  -> npm run lint
  -> npm test
  -> npm run build
```

The intent is to require lint/test/build checks before accepting changes. Current commands must still be verified in the repository.

### 15. Self-Assessment Report

A self-assessment explains the team's claimed completion level against course criteria and points to evidence rather than merely submitting code.

Main fields described:

- **Submitted by:** Team members submitting the work.
- **Total I claim:** Claimed total score.
- **Criterion:** Assessed criterion.
- **Max:** Maximum score.
- **I claim:** Team's claimed score for that criterion.
- **Evidence:** Source files, tests, or other verifiable supporting items.

Examples of framework evidence:

- Project Conventions → `AGENTS.md`.
- Quality Gates → `docs/QUALITY-GATE.md`, `package.json`, `eslint.config.mjs`.
- AI Usage Log → `AI-LOG.md`.

Further report sections:

- **What I did not manage:** Incomplete features, missing tests/evidence, or other limitations.
- **What I would do differently:** Improvements to development practices, such as recording AI assistance immediately instead of retroactively.

## Historical framework files added (8)

The notes list these additions in the framework at the time of the meeting:

| Path | Description |
|---|---|
| `backend/src/config/cloudinary.js` | Cloudinary setup and required configuration checks. |
| `backend/src/middleware/auth.middleware.js` | Verify JWT Bearer tokens to protect APIs. |
| `backend/src/middleware/upload.middleware.js` | Multer handling up to 5 MB, allowing JPEG, PNG, WebP, and PDF in the generic middleware. |
| `backend/src/services/cloudinary.service.js` | Upload and delete files via Cloudinary. |
| `backend/src/utils/jwt.js` | Issue/verify JWTs and enforce expiry. |
| `backend/tests/unit/middleware/auth.middleware.test.js` | Unit tests for authentication middleware. |
| `backend/tests/unit/middleware/upload.middleware.test.js` | Tests for file format, size, and temporary/memory upload handling. |
| `backend/tests/unit/utils/jwt.test.js` | Tests for valid, expired, and invalid JWTs. |

## Historical framework files modified (6)

| Path | Description |
|---|---|
| `.env.example` | Added JWT/Cloudinary configuration examples. |
| `backend/package.json` | Added `jsonwebtoken`, `multer`, and `cloudinary`. |
| `backend/src/config/env.js` | Requires `JWT_SECRET` during backend startup. |
| `eslint.config.mjs` | Combined ESLint configuration for frontend/backend/tests. |
| `package.json` | Added lint and verify scripts and ESLint dependencies. |
| `package-lock.json` | Updated dependency tree and package versions. |

## Historical summary

- **JWT:** Authentication foundation existed, but login/register flows had not yet been built.
- **Multer + Cloudinary:** Upload/storage foundation existed, but a complete upload endpoint had not yet been created.
- **Vitest:** Added tests for JWT and upload middleware.
- **ESLint:** Project-wide code-checking infrastructure was established.
- **Quality Gate:** `npm run verify` checks lint, tests, and build before merge.

*End of English translation. The supplied Vietnamese original is preserved separately in `ClubFlow_Original_Sources.zip`. Historical paths, dependencies, and behavior should be validated against the current ClubFlow repository rather than treated as newly verified facts.*
