# Evaluator expertise and independence

A VPAT is only as credible as the people and process behind it. This section discloses both plainly.

## 1. Who performed the evaluation

The initial evaluation (version 1.1.0, 2026-10-15) was carried out by **Claude, an AI coding assistant made by Anthropic**, working in the project repository at the request of the product owner. In the same session Claude:

- designed and wrote the automated accessibility test suite
- ran a baseline audit, fixed the issues found, and re-ran the suite (see `05-remediation-log.md`)
- performed the code review, visual inspection and accessibility tree review described in `03-test-methodology.md`
- wrote the evaluation data, this evidence pack and the VPAT generator.

## 2. Relevant expertise

- The evaluation applies the published WCAG 2.2 success criteria and their Understanding documents, the WAI-ARIA Authoring Practices patterns (tabs, live regions), and EN 301 549 v3.2.1.
- The evaluator holds **no professional accessibility certification**: not IAAP CPACC, WAS or CPWA, Trusted Tester, or equivalent. An AI system cannot hold these credentials.
- The evaluator **cannot operate assistive technology** or bring the lived experience of a person with a disability. Findings about the experience of screen reader, magnification, voice-control or switch users are inferred from conformance and from the accessibility tree, not observed.

## 3. Independence

The evaluation is **not independent**. The same agent built the features, wrote the tests and judged conformance. This is a self-assessment and should be treated with the same caution as any vendor's first-party VPAT.

Safeguards that reduce this risk:

- **Machine-checkable claims are verified by tools** (axe-core and scripted checks) on every commit, and the VPAT is generated from those results rather than written by hand. A failing check automatically downgrades the claim.
- **The baseline audit is kept** (`baseline-results.json`) so a reviewer can see that the tests found real defects before fixes and were not written to pass.
- **Manual judgements are tied to a code fingerprint.** The VPAT flags them as pending re-review when the user interface changes.
- **Limitations are stated explicitly** in the VPAT notes and in `03-test-methodology.md`.

## 4. Recommended independent verification

Before relying on this VPAT for a procurement or compliance decision, a qualified, independent reviewer should:

1. Test the key tasks (scope, gate readiness questionnaire, report, language switch) in both languages with at least NVDA + Firefox, JAWS + Chrome, VoiceOver + Safari (macOS and iOS), and Windows high contrast mode.
2. Spot-check this report's judgement criteria (1.3.1, 1.3.3, 2.4.6, 3.3.x).
3. Include users with disabilities in usability testing.
4. Record the review with `npm run a11y:attest -- --reviewer "Name, credential, organization" --notes "Scope of review"`. The reviewer's name then appears in the VPAT.

## 5. Review record

| Date | Reviewer | Type | Scope |
|---|---|---|---|
| 2026-10-15 | Claude (Anthropic AI assistant) | Self-assessment: automated, scripted and code review | Version 1.0.0, all page states in `02-scope-and-context.md` |

The current attested review is recorded in `accessibility/evaluation/manual-review.json` and shown in the VPAT header.
