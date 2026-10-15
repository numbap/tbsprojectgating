# Accessibility Conformance Report

Based on VPAT® Version 2.5Rev (EU edition: WCAG and EN 301 549)

**Name of product and version:** Project Gating Navigator (Navigateur des points de contrôle de projet) 1.0.0  
**Report date:** 2026-10-15 (manual evaluation); automated results recompiled with each commit  
**Product description:** A bilingual (English/French) browser-based tool that helps Government of Canada employees navigate project governance under the Directive on the Management of Projects and Programmes and TBS gating guidance: scoping interview with an indicative complexity and risk estimate, approval authority and oversight determination, document review, a gate readiness questionnaire with guidance for each requirement, a requirements library, a gate guide, a governance decision tree, and a generated gate readiness report. Runs entirely in the browser with no server-side processing or authentication.  
**Contact information:** https://github.com/numbap/tbsprojectgating/issues/new?labels=accessibility&title=Accessibility%3A%20  
**Evaluator:** Claude (AI assistant, Anthropic). Self-assessment; no accessibility certification; not independent  
**Evaluation methods used:** WCAG 2.2 A/AA evaluation combining (1) axe-core automated rules on every page state in light and dark themes; (2) scripted Playwright checks for keyboard access, keyboard traps, focus visibility and contrast, focus obscuring, reflow at 320 CSS px, resize at 200%, text spacing, target size, non-text contrast, ARIA tabs, focus management and status messages; (3) code review of templates, styles and event handling; (4) visual inspection of light, dark and forced-colours rendering at several widths; and (5) review of the generated accessibility tree. Details are in the test methodology and test report.

## Build status

- Automated suite failed: 0 WCAG violation(s) and 3 failed scripted check(s). Affected criteria are downgraded below.
- Manual review is current: the code-review and visual judgements were made on the same user-interface code this report describes (fingerprint ecdea3043859abf4).

## Notes

- Scope: the complete web interface (all views and states listed in the scope document) and the accessibility documentation pages. Generated export files (Markdown, CSV, JSON, printed PDF) are not evaluated as non-web documents.
- Evaluator: this report is a self-assessment carried out by an AI assistant (Claude, Anthropic) using automated tools, scripted browser checks, code review and visual inspection. No testing with screen readers or other assistive technology, and no testing by people with disabilities, has been performed yet. Only Chromium was tested. Independent verification is recommended; see the expertise and independence statement.
- Conformance levels for criteria with automated checks are recompiled on every commit. If an automated check fails, the affected criterion is downgraded automatically.

## Applicable standards and guidelines

| Standard or guideline | Included in report |
|---|---|
| WCAG 2.0 | Level A (Yes), Level AA (Yes), Level AAA (No) |
| WCAG 2.1 | Level A (Yes), Level AA (Yes), Level AAA (No) |
| WCAG 2.2 | Level A (Yes), Level AA (Yes), Level AAA (No) |
| EN 301 549 v3.2.1 (CAN/ASC-EN 301 549:2024) | Yes |

## WCAG 2.x Report

Summary: 44 Supports, 1 Partially Supports, 11 Not Applicable.

### Table 1: Success Criteria, Level A

| Criteria | Conformance level | Remarks and explanations |
|---|---|---|
| 1.1.1 Non-text Content | Supports | The logo graphic is hidden from assistive technology and accompanied by the product name in text. Progress rings and score bars use role=img with a text alternative giving the percentage. Decorative glyphs (disclosure triangle, check marks, theme icon) are hidden with aria-hidden or empty CSS alternative text. The theme button has an accessible name. Evidence: 1 axe-core rule passed (role-img-alt); code review, accessibility tree inspection. |
| 1.2.1 Audio-only and Video-only (Prerecorded) | Not Applicable | The product contains no audio or video. Evidence: code review. |
| 1.2.2 Captions (Prerecorded) | Not Applicable | The product contains no audio or video. Evidence: code review. |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | Not Applicable | The product contains no video. Evidence: code review. |
| 1.3.1 Info and Relationships | Supports | Structure is conveyed with native semantics: landmarks, headings in order, lists, data tables with captions and th scope, fieldset/legend for each question, labelled radio groups for scoping questions, and labels for every field. Evidence: 9 axe-core rules passed (aria-hidden-body, aria-required-children, aria-required-parent, definition-list, dlitem, list, listitem, td-headers-attr, th-has-data-cells); code review, accessibility tree inspection. |
| 1.3.2 Meaningful Sequence | Supports | DOM order matches visual reading order. The only CSS reordering places the main navigation below the product name on narrow screens, which does not change meaning. Evidence: code review, visual inspection. |
| 1.3.3 Sensory Characteristics | Supports | Instructions refer to sections by name, not by shape, size or position. One location-based instruction found during evaluation (“right-hand panel”) was reworded. Evidence: code review. |
| 1.4.1 Use of Color | Supports | Status, risk, applicability and severity are always shown as text. Selected answers show a check mark and bold text in addition to colour. Links within text are underlined. Evidence: 1 axe-core rule passed (link-in-text-block); code review, visual inspection. |
| 1.4.2 Audio Control | Not Applicable | The product plays no audio. Evidence: code review. |
| 2.1.1 Keyboard | Supports | All functions use native, keyboard-operable controls. Scripted checks Tab through every page state and confirm every focusable control is reached, that button-styled file pickers are keyboard operable, that the requirement lens tabs work with arrow keys, and that questionnaire answers can be selected with the keyboard. Evidence: 1 axe-core rule passed (scrollable-region-focusable); scripted checks keyboard-reach, lookalike-controls, tabs-pattern, status-messages (107 runs, all passed); code review. |
| 2.1.2 No Keyboard Trap | Supports | Scripted traversal confirms focus moves through and out of every page state. Evidence: scripted checks no-keyboard-trap (70 runs, all passed). |
| 2.1.4 Character Key Shortcuts | Not Applicable | No single-character shortcuts are defined. Arrow, Home and End keys act only while a tab has focus, and Escape dismisses the confirmation message. Evidence: code review. |
| 2.2.1 Timing Adjustable | Supports | The only time limit is the auto-lock for encrypted Protected storage (a security safeguard). Users can adjust it before encountering it, from 15 minutes to 8 hours (more than ten times the default), or turn it off on the Data and security page. Locking loses no work: the assessment is saved before locking and restored on unlock. Confirmation messages stay visible until dismissed. Evidence: code review. |
| 2.2.2 Pause, Stop, Hide | Not Applicable | There is no moving, blinking, scrolling or auto-updating content. Evidence: code review. |
| 2.3.1 Three Flashes or Below Threshold | Supports | No content flashes. Transitions are disabled when the user prefers reduced motion. Evidence: code review. |
| 2.4.1 Bypass Blocks | Supports | A skip link is the first focusable element, and pages use banner, navigation, main and contentinfo landmarks. Evidence: 1 axe-core rule passed (bypass); code review. |
| 2.4.2 Page Titled | Supports | Each view sets a unique, descriptive document title on navigation (verified by the route-focus check). Documentation pages have unique titles. Evidence: 1 axe-core rule passed (document-title); scripted checks route-focus (1 runs, all passed). |
| 2.4.3 Focus Order | Supports | Focus order follows the DOM. After in-app navigation focus moves to the new page heading (or to the requested control); after an action re-renders a view, focus returns to the control that triggered it. Evidence: scripted checks route-focus (1 runs, all passed); code review. |
| 2.4.4 Link Purpose (In Context) | Supports | Link text is descriptive or made clear by its card or list item (e.g. requirement links show the requirement ID and title). Evidence: 1 axe-core rule passed (link-name); code review. |
| 2.5.1 Pointer Gestures | Not Applicable | No multipoint or path-based gestures are used. Evidence: code review. |
| 2.5.2 Pointer Cancellation | Supports | All actions use native click activation, which fires on release and can be cancelled by moving the pointer away. Evidence: code review. |
| 2.5.3 Label in Name | Supports | Accessible names contain the visible label text. Buttons with extra context (“Apply: Where does it run?”, “Dismiss message”) start with the visible label. Evidence: 1 axe-core rule passed (label-content-name-mismatch); code review, accessibility tree inspection. |
| 2.5.4 Motion Actuation | Not Applicable | No functions are triggered by device motion. Evidence: code review. |
| 3.1.1 Language of Page | Supports | Pages declare lang="en" or lang="fr"; the application updates the html lang attribute when the language is switched. Evidence: 2 axe-core rules passed (html-has-lang, html-lang-valid); scripted checks language-switch (1 runs, all passed). |
| 3.2.1 On Focus | Supports | Receiving focus never changes context. Evidence: code review. |
| 3.2.2 On Input | Supports | Changing a field updates related summaries, statuses and search results on the same page but never navigates, submits or moves focus. Evidence: code review. |
| 3.2.6 Consistent Help | Supports | Links to the accessibility statement and to the problem-reporting page appear in the same footer position on every application and documentation page. Evidence: code review. |
| 3.3.1 Error Identification | Supports | Form errors (passphrase rules, a wrong passphrase, a storage choice not allowed for the marking, import problems) appear in an error summary that receives focus and links to the field, with an inline message on the field, aria-invalid and aria-describedby. Other errors (analyzing empty text) are described in text and announced. Evidence: code review. |
| 3.3.2 Labels or Instructions | Supports | Every field has a visible label; scoping questions also explain why they are asked. Evidence: 1 axe-core rule passed (form-field-multiple-labels); code review. |
| 3.3.7 Redundant Entry | Supports | Information entered once (product name, organization, scope) is reused automatically in statements and reports; nothing has to be entered twice. Evidence: code review. |
| 4.1.1 Parsing (obsolete and removed in WCAG 2.2) | Supports | Removed in WCAG 2.2 and treated as always satisfied. For WCAG 2.0 and 2.1: markup is generated from templates with unique IDs, and the browser DOM is checked by axe-core for duplicate IDs referenced by ARIA. Evidence: code review. |
| 4.1.2 Name, Role, Value | Supports | Native controls are used throughout. Custom patterns expose correct roles and states: tabs (tablist/tab/tabpanel, aria-selected, roving tabindex), the theme toggle (aria-pressed), the current page (aria-current) and disclosure (details/summary). Evidence: 17 axe-core rules passed (aria-allowed-attr, aria-conditional-attr, aria-deprecated-role, aria-hidden-body, aria-hidden-focus, aria-prohibited-attr, aria-required-attr, aria-roles, aria-valid-attr, aria-valid-attr-value, button-name, duplicate-id-aria, label, link-name, nested-interactive, select-name, summary-name); scripted checks lookalike-controls, route-focus, tabs-pattern (37 runs, all passed); accessibility tree inspection. |

### Table 2: Success Criteria, Level AA

| Criteria | Conformance level | Remarks and explanations |
|---|---|---|
| 1.2.4 Captions (Live) | Not Applicable | The product contains no live audio. Evidence: code review. |
| 1.2.5 Audio Description (Prerecorded) | Not Applicable | The product contains no video. Evidence: code review. |
| 1.3.4 Orientation | Supports | No orientation lock; layouts were checked at portrait phone widths (320 px) and desktop widths. Evidence: code review. |
| 1.3.5 Identify Input Purpose | Supports | Passphrase fields declare autocomplete="new-password" or "current-password". Other fields describe the product being assessed (name, responsible organization, scope), not the user, so no WCAG input purpose applies to them. Evidence: 1 axe-core rule passed (autocomplete-valid); code review, accessibility tree inspection. |
| 1.4.3 Contrast (Minimum) | Supports | axe-core contrast checks pass in light and dark themes on every page state. Dark-theme accent colours were changed during evaluation to meet 4.5:1. Evidence: 1 axe-core rule passed (color-contrast); visual inspection. |
| 1.4.4 Resize Text | Supports | No loss of content or function at 200% zoom (640 CSS px viewport); text scales with browser zoom. Evidence: 1 axe-core rule passed (meta-viewport); scripted checks reflow-640 (35 runs, all passed); visual inspection. |
| 1.4.5 Images of Text | Supports | No images of text are used. Evidence: code review. |
| 1.4.10 Reflow | Supports | No two-dimensional scrolling at 320 CSS px on any page state. Data tables in the report scroll within their own container, which WCAG allows for content that needs two-dimensional layout. The header stops being sticky on narrow screens so it does not take space at high zoom. Evidence: scripted checks reflow-320 (35 runs, all passed); visual inspection. |
| 1.4.11 Non-text Contrast | Supports | Field and choice boundaries have at least 3:1 contrast in both themes, and focus indicators have at least 3:1 against their background (both verified by scripted checks). Field borders were darkened during evaluation. Evidence: scripted checks focus-visible, non-text-contrast (140 runs, all passed); visual inspection. |
| 1.4.12 Text Spacing | Partially Supports | With the WCAG text-spacing overrides applied at 1280 px and 320 px, no content is clipped and no horizontal scrolling appears. Automated regression detected in the current build: text-spacing on report (320px): Page scrolls horizontally by 11px; text-spacing on fr-report (320px): Page scrolls horizontally by 5px; text-spacing on fr-assess (320px): Page scrolls horizontally by 10px. Evidence: 1 axe-core rule passed (avoid-inline-spacing); scripted checks text-spacing (70 runs). |
| 1.4.13 Content on Hover or Focus | Supports | No custom hover or focus pop-ups. Some badges have a native title tooltip, which is controlled by the browser. Evidence: code review. |
| 2.4.5 Multiple Ways | Supports | Main navigation, a gate sidebar, previous/next links, a gate guide, a decision tree with a full map, and a searchable, filterable library of all requirements. Evidence: code review. |
| 2.4.6 Headings and Labels | Supports | Headings and labels describe their topic or purpose; repeated “Questions” headings include the requirement ID for assistive technology. Evidence: code review, accessibility tree inspection. |
| 2.4.7 Focus Visible | Supports | Every focus stop on every page state shows an outline (scripted check), including visually hidden radio and file inputs, whose indicator appears on their visible label, and the date input's calendar button. Evidence: scripted checks focus-visible (70 runs, all passed); visual inspection. |
| 2.4.11 Focus Not Obscured (Minimum) | Supports | Scroll padding keeps focused elements clear of the sticky header and of the confirmation message, which can also be dismissed with Escape. The scripted check confirms no focused element is hidden on any page state, including one with the message showing. Evidence: scripted checks focus-not-obscured (70 runs, all passed); code review. |
| 2.5.7 Dragging Movements | Not Applicable | No dragging is required. (Text area resize handles are provided by the browser.) Evidence: code review. |
| 2.5.8 Target Size (Minimum) | Supports | Every pointer target is at least 24 by 24 CSS px, except links inside sentences, which WCAG exempts (scripted check). The skip link and footer links were enlarged during evaluation. Evidence: 1 axe-core rule passed (target-size); scripted checks target-size (35 runs, all passed). |
| 3.1.2 Language of Parts | Supports | The interface is available in English and French. The document language (html lang) follows the selected language, and the language toggle, whose label is always in the other language, carries its own lang attribute. Exported reports declare their language. Project data typed by users (names, descriptions) is not language-tagged. Evidence: 1 axe-core rule passed (valid-lang); scripted checks language-switch (1 runs, all passed); code review. |
| 3.2.3 Consistent Navigation | Supports | The header navigation and footer are identical and in the same order on every view. Evidence: code review. |
| 3.2.4 Consistent Identification | Supports | Components with the same function use the same labels throughout (e.g. status and applicability badges, export buttons). Evidence: code review. |
| 3.3.3 Error Suggestion | Supports | Error messages say how to fix the problem (e.g. “Use at least 15 characters. Four or more unrelated words work well.”, “Paste some documentation text first”). Evidence: code review. |
| 3.3.4 Error Prevention (Legal, Financial, Data) | Supports | Actions that delete or replace the user's data (erase all data, start a new project, load the sample, import, replace a gate statement) ask for confirmation. Passphrases must be entered twice when created. Assessments can be exported and re-imported. Evidence: code review. |
| 3.3.8 Accessible Authentication (Minimum) | Supports | Unlocking an encrypted assessment requires a passphrase. Pasting is allowed and the fields declare autocomplete (new-password / current-password), so password managers can supply it; a “Show passphrase” option is provided. No other cognitive function test is used. Evidence: code review. |
| 4.1.3 Status Messages | Supports | Results of actions (answer status, scope changes, analysis results, search result counts, import, export, lock and unlock confirmations) are announced through a polite live region without moving focus (scripted check). Form error summaries use role=alert. Evidence: scripted checks language-switch, status-messages (2 runs, all passed); code review. |

### Table 3: Success Criteria, Level AAA

Not evaluated.

## EN 301 549 Report

### Chapter 4: Functional Performance Statements

| Criteria | Conformance level | Remarks and explanations |
|---|---|---|
| 4.2.1 Usage without vision | Supports | Supported through conformance to the WCAG criteria in chapter 9: all content and functions are exposed through native semantics, and the generated accessibility tree snapshots confirm names, roles and states. Not yet verified with screen reader users (see Notes). |
| 4.2.2 Usage with limited vision | Supports | Supports browser zoom to 400% without loss of content, meets contrast minimums in light and dark themes, follows the operating system's dark mode, and supports Windows forced-colours mode. |
| 4.2.3 Usage without perception of colour | Supports | Colour is never the only way information is conveyed (see 9.1.4.1). |
| 4.2.4 Usage without hearing | Not Applicable | The product does not use audio. |
| 4.2.5 Usage with limited hearing | Not Applicable | The product does not use audio. |
| 4.2.6 Usage with no or limited vocal capability | Not Applicable | The product does not require speech input. |
| 4.2.7 Usage with limited manipulation or strength | Supports | Fully keyboard operable, with no gestures, dragging or time limits, and targets of at least 24 by 24 CSS px. |
| 4.2.8 Usage with limited reach | Not Applicable | Software only; there are no physical controls. |
| 4.2.9 Minimize photosensitive seizure triggers | Supports | No flashing content; motion is removed when the user prefers reduced motion. |
| 4.2.10 Usage with limited cognition, language or learning | Partially Supports | Plain-language questions, a “why we ask” explanation for each scoping question, consistent navigation, no time limits, confirmation before data loss, and progress shown at each step. However, the subject matter (federal project governance) is technical, and the product uses specialized terms and acronyms (PCRA, OPMCA, GC EARB) that some users will find hard to understand; acronyms are expanded in scoping questions and requirement titles, but a glossary is not yet provided. |
| 4.2.11 Privacy | Supports | Accessibility features do not expose personal information. Assessment data stays in the user's browser. |

### Chapters 5 to 8

| Criteria | Conformance level | Remarks and explanations |
|---|---|---|
| 5.1 Closed functionality | Not Applicable | The product is a web application used with the user's own browser and assistive technology. |
| 5.2 Activation of accessibility features | Not Applicable | The product has no platform accessibility features to activate. It follows the user's dark mode, reduced motion and forced-colours settings automatically. |
| 5.3 Biometrics | Not Applicable | Not used. |
| 5.4 Preservation of accessibility information during conversion | Supports | Report exports keep structure: Markdown keeps headings, lists and tables, and CSV has a header row. Printing uses the browser's PDF output (see chapter 10). |
| 5.5–5.8 Operable parts, locking, key repeat, double-strike | Not Applicable | Hardware-related; not applicable to a web application. |
| 5.9 Simultaneous user actions | Supports | No function requires simultaneous actions. |
| 6 ICT with two-way voice communication | Not Applicable | Not provided. |
| 7 ICT with video capabilities | Not Applicable | Not provided. |
| 8 Hardware | Not Applicable | Software only. |

### Chapter 9: Web

| Criteria | Conformance level | Remarks and explanations |
|---|---|---|
| 9.1.1.1 Non-text Content | Supports | See WCAG 1.1.1. |
| 9.1.2.1 Audio-only and Video-only (Prerecorded) | Not Applicable | See WCAG 1.2.1. |
| 9.1.2.2 Captions (Prerecorded) | Not Applicable | See WCAG 1.2.2. |
| 9.1.2.3 Audio Description or Media Alternative (Prerecorded) | Not Applicable | See WCAG 1.2.3. |
| 9.1.3.1 Info and Relationships | Supports | See WCAG 1.3.1. |
| 9.1.3.2 Meaningful Sequence | Supports | See WCAG 1.3.2. |
| 9.1.3.3 Sensory Characteristics | Supports | See WCAG 1.3.3. |
| 9.1.4.1 Use of Color | Supports | See WCAG 1.4.1. |
| 9.1.4.2 Audio Control | Not Applicable | See WCAG 1.4.2. |
| 9.2.1.1 Keyboard | Supports | See WCAG 2.1.1. |
| 9.2.1.2 No Keyboard Trap | Supports | See WCAG 2.1.2. |
| 9.2.1.4 Character Key Shortcuts | Not Applicable | See WCAG 2.1.4. |
| 9.2.2.1 Timing Adjustable | Supports | See WCAG 2.2.1. |
| 9.2.2.2 Pause, Stop, Hide | Not Applicable | See WCAG 2.2.2. |
| 9.2.3.1 Three Flashes or Below Threshold | Supports | See WCAG 2.3.1. |
| 9.2.4.1 Bypass Blocks | Supports | See WCAG 2.4.1. |
| 9.2.4.2 Page Titled | Supports | See WCAG 2.4.2. |
| 9.2.4.3 Focus Order | Supports | See WCAG 2.4.3. |
| 9.2.4.4 Link Purpose (In Context) | Supports | See WCAG 2.4.4. |
| 9.2.5.1 Pointer Gestures | Not Applicable | See WCAG 2.5.1. |
| 9.2.5.2 Pointer Cancellation | Supports | See WCAG 2.5.2. |
| 9.2.5.3 Label in Name | Supports | See WCAG 2.5.3. |
| 9.2.5.4 Motion Actuation | Not Applicable | See WCAG 2.5.4. |
| 9.3.1.1 Language of Page | Supports | See WCAG 3.1.1. |
| 9.3.2.1 On Focus | Supports | See WCAG 3.2.1. |
| 9.3.2.2 On Input | Supports | See WCAG 3.2.2. |
| 9.3.3.1 Error Identification | Supports | See WCAG 3.3.1. |
| 9.3.3.2 Labels or Instructions | Supports | See WCAG 3.3.2. |
| 9.4.1.1 Parsing | Supports | See WCAG 4.1.1. |
| 9.4.1.2 Name, Role, Value | Supports | See WCAG 4.1.2. |
| 9.1.2.4 Captions (Live) | Not Applicable | See WCAG 1.2.4. |
| 9.1.2.5 Audio Description (Prerecorded) | Not Applicable | See WCAG 1.2.5. |
| 9.1.3.4 Orientation | Supports | See WCAG 1.3.4. |
| 9.1.3.5 Identify Input Purpose | Supports | See WCAG 1.3.5. |
| 9.1.4.3 Contrast (Minimum) | Supports | See WCAG 1.4.3. |
| 9.1.4.4 Resize Text | Supports | See WCAG 1.4.4. |
| 9.1.4.5 Images of Text | Supports | See WCAG 1.4.5. |
| 9.1.4.10 Reflow | Supports | See WCAG 1.4.10. |
| 9.1.4.11 Non-text Contrast | Supports | See WCAG 1.4.11. |
| 9.1.4.12 Text Spacing | Partially Supports | See WCAG 1.4.12. |
| 9.1.4.13 Content on Hover or Focus | Supports | See WCAG 1.4.13. |
| 9.2.4.5 Multiple Ways | Supports | See WCAG 2.4.5. |
| 9.2.4.6 Headings and Labels | Supports | See WCAG 2.4.6. |
| 9.2.4.7 Focus Visible | Supports | See WCAG 2.4.7. |
| 9.3.1.2 Language of Parts | Supports | See WCAG 3.1.2. |
| 9.3.2.3 Consistent Navigation | Supports | See WCAG 3.2.3. |
| 9.3.2.4 Consistent Identification | Supports | See WCAG 3.2.4. |
| 9.3.3.3 Error Suggestion | Supports | See WCAG 3.3.3. |
| 9.3.3.4 Error Prevention (Legal, Financial, Data) | Supports | See WCAG 3.3.4. |
| 9.4.1.3 Status Messages | Supports | See WCAG 4.1.3. |
| 9.6 WCAG conformance requirements | Partially Supports | One or more clauses are not fully supported. |

### Chapters 10 to 12

| Criteria | Conformance level | Remarks and explanations |
|---|---|---|
| 10 Non-web documents | Not Evaluated | Files the product produces (Markdown and CSV reports, JSON assessment exports, and PDFs produced with the browser's print function) have not been evaluated as non-web documents. Markdown and CSV are plain text with structure. Whether a printed PDF is tagged depends on the browser. |
| 11.1–11.7 Software (non-web) | Not Applicable | Web application, evaluated under chapter 9. |
| 11.8.1 Authoring tools: content technology | Supports | The product generates an HTML report; the generated report view is included in every automated test run. |
| 11.8.2 Authoring tools: accessible content creation | Supports | Users supply only plain text. The report structure (headings, captioned tables, lists) is produced by the product, and user text is escaped, so users cannot introduce inaccessible markup. |
| 11.8.3 Authoring tools: preservation of accessibility information in transformations | Supports | The Markdown export keeps the report's headings, lists and tables. |
| 11.8.4 Authoring tools: repair assistance | Not Applicable | Users cannot author markup, so there is nothing to repair. |
| 11.8.5 Authoring tools: templates | Not Applicable | No layout templates are offered. Draft implementation statements are plain text. |
| 12.1.1 Accessibility and compatibility features | Supports | The accessibility statement (accessibility/index.html) describes the accessibility features, supported settings and known limitations. |
| 12.1.2 Accessible documentation | Supports | Documentation is provided as HTML pages that are included in the automated test runs, plus Markdown. |
| 12.2.2–12.2.4 Support services | Not Applicable | No support service is offered. Accessibility problems can be reported through the project's issue tracker. |

## Legal disclaimer

This report describes the accessibility of the product version and code identified above, as evaluated by the methods described. It is a self-assessment, not a certification, and is provided “as is” without warranty. VPAT® is a registered service mark of the Information Technology Industry Council (ITI).
