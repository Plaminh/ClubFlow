# Architecture

This document explains the project structure. For canonical implementation conventions and coding rules, see [`AGENTS.md`](../AGENTS.md).

## Frontend

The frontend follows Atomic Design for reusable UI composition:

```text
atoms → molecules → organisms → templates → pages
```

Supporting folders such as `hooks`, `contexts`, `services`, `routes`, `utils`, and `constants` are not Atomic Design levels; they contain application behavior and shared infrastructure.

`layouts` are routing/application-shell structures such as a dashboard shell. `templates` are page-level UI compositions in the Atomic Design hierarchy.

## Backend

The backend follows a layered request flow:

```text
HTTP Request
    ↓
Route
    ↓
Validator / Middleware
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

Models represent domain data/behavior. Repositories are the only application layer that should directly query PostgreSQL.

### Responsibilities

- Route: endpoint mapping.
- Validator: request input validation.
- Middleware: cross-cutting HTTP behavior.
- Controller: translate HTTP request/response to application calls.
- Service: business workflows and business rules.
- Repository: persistence and SQL.
- Model: domain representation and behavior, without SQL or Express objects.
- Error: application-specific errors.
- DB: connection pool, transaction helpers, migration/seed runners.

## Environment policy

There is one `.env` at repository root for local development.

- Vite reads it through `envDir: '..'`.
- Express reads it through `backend/src/config/env.js`.
- Docker Compose reads it automatically.

Only variables prefixed with `VITE_` are exposed to frontend code. Never prefix secrets with `VITE_`.
