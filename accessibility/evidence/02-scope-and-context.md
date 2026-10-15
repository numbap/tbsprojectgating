# Evaluation scope and context

## 1. Product context

The Project Gating Navigator is a bilingual (English and French) client-side web application. Federal employees (project managers, sponsors, project management office staff, gatekeepers and reviewers) use it to scope a project, determine its complexity, approval authority and oversight, check readiness for its next gate against the Directive on the Management of Projects and Programmes and TBS gating guidance, and generate a gate readiness report.

- **Users:** Government of Canada employees in project, program, finance, IT and oversight roles, in either official language. Users may rely on keyboards, screen readers, magnification, high contrast or dark modes, or voice control.
- **Technology:** HTML, CSS and JavaScript ES modules with no third-party runtime libraries. The application runs entirely in the browser and keeps its data in the browser's local storage, encrypted by default. There is no server-side processing or third-party content. A passphrase unlocks encrypted assessments.
- **Accessibility-supported technologies relied upon:** HTML, CSS, JavaScript and WAI-ARIA 1.2.

## 2. In scope

The whole web interface of the version under evaluation, in every view and in the states listed below. The automated suite runs every listed state. The full list with URLs is in the generated test report (`test-report.html`).

| Area | States evaluated |
|---|---|
| Start page | Default, with an assessment in progress |
| 1. Scope | Full profile interview with the governance summary panel and the indicative complexity estimator, in English and French |
| 2. Review documents | With analysis results and scope suggestions; with the confirmation message showing |
| 3. Gate readiness | Gate with a required requirement expanded (questions, lens tabs, fields), in English and French; gate with a departmental requirement expanded |
| Requirement page | Single requirement detail |
| Requirements library | Full list (search and filter interaction are covered by scripted checks) |
| Gate guide | Overview of gating models and gates; single gate page |
| Governance path | Decision tree at its first decision; an activity with the whole tree expanded |
| 4. Report | Full generated report, including tables, in English and French |
| Data protection | First-run storage setup (with and without a validation error), lock screen, Data and security page (unencrypted and encrypted modes), start page with the Protected B marking banner |
| Accessibility documentation | Statement, VPAT, test report and evidence pages |
| Policies | Privacy policy and Protected B handling, each in English and French; French accessibility statement |

Each state is evaluated in:

- light and dark themes at 1280 by 900 CSS px
- 320 CSS px wide (equivalent to 400% zoom on a 1280 px display)
- 640 CSS px wide (200% zoom)
- WCAG text-spacing overrides at 1280 px and 320 px.

Browser storage is seeded before each load: most states use an Unclassified assessment stored unencrypted, and the lock and unlocked Protected B states use an encrypted assessment that the harness unlocks with a fixture passphrase. A realistic, deterministic sample assessment is loaded so that every view renders with content: answered, partial, unknown and gap states, notes, document review results and a remediation plan (`fixtureState()` in `tests/a11y/run.mjs`).

## 3. Out of scope

- **Files the product generates** (Markdown, CSV and JSON downloads, and PDFs printed by the browser). These are reported under EN 301 549 chapter 10 as Not Evaluated.
- **Browser-provided user interface:** native file pickers, confirmation dialogs, date pickers and title tooltips.
- **Third-party sites linked from the product** (for example the GitHub issue tracker).
- **WCAG Level AAA.**

## 4. Evaluation environment

| Item | Value |
|---|---|
| Browser engine | Chromium, through Playwright (version recorded in `results/automated-results.json`) |
| Rule engine | axe-core (version recorded in results), tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22a`, `wcag22aa`, `best-practice` |
| Operating system | Linux container (local evaluation) and GitHub-hosted Ubuntu runners (continuous runs) |
| Emulated user settings | `prefers-color-scheme` light and dark, `prefers-reduced-motion: reduce`, `forced-colors: active` (visual inspection only) |

**Not used:** Firefox, Safari or WebKit, Windows or macOS platform accessibility APIs, and screen readers (JAWS, NVDA, VoiceOver, TalkBack) or other assistive technology. See the limitations in `03-test-methodology.md`.

## 5. Assumptions

- Users have a current evergreen browser with JavaScript enabled (the application cannot work without JavaScript).
- Conformance claims apply to the version and commit recorded in the VPAT and test results. Each commit is re-tested by the CI pipeline.
