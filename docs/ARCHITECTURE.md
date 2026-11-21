# Architecture

This document explains the structure of ClubFlow, a student club recruitment management web application. For canonical implementation conventions and coding rules, see [`AGENTS.md`](../AGENTS.md).

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

There is one environment file, `server/.env`, copied from `server/.env.example` (changed in PA#4; see `AGENTS.md`).

- The server's npm scripts load it with Node's `--env-file-if-exists=.env`.
- `server/src/config/env.js` is the only module that reads `process.env`; a missing value stops the server with a message, and no secret has a fallback.
- The front end needs no variables; it calls relative `/api` paths through the Vite proxy.
- `docker-compose.yml` needs no variables (local PostgreSQL 17, no password, bound to 127.0.0.1).

Only variables prefixed with `VITE_` are exposed to frontend code. Never prefix secrets with `VITE_`.
