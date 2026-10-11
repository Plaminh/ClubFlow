<!--
Sync Impact Report:
- Version change: N/A -> 1.0.0
- Modified principles: Testing Strategy, Backend Architecture, Governance (Wording clarifications)
- Added sections: 10 Core Principles based on user requirements.
- Removed sections: N/A
- Templates requiring updates: ✅ None pending.
- Follow-up TODOs: None.
-->
# Web Application Development Constitution

This constitution defines high-level project governance. For canonical implementation conventions and coding rules, see [`AGENTS.md`](../../AGENTS.md).

## Core Principles

### I. Fixed Technology Stack
The approved stack MUST NOT be replaced unless the team explicitly approves the change.
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Containerization**: Docker (for development)
- **Testing**: Vitest (only automated test framework allowed)
- **Workflow**: GitHub Spec Kit for spec-driven development
- **Management**: Jira for project/task management

### II. Frontend Architecture
Frontend MUST follow Atomic Design principles:
`atoms -> molecules -> organisms -> templates -> pages`.

- **Dependency Direction**: Lower-level components MUST NOT import higher-level components.
- **Supporting Layers**: MAY include layouts, routes, hooks, contexts, services, utils, and constants.
- **API Access**: MUST go through frontend services and shared API client logic.
- **Restriction**: Atoms and molecules MUST NOT contain backend API logic.
- **State**: Avoid unnecessary global state management (e.g., do not introduce Redux without explicit requirement).

### III. Backend Architecture
Backend MUST follow a strict layered architecture flow:
`Route -> Validator/Middleware -> Controller -> Service -> Repository -> PostgreSQL`.

Models act as domain objects rather than a sequential processing layer.

- **Controllers**: MUST handle HTTP concerns only; MUST NOT contain business logic; MUST NOT access the database directly.
- **Services**: MUST contain business workflows and rules; MUST NOT execute SQL; MUST NOT access Express `req` or `res`.
- **Repositories**: MUST manage persistence; MAY map database rows into domain models; MUST be the application layer responsible for database queries.
- **Models**: Represent domain entities and entity-specific behavior; MUST NOT execute SQL; MUST NOT import or access the PostgreSQL pool; MUST NOT act as repositories; MUST NOT access Express `req` or `res`.
- **SQL Execution**: SQL MUST ONLY exist in repositories or database infrastructure.

### IV. Database Discipline
- **Migrations**: All shared PostgreSQL schema changes REQUIRE migrations. Shared migrations SHOULD NOT be silently rewritten after being used by the team.
- **Seeds**: Seeds exist ONLY for development/demo data.
- **Restriction**: Business logic MUST NOT depend on seed data.

### V. Testing Strategy
- **Framework**: Vitest is the ONLY automated test framework allowed.
- **Coverage Requirement**: New or modified business rules, validators, important API behavior, domain model behavior, and critical UI interactions MUST include relevant automated tests when their observable behavior changes.
- **Restriction**: DO NOT generate tests only to increase test count or coverage.

### VI. Environment Configuration
- **Files**: The repository uses ONE root `.env` file only. DO NOT create `frontend/.env`, `backend/.env`, `.env.test`, `.env.development`, or `.env.production`.
- **Visibility**: Browser-visible configuration MUST use the `VITE_` prefix.
- **Security**: Secrets MUST NEVER be exposed through `VITE_` variables.
- **Git Safety**: `.env` MUST NOT be committed.
- **Example Configuration**: `.env.example` MUST be updated whenever a new environment variable is introduced.

### VII. Simplicity and Oral-Exam Readiness
- **Complexity**: Prefer the simplest implementation that satisfies the specification. Avoid unnecessary abstractions, dependencies, frameworks, patterns, and infrastructure.
- **Comprehension**: Every team member MUST be able to understand and explain generated code.
- **Restrictions**: DO NOT introduce ORM libraries, Redux, microservices, dependency injection containers, or similar architecture without an explicit requirement.

### VIII. Spec-Driven Development
Non-trivial features MUST follow the GitHub Spec Kit lifecycle:
`specify -> clarify -> plan -> checklist -> tasks -> analyze -> implement -> converge`.

- **Traceability**: Implementation MUST remain traceable to approved requirements and tasks.
- **Compliance**: Constitution violations are considered blockers.

### IX. Scope Control
- **Isolation**: DO NOT modify unrelated code.
- **Refactoring**: DO NOT silently refactor existing architecture.
- **Justification**: Any architecture change MUST first be justified in `plan.md`.
- **Minimal Change**: Implement the smallest change that fully satisfies the approved specification.

### X. AI Usage
- **Tracking**: Significant AI-assisted work MUST be recorded in `AI-LOG.md` where required by the course project.
- **Review**: Generated code MUST be reviewed and understood by the team.

## Governance

Amendments require documentation, team approval, and a migration plan if applicable. Implementation must remain consistent with the project constitution, `spec.md`, `plan.md`, and `tasks.md`. If these artifacts conflict, report the conflict instead of guessing.

All changes MUST be reviewed for constitution compliance before being considered complete. Pull requests, when used, MUST verify constitution compliance before merging.

**Version**: 1.0.0 | **Ratified**: 2026-10-04 | **Last Amended**: 2026-10-04
