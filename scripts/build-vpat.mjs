// Compiles the accessibility conformance report (VPAT) and its supporting pages
// from the evaluation data and the latest automated test results.
//
//   node scripts/build-vpat.mjs           build; warn about problems
//   node scripts/build-vpat.mjs --strict  build; exit 1 if results are missing or failing
//
// Output (accessibility/): index.html (statement), vpat.html, VPAT.md,
// test-report.html and one page per evidence document. Output is deterministic
// for a given input so CI only commits it when something actually changed.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { WCAG, EN_FPS, EN_OTHER, LEVELS, METHOD_LABELS } from "../accessibility/evaluation/criteria.mjs";
import { UI_FILES, uiFingerprint } from "./ui-fingerprint.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
// VPAT_OUT and A11Y_RESULTS let tests compile into a scratch directory from fixture results.
const OUT = process.env.VPAT_OUT ?? join(ROOT, "accessibility");
const EVIDENCE_DIR = join(ROOT, "accessibility/evidence");
const strict = process.argv.includes("--strict");
const REPO = "https://github.com/numbap/tbsprojectgating";
const ISSUES = `${REPO}/issues/new?labels=accessibility&title=Accessibility%3A%20`;

const EVIDENCE = [
  { file: "01-strategy.md", page: "strategy.html", title: "Accessibility strategy and conformance policy" },
  { file: "02-scope-and-context.md", page: "scope.html", title: "Evaluation scope and context" },
  { file: "03-test-methodology.md", page: "methodology.html", title: "Test methodology" },
  { file: "04-expertise-and-independence.md", page: "expertise.html", title: "Evaluator expertise and independence" },
  { file: "05-remediation-log.md", page: "remediation-log.html", title: "Baseline audit and remediation log" },
];

// ------------------------------------------------------------------ inputs

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const readJSON = async (p) => { try { return JSON.parse(await readFile(p.startsWith("/") ? p : join(ROOT, p), "utf8")); } catch { return null; } };

const pkg = await readJSON("package.json");
const results = await readJSON(process.env.A11Y_RESULTS ?? "accessibility/results/automated-results.json");
const review = await readJSON("accessibility/evaluation/manual-review.json");
const fingerprint = await uiFingerprint();
const changedFiles = review ? Object.keys(fingerprint.files).filter((f) => review.fingerprint?.files?.[f] !== fingerprint.files[f]) : UI_FILES;
const reviewCurrent = !!review && changedFiles.length === 0;

// ------------------------------------------------------------------ evidence per criterion

function automatedEvidence(sc) {
  if (!results) return { available: false, rules: [], checks: [], failures: [] };
  const rules = Object.entries(results.axeRules).filter(([, r]) => r.sc.includes(sc)).map(([id]) => id);
  const passedRules = rules.filter((id) => results.axe.some((run) => run.passes.includes(id)));
  const failures = [];
  for (const run of results.axe) {
    for (const v of run.violations.filter((x) => x.sc.includes(sc))) failures.push(`axe ${v.id} on ${run.state} (${run.theme}): ${v.help}`);
  }
  const checks = results.checks.filter((c) => c.sc.includes(sc) && !c.advisory);
  const checkIds = [...new Set(checks.map((c) => c.id))];
  for (const c of checks.filter((x) => !x.pass)) failures.push(`${c.id} on ${c.state} (${c.variant}): ${c.failures[0] ?? "failed"}`);
  return { available: true, rules: passedRules, checks: checkIds, checkRuns: checks.length, failures };
}

function evaluate(item) {
  const auto = automatedEvidence(item.sc);
  let conf = item.c;
  const notes = [item.remarks];
  if (auto.failures.length) {
    if (conf === "S") conf = "P";
    notes.push(`Automated regression detected in the current build: ${auto.failures.slice(0, 3).join("; ")}${auto.failures.length > 3 ? ` (and ${auto.failures.length - 3} more)` : ""}.`);
  }
  const ev = [];
  if (auto.rules.length) ev.push(`${auto.rules.length} axe-core rule${auto.rules.length > 1 ? "s" : ""} passed (${auto.rules.join(", ")})`);
  if (auto.checks.length) ev.push(`scripted checks ${auto.checks.join(", ")} (${auto.checkRuns} runs${auto.failures.length ? "" : ", all passed"})`);
  const manual = item.methods.filter((m) => !["automated", "scripted"].includes(m)).map((m) => METHOD_LABELS[m]);
  if (manual.length) ev.push(manual.join(", ") + (reviewCurrent ? "" : " (pending re-review after UI changes)"));
  if (!auto.available && item.methods.some((m) => ["automated", "scripted"].includes(m))) ev.push("automated results not available in this build");
  return { ...item, conf, remarks: notes.join(" "), evidence: ev, failures: auto.failures };
}

const wcag = WCAG.map(evaluate);
const en9 = wcag.filter((c) => c.since !== "2.2").map((c) => ({ ...c, id: `9.${c.sc}` }));
const en96 = en9.every((c) => ["S", "NA"].includes(c.conf)) ? "S" : "P";
const counts = Object.fromEntries(Object.keys(LEVELS).map((k) => [k, wcag.filter((c) => c.conf === k).length]));
const failing = wcag.filter((c) => c.failures.length);
const enNotes = [...EN_FPS, ...EN_OTHER].filter((c) => ["P", "D", "NE"].includes(c.c))
  .map((c) => `; ${c.id} (${c.name.toLowerCase()}) is ${{ P: "partially supported", D: "not supported", NE: "not evaluated" }[c.c]}`).join("");
const automatedPass = !!results?.summary?.pass;

// ------------------------------------------------------------------ shared page layout

const NAV = [
  ["index.html", "Accessibility statement"],
  ["vpat.html", "VPAT"],
  ["test-report.html", "Test report"],
  ...EVIDENCE.map((e) => [e.page, e.title.split(" ")[0] === "Evaluator" ? "Expertise" : e.title.replace(/^(Accessibility |Evaluation |Test |Baseline audit and )/, "").replace(/^./, (c) => c.toUpperCase())]),
];

// Shared page shell for the accessibility pages (accessibility/) and the policy
// pages (policies/). Same header, footer and help links on every page (WCAG 3.2.3, 3.2.6).
// Policy pages exist in English and French; the French accessibility statement
// (declaration.html) summarizes the English VPAT and evidence.
const POLICY_NAV = [["privacy.html", "Privacy policy"], ["protected-b.html", "Protected B handling"]];
const POLICY_NAV_FR = [["privacy-fr.html", "Politique de confidentialité"], ["protected-b-fr.html", "Traitement de l'information Protégé B"]];
const NAV_FR = [["declaration.html", "Déclaration d'accessibilité"], ["vpat.html", "VPAT (en anglais)"], ["test-report.html", "Rapport d'essais (en anglais)"]];
const SECTIONS = {
  accessibility: { label: "Accessibility", nav: NAV, navLabel: "Accessibility documentation", toAcc: "", toPol: "../policies/", css: "assets/docs.css" },
  policies: { label: "Policies", nav: POLICY_NAV, navLabel: "Policies", toAcc: "../accessibility/", toPol: "", css: "../accessibility/assets/docs.css" },
};
const CHROME = {
  en: { app: "Project Gating Navigator", skip: "Skip to content", privacy: "privacy.html", privacyLabel: "Privacy policy", pb: "protected-b.html", pbLabel: "Protected B handling", acc: "index.html", accLabel: "Accessibility statement, VPAT and evidence", report: "Report an accessibility problem", back: "Back to the application", other: "Français" },
  fr: { app: "Navigateur des points de contrôle de projet", skip: "Passer au contenu", privacy: "privacy-fr.html", privacyLabel: "Politique de confidentialité", pb: "protected-b-fr.html", pbLabel: "Traitement de l'information Protégé B", acc: "declaration.html", accLabel: "Déclaration d'accessibilité, VPAT et preuves", report: "Signaler un problème d'accessibilité", back: "Retour à l'application", other: "English" },
};

// alt: the same page in the other language, if there is one.
function layout(page, title, body, section = "accessibility", lang = "en", alt = null) {
  const S0 = SECTIONS[section];
  const S = lang === "fr" ? { ...S0, label: section === "policies" ? "Politiques" : "Accessibilité", nav: section === "policies" ? POLICY_NAV_FR : NAV_FR, navLabel: section === "policies" ? "Politiques" : "Documentation sur l'accessibilité" } : S0;
  const C = CHROME[lang];
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; img-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'">
<meta name="referrer" content="no-referrer">
<title>${esc(title)} · ${C.app}</title>
<link rel="stylesheet" href="${S.css}">
</head>
<body>
<a class="skip" href="#main">${C.skip}</a>
<header class="top">
  <p class="brand"><a href="../index.html">${C.app}</a> <span>${S.label}</span>${alt ? ` <a class="alt-lang" href="${alt}" lang="${lang === "fr" ? "en" : "fr"}">${C.other}</a>` : ""}</p>
  <nav aria-label="${S.navLabel}"><ul>${S.nav.map(([href, label]) => `<li><a href="${href}"${href === page ? ' aria-current="page"' : ""}>${esc(label)}</a></li>`).join("")}</ul></nav>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="foot">
  <p class="foot-links"><a href="${S.toPol}${C.privacy}">${C.privacyLabel}</a>
  <a href="${S.toPol}${C.pb}">${C.pbLabel}</a>
  <a href="${S.toAcc}${C.acc}">${C.accLabel}</a>
  <a href="${ISSUES}">${C.report}</a>
  <a href="../index.html">${C.back}</a></p>
  <p${lang === "fr" ? ' lang="en"' : ""}>Generated by <code>scripts/build-vpat.mjs</code>. ${section === "accessibility" ? "Compiled from <code>accessibility/evaluation/criteria.mjs</code> and the automated test results; recompiled on every commit by the accessibility workflow." : `Source: <code>policies/${page.replace(/\.html$/, ".md")}</code>.`}</p>
</footer>
</body>
</html>
`;
}

// Wrap tables so they can scroll horizontally on narrow screens and be scrolled by keyboard.
let tableN = 0;
function wrapTables(html) {
  return html.replace(/<table>([\s\S]*?)<\/table>/g, (m, inner) => {
    tableN++;
    return `<div class="table-wrap" role="region" tabindex="0" aria-label="Table ${tableN}, scrollable"><table>${inner}</table></div>`;
  });
}

const pill = (lvl) => `<span class="lvl lvl-${lvl}">${esc(LEVELS[lvl])}</span>`;
const table = (caption, head, rows) => `<div class="table-wrap" role="region" tabindex="0" aria-label="${esc(caption)}"><table><caption>${esc(caption)}</caption>
<thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
<tbody>${rows.join("\n")}</tbody></table></div>`;

// ------------------------------------------------------------------ VPAT content

const productName = "Project Gating Navigator (Navigateur des points de contrôle de projet)";
const version = pkg?.version ?? "unknown";
const reportDate = review?.reviewedAt ?? "Not yet reviewed";
const reviewer = review?.reviewer ?? "None recorded";
const description = "A bilingual (English/French) browser-based tool that helps Government of Canada employees navigate project governance under the Directive on the Management of Projects and Programmes and TBS gating guidance: scoping interview with an indicative complexity and risk estimate, approval authority and oversight determination, document review, a gate readiness questionnaire with guidance for each requirement, a requirements library, a gate guide, a governance decision tree, and a generated gate readiness report. Runs entirely in the browser with no server-side processing or authentication.";

const reviewNotice = reviewCurrent
  ? `Manual review is current: the code-review and visual judgements were made on the same user-interface code this report describes (fingerprint <code>${fingerprint.combined}</code>).`
  : `<strong>Manual review pending.</strong> The user interface has changed since the last attested manual review (${review ? esc(review.reviewedAt) : "none recorded"}). Changed: ${changedFiles.map((f) => `<code>${esc(f)}</code>`).join(", ")}. Automated results in this report are current; judgements based on code review or visual inspection must be re-confirmed (<code>npm run a11y:attest</code>).`;

const automatedNotice = !results
  ? "<strong>Automated results are missing.</strong> Run <code>npm run a11y</code>."
  : automatedPass
    ? `Automated suite passed: ${results.summary.axeRuns} axe-core runs with no WCAG violations, and ${results.summary.checksRun} scripted checks passed across ${results.summary.pageStates} page states (axe-core ${esc(results.tools["axe-core"])}, ${esc(results.tools.browser)}).`
    : `<strong>Automated suite failed:</strong> ${results.summary.wcagViolations} WCAG violation(s) and ${results.summary.checksFailed} failed scripted check(s). Affected criteria are downgraded below.`;

const notes = [
  "Scope: the complete web interface (all views and states listed in the scope document) and the accessibility documentation pages. Generated export files (Markdown, CSV, JSON, printed PDF) are not evaluated as non-web documents.",
  "Evaluator: this report is a self-assessment carried out by an AI assistant (Claude, Anthropic) using automated tools, scripted browser checks, code review and visual inspection. No testing with screen readers or other assistive technology, and no testing by people with disabilities, has been performed yet. Only Chromium was tested. Independent verification is recommended; see the expertise and independence statement.",
  "Conformance levels for criteria with automated checks are recompiled on every commit. If an automated check fails, the affected criterion is downgraded automatically.",
];

const methodsText = "WCAG 2.2 A/AA evaluation combining (1) axe-core automated rules on every page state in light and dark themes; (2) scripted Playwright checks for keyboard access, keyboard traps, focus visibility and contrast, focus obscuring, reflow at 320 CSS px, resize at 200%, text spacing, target size, non-text contrast, ARIA tabs, focus management and status messages; (3) code review of templates, styles and event handling; (4) visual inspection of light, dark and forced-colours rendering at several widths; and (5) review of the generated accessibility tree. Details are in the test methodology and test report.";

const SINCE = { "2.0": "", "2.1": ", WCAG 2.1 and 2.2", "2.2": ", WCAG 2.2 only" };
function rowsFor(items) {
  return items.map((c) => `<tr><th scope="row">${esc(c.sc)} ${esc(c.name)} <span class="meta">(Level ${c.level}${SINCE[c.since]})</span></th>
<td>${pill(c.conf)}</td>
<td>${esc(c.remarks)}${c.evidence.length ? `<p class="ev"><strong>Evidence:</strong> ${esc(c.evidence.join("; "))}.</p>` : ""}</td></tr>`);
}
const wRows = (lvl) => wcag.filter((c) => c.level === lvl);

const vpatBody = `
<h1>Accessibility Conformance Report</h1>
<p class="lead">Based on VPAT<sup>®</sup> Version 2.5Rev (EU edition: WCAG and EN 301 549)</p>

<div class="table-wrap" role="region" tabindex="0" aria-label="Report information">
<table class="kv"><caption>Report information</caption><tbody>
<tr><th scope="row">Name of product and version</th><td>${productName} ${esc(version)}</td></tr>
<tr><th scope="row">Report date</th><td>${esc(reportDate)} (manual evaluation); automated results recompiled with each commit</td></tr>
<tr><th scope="row">Product description</th><td>${esc(description)}</td></tr>
<tr><th scope="row">Contact information</th><td><a href="${ISSUES}">Report an accessibility problem</a> (project issue tracker, <a href="${REPO}">${REPO.replace("https://", "")}</a>)</td></tr>
<tr><th scope="row">Evaluator</th><td>${esc(reviewer)}</td></tr>
<tr><th scope="row">Evaluation methods used</th><td>${esc(methodsText)}</td></tr>
</tbody></table></div>

<h2>Build status</h2>
<p class="notice ${automatedPass ? "ok" : "bad"}">${automatedNotice}</p>
<p class="notice ${reviewCurrent ? "ok" : "warn"}">${reviewNotice}</p>

<h2>Notes</h2>
<ul>${notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>

<h2>Applicable standards and guidelines</h2>
${table("Standards and guidelines covered", ["Standard or guideline", "Included in report"], [
  `<tr><th scope="row">Web Content Accessibility Guidelines 2.0</th><td>Level A (Yes) · Level AA (Yes) · Level AAA (No)</td></tr>`,
  `<tr><th scope="row">Web Content Accessibility Guidelines 2.1</th><td>Level A (Yes) · Level AA (Yes) · Level AAA (No)</td></tr>`,
  `<tr><th scope="row">Web Content Accessibility Guidelines 2.2</th><td>Level A (Yes) · Level AA (Yes) · Level AAA (No)</td></tr>`,
  `<tr><th scope="row">EN 301 549 v3.2.1 (2021-03), adopted in Canada as CAN/ASC-EN 301 549:2024</th><td>Yes</td></tr>`,
])}

<h2>Terms</h2>
<dl>
<dt>Supports</dt><dd>The functionality of the product has at least one method that meets the criterion without known defects or meets with equivalent facilitation.</dd>
<dt>Partially Supports</dt><dd>Some functionality of the product does not meet the criterion.</dd>
<dt>Does Not Support</dt><dd>The majority of product functionality does not meet the criterion.</dd>
<dt>Not Applicable</dt><dd>The criterion is not relevant to the product.</dd>
<dt>Not Evaluated</dt><dd>The product has not been evaluated against the criterion.</dd>
</dl>

<h2>Summary</h2>
<p>WCAG 2.2 Level A and AA (${wcag.length} criteria, including 4.1.1): ${Object.entries(counts).filter(([, n]) => n).map(([k, n]) => `${n} ${LEVELS[k]}`).join(", ")}.</p>

<h2>WCAG 2.x Report</h2>
<p>Tables 1 and 2 cover WCAG 2.0, 2.1 and 2.2. Criteria introduced in WCAG 2.1 or 2.2 are marked. EN 301 549 chapter 9 results follow from these tables.</p>
${table("Table 1: Success Criteria, Level A", ["Criteria", "Conformance level", "Remarks and explanations"], rowsFor(wRows("A")))}
${table("Table 2: Success Criteria, Level AA", ["Criteria", "Conformance level", "Remarks and explanations"], rowsFor(wRows("AA")))}
<p>Table 3: Success Criteria, Level AAA: not evaluated.</p>

<h2>EN 301 549 Report</h2>
<h3>Chapter 4: Functional Performance Statements</h3>
${table("Chapter 4: Functional Performance Statements", ["Criteria", "Conformance level", "Remarks and explanations"], EN_FPS.map((c) => `<tr><th scope="row">${esc(c.id)} ${esc(c.name)}</th><td>${pill(c.c)}</td><td>${esc(c.remarks)}</td></tr>`))}
<h3>Chapters 5 to 8</h3>
${table("Chapters 5 to 8: Generic requirements, two-way voice, video, hardware", ["Criteria", "Conformance level", "Remarks and explanations"], EN_OTHER.filter((c) => Number(c.chapter) <= 8).map((c) => `<tr><th scope="row">${esc(c.id)} ${esc(c.name)}</th><td>${pill(c.c)}</td><td>${esc(c.remarks)}</td></tr>`))}
<h3>Chapter 9: Web</h3>
<p>Clauses 9.1 to 9.4 correspond to WCAG 2.1 Level A and AA. The results below are identical to Tables 1 and 2 for those criteria.</p>
${table("Chapter 9: Web", ["Criteria", "Conformance level", "Remarks and explanations"], [
  ...en9.map((c) => `<tr><th scope="row">${esc(c.id)} ${esc(c.name.replace(" (obsolete and removed in WCAG 2.2)", ""))}</th><td>${pill(c.conf)}</td><td>See WCAG ${esc(c.sc)}${c.failures.length ? `. ${esc(c.failures[0])}` : ""}.</td></tr>`),
  `<tr><th scope="row">9.6 WCAG conformance requirements</th><td>${pill(en96)}</td><td>${en96 === "S" ? "All clauses 9.1 to 9.4 are supported or not applicable." : "One or more clauses 9.1 to 9.4 are not fully supported."}</td></tr>`,
])}
<h3>Chapters 10 to 12</h3>
${table("Chapters 10 to 12: Non-web documents, software, documentation and support", ["Criteria", "Conformance level", "Remarks and explanations"], EN_OTHER.filter((c) => Number(c.chapter) >= 10).map((c) => `<tr><th scope="row">${esc(c.id)} ${esc(c.name)}</th><td>${pill(c.c)}</td><td>${esc(c.remarks)}</td></tr>`))}

<h2>Legal disclaimer</h2>
<p>This report describes the accessibility of the product version and code identified above, as evaluated by the methods described. It is a self-assessment, not a certification, and is provided “as is” without warranty. VPAT<sup>®</sup> is a registered service mark of the Information Technology Industry Council (ITI); this report follows the structure of the ITI VPAT 2.5Rev template.</p>

<h2>Downloads</h2>
<ul class="downloads">
<li><a href="VPAT.md" download>VPAT (Markdown)</a></li>
<li><a href="vpat.html" download="Project-Gating-Navigator-VPAT.html">VPAT (HTML file)</a>. To save as PDF, use your browser's Print command.</li>
<li><a href="results/automated-results.json" download>Raw automated test results (JSON)</a></li>
</ul>`;

// ------------------------------------------------------------------ Markdown VPAT

const mdCell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");
const stripTags = (s) => s.replace(/<[^>]+>/g, "");
function mdTable(head, rows) {
  return [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.map(mdCell).join(" | ")} |`)].join("\n");
}
const md = [
  "# Accessibility Conformance Report",
  "",
  "Based on VPAT® Version 2.5Rev (EU edition: WCAG and EN 301 549)",
  "",
  `**Name of product and version:** ${productName} ${version}  `,
  `**Report date:** ${reportDate} (manual evaluation); automated results recompiled with each commit  `,
  `**Product description:** ${description}  `,
  `**Contact information:** ${ISSUES}  `,
  `**Evaluator:** ${reviewer}  `,
  `**Evaluation methods used:** ${methodsText}`,
  "",
  "## Build status",
  "",
  `- ${stripTags(automatedNotice)}`,
  `- ${stripTags(reviewNotice)}`,
  "",
  "## Notes",
  "",
  ...notes.map((n) => `- ${n}`),
  "",
  "## Applicable standards and guidelines",
  "",
  mdTable(["Standard or guideline", "Included in report"], [
    ["WCAG 2.0", "Level A (Yes), Level AA (Yes), Level AAA (No)"],
    ["WCAG 2.1", "Level A (Yes), Level AA (Yes), Level AAA (No)"],
    ["WCAG 2.2", "Level A (Yes), Level AA (Yes), Level AAA (No)"],
    ["EN 301 549 v3.2.1 (CAN/ASC-EN 301 549:2024)", "Yes"],
  ]),
  "",
  `## WCAG 2.x Report`,
  "",
  `Summary: ${Object.entries(counts).filter(([, n]) => n).map(([k, n]) => `${n} ${LEVELS[k]}`).join(", ")}.`,
  "",
  "### Table 1: Success Criteria, Level A",
  "",
  mdTable(["Criteria", "Conformance level", "Remarks and explanations"], wRows("A").map((c) => [`${c.sc} ${c.name}`, LEVELS[c.conf], `${c.remarks}${c.evidence.length ? ` Evidence: ${c.evidence.join("; ")}.` : ""}`])),
  "",
  "### Table 2: Success Criteria, Level AA",
  "",
  mdTable(["Criteria", "Conformance level", "Remarks and explanations"], wRows("AA").map((c) => [`${c.sc} ${c.name}`, LEVELS[c.conf], `${c.remarks}${c.evidence.length ? ` Evidence: ${c.evidence.join("; ")}.` : ""}`])),
  "",
  "### Table 3: Success Criteria, Level AAA",
  "",
  "Not evaluated.",
  "",
  "## EN 301 549 Report",
  "",
  "### Chapter 4: Functional Performance Statements",
  "",
  mdTable(["Criteria", "Conformance level", "Remarks and explanations"], EN_FPS.map((c) => [`${c.id} ${c.name}`, LEVELS[c.c], c.remarks])),
  "",
  "### Chapters 5 to 8",
  "",
  mdTable(["Criteria", "Conformance level", "Remarks and explanations"], EN_OTHER.filter((c) => Number(c.chapter) <= 8).map((c) => [`${c.id} ${c.name}`, LEVELS[c.c], c.remarks])),
  "",
  "### Chapter 9: Web",
  "",
  mdTable(["Criteria", "Conformance level", "Remarks and explanations"], [
    ...en9.map((c) => [`${c.id} ${c.name.replace(" (obsolete and removed in WCAG 2.2)", "")}`, LEVELS[c.conf], `See WCAG ${c.sc}.`]),
    ["9.6 WCAG conformance requirements", LEVELS[en96], en96 === "S" ? "All clauses 9.1 to 9.4 are supported or not applicable." : "One or more clauses are not fully supported."],
  ]),
  "",
  "### Chapters 10 to 12",
  "",
  mdTable(["Criteria", "Conformance level", "Remarks and explanations"], EN_OTHER.filter((c) => Number(c.chapter) >= 10).map((c) => [`${c.id} ${c.name}`, LEVELS[c.c], c.remarks])),
  "",
  "## Legal disclaimer",
  "",
  "This report describes the accessibility of the product version and code identified above, as evaluated by the methods described. It is a self-assessment, not a certification, and is provided “as is” without warranty. VPAT® is a registered service mark of the Information Technology Industry Council (ITI).",
  "",
].join("\n");

// ------------------------------------------------------------------ test report page

function testReportBody() {
  if (!results) return `<h1>Automated test report</h1><p class="notice bad">No automated results found. Run <code>npm run a11y</code>.</p>`;
  const s = results.summary;
  const checkIds = [...new Set(results.checks.map((c) => c.id))];
  const checkRows = checkIds.map((id) => {
    const runs = results.checks.filter((c) => c.id === id);
    const failed = runs.filter((c) => !c.pass);
    return `<tr><th scope="row"><code>${esc(id)}</code><br>${esc(runs[0].title)}</th><td>${esc(runs[0].sc.join(", "))}</td><td>${runs.length}</td>
<td>${failed.length ? `<span class="lvl lvl-D">${failed.length} failed</span><ul>${failed.slice(0, 5).map((f) => `<li>${esc(f.state)} (${esc(f.variant)}): ${esc(f.failures.slice(0, 2).join("; "))}</li>`).join("")}</ul>` : `<span class="lvl lvl-S">All passed</span>`}</td></tr>`;
  });
  const scRules = {};
  for (const [id, r] of Object.entries(results.axeRules)) for (const sc of r.sc) (scRules[sc] ??= []).push(id);
  const ruleRows = Object.keys(scRules).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((sc) => `<tr><th scope="row">${esc(sc)}</th><td>${scRules[sc].map((r) => `<code>${esc(r)}</code>`).join(" ")}</td></tr>`);
  const violations = results.axe.flatMap((a) => a.violations.map((v) => `<li>${esc(a.state)} (${esc(a.theme)}): <code>${esc(v.id)}</code> ${esc(v.help)}${v.wcag ? "" : " (advisory)"}: ${esc(v.nodes.slice(0, 3).join(", "))}</li>`));
  const incomplete = {};
  for (const a of results.axe) for (const i of a.incomplete) (incomplete[i.id] ??= new Set()).add(`${a.state}/${a.theme}`);
  return `
<h1>Automated test report</h1>
<p class="notice ${s.pass ? "ok" : "bad"}">${s.pass ? "Passed" : "Failed"}: ${s.axeRuns} axe-core runs (${s.wcagViolations} WCAG violations, ${s.advisoryViolations} best-practice issues), ${s.checksRun - s.checksFailed} of ${s.checksRun} scripted checks passed, ${s.pageErrors} JavaScript errors.</p>

<h2>Tools</h2>
<ul>${Object.entries(results.tools).map(([k, v]) => `<li>${esc(k)}: ${esc(v)}</li>`).join("")}<li>axe-core tags: ${results.axeTags.map((t) => `<code>${esc(t)}</code>`).join(" ")}</li></ul>

<h2>Page states tested</h2>
${table("Page states", ["ID", "Description", "URL"], results.states.map((st) => `<tr><th scope="row"><code>${esc(st.id)}</code></th><td>${esc(st.name)}${st.setup ? `<br><span class="meta">Setup: <code>${esc(st.setup)}</code></span>` : ""}</td><td><code>${esc(st.url)}</code></td></tr>`))}
<p>Each state was tested in: ${results.variants.map(esc).join("; ")}.</p>

<h2>Scripted checks</h2>
${table("Scripted check results", ["Check", "WCAG", "Runs", "Result"], checkRows)}

<h2>axe-core violations</h2>
${violations.length ? `<ul>${violations.join("")}</ul>` : "<p>None.</p>"}

<h2>Items axe-core could not decide</h2>
<p>axe-core marks some results “incomplete” when a human must decide, for example text over a gradient. These were reviewed visually.</p>
${Object.keys(incomplete).length ? `<ul>${Object.entries(incomplete).map(([id, set]) => `<li><code>${esc(id)}</code> (${esc(results.axeRules[id]?.help ?? "")}): ${esc([...set].join(", "))}</li>`).join("")}</ul>` : "<p>None.</p>"}

<h2>axe-core rules applied, by success criterion</h2>
${table("axe-core rules by WCAG success criterion", ["WCAG", "Rules"], ruleRows)}

<h2>Accessibility tree snapshots</h2>
<p>The accessibility tree Chromium exposes to assistive technology for each application state (Playwright aria snapshots, YAML):</p>
<ul>${results.states.filter((st) => !st.id.startsWith("docs/")).map((st) => `<li><a href="results/aria/${esc(st.id)}.yml">${esc(st.name)}</a></li>`).join("")}</ul>

<h2>Baseline</h2>
<p>The audit before remediation is kept as <a href="evidence/baseline-results.json">evidence/baseline-results.json</a> and summarized in the <a href="remediation-log.html">remediation log</a>.</p>`;
}

// ------------------------------------------------------------------ statement (index)

const statementBody = `
<h1>Accessibility statement</h1>
<p class="lead">The Project Gating Navigator aims to be usable by everyone, including people who use assistive technologies. We target WCAG 2.2 Level AA and EN 301 549 v3.2.1.</p>

<h2>Conformance status</h2>
<p class="notice ${automatedPass && !failing.length ? "ok" : "bad"}">${automatedPass && !failing.length ? `Version ${esc(version)} is evaluated as conforming to WCAG 2.2 Level AA: ${counts.S} criteria supported and ${counts.NA} not applicable. EN 301 549: chapter 9 ${en96 === "S" ? "supported" : "partially supported"}${enNotes}.` : `Version ${esc(version)} does not currently fully conform. ${failing.length} WCAG criteria are affected by automated failures; see the VPAT.`}</p>
<p class="notice ${reviewCurrent ? "ok" : "warn"}">${reviewNotice}</p>
<p>This is a self-assessment. It has <strong>not yet been verified with assistive technology or by an independent auditor</strong>; see the <a href="expertise.html">expertise and independence statement</a>.</p>

<h2>Documents</h2>
<ul class="doclist">
<li><a href="vpat.html">Accessibility Conformance Report (VPAT 2.5Rev, WCAG 2.2 and EN 301 549)</a>, also available as <a href="VPAT.md" download>Markdown</a></li>
<li><a href="test-report.html">Automated test report</a> with raw <a href="results/automated-results.json">JSON results</a></li>
${EVIDENCE.map((e) => `<li><a href="${e.page}">${esc(e.title)}</a></li>`).join("\n")}
</ul>

<h2>Accessibility features</h2>
<ul>
<li>Fully operable with a keyboard. A skip link bypasses the navigation, and focus moves to the page heading after navigation.</li>
<li>Works with screen readers through native HTML semantics. Status changes (answer status, analysis results, search counts, confirmations) are announced.</li>
<li>Available in English and French; the page language is set accordingly, and reports are produced in the selected language.</li>
<li>Follows your system's dark mode, with a manual toggle. Supports Windows high contrast (forced colours) and reduced motion settings.</li>
<li>Reflows to a single column down to 320 CSS px (400% zoom) without horizontal scrolling. Report tables scroll within their own area.</li>
<li>No time limits, no flashing content, and confirmation before data is deleted or replaced.</li>
</ul>

<h2>Known limitations</h2>
<ul>
<li>The subject matter uses specialized governance terminology and acronyms; there is no glossary yet (EN 301 549 4.2.10).</li>
<li>The French text was drafted with machine assistance and has not yet been reviewed by a certified translator. The VPAT, test report and evidence documents are in English only.</li>
<li>Downloaded files (Markdown, CSV, JSON) and printed PDFs have not been evaluated for accessibility.</li>
<li>Testing has used Chromium only. Firefox and Safari have not yet been tested.</li>
</ul>

<h2>Compatibility</h2>
<p>Designed for current versions of Chrome, Edge, Firefox and Safari with JavaScript enabled. It relies on HTML, CSS, JavaScript and WAI-ARIA.</p>

<h2>Feedback</h2>
<p>If you find a barrier, please <a href="${ISSUES}">report an accessibility problem</a>. Include the page, what you were trying to do, and the browser and assistive technology you use. Problems that block a task are fixed before the next release.</p>

<h2>How this statement is maintained</h2>
<p>An automated accessibility suite runs on every commit, and this statement, the VPAT and the test report are recompiled from its results. If a check fails, the build fails and the affected criteria are downgraded. When the user interface changes, the manual review is flagged as pending until a reviewer re-confirms it. See the <a href="strategy.html">strategy</a>.</p>`;

// ------------------------------------------------------------------ statement in French (declaration)

const statementBodyFr = `
<h1>Déclaration d'accessibilité</h1>
<p class="lead">Le Navigateur des points de contrôle de projet vise à être utilisable par tous, y compris les personnes qui utilisent des technologies d'assistance. Nous visons le niveau AA des WCAG 2.2 et la norme EN 301 549 v3.2.1.</p>

<h2>État de conformité</h2>
<p class="notice ${automatedPass && !failing.length ? "ok" : "bad"}">${automatedPass && !failing.length ? `La version ${esc(version)} est évaluée comme conforme au niveau AA des WCAG 2.2 : ${counts.S} critères pris en charge et ${counts.NA} sans objet.` : `La version ${esc(version)} n'est pas entièrement conforme pour le moment. ${failing.length} critères WCAG sont touchés par des échecs automatisés; consultez le VPAT.`}</p>
<p class="notice ${reviewCurrent ? "ok" : "warn"}">${reviewCurrent ? "L'examen manuel est à jour : les jugements fondés sur l'examen du code et l'inspection visuelle portent sur le code d'interface décrit par ce rapport." : "<strong>Examen manuel en attente.</strong> L'interface a changé depuis le dernier examen manuel attesté. Les résultats automatisés sont à jour."}</p>
<p>Il s'agit d'une autoévaluation. Elle n'a <strong>pas encore été vérifiée avec des technologies d'assistance ni par un vérificateur indépendant</strong>.</p>

<h2>Documents</h2>
<p>Les documents détaillés sont en anglais seulement :</p>
<ul class="doclist">
<li><a href="vpat.html" hreflang="en">Accessibility Conformance Report (VPAT 2.5Rev)</a></li>
<li><a href="test-report.html" hreflang="en">Automated test report</a></li>
<li><a href="index.html" hreflang="en">Accessibility statement</a> et documents de preuve</li>
</ul>

<h2>Caractéristiques d'accessibilité</h2>
<ul>
<li>Entièrement utilisable au clavier. Un lien d'évitement permet de passer la navigation, et le focus passe au titre de la page après chaque navigation.</li>
<li>Compatible avec les lecteurs d'écran grâce à la sémantique HTML native. Les changements d'état (état des exigences, résultats d'analyse, nombre de résultats de recherche, confirmations) sont annoncés.</li>
<li>Offert en français et en anglais; la langue de la page est définie en conséquence, et les rapports sont produits dans la langue choisie.</li>
<li>Suit le mode sombre du système, avec un bouton manuel. Prend en charge le contraste élevé de Windows et la réduction des animations.</li>
<li>S'adapte à une seule colonne jusqu'à 320 px CSS (zoom de 400 %) sans défilement horizontal.</li>
<li>Aucune limite de temps imposée, aucun contenu clignotant, et confirmation avant la suppression ou le remplacement de données.</li>
</ul>

<h2>Limites connues</h2>
<ul>
<li>Le sujet utilise une terminologie et des acronymes spécialisés en gouvernance; il n'y a pas encore de glossaire.</li>
<li>Le texte français a été rédigé avec l'aide d'outils de traduction automatique et n'a pas encore été révisé par un traducteur agréé.</li>
<li>Les fichiers téléchargés (Markdown, CSV, JSON) et les PDF imprimés n'ont pas été évalués.</li>
<li>Les essais ont été faits avec Chromium seulement.</li>
</ul>

<h2>Rétroaction</h2>
<p>Si vous rencontrez un obstacle, veuillez <a href="${ISSUES}">signaler un problème d'accessibilité</a>. Indiquez la page, ce que vous tentiez de faire, ainsi que le navigateur et la technologie d'assistance utilisés.</p>`;

// ------------------------------------------------------------------ write

await mkdir(join(OUT, "assets"), { recursive: true });
await writeFile(join(OUT, "index.html"), layout("index.html", "Accessibility statement", statementBody, "accessibility", "en", "declaration.html"));
await writeFile(join(OUT, "declaration.html"), layout("declaration.html", "Déclaration d'accessibilité", statementBodyFr, "accessibility", "fr", "index.html"));
await writeFile(join(OUT, "vpat.html"), layout("vpat.html", "Accessibility Conformance Report (VPAT)", vpatBody));
await writeFile(join(OUT, "VPAT.md"), md);
await writeFile(join(OUT, "test-report.html"), layout("test-report.html", "Automated test report", testReportBody()));
for (const e of EVIDENCE) {
  const src = await readFile(join(EVIDENCE_DIR, e.file), "utf8");
  tableN = 0;
  let html = wrapTables(marked.parse(src));
  for (const x of EVIDENCE) html = html.replaceAll(x.file, x.page);
  await writeFile(join(OUT, e.page), layout(e.page, e.title, html));
}

// Policy pages (privacy, Protected B) are written in Markdown under policies/.
const POLICY_DIR = process.env.POLICY_OUT ?? join(ROOT, "policies");
await mkdir(POLICY_DIR, { recursive: true });
for (const [[page, title], [pageFr, titleFr]] of POLICY_NAV.map((p, i) => [p, POLICY_NAV_FR[i]])) {
  const src = await readFile(join(ROOT, "policies", page.replace(/\.html$/, ".md")), "utf8");
  tableN = 0;
  await writeFile(join(POLICY_DIR, page), layout(page, title, wrapTables(marked.parse(src)), "policies", "en", pageFr));
  const srcFr = await readFile(join(ROOT, "policies", page.replace(/\.html$/, ".fr.md")), "utf8");
  tableN = 0;
  await writeFile(join(POLICY_DIR, pageFr), layout(pageFr, titleFr, wrapTables(marked.parse(srcFr)), "policies", "fr", page));
}

// ------------------------------------------------------------------ report status

const problems = [];
if (!results) problems.push("automated results missing (run tests/a11y/run.mjs)");
else if (!results.summary.pass) problems.push(`automated suite failed: ${results.summary.wcagViolations} WCAG violations, ${results.summary.checksFailed} failed checks`);
if (failing.length) problems.push(`criteria downgraded by automated failures: ${failing.map((c) => c.sc).join(", ")}`);
console.log(`VPAT compiled: ${counts.S} Supports, ${counts.P} Partially Supports, ${counts.D} Does Not Support, ${counts.NA} Not Applicable, ${counts.NE} Not Evaluated`);
if (!reviewCurrent) console.warn(`warning: manual review pending; UI files changed since last attestation: ${changedFiles.join(", ")}`);
for (const p of problems) console.error(`${strict ? "error" : "warning"}: ${p}`);
if (strict && problems.length) process.exit(1);
