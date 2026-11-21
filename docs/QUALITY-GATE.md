# Quality Gate

## Purpose

A change is not considered complete until the project's required automated and human checks have been performed.

## Automated Checks

Run the complete local quality gate from the repository root:

```bash
npm run verify
```

It runs these commands in order:

1. `npm run format:check` — Prettier checks that code is formatted.
2. `npm run lint` — ESLint checks JavaScript/JSX correctness and project lint rules.
3. `npm test` — Vitest runs the client and mock tests.
4. `npm run test:server` — Vitest runs the server tests against PostgreSQL (`server/.env`; set `TEST_DATABASE_URL` to keep your dev data).
5. `npm run build` — Vite verifies that the frontend production build succeeds.

GitHub Actions (`.github/workflows/ci.yml`) runs the same commands on every push, with a PostgreSQL 17 service, and installs `server/` with `npm ci --ignore-scripts` as the PA#4 marker does.

## Non-Automated Checks

Before a significant change is considered complete, confirm that:

- the implementation matches the approved requirement or specification;
- the architecture follows [`AGENTS.md`](../AGENTS.md);
- no secrets are committed;
- AI-generated code has been reviewed;
- team members can explain the changed code; and
- important changes receive human or peer review.

When Spec Kit is used for a feature, relevant Analyze, Review, or Converge checks may be used where appropriate. Trivial changes do not require heavyweight feature workflow solely to pass this gate.

## Definition of Done

A change is acceptable when:

- `npm run verify` exits successfully;
- relevant requirements are satisfied;
- architecture and conventions are respected;
- known limitations are documented; and
- a reviewer or team member understands the implementation.
