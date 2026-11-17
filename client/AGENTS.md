# Frontend Rules

Frontend code MUST follow React + Vite and Atomic Design.

Component dependency direction:

`atoms -> molecules -> organisms -> templates -> pages`

## Component Rules

- Lower-level components MUST NOT import higher-level components.
- Atoms and molecules MUST remain reusable UI components.
- Atoms and molecules MUST NOT perform backend API calls.
- Templates define page-level composition.
- Pages combine UI composition with feature behavior.

## Data and API Access

- Backend API access MUST go through `src/services`.
- Shared HTTP configuration MUST go through the shared API client.
- Do NOT hardcode backend URLs inside components.

## Testing

Use Vitest and React Testing Library for frontend tests.

New or modified critical UI behavior MUST include relevant automated tests when observable behavior changes.

## Restrictions

Do NOT introduce:

- another frontend framework;
- Redux or another global state management library;
- ORM-related frontend dependencies;
- unnecessary architectural abstractions;

unless explicitly approved by the specification.

Preserve the existing frontend architecture and naming conventions.

For frontend-only tasks, do NOT modify backend code unless the approved specification explicitly requires a backend change.

Make the smallest change required by the approved specification.