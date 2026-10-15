# Test methodology

This document explains how each conformance judgement in the VPAT was reached, so that a third party can reproduce or challenge it.

## 1. Overview

| Method | Code in evaluation data | What it provides |
|---|---|---|
| Automated rules | `automated` | axe-core run on every page state, in light and dark themes |
| Scripted checks | `scripted` | Playwright scripts that test criteria rule engines cannot (keyboard, focus, reflow, spacing, target size, ARIA patterns, live regions) |
| Code review | `code-review` | Inspection of HTML templates (`index.html`, `js/app.js`, `js/report.js`), CSS (`css/styles.css`) and event handling |
| Visual inspection | `visual` | Review of rendered screenshots: light and dark themes, 320 px and 1280 px widths, forced-colours mode, focus states |
| Accessibility tree | `aria-tree` | Review of the accessibility tree Chromium exposes for each state (`results/aria/*.yml`) |

Each criterion in `accessibility/evaluation/criteria.mjs` lists the methods its judgement relies on. The VPAT's remarks also cite the automated rules and scripted checks mapped to that criterion in the current run.

## 2. Automated rules (axe-core)

- Runs with tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22a`, `wcag22aa` and `best-practice`.
- Rules are mapped to success criteria through axe's `wcagNNN` tags.
- A violation of any WCAG-tagged rule fails the build and downgrades the mapped criterion in the VPAT.
- Best-practice violations are reported as advisory and do not affect conformance.
- “Incomplete” results (where axe needs human review) are listed in the test report for the reviewer.

## 3. Scripted checks

Implemented in `tests/a11y/checks.mjs`:

| Check | WCAG | Procedure | Pass condition |
|---|---|---|---|
| keyboard-reach | 2.1.1 | Start at the top of the document and press Tab until focus leaves the page; compare the stops with every visible, enabled focusable element | Every element is reached. For radio groups one member suffices; roving-tabindex tabs are covered by tabs-pattern. |
| no-keyboard-trap | 2.1.2 | Same traversal | Focus leaves the page within 900 presses |
| focus-visible | 2.4.7, 1.4.11 | At each stop, read the computed outline or box-shadow of the element, or of its visible label for visually hidden inputs | An indicator is present, and an outline has at least 3:1 contrast with the adjacent background |
| focus-not-obscured | 2.4.11 | At each stop, hit-test the centre and two corners of the focused element | At least one point hits the element itself |
| lookalike-controls | 2.1.1, 4.1.2 | Find elements styled as buttons, tabs or choices | Each is focusable or contains a focusable control |
| target-size | 2.5.8 | Measure every focusable target (the visible label for hidden inputs) | At least 24 by 24 CSS px, except inline links in sentences |
| non-text-contrast | 1.4.11 | Compare the border colour of fields, selects and choice controls with the surrounding background | At least 3:1 (or the fill contrasts at least 3:1) |
| reflow-320 | 1.4.10 | Load at a 320 CSS px wide viewport | Document does not scroll horizontally (content inside scroll containers for data tables is exempt) |
| reflow-640 | 1.4.4 | Load at 640 CSS px (200% zoom) | Same as above |
| text-spacing | 1.4.12 | Inject the WCAG text-spacing overrides at 1280 and 320 px | No clipped text in overflow-restricted elements; no horizontal scrolling |
| route-focus | 2.4.3, 2.4.2, 4.1.2 | Use the main navigation with the keyboard | Focus moves to the new page's h1; title is unique; link has `aria-current="page"` |
| tabs-pattern | 2.1.1, 4.1.2 | Arrow and End keys on the requirement lens tabs | Focus and selection move; `aria-selected`, `aria-controls` and `aria-labelledby` are set; single tab stop |
| language-switch | 3.1.1, 3.1.2, 4.1.3 | Press Enter on the language toggle, then again | `html lang` becomes `fr` then `en`; focus stays on the toggle; the toggle is marked with the language it offers; the change is announced; content is translated |
| status-messages | 4.1.3, 2.1.1 | Select an answer with Space, run Analyze with Enter, type in the library search | Each action produces live-region text; search keeps focus |

## 4. Manual procedures

**Code review.** For each criterion marked `code-review`, the evaluator inspected the relevant templates and handlers: semantics of each component, error messages, confirmation before destructive actions, change-of-context behaviour, language, and timing.

**Visual inspection.** Screenshots were reviewed for: legibility and contrast in both themes; layout at 320 px; visible focus indicators; selected-state cues that do not depend on colour (check marks); and forced-colours rendering (selection uses system Highlight colours, focus uses an outline).

**Accessibility tree.** The YAML snapshots in `results/aria/` show each state's roles, names and states as exposed to assistive technology. They were reviewed for meaningful names (for example, “Apply: Where does it run?” instead of repeated “Apply”) and correct roles (tablist, tab, tabpanel, radio, status).

## 5. Reproducing the results

```sh
npm ci
npx playwright install chromium   # unless a Chromium is already available
npm run a11y                      # build docs, run the suite, rebuild the VPAT in strict mode
```

The results are written to `accessibility/results/automated-results.json`. Given the same code, tool versions and environment, runs are deterministic: the fixture data and viewports are fixed and no timestamps are recorded.

**Reference environment.** The GitHub-hosted Ubuntu runner used by the CI workflow is the reference environment, and its results are the ones committed. Font availability differs between machines and can change layout slightly, which in turn changes which axe-core rules apply (for example, whether a region is wide enough to scroll). A local run can therefore list a slightly different set of passing rules. Failures are not environment-dependent in this way: any failure in any environment fails the build.

## 6. Limitations

The following were **not** performed. A third party should weigh them when relying on this report:

1. **No testing with assistive technology.** No testing was done with JAWS, NVDA, VoiceOver, TalkBack, Dragon or switch access, or by people with disabilities. The accessibility tree snapshots show what is exposed to assistive technology, but not how a particular screen reader announces it.
2. **Single browser engine.** Testing used Chromium only. Firefox and Safari were not tested.
3. **Rendering-dependent checks are heuristic.** The focus-obscured and clipping checks sample points and overflow properties; they can miss partial overlaps.
4. **Emulated zoom.** Reflow and resize were tested with narrow viewports rather than real browser zoom or text-only zoom.
5. **Judgement criteria.** Criteria such as 2.4.6 and 3.3.3 depend on human judgement. They are re-reviewed when the user interface changes (see the strategy, section 4), but are not re-verified automatically on each commit.

An independent audit that includes assistive technology testing is recommended before relying on this VPAT for procurement decisions.
