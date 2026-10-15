# Accessibility strategy and conformance policy

| Item | Value |
|---|---|
| Product | Project Gating Navigator (web application, English and French) |
| Document owner | Product maintainers, `numbap/tbsprojectgating` repository |
| Applies from | Version 1.0.0 |
| Last revised | 2026-10-15 |

## 1. Conformance target

The product's web interface and its accessibility documentation pages target:

- **WCAG 2.2 Level A and AA** (W3C Recommendation). This also meets WCAG 2.1 and 2.0 A and AA, which WCAG 2.2 is backwards compatible with (4.1.1 Parsing is reported separately).
- **EN 301 549 v3.2.1**, the standard used in Canadian and European ICT procurement. Its Canadian adoption is CAN/ASC-EN 301 549:2024. Chapter 9 of EN 301 549 incorporates WCAG 2.1 A and AA for web content.

WCAG Level AAA is not targeted, though several AAA practices are followed (for example, reduced motion support). Government of Canada teams should confirm which policy instruments apply to their use of the product at the time of procurement.

## 2. Principles

1. **Native first.** Use native HTML elements (buttons, links, radio buttons, `details`/`summary`, tables) before ARIA. ARIA is used only for patterns HTML lacks (tabs, live regions, `aria-current`, `aria-pressed`).
2. **Shift left.** Accessibility is a definition-of-done criterion for every change, not a pre-release audit.
3. **Automate what is reliably automatable; review the rest.** Automated checks block regressions on every commit. Criteria that need human judgement are evaluated manually and re-reviewed whenever the user interface changes (section 4).
4. **Honest reporting.** The VPAT reports what the evidence supports. When automated evidence contradicts a manual judgement, the generator automatically downgrades that criterion. Limitations of the evaluation are disclosed (see `04-expertise-and-independence.md`).

## 3. Continuous compliance pipeline

Every push and pull request runs `.github/workflows/accessibility.yml`:

1. Unit tests (`npm test`).
2. The accessibility test suite (`tests/a11y/run.mjs`): axe-core across every page state in light and dark themes, plus scripted checks for keyboard access, focus visibility, focus obscuring, reflow, text spacing, target size, non-text contrast, the ARIA tabs pattern, focus management and status messages.
3. **VPAT recompilation** (`scripts/build-vpat.mjs`): the VPAT, accessibility statement and test report are regenerated from the evaluation data (`accessibility/evaluation/criteria.mjs`) and the new test results.
4. On pushes, regenerated documentation that differs from the committed copy is committed back to the branch automatically, so the VPAT in the repository always matches the code it describes.
5. The workflow **fails** if any automated check fails. The recompiled VPAT will then show the affected criteria as “Partially Supports” with the failure in the remarks. To block merging non-conformant changes, make this check required in branch protection.

The run's documentation and raw results are attached to every workflow run as an artifact named `accessibility-vpat`.

## 4. Manual review and drift detection

Some criteria cannot be decided by tools (for example 1.3.3, 2.4.6, 3.3.3). The manual evaluation is recorded in `accessibility/evaluation/manual-review.json`, together with a fingerprint (SHA-256 hash) of the user-interface source files it covered.

When any of those files changes, the generator marks the VPAT with **“Manual review pending”** and names the changed files. The automated results stay current, but the manual judgements must be confirmed by a reviewer, who then runs:

```sh
npm run a11y:attest -- --reviewer "Name, role/credential" --notes "What was reviewed"
```

This records the review against the new fingerprint. Required cadence: before each release, and at least every six months.

## 5. Roles

| Role | Responsibility |
|---|---|
| Contributors | Meet the definition of done; run `npm run a11y` locally for UI changes |
| Maintainers | Keep the CI gate required; triage accessibility issues as defects of the same severity as functional bugs |
| Accessibility reviewer | Perform and attest manual reviews; recommended to hold IAAP CPACC/WAS or equivalent (see `04-expertise-and-independence.md`) |

## 6. Definition of done for UI changes

- `npm run a11y` passes locally or in CI.
- New interactive patterns use native elements or a documented ARIA pattern, and have a scripted check if they are custom.
- New colours are added as tokens in both themes and pass contrast checks.
- Any new page state is added to `APP_STATES` in `tests/a11y/run.mjs`.
- A manual review is attested if the change affects criteria marked `code-review` or `visual` in the evaluation data.

## 7. Defect handling

Accessibility problems are reported through the repository's issue tracker (linked in the footer of every page). They are prioritized as follows:

| Severity | Example | Target |
|---|---|---|
| Blocker | A task cannot be completed with keyboard or screen reader | Fix before next release |
| Serious | WCAG A/AA failure with a workaround | Within 30 days |
| Moderate | Best-practice issue or AAA improvement | Planned in backlog |

Any known non-conformance is disclosed in the VPAT remarks until fixed.
