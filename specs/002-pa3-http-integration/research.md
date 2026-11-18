# Research: PA#3 HTTP Integration and Completion

## D-001 - Contract-first, mock-first sequencing

**Decision**: Finish and commit the complete C1-C11 HTTP contract before implementing `mock/`, then verify and commit the mock before connecting any domain service.

**Rationale**: This is an explicit PA#3 acceptance gate, prevents the current browser service shapes from silently becoming the network contract, and creates reviewable boundaries in Git history.

**Alternatives considered**: Integrating one screen at a time while inventing endpoints; rejected because it would mix provider and consumer changes and make contract review unreliable.

## D-002 - Separate built-in Node mock

**Decision**: Implement the PA#3 provider as a separate root `mock/` process using only Node.js built-in runtime modules.

**Rationale**: The rubric requires `node mock/server.mjs`, port 3001, no install step, process-memory reset, four modes, multipart support, and deterministic state. Reusing Express would blur the PA#3/PA#4 boundary and violate the explicit mock constraint.

**Alternatives considered**: Express routes in `backend/`; rejected as PA#4 work. Browser fixtures; rejected because graders require real HTTP requests.

## D-003 - Canonical fixtures and stable mappings

**Decision**: Use a single primary campaign and canonical identities `exec`, `studentA`, `studentB`, `int-content`, `int-comms`, A01 Content, and A02 Communications. Preserve legacy browser identities unless an explicit mapping is documented.

**Rationale**: Stable identities make executable examples deterministic while avoiding a misleading silent rename of established UX fixtures.

**Alternatives considered**: Re-labeling all legacy `CF-*` data as A01/A02; rejected because it would corrupt historical fixture meaning and create UI regressions.

## D-004 - Mock mode configuration

**Decision**: Read `MOCK_MODE` (`normal`, `slow`, `error`, `empty`) and `PORT` from the process environment with defaults `normal` and `3001`; do not add environment files.

**Rationale**: Process variables allow isolated restarts for each mode, satisfy the one-root-`.env` rule, and avoid a test-only production endpoint. Normal delays about 150 ms; slow delays about 2 seconds; error keeps login usable and returns documented 500 errors for domain requests; empty recursively empties arrays after normal authorization and single-resource construction.

**Alternatives considered**: Runtime mode-switch endpoint; rejected as an invented production capability. Multiple `.env` files; prohibited.

## D-005 - Published campaign correction semantics

**Decision**: Follow the supplied PA#3 Q-03 direction over the older team-selected prototype lock: published campaigns allow constrained position/quota/window changes, linked positions cannot be deleted, the first valid application locks interview configuration, and confirmed schedules lock required campaign/schedule data.

**Rationale**: The master prompt explicitly identifies this as the authoritative correction for PA#3. The difference must be visible in contract change history, tests, and UI behavior.

**Alternatives considered**: Preserve full lock on publication; rejected because it conflicts with the supplied PA#3 decision.

## D-006 - Schedule action boundaries

**Decision**: Treat Generate Draft, Edit/Resolve row, Save Changes, and Confirm as separate actions. Row edits stage server-side in the current draft and recalculate all conflicts; Save Changes stamps/persists the staged draft in process state; Confirm validates the saved current draft atomically and locks it.

**Rationale**: This gives Save Changes meaningful observable behavior without a second client-only schedule store and keeps state continuity simple.

**Alternatives considered**: Make every row edit permanently saved; rejected because Save Changes would be redundant. Send an entire schedule body to Save; rejected because the established UI edits one row at a time and the contract can minimize payload duplication.

## D-007 - Relative frontend HTTP boundary

**Decision**: All domain services call relative `/api` paths through `client/src/services/apiClient.js`; Vite `server.proxy` and `preview.proxy` forward to the mock.

**Rationale**: Same-origin runtime paths work in development and preview, keep hosts and ports out of source, and centralize bearer headers, serialization, error mapping, downloads, and cancellation.

**Alternatives considered**: `VITE_API_URL` absolute host configuration; rejected for PA#3 runtime domain requests. Direct `fetch` in hooks/components; rejected by architecture rules.

## D-008 - Session and deterministic token lifecycle

**Decision**: The HTTP login returns a deterministic token and User DTO. Shared context owns token/user, registers a token provider with `apiClient`, clears both on sign-out, restores a stored demo token only after `/auth/me` succeeds, and preserves safe intended-route behavior.

**Rationale**: The rubric needs real login HTTP, shared state, bearer headers, reload/deep-link behavior, and valid tokens after a mock restart.

**Alternatives considered**: Decode role from token or URL; rejected as unsafe and explicitly disallowed. Keep account identity in the browser mock store; rejected because it would split the source of truth.

## D-009 - Testing and checker evidence

**Decision**: Use Vitest for mock workflows and frontend tests. If the exact official `contract-check.mjs` remains unavailable, create a clearly named equivalent verifier that executes documented paths and state transitions, while reporting official checker status as NOT RUN.

**Rationale**: The constitution permits only Vitest as an automated test framework, and the user explicitly prohibits presenting a homemade checker as official.

**Alternatives considered**: Node's built-in test runner; rejected because it conflicts with project testing governance. A simplified tool named `contract-check.mjs`; rejected because it could be mistaken for the official file.

## D-010 - Empty and file-response behavior

**Decision**: Empty mode recursively turns array-valued JSON properties into `[]`, including pagination items and nested lists, while retaining valid objects, authorization, lifecycle context, and zero-derived counts. CSV and PDF responses retain correct content types in normal mode; empty CSV contains headers and no records.

**Rationale**: The rubric explicitly tests nested empty lists and valid single resources. Applying the mode after domain computation avoids bypassing role or ownership rules.

**Alternatives considered**: Return `404` for missing collections; rejected by contract convention. Replace every response with `{}`; rejected because pages need stable object context.

## D-011 - Browser and validation evidence

**Decision**: Reuse existing browser-capable tooling when available, inspect all direct routes at 360/768/1280, and distinguish automated viewport evidence from unperformed manual zoom/screen-reader/W3C checks.

**Rationale**: Evidence must be truthful and reproducible; missing tools are a limitation, not a reason to fabricate screenshots or validation results.

**Alternatives considered**: Add a browser dependency without approval; rejected. Claim historical browser results prove the new HTTP integration; rejected because behavior and timing change.
