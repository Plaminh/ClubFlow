# ClubFlow — Complete UI Reference Package

**Reference-only assets** for the ClubFlow project, based on the three original PA#2 static prototype screens and the additional UI reference drafts. These files are **not** the React production implementation.

## Main pages (5)

| File | Main UI | Source |
|---|---|---|
| `index.html` | Executive — Create Recruitment Campaign | Original PA#2 |
| `review.html` | Executive — Application Review / CV Screening | Original PA#2 |
| `scheduling.html` | Executive — Interview Scheduling | Original PA#2 |
| `applicant.html` | Public campaign & Applicant Portal | Additional reference |
| `interviewer.html` | Interviewer Workspace | Additional reference |

**Extra state preview**: `review-final-results-preview.html` — reference for the **Final Results tab inside Application Review**, not a sixth product page. It has **not been merged** into the original `review.html`, so both versions are preserved intact for React development.

## Supporting files

- `assets/css/styles.css`: original PA#2 shared styles.
- `assets/reference.css`, `assets/reference.js`: extra reference styles and mock interactions.
- `assets/documents/CF-026-fictional-sample-cv.pdf`: fictional sample CV linked from the original review page.
- `screenshots/`: **9 original + 18 new** screenshots for 360px, 768px, and 1280px plus demonstration states.
- `UI_REFERENCE_NOTES.md`: notes from the additional UI drafts, including sample states and limitations.

All HTML files and their directly referenced relative links/assets were checked when packaging. Individual reference pages preserve their own original styling; the styles are **not unified** across all pages yet.

## Import into ClubFlow

Extract this ZIP into `D:\nam3\clubflow\docs\reference\`.

The ZIP contains a top-level `ui/` folder, resulting in `docs/reference/ui/`.

Then open `docs/reference/ui/index.html` (and other HTML files) in a browser to review the static UI. For React, recreate the UI as components, rather than importing these HTML/JS reference files as runtime code.

## Reference limitations

- The original three HTML screens are static PA#2 prototypes; they are not fully functional workflows.
- Additional reference pages may use fictional mock state; authentication and RBAC are not real.
- Backend authorization, database persistence, CV file privacy, scheduling rules, and publication logic must be implemented separately.
- Business requirements should be taken from `docs/requirements/`, **not** inferred from these static examples.
- This merge does **not** change any of the original HTML/CSS/JS source files.
