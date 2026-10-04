# Backend Rules

Backend code MUST follow:

`Route -> Validator/Middleware -> Controller -> Service -> Repository -> PostgreSQL`

Models represent domain entities and domain-specific behavior.

## Layer Responsibilities

- **Routes** define endpoints and middleware chains only.
- **Validators** validate untrusted input before business logic.
- **Controllers** handle HTTP concerns only and MUST delegate workflows to services.
- **Services** contain business workflows and rules.
- **Repositories** own application data access and persistence.
- **Models** represent domain entities and MUST NOT access PostgreSQL directly.

## Restrictions

SQL MUST NOT appear in:

- routes
- controllers
- services
- models

Application data-access SQL MUST remain in repositories.

Database infrastructure MAY execute SQL for migrations, initialization, transactions, and other infrastructure-level operations.

Controllers MUST NOT contain business logic or access the database directly.

Services MUST NOT:

- execute SQL;
- access Express `req` or `res`.

Models MUST NOT:

- execute SQL;
- import or access the PostgreSQL pool;
- act as repositories;
- access Express `req` or `res`.

Do NOT introduce ORM libraries unless explicitly approved.

## Endpoint Requirements

New or modified endpoints MUST include, when relevant:

- input validation;
- consistent error handling;
- controller logic;
- service logic;
- repository logic;
- meaningful Vitest coverage for changed observable behavior.

Preserve the existing backend architecture and make the smallest change required by the approved specification.