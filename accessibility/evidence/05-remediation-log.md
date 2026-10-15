# Baseline audit and remediation log

The Project Gating Navigator is built on the user-interface framework, test suite and documentation pipeline of the [ITSG-33 Compliance Navigator](https://github.com/numbap/Itsg33), a sister tool by the same maintainers. Sections 1 to 5 record the audit and remediation of that framework (its baseline results are kept in `baseline-results.json`, in an earlier schema of the results format); those fixes carry over to this product. Section 6 records what the suite found when it was first run against this product.

The framework's suite was first run before any accessibility work on 2026-10-15. Out of 131 scripted checks, 90 passed; axe-core reported 8 WCAG violations and 4 best-practice issues across 16 runs.

The tables below record each finding, its cause, the fix and how it was verified. Every fix was verified by re-running the full suite. The final run passed with no WCAG violations and every scripted check passing.

## 1. Findings from automated and scripted checks

| # | WCAG | Finding (baseline) | Cause | Fix |
|---|---|---|---|---|
| 1 | 1.4.3 | Insufficient contrast in dark theme: active navigation item, primary buttons, active sidebar link, selected choices | Dark-theme accent `#e0505c` was used both as text on dark surfaces and as a button fill behind white text | Split the colour into `--accent` (text and lines; `#ff8a94` in dark) and `--accent-strong` (fills behind white text, `#b8202f`) |
| 2 | 1.4.11 | Field, select and choice boundaries at about 1.4:1 in both themes | Controls used the decorative `--border` colour | Added a `--control-border` token at 3:1 or more in both themes for fields, selects, segmented answers and choices |
| 3 | 2.1.1 | “Import assessment” and “Load text file” could not be reached by keyboard | File inputs were hidden with the `hidden` attribute (display: none) inside button-styled labels | File inputs are visually hidden (`.sr-only`) but focusable; the label shows the focus ring with `:focus-within` |
| 4 | 2.4.7 | No visible focus on the fourth Tab stop of the date field | Chromium's calendar button inside the date input matches `:focus-within`, not `:focus` | Added an `input[type="date"]:focus-within` outline; text fields always show focus |
| 5 | 2.5.8 | Skip link 23 px tall; “Show controls removed or shared” 22 px; control links in review findings 23 px; footer link 15 px | Small padding | Increased padding to at least 24 px targets |
| 6 | 1.4.10, 1.4.12 | Horizontal scrolling at 320 px: header (31 px), questionnaire pages (220 px; 327 px with text spacing) | Header navigation would not wrap; a grid column with an `auto` minimum; inline applicability selector; tab strip | Navigation and brand wrap; grid columns use `minmax(0, 1fr)`; applicability label and tabs wrap; header is no longer sticky on narrow screens |
| 7 | 2.4.3, 4.1.2 | After in-app navigation focus stayed on the old link; no `aria-current` | Single-page app re-rendered without focus management | Focus moves to the new page's h1 (or the requested control); `aria-current="page"` set; re-renders after actions return focus to the triggering control |
| 8 | 2.1.1, 4.1.2 | Gemba tabs did not follow the ARIA tabs pattern | No `aria-controls`/`aria-labelledby`, no arrow-key support, every tab was a tab stop | Implemented the pattern: roving tabindex, ArrowLeft/Right/Home/End, `aria-controls`, labelled tab panels |
| 9 | 4.1.3 | Answering a question did not announce the new status | No live region for status changes | Added a polite live region; status, scope, analysis, search-count and confirmation messages are announced |
| 10 | Best practice | Heading levels skipped (h1 to h4 in the questionnaire, h1 to h3 in the library) | Heading levels chosen for size | Corrected levels; size is controlled by CSS classes |

## 2. Findings from manual review

| # | WCAG | Finding | Fix |
|---|---|---|---|
| 11 | 1.3.3 | The scope page referred to “the right-hand panel”, which sits below the form on narrow screens | Refers to the panel by its name |
| 12 | 2.2.1 | The confirmation message hid itself after 2.4 s; some confirmations appear nowhere else | The message stays until dismissed (button or Escape) and closes on navigation |
| 13 | 3.2.6 | No consistent help mechanism | Footer on every page links to the accessibility statement and a problem-reporting page |
| 14 | 1.4.1 | Selected answers were distinguished mainly by colour and weight | Added a check mark to selected options |
| 15 | Forced colours | Selection and focus were indistinguishable in Windows high contrast | Selection uses system Highlight colours; focus keeps the outline |
| 16 | 1.3.1 | Report tables lacked captions and `th` scope | Added captions and scope attributes |
| 17 | 4.1.3 / 2.4.3 | Library search re-rendered the whole page on each keystroke, so the result count was never announced and focus had to be restored by script | Only the results region updates; the result count is announced |

## 3. Findings from extending the test scope

Adding a page state with the confirmation message visible, adding an axe-core run at 320 px, and testing the generated documentation pages found more issues, all fixed:

| # | Rule / WCAG | Finding | Fix |
|---|---|---|---|
| 18 | region (best practice) | Message content outside any landmark | The message is an `aside` labelled “Notification” |
| 19 | 2.4.7 / 1.4.11 | Dismiss button focus outline at 2.5:1 (light) and 1.85:1 (dark) against the message background | Outline uses the inverse colour inside the message |
| 20 | 2.1.1 | (Added an axe run at 320 px.) Code blocks in the documentation pages scrolled horizontally but could not be scrolled by keyboard | Code blocks wrap; report and documentation tables are in labelled, focusable scroll regions |
| 21 | Best practice | (Documentation pages) A metadata table had empty header cells | Headers added |
| 22 | 2.5.8 | (Documentation pages) Stand-alone list links in the test report were 20 px tall | Stand-alone list links get a 24 px target |

## 4. Corrections to the test harness

Two baseline failures were caused by the harness rather than the product. The corrections are recorded here for transparency:

- **Links inside a collapsed `<details>` were counted as unreachable.** Chromium still reports layout boxes for them. The visibility test now excludes content of closed `details` elements (except the summary).
- **On deep-linked pages, keyboard traversal started mid-page.** The browser's sequential-focus starting point followed the scrolled-to control. Traversal now starts from a temporary element at the top of the document, as a user arriving on the page would.

After the tabs pattern was implemented, the reachability check was also changed to skip elements with `tabindex="-1"`. Inactive tabs are intentionally outside the Tab sequence, and their arrow-key access is verified separately by the tabs-pattern check.

## 5. Data protection screens (framework version 1.2.0)

Framework version 1.2.0 added a storage setup screen, a lock screen, a Data and security page and the security marking banner. Adding these as page states found the following, all fixed before release:

| # | WCAG | Finding | Fix |
|---|---|---|---|
| 23 | 2.5.8, 1.4.11 | Password and file inputs were not styled like other fields: 21 px tall with low-contrast default borders | Password and file inputs use the standard field style (3:1 border, 24 px or more); the non-text contrast check now covers them |
| 24 | 2.5.8 | “Show passphrase” checkboxes were 18 by 18 px | Enlarged to 24 by 24 px |
| 25 | 1.4.10, 1.4.12 | The file input overflowed by 24 px at 320 px with text spacing | Field style constrains its width |
| 26 | 4.1.2 (visual) | The Lock button showed on the setup and lock screens because a component display rule overrode the `hidden` attribute | A global `[hidden]` rule; the security tests check button visibility in every state |

The harness was also adjusted: it injects axe-core with the Content Security Policy bypassed in test contexts only (the CSP is verified separately by `tests/security/run.mjs`), and every page load starts from `about:blank` so that hash URLs reload fully.

## 6. Project Gating Navigator 1.0.0: first run

The suite was extended with this product's views (gate readiness, requirement pages, gate guide, governance path), French versions of the scope, gate readiness and report views, French policy pages and the French accessibility statement, and a new scripted check for the language switch. The first run, on 2026-10-15, covered 105 axe-core runs and 564 scripted checks. It found 4 WCAG violations, 6 best-practice issues and 5 failed checks, all fixed before release:

| # | Rule / WCAG | Finding | Cause | Fix |
|---|---|---|---|---|
| 27 | 2.5.8 | “See the full governance profile in the report” link was 17 px tall (scope summary) | Inline link in small text | The link gets 4 px vertical padding (24 px or more) |
| 28 | 2.5.8 | “N items still open from earlier gates” disclosure summary was 23 px tall, in English and French | Summary inherited compact callout padding | Summary padding raised to give a 24 px or larger target |
| 29 | 1.4.10, 1.4.12 | Library filter selects overflowed by 28 px at 320 px (109 px with text spacing) | Selects kept their intrinsic width of the longest option | Selects can shrink to the container (`max-width: 100%; min-width: 0`) |
| 30 | 2.1.1 (axe scrollable-region-focusable) | At 320 px the lists inside the governance profile table became scrollable regions that could not be reached by keyboard | A shared list style limits height and scrolls | Lists inside the report and the governance summary are not height-limited |
| 31 | heading-order (best practice) | The complexity estimator's category headings jumped from h1 to h3 | Heading level chosen for size | Category headings are h2, styled small |
| 32 | 1.4.12 | In CI only (wider runner fonts), the report's summary tiles and the French gate readiness page scrolled horizontally by 5 to 11 px at 320 px with text-spacing overrides | Fixed-width grid tracks and pills that could not wrap | Tiles stack in one column below 480 px; tiles, pills and requirement titles may wrap |
