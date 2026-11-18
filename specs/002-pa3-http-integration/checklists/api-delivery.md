# API Delivery Requirements Checklist: PA#3 HTTP Integration and Completion

**Purpose**: Validate that the written PA#3 requirements are complete, clear, consistent, measurable, and ready for contract/mock/frontend implementation review
**Created**: 2026-11-18
**Feature**: [spec.md](../spec.md)

**Audience/timing**: Author and peer reviewer before implementation and at each release/commit gate

## Requirement Completeness

- [x] CHK001 Are all C1-C11 capabilities explicitly required and mapped to the four user roles? [Completeness, Spec FR-001, Contracts Journey map]
- [x] CHK002 Are authentication, role, ownership, assignment, and private-field visibility requirements defined for every protected resource class? [Completeness, Spec FR-002, Data Model Visibility Matrix]
- [x] CHK003 Are the canonical accounts, login field names, and optional ownership-test account documented without claiming production authentication? [Completeness, Spec FR-003, Spec Assumptions]
- [x] CHK004 Does the specification require purpose, roles, inputs, constraints, success, errors, examples, and change history for every product endpoint? [Completeness, Spec FR-004]
- [x] CHK005 Are collection, single-resource, empty, no-content, JSON, multipart, CSV, and PDF response cases covered by the written requirements? [Completeness, Spec FR-005/006/009/010/018/019, Plan Phase 3]
- [x] CHK006 Are all four mock modes and their effects on login, domain errors, nested arrays, counts, and single-resource responses specified? [Completeness, Spec US4, FR-019, Research D-004/D-010]
- [x] CHK007 Are loading, error with Retry, empty, success, stale-request, and mutation-refresh states required for every API-backed screen? [Completeness, Spec FR-016/017]
- [x] CHK008 Are direct-route, reload, Browser Back, unknown-route, signed-out, and wrong-role behaviors all specified? [Completeness, Spec FR-021, US4]

## Requirement Clarity

- [x] CHK009 Is the common error structure defined with required human/machine fields and optional field/detail objects rather than vague “consistent errors” wording? [Clarity, Spec FR-006, Contracts Shared conventions]
- [x] CHK010 Are upload boundaries exact for PDF type, 5 MiB size, statement word count, required availability, and duplicate identity? [Clarity, Spec FR-009, Edge Cases]
- [x] CHK011 Are Vietnam-time closing semantics and the absence of a time-control endpoint unambiguous? [Clarity, Spec FR-007, Assumptions, Data Model Campaign lifecycle]
- [x] CHK012 Are permitted published edits, linked-position protection, first-application locks, and confirmation locks distinguished clearly? [Clarity, Spec FR-008, Research D-005]
- [x] CHK013 Are Generate Draft, Edit/Resolve, Save Changes, export, and Confirm specified as observably distinct actions? [Clarity, Spec FR-012, Research D-006]
- [x] CHK014 Are strict overlap and adjacency semantics, eligible resources, availability, and campaign-window constraints stated for schedule rows? [Clarity, Spec FR-011, Data Model Schedule and Interview]
- [x] CHK015 Are result recording, publication visibility, notification uniqueness, and repeat-publication behavior separated clearly? [Clarity, Spec FR-015, Data Model Final Result and Notification]

## Requirement Consistency

- [x] CHK016 Does the PA#3 Q-03 direction consistently supersede the older full-publication-lock prototype across specification, plan, research, and lifecycle model? [Consistency, Spec Assumptions, Plan Phase 2B/2C, Research D-005]
- [x] CHK017 Do service boundary shapes and pagination/schedule/error conventions align with existing UI consumers without dictating a UI rewrite? [Consistency, Contracts Consumer compatibility rules, Plan Phase 4]
- [x] CHK018 Are the separate PA#3 mock and preserved PA#4 Express/PostgreSQL architecture described without presenting the mock as production backend work? [Consistency, Spec Out of Scope, Plan Constitution Check/Structure]
- [x] CHK019 Are Vitest-only automated testing rules consistent with the mock verification strategy and the unavailable official checker policy? [Consistency, Plan Testing, Research D-009]
- [x] CHK020 Are relative `/api`, shared `apiClient`, and the prohibition on browser fixture runtime data consistent across requirements and plan? [Consistency, Spec FR-018, Research D-007, Contracts Consumer rules]

## Acceptance Criteria Quality

- [x] CHK021 Can the complete main flow be objectively measured as exactly 11 required steps with visible state continuity? [Measurability, Spec SC-001]
- [x] CHK022 Can contract/mock alignment be measured by documented status/shape matches and zero undocumented frontend product requests? [Measurability, Spec SC-002]
- [x] CHK023 Are mode outcomes measurable for every main data screen, including zero derived counts in empty mode? [Measurability, Spec SC-003]
- [x] CHK024 Are automated quality outcomes stated as zero-failure gates rather than subjective “works correctly” claims? [Measurability, Spec SC-004]
- [x] CHK025 Are responsive and semantic outcomes quantified at 360/768/1280 pixels, one `h1`, no horizontal page scroll, and 44-pixel targets? [Measurability, Spec SC-005]
- [x] CHK026 Is deterministic restart behavior measurable for accounts, tokens, initial records, and discarded mutations? [Measurability, Spec SC-008]

## Scenario and Edge-Case Coverage

- [x] CHK027 Are primary Executive, Applicant, Interviewer, and reviewer journeys independently testable from their acceptance scenarios? [Coverage, Spec US1-US4]
- [x] CHK028 Are validation, authorization, conflict, not-found, server failure, no-content, stale request, and closed-during-submit exception classes represented? [Coverage, Spec Edge Cases, FR-006/009/013/017]
- [x] CHK029 Are multi-position ownership, duplicate submission, exact upload/word boundaries, scheduling overlaps, duplicate assessment, and repeat publication addressed? [Coverage, Spec Edge Cases]
- [x] CHK030 Are recovery requirements defined for retry after error mode, fresh restart between mutating checks, and preservation of correctable form values? [Recovery, Spec US2/US4, Quickstart Mode matrix]
- [x] CHK031 Are unsupported or early workflow routes required to show meaningful context rather than blank screens? [Coverage, Spec US4, FR-021]

## Dependencies, Evidence, and Scope

- [x] CHK032 Are the existing UI baseline, deterministic primary campaign, fixed mock scheduling, and human-supplied team identity recorded as assumptions? [Assumption, Spec Assumptions]
- [x] CHK033 Are production Express domain APIs, PostgreSQL, JWT, Cloudinary, optimization, email, remote operations, and external submission explicitly excluded? [Scope, Spec Out of Scope]
- [x] CHK034 Is the official-checker limitation documented so equivalent checks cannot be misreported as official PASS? [Evidence, Spec Assumptions, Research D-009, Quickstart]
- [x] CHK035 Are PASS, FAIL, and NOT RUN distinctions and missing human inputs required in final documentation? [Evidence, Spec FR-024, SC-009]
- [x] CHK036 Does the plan require explicit commit boundaries that preserve contract-first and mock-first history without staging unrelated work? [Dependency, Plan Commit Boundaries]

## Notes

- All 36 requirement-quality checks pass before task generation.
- This checklist validates the written requirements. Implementation verification remains in `tasks.md`, automated tests, the quickstart, and final QA evidence.
