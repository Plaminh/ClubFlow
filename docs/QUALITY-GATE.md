# Quality Gate

## Purpose

A change is not considered complete until the project's required automated and human checks have been performed.

## Automated Checks

Run the complete local quality gate from the repository root:

```bash
npm run verify
```

It runs these commands in order:

1. `npm run lint` — ESLint checks JavaScript/JSX correctness and project lint rules.
2. `npm test` — Vitest runs the frontend and backend automated tests.
3. `npm run build` — Vite verifies that the frontend production build succeeds.

This quality gate currently runs locally. No GitHub Actions or CI pipeline is required for the current course scope.

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
