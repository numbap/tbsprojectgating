# Project Gating Navigator / Navigateur des points de contrôle de projet

A bilingual (English and French) browser app that helps Government of Canada employees navigate **project governance**: the Treasury Board of Canada Secretariat's gating model, the **Directive on the Management of Projects and Programmes**, the **Policy on the Planning and Management of Investments** and the related policy assessments a project meets on its way through the gates. It works out who approves the project and which gates and oversight apply, checks readiness for the next gate, and produces a gate readiness report with an action plan and a draft gate decision record.

Each requirement comes with five lenses: **where to look** for evidence, how to **right-size** it legitimately, what happens **if it's missing**, how to **recover**, and how to **describe it** in a gate submission.

> **Not an official Government of Canada tool.** Requirements are paraphrased from TBS instruments and guidance. Your departmental project management framework and the current instruments on canada.ca take precedence. See [Limitations](#limitations).

## Workflow

1. **Scope**: a short interview (project type, cost, OPMCA class, PCRA level, new funding, horizontality, procurement, delivery approach, personal information, automated decisions, security, emerging technology, public service, next gate). If no official PCRA exists yet, twelve **indicative complexity and risk questions** sampling the seven PCRA categories give an estimated level using the official score bands. A live **governance summary** shows:
   - **Approval authority** (Directive on the Management of Projects and Programmes, Appendix C): without an approved OPMCA class of 1 or higher, every project over the $2.5M base limit needs Treasury Board approval; with class 1 or higher, a project needs it when its PCRA level exceeds the class, whatever its cost. When Treasury Board approval is needed, the tool shows the two stages of Appendix D (expenditure authority for definition, then project approval and expenditure authority for implementation) and the cost estimate each needs. New funding flags a Treasury Board submission for funding.
   - **PCRA required**: above the Appendix C threshold for the class ($2.5M with no class or class 0; $5M, $10M, $25M, $50M for classes 1 to 4), submitted to TBS before definition.
   - **Digital oversight**: a concept case reviewed by the GC CIO and a GC Enterprise Architecture Review Board review at or above the department's threshold ($2.5M with no class or class 1, $5M class 2, $10M class 3, $25M class 4; National Defence $15M is noted), or for emerging technology, policy exceptions, Protected B or lower hosting outside public cloud, or extended support for unsupported technology.
   - **Baseline reporting** to the Office of the Comptroller General for projects of $25M or more.
   - **Gating model**: full (seven gates), streamlined (five) or light (three), recommended from complexity, authority and cost, and overridable.
   - **Independent review** expectation and the related assessments (PIA, AIA, SA&A, GBA Plus).
2. **Review documents**: paste a concept note, charter, business case draft or briefing note, in English or French. The review maps sentences to requirements, flags caveats (“TBD”, “planned”, “draft”, « à déterminer », « prévu »), and suggests scope answers (cost from dollar amounts, PCRA level, OPMCA class, personal information, agile delivery, new funding, and so on). It runs locally and nothing is uploaded.
3. **Gate readiness**: requirements grouped by the gates of the chosen model, each with plain-language yes / partly / no / don't know questions, the five lenses, evidence notes, interim measures, an action with owner and target date, and the statement for the gate submission (a draft can be generated). Items still open from earlier gates are listed at each gate.
4. **Report** (in the interface language): executive summary, project profile, governance and oversight profile, approvals and reviews roadmap, readiness by gate, right-sizing opportunities, a risk-ranked gap register and action plan, a **draft gate decision record** for the next gate (suggested decision and proposed conditions), open questions, items provided by the departmental framework, document review coverage and gate submission statements. Export as print/PDF, Markdown or CSV; the whole assessment as JSON (encrypted or not).

Also:

- **Requirements library**: all 66 requirements across 12 areas, searchable and filterable by area and gate.
- **Gate guide**: the three gating models and a page per gate (question, purpose, decision, gatekeepers, deliverables, review topics, pitfalls, requirements first due and revisited).
- **Governance path**: an interactive decision tree from the departmental framework and OPMCA through each gate to close-out, including approval authority, GC EARB, agile delivery, failed gates, tolerance breaches and rebaselining, and stopping a project.

## Sources

Content is paraphrased from the following, and should be checked against their current versions:

- Directive on the Management of Projects and Programmes, and Policy on the Planning and Management of Investments (Treasury Board)
- A Guide to Project Gating for IT-Enabled Projects (TBS, 2010); The Independent Reviewer's Handbook; Review Topics for Enquiry
- Guide to Using the Project Complexity and Risk Assessment Tool; Organizational Project Management Capacity Assessment guidance
- Directive on Service and Digital (GC EARB thresholds), Directive on Privacy Impact Assessment, Directive on Automated Decision-Making, Policy on Government Security / Directive on Security Management, Directive on the Management of Procurement, Directive on the Management of Real Property, Official Languages Act, Accessible Canada Act, GBA Plus guidance

**Verification status (October 2026).** The approval rules, thresholds and section references for the Directive on the Management of Projects and Programmes (including Appendices A to E), the Policy on the Planning and Management of Investments and the Directive on Service and Digital were checked against the text on tbs-sct.canada.ca, and the gates, gating models and estimate accuracy against the 2010 gating guide. Requirement sources cite the sections they paraphrase. The PCRA score bands (under 45, 45–63, 64–82, 83 and up) and the other instruments listed above were confirmed through secondary sources only, because www.canada.ca could not be reached from the build environment.

## Running

No runtime dependencies and no build step.

```sh
npm start        # serves on http://localhost:8080 (PORT to override)
npm test         # unit tests: data integrity, bilingual parity, governance rules, report, process tree, storage, VPAT generator
```

Any static host (for example GitHub Pages) also works. ES modules must be served over HTTP; opening `index.html` from `file://` will not load them.

## Bilingual

The interface, all requirement content, the gate guide, the decision tree, reports and the privacy and Protected B pages are available in English and French. The language follows the browser on first visit and can be switched at any time (the choice is remembered in the browser). Reports are produced in the interface language, so switch language to produce the other version. A unit test fails if the two languages do not define the same interface keys and placeholders, or if any bilingual content is missing a language.

**The French text was drafted with machine assistance and has not been reviewed by a certified translator.** Have it reviewed before official use. The VPAT, test report and accessibility evidence are English only; a French accessibility statement summarizes them.

## Privacy and Protected B

The application is open source (MIT, see `LICENSE`) and runs entirely in the browser. **Nothing you enter is sent to any server.** A Content Security Policy (`connect-src 'none'`) blocks network connections, and tests fail the build if the client code uses network or cookie APIs. No cookies are set.

Gate assessments often contain unannounced funding requests, cost estimates, procurement strategy and frank risk statements, so the default marking is **Protected B**. Do not paste Cabinet confidences.

| Mode | Where | Allowed for |
|---|---|---|
| Encrypted (default) | `localStorage`, AES-256-GCM, key derived from your passphrase (PBKDF2-SHA-256, 600,000 iterations); auto-lock after inactivity | Unclassified, Protected A, Protected B |
| Not saved | Memory of the open tab only | All |
| Unencrypted | `localStorage` as plain JSON | Unclassified only (enforced in code) |

Every screen, report, printed page and export carries the security marking. Encrypted exports use their own passphrase.

- Privacy policy: [`policies/privacy.html`](policies/privacy.html) / [`policies/privacy-fr.html`](policies/privacy-fr.html)
- Protected B handling, ITSG-33 mapping of the tool's own safeguards and **caveats**: [`policies/protected-b.html`](policies/protected-b.html) / [`policies/protected-b-fr.html`](policies/protected-b-fr.html)

For Protected B use, departments should host a reviewed, pinned copy on their own infrastructure, on a dedicated origin with server-set security headers, and approve its use through their security process.

```sh
npm run test:security   # browser checks: CSP blocks network, ciphertext-only storage, lock, framing, erase
```

## Accessibility (WCAG 2.2 AA) and the VPAT

The interface targets **WCAG 2.2 Level AA** and **EN 301 549 v3.2.1**. The accessibility statement (English and French), the VPAT and the evidence are published at [`accessibility/index.html`](accessibility/index.html).

The VPAT is compiled, not hand-written: `scripts/build-vpat.mjs` merges the evaluator's judgements (`accessibility/evaluation/criteria.mjs`) with the latest automated results, and any failed automated check downgrades the affected criteria. The suite covers every view in light and dark themes, at 320 and 640 px, with text-spacing overrides, French versions of the main views, and a language-switch check.

```sh
npm run a11y                       # build docs → run accessibility suite → recompile VPAT (strict)
npm run vpat                       # recompile the VPAT from existing results
npm run a11y:attest -- --reviewer "Name, credential" --notes "Scope"   # record a manual review
```

Locally, use the pre-installed Chromium if Playwright's download is unavailable: `CHROMIUM_PATH=/path/to/chromium npm run a11y`.

The current evaluation is a **self-assessment by an AI assistant**, not verified with screen readers or by an independent auditor.

## Publishing (GitHub Pages)

Pushes to the default branch that pass all checks are deployed to GitHub Pages by `.github/workflows/accessibility.yml` (site files only). One-time setup by a repository admin: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Structure

| Path | Purpose |
|---|---|
| `js/data/gates.js` | Seven gates, gating models (full, streamlined, light), review topics, gate decisions |
| `js/data/areas.js` | 12 requirement areas and applicability levels |
| `js/data/req-*.js` | Requirements with the five lenses, questions, keywords (EN and FR) and scope rules |
| `js/data/scoping.js` | Scoping interview, cost bands, indicative PCRA questions and score bands, profile warnings |
| `js/data/process.js` | Governance decision tree |
| `js/engine.js` | Governance profile (authority, GC EARB, model), applicability, status, scoring, gap risk, statements, document review, right-sizing, approvals roadmap (pure functions) |
| `js/report.js` | Report model rendered to HTML, Markdown and CSV in either language |
| `js/i18n.js`, `js/strings.js` | Language selection, bilingual content lookup, interface strings |
| `js/app.js` | UI: routing, views, events, focus management and live announcements |
| `js/sample.js` | Fictional sample project (also the accessibility test fixture) |
| `js/vault.js`, `js/storage.js` | Encryption (Web Crypto) and storage modes, with the Protected-information policy enforced in code |
| `policies/` | Privacy policy and Protected B handling (Markdown sources `*.md` / `*.fr.md`, generated HTML) |
| `tests/` | Unit tests, browser security checks, accessibility suite |
| `scripts/build-vpat.mjs` | Compiles the VPAT, statements, test report, evidence and policy pages |

### Adding or editing a requirement

Add an object to the relevant `js/data/req-*.js` file with `id` (area prefix and number), `gate` (G1 to G7, where evidence is first expected), optional `revisit` gates, `sev` (impact at the gate if missing), `base` (`required`, `recommended` or `departmental`), and bilingual `source`, `title`, `summary`, `look`, `rightsize`, `consequences`, `mitigations`, `describe`, `questions` and `keywords`. Lists must have the same length in both languages. `scope` rules (`{ when, status, reason }`, first match wins) can test profile fields or the derived values `tb`, `earb`, `highRisk`, `digital` and `pcraLevel`. Templates may use `{project}`, `{dept}`, `{sponsor}`, `{description}`, `{model}`, `{pcra}` and `{authority}`. The tests check all of this.

## Scoring

Met and departmental requirements count as 1, partial 0.5, planned 0.25, everything else 0; not-applicable requirements are excluded. **Readiness for a gate** counts every requirement due at or before it. Gap risk is the impact weighted by status, reduced for recommended (good-practice) items and increased for items overdue from earlier gates. The suggested gate decision reflects readiness only: whether the project still offers value is the gatekeepers' judgement, so the tool never suggests “stop”.

## Limitations

- Requirements are **paraphrased** and do not reproduce the instruments. Section references point to where to read the authoritative text.
- The complexity estimate is **indicative**; the official TBS PCRA tool is still required. The approval determination is a guide based on the inputs you give; confirm it with your PMO, CFO and the TBS program sector.
- Departments define their own gates and evidence; map this tool's gates to your framework.
- The document review is keyword-based. Treat its matches as leads, not proof.
- French content needs professional translation review before official use.
