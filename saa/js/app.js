// UI layer for the SA&A Wizard: hash routing, rendering and event handling.
// All data stays in the browser: encrypted, in memory only, or (Unclassified
// only) unencrypted in localStorage. See js/store.js.

// Refuse to run inside a frame: a framing page on the same origin could read the
// decrypted file. frame-ancestors cannot be set from a <meta> CSP.
if (window.top !== window.self) {
  document.body.textContent = "For security, the SA&A Wizard cannot be used inside a frame. Open it directly in a browser tab.";
  throw new Error("Refusing to run inside a frame");
}

import {
  AVAILABILITY_PROMPTS, CONFIDENTIALITY, CONFIDENTIALITY_PROMPTS, CONTROL_FAMILIES, CONTROL_STATUS, DECISIONS, DEPLOYMENTS,
  FINDING_SOURCES, FINDING_STATUS, GUARDRAILS, IMPACT, INJURY, INTEGRITY_PROMPTS, ITEM_STATUS, LIKELIHOOD, REAUTH_TRIGGERS,
  ROLES, SEVERITIES, SOURCES, SOURCING, STEPS, STEP_MAP, THREATS, TIERS, TREATMENTS, USERS, YES_NO,
} from "./data.js";
import {
  categorization, context, controlsSummary, findingSummary, items, nextActions, normalize, newState, overall, packageStatus,
  progress, rateRisk, reauthDate, recommendation, riskSummary, stepProgress, tier, uid,
} from "./engine.js";
import { buildReport, esc, pct, poamToCSV, reportToHTML, reportToMarkdown } from "./report.js";
import { sampleState } from "./sample.js";
import { KEYS, MARKINGS, MIN_PASSPHRASE, MODES, PolicyError, Store, modeAllowed } from "./store.js";

const app = document.getElementById("app");

let browserStorage = null;
try { browserStorage = window.localStorage; } catch { /* blocked */ }
const store = new Store(browserStorage ?? { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() {} });

let state = store.status() === "ready" ? normalize(store.loadReady() ?? newState()) : null;
let saveTimer;

function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => store.save(state), 300);
}

const marking = () => MARKINGS[store.settings?.marking] ?? null;

// ---------------------------------------------------------------- helpers

let liveTimer;
function announce(msg) {
  const live = document.getElementById("live");
  live.textContent = "";
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => { live.textContent = msg; }, 50);
}

function toast(msg) {
  document.getElementById("toast-msg").textContent = msg;
  document.getElementById("toast").hidden = false;
  announce(msg);
}

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = () => (state.profile.name || "saa").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "saa";

// Reads or writes a dotted path such as "profile.roles.ao" or "risks.2.l".
function getPath(path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), state);
}
function setPath(path, value) {
  const keys = path.split(".");
  let o = state;
  for (const k of keys.slice(0, -1)) {
    if (o[k] == null || typeof o[k] !== "object") o[k] = {};
    o = o[k];
  }
  o[keys.at(-1)] = value;
  save();
}

const opts = (pairs, value, blank = "Choose…") =>
  `${blank === null ? "" : `<option value="">${esc(blank)}</option>`}${pairs.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(value ?? "") ? " selected" : ""}>${esc(l)}</option>`).join("")}`;
const idOpts = (list) => list.map((x) => [x.id, x.label]);

function selectField(path, label, pairs, { hint = "", blank } = {}) {
  const id = `f-${path.replace(/\./g, "-")}`;
  return `<div class="field"><label class="field-label" for="${id}">${esc(label)}</label>
    <select id="${id}" data-bind="${esc(path)}" data-rerender${hint ? ` aria-describedby="${id}-h"` : ""}>${opts(pairs, getPath(path), blank)}</select>
    ${hint ? `<p class="why" id="${id}-h">${esc(hint)}</p>` : ""}</div>`;
}

function textField(path, label, { area = false, hint = "", type = "text", rerender = false } = {}) {
  const id = `f-${path.replace(/\./g, "-")}`;
  const v = esc(getPath(path) ?? "");
  const desc = hint ? ` aria-describedby="${id}-h"` : "";
  const rr = rerender ? " data-rerender" : "";
  const input = area
    ? `<textarea id="${id}" rows="3" data-bind="${esc(path)}"${desc}${rr}>${v}</textarea>`
    : `<input type="${type}" id="${id}" value="${v}" data-bind="${esc(path)}"${desc}${rr}>`;
  return `<div class="field"><label class="field-label" for="${id}">${esc(label)}</label>${input}${hint ? `<p class="why" id="${id}-h">${esc(hint)}</p>` : ""}</div>`;
}

function radios(path, legend, options, { describe } = {}) {
  const name = `r-${path.replace(/\./g, "-")}`;
  const cur = getPath(path);
  return `<fieldset class="q"><legend class="field-label">${esc(legend)}</legend><div class="choices stacked">${options.map(({ id, label, help }) => `
    <label class="choice"><input type="radio" id="${name}-${esc(id)}" name="${name}" value="${esc(id)}" data-bind="${esc(path)}" data-rerender${cur === id ? " checked" : ""}>
      <span>${esc(label)}${help ? `<small>${esc(help)}</small>` : ""}</span></label>`).join("")}</div>${describe ?? ""}</fieldset>`;
}

const levelPill = (level) => `<span class="pill app-${level}">${esc({ required: "Required", recommended: "Recommended", na: "Not applicable" }[level])}</span>`;
const statusPill = (status) => {
  const cls = { done: "st-met", progress: "st-partial", todo: "st-unknown", na: "app-na" }[status];
  return `<span class="pill ${cls}">${esc(ITEM_STATUS.find((s) => s.id === status)?.label)}</span>`;
};
const riskPill = (lv) => (lv ? `<span class="pill risk-${lv.id === "veryhigh" ? "high" : lv.id}">${esc(lv.label)} · ${lv.score}</span>` : `<span class="pill">Not rated</span>`);
const tone = (t) => ({ ok: "tone-ok", warn: "tone-warn", bad: "tone-warn" }[t] ?? "tone-check");

function ring(value, label) {
  return `<div class="ring" data-deg="${Math.round(value * 360)}" role="img" aria-label="${esc(label)}: ${pct(value)}"><span aria-hidden="true">${pct(value)}</span></div>`;
}

// ---------------------------------------------------------------- home

function viewHome() {
  const cat = categorization(state);
  const tr = tier(state);
  const ov = overall(state);
  const rec = recommendation(state);
  const next = nextActions(state, 6);
  return `
  <section class="hero">
    <div>
      <p class="eyebrow">Security assessment and authorization</p>
      <h1 tabindex="-1">SA&amp;A Wizard</h1>
      <p class="lead">A step-by-step guide through security assessment and authorization (SA&amp;A) for a software product in the Government of Canada, following the ITSG-33 information system lifecycle. Work through the eight steps, keep your registers here, and produce a summary and POA&amp;M for your package.</p>
      <div class="actions">
        <a class="btn primary" href="#/step/${firstOpenStep()}">${ov.all.done ? "Continue" : "Start with step 1"}</a>
        <a class="btn" href="#/report">View summary report</a>
      </div>
    </div>
    <div class="card hero-stats">
      <div class="ring-row">${ring(ov.required.pct, "Required activities complete")}<div><strong>${ov.required.done} of ${ov.required.total}</strong><br><span class="muted small">required activities done</span></div></div>
      <dl class="gov-list">
        <div><dt>System</dt><dd>${esc(state.profile.name || "Not named")}</dd></div>
        <div><dt>Category</dt><dd>${esc(cat.code || "Not categorized")}</dd></div>
        <div><dt>SA&amp;A tier</dt><dd>${esc(tr.label)}</dd></div>
        <div><dt>Evidence supports</dt><dd><span class="tone ${tone(rec.tone)}">${esc(rec.label)}</span></dd></div>
      </dl>
    </div>
  </section>
  <h2>The eight steps</h2>
  <div class="steps-grid">
    ${stepProgress(state).map((s) => `
      <a class="card step" href="#/step/${s.step.id}">
        <b>${s.step.n}</b>
        <h3>${esc(s.step.title)}</h3>
        <p>${s.required.done} of ${s.required.total} required done · ${pct(s.all.pct)}</p>
      </a>`).join("")}
  </div>
  <div class="grid2">
    <section class="card">
      <h2 class="h4">Next required activities</h2>
      ${next.length ? `<ol>${next.map((r) => `<li><a href="#/step/${r.item.step}/${r.item.id}">${esc(r.item.title)}</a> <span class="muted small">(${esc(STEP_MAP[r.item.step].title)})</span></li>`).join("")}</ol>` : `<p>Every required activity is done.</p>`}
    </section>
    <section class="card">
      <h2 class="h4">How SA&amp;A fits together</h2>
      <p class="small">Under the Policy on Government Security and the Directive on Security Management, departments authorize information systems before they operate, based on an assessment of their security controls and an explicit decision to accept the residual risk. ITSG-33 describes the lifecycle: categorize, select and tailor controls, design and implement them, assess them, authorize, then monitor and maintain.</p>
      <p class="small">The tool sizes the work to the system: a <strong>light</strong>, <strong>standard</strong> or <strong>enhanced</strong> tier, from the categorization and exposure. Your department's SA&amp;A procedure, templates and authorities always take precedence.</p>
    </section>
  </div>`;
}

function firstOpenStep() {
  const s = stepProgress(state).find((x) => x.required.done < x.required.total);
  return s ? s.step.id : "context";
}

// ---------------------------------------------------------------- step pages

function sidebar(activeId) {
  return `<aside class="side card" aria-label="Steps">
    <nav class="fam-nav">
      <p class="fam-class">Steps</p>
      ${stepProgress(state).map((s) => `<a href="#/step/${s.step.id}"${s.step.id === activeId ? ' class="active" aria-current="page"' : ""}>
        <span>${s.step.n}. ${esc(s.step.title)}</span><span class="fam-prog">${s.required.done}/${s.required.total}</span></a>`).join("")}
      <p class="fam-class">Outputs</p>
      <a href="#/report">Summary report</a>
    </nav>
  </aside>`;
}

function viewStep(id, focusItem) {
  const step = STEP_MAP[id];
  if (!step) return viewHome();
  const pr = progress(state, id);
  const idx = STEPS.indexOf(step);
  const prev = STEPS[idx - 1], next = STEPS[idx + 1];
  const rows = items(state, id);
  return `<div class="assess">
    ${sidebar(id)}
    <div>
      <header class="page-head fam-head">
        <div>
          <p class="eyebrow">Step ${step.n} of ${STEPS.length}</p>
          <h1 tabindex="-1">${esc(step.title)}</h1>
          <p class="lead">${esc(step.why)}</p>
          <p class="small"><strong>Produces:</strong> ${esc(step.produces.join(" · "))}</p>
        </div>
        <div class="fam-score">${ring(pr.required.pct, "Required activities in this step")}<span class="small muted">${pr.required.done}/${pr.required.total} required</span></div>
      </header>
      <div id="panel">${PANELS[id]?.() ?? ""}</div>
      <h2>Checklist</h2>
      <p class="muted small">Required and recommended activities for this system at the ${esc(tier(state).label)} tier. Mark each one as you go and note where the evidence is.</p>
      ${rows.map((r) => itemCard(r, r.item.id === focusItem)).join("")}
      <div class="actions pager">
        ${prev ? `<a class="btn" href="#/step/${prev.id}">← ${esc(prev.title)}</a>` : `<a class="btn" href="#/">← Overview</a>`}
        ${next ? `<a class="btn primary" href="#/step/${next.id}">${esc(next.title)} →</a>` : `<a class="btn primary" href="#/report">Summary report →</a>`}
      </div>
    </div>
  </div>`;
}

function itemCard({ item, level, status }, open) {
  const cur = state.items[item.id] ?? {};
  const name = `st-${item.id}`;
  const statusRadios = level === "na" ? `<p class="muted small">Not applicable to this system, based on your answers in steps 1 and 2.</p>` : `
    <fieldset class="q"><legend>Status</legend><div class="seg">${ITEM_STATUS.map((s) => `
      <label class="seg-opt seg-${{ done: "yes", progress: "partial", todo: "no", na: "na" }[s.id]}"><input type="radio" id="${name}-${s.id}" name="${name}" value="${s.id}" data-bind="items.${item.id}.status" data-rerender${(cur.status || "todo") === s.id ? " checked" : ""}><span>${esc(s.label)}</span></label>`).join("")}
    </div></fieldset>
    <label class="block" for="n-${item.id}">Notes and evidence location</label>
    <textarea id="n-${item.id}" rows="2" data-bind="items.${item.id}.note">${esc(cur.note ?? "")}</textarea>`;
  return `<details class="ctl" id="item-${item.id}"${open ? " open" : ""}>
    <summary><span class="ctitle">${esc(item.title)}</span><span class="pills">${item.artifact ? '<span class="pill">Document</span>' : ""}${levelPill(level)}${level === "na" ? "" : statusPill(status)}</span></summary>
    <div class="ctl-body">
      <p>${esc(item.help)}</p>
      <p class="small"><strong>Good evidence:</strong> ${esc(item.evidence)}</p>
      ${statusRadios}
    </div>
  </details>`;
}

// ---------------------------------------------------------------- step panels

function tierCard() {
  const tr = tier(state);
  return `<section class="card" aria-labelledby="tier-h">
    <h2 class="h4" id="tier-h">SA&amp;A tier: ${esc(tr.label)}${tr.overridden ? ` <span class="pill">chosen; suggested ${esc(TIERS[tr.suggested].label)}</span>` : ""}</h2>
    <p>${esc(tr.summary)}</p>
    <p class="small"><strong>Why ${esc(TIERS[tr.suggested].label)} is suggested:</strong></p>
    <ul class="small">${tr.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
  </section>`;
}

const PANELS = {
  context() {
    return `<fieldset class="card"><legend>The system</legend>
      <div class="grid2">${textField("profile.name", "System or product name", { rerender: false })}${textField("profile.version", "Version or release")}</div>
      ${textField("profile.dept", "Department or agency")}
      ${textField("profile.description", "What it does, for whom, and what information it handles", { area: true })}
      <div class="grid2">
        ${selectField("profile.deployment", "Where it runs", DEPLOYMENTS)}
        ${selectField("profile.sourcing", "How it is built or obtained", SOURCING)}
      </div>
      <div class="grid2">
        ${selectField("profile.users", "Who uses it", USERS)}
        ${selectField("profile.internet", "Reachable from the internet?", YES_NO)}
        ${selectField("profile.pi", "Does it handle personal information?", YES_NO, { hint: "Information about an identifiable individual (Privacy Act)." })}
        ${selectField("profile.adm", "Does it make or support administrative decisions about people?", YES_NO, { hint: "Automated decision systems fall under the Directive on Automated Decision-Making." })}
        ${selectField("profile.interconnect", "Does it connect to other systems or organizations?", YES_NO)}
        ${selectField("profile.critical", "Does it support a critical service?", YES_NO, { hint: "A service whose disruption would cause high injury to health, safety, security or economic well-being." })}
      </div>
    </fieldset>
    <fieldset class="card"><legend>Roles</legend>
      <p class="muted small">Names or positions. You can fill these in as you learn them.</p>
      <div class="grid2">${ROLES.map(([id, name, help]) => textField(`profile.roles.${id}`, name, { hint: help })).join("")}</div>
    </fieldset>
    ${tierCard()}`;
  },

  categorize() {
    const cat = categorization(state);
    const prompts = (list) => `<details class="small"><summary>Questions to ask</summary><ul>${list.map((q) => `<li>${esc(q)}</li>`).join("")}</ul></details>`;
    return `<div class="split">
      <div>
        <section class="card">${radios("cat.conf", "Confidentiality: the most sensitive information in the system", CONFIDENTIALITY.map((c) => ({ id: c.id, label: c.label, help: c.injury })), { describe: prompts(CONFIDENTIALITY_PROMPTS) })}
          ${textField("cat.confNotes", "Reasoning for the confidentiality level", { area: true })}</section>
        <section class="card">${radios("cat.integrity", "Integrity: injury if information or processing were altered", INJURY, { describe: prompts(INTEGRITY_PROMPTS) })}
          ${textField("cat.intNotes", "Reasoning for the integrity level", { area: true })}</section>
        <section class="card">${radios("cat.availability", "Availability: injury if the system or information were unavailable", INJURY, { describe: prompts(AVAILABILITY_PROMPTS) })}
          ${textField("cat.availNotes", "Reasoning for the availability level", { area: true })}</section>
      </div>
      <div class="sticky">
        <section class="card" aria-labelledby="cat-h" aria-live="polite">
          <h2 class="h4" id="cat-h">Security category</h2>
          <p class="kpi-v">${esc(cat.code || "—")}</p>
          <p>${esc(cat.label)}</p>
          ${cat.profile ? `<h3 class="h5">Starting control profile</h3><p><strong>${esc(cat.profile.name)}</strong></p><p class="small">${esc(cat.profile.detail)}</p>` : `<p class="muted small">Choose a level for each of the three to see the category and the control profile to start from.</p>`}
          ${cat.warnings.map((w) => `<div class="callout warn small">${esc(w)}</div>`).join("")}
        </section>
        ${tierCard()}
      </div>
    </div>`;
  },

  plan() {
    const tr = tier(state);
    const cat = categorization(state);
    const ctx = context(state);
    return `<div class="grid2">
      ${tierCard()}
      <section class="card">
        <h2 class="h4">Adjust the tier</h2>
        ${selectField("profile.tierOverride", "SA&A tier to plan for", Object.entries(TIERS).map(([k, v]) => [k, v.label]), { blank: `Use the suggestion (${TIERS[tr.suggested].label})`, hint: "Choose another tier only if your IT security team agrees, for example when departmental policy sets the approach." })}
        <h3 class="h5">Starting control profile</h3>
        <p>${esc(cat.profile?.name ?? "Complete step 2 to select a profile.")}</p>
        ${ctx.cloud ? `<p class="small">Cloud: identify which controls the provider covers (inherited), which are shared and which are yours, using the CCCS assessment summary and the provider's customer responsibility matrix.</p>` : ""}
      </section>
    </div>
    <section class="card">
      <h2 class="h4">Aligning SA&amp;A with project gates</h2>
      <ul class="small">
        <li><strong>Before the business case or project approval:</strong> categorization, SA&amp;A tier, and an estimate of SA&amp;A effort and cost.</li>
        <li><strong>Before detailed design:</strong> TRA, tailored profile and security requirements.</li>
        <li><strong>Before build is complete:</strong> security design reviewed and SRTM drafted.</li>
        <li><strong>Before go-live:</strong> assessment complete and authorization decision signed. Do not plan go-live on the day the SAR is due.</li>
      </ul>
    </section>`;
  },

  tra() {
    const rs = riskSummary(state);
    return `<section class="card" aria-labelledby="risk-h">
      <h2 class="h4" id="risk-h">Risk register</h2>
      <p class="small muted">Rate likelihood and impact on a 1–5 scale. Risk score = likelihood × impact: 1–4 low, 5–9 medium, 10–15 high, 16–25 very high. Use your department's TRA scale if it differs.</p>
      <div class="actions">
        <label class="sr-only" for="threat-pick">Common threat to add</label>
        <select id="threat-pick" class="inline-select">${opts(THREATS.map((t) => [t.id, t.threat]), "", "Add a common threat…")}</select>
        <button class="btn" type="button" data-act="add-threat">Add threat</button>
        <button class="btn" type="button" data-act="add-risk">Add blank risk</button>
      </div>
      <p class="small">${state.risks.length} risk(s). Residual: ${["veryhigh", "high", "medium", "low"].map((k) => `${rs.residual[k]} ${{ veryhigh: "very high", high: "high", medium: "medium", low: "low" }[k]}`).join(", ")}.</p>
    </section>
    ${state.risks.map((r, i) => riskCard(r, i)).join("")}`;
  },

  controls() {
    const cs = controlsSummary(state);
    const ctx = context(state);
    const row = (base, key, label, keyCtls) => {
      const cur = getPath(`${base}.${key}`) ?? {};
      const id = `${base}-${key}`;
      return `<tr>
        <th scope="row">${esc(label)}${keyCtls ? `<details class="small"><summary>Key controls</summary><ul>${keyCtls.map((k) => `<li>${esc(k)}</li>`).join("")}</ul></details>` : ""}</th>
        <td><label class="sr-only" for="s-${id}">Status of ${esc(label)}</label><select id="s-${id}" data-bind="${base}.${key}.status" data-rerender>${opts(idOpts(CONTROL_STATUS), cur.status || "notstarted", null)}</select></td>
        <td><label class="sr-only" for="n-${id}">Notes for ${esc(label)}</label><input type="text" id="n-${id}" value="${esc(cur.note ?? "")}" data-bind="${base}.${key}.note"></td>
      </tr>`;
    };
    return `<section class="card" aria-labelledby="fam-h">
      <h2 class="h4" id="fam-h">Control families (ITSG-33)</h2>
      <p class="small muted">Track implementation by family here; keep control-by-control detail in your SRTM. ${pct(cs.pct)} implemented or inherited (partial counts half).</p>
      <div class="table-wrap"><table><thead><tr><th scope="col">Family</th><th scope="col">Status</th><th scope="col">Notes, evidence, who provides it</th></tr></thead>
      <tbody>${CONTROL_FAMILIES.map((f) => row("controls", f.id, `${f.id} ${f.name}`, f.key)).join("")}</tbody></table></div>
    </section>
    ${ctx.tenancy ? `<section class="card" aria-labelledby="gr-h">
      <h2 class="h4" id="gr-h">GC Cloud Guardrails</h2>
      <p class="small muted">${cs.railsMet} of ${GUARDRAILS.length} in place. Check the current guardrails and validation procedures on canada.ca.</p>
      <div class="table-wrap"><table><thead><tr><th scope="col">Guardrail</th><th scope="col">Status</th><th scope="col">Notes</th></tr></thead>
      <tbody>${GUARDRAILS.map((g) => row("guardrails", g.n, `${g.n}. ${g.name}`, [g.hint])).join("")}</tbody></table></div>
    </section>` : ctx.saas ? `<div class="callout info small">SaaS: GC Cloud Guardrails apply to cloud tenancies the department manages (IaaS and PaaS). For SaaS, rely on the provider's assessment and review the tenant configuration you control.</div>` : ""}`;
  },

  assess() {
    const fs = findingSummary(state);
    return `<section class="card" aria-labelledby="find-h">
      <h2 class="h4" id="find-h">Findings register</h2>
      <p class="small muted">Record every gap found by control assessment, scanning, testing or vendor evidence. Open findings feed the POA&amp;M.</p>
      <p class="small">${fs.total} finding(s), ${fs.open.length} open: ${SEVERITIES.map((s) => `${fs.bySev[s.id]} ${s.label.toLowerCase()}`).join(", ")}.${fs.overdue.length ? ` <strong>${fs.overdue.length} overdue.</strong>` : ""}</p>
      <div class="actions"><button class="btn" type="button" data-act="add-finding">Add finding</button></div>
    </section>
    ${state.findings.map((f, i) => findingCard(f, i)).join("")}`;
  },

  authorize() {
    const rec = recommendation(state);
    const rs = riskSummary(state);
    const pkg = packageStatus(state);
    return `<section class="card" aria-labelledby="rec-h">
      <h2 class="h4" id="rec-h">What the evidence supports</h2>
      <p><span class="tone ${tone(rec.tone)}">${esc(rec.label)}</span></p>
      <ul>${rec.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      <p class="small muted">The authorizing official decides. This reflects only the package, findings and risk register recorded here.</p>
    </section>
    <div class="grid2">
      <section class="card" aria-labelledby="pkg-h">
        <h2 class="h4" id="pkg-h">Package checklist</h2>
        <ul class="hints">${pkg.filter((d) => d.level !== "na").map((d) => `<li><a href="#/step/${itemStep(d.id)}/${d.id}">${esc(d.name)}</a><span class="pills">${levelPill(d.level)}${statusPill(d.status)}</span></li>`).join("")}</ul>
      </section>
      <section class="card" aria-labelledby="acc-h">
        <h2 class="h4" id="acc-h">Residual risks to accept</h2>
        ${rs.forAcceptance.length ? `<ul>${rs.forAcceptance.map((r) => `<li>${riskPill(r.residual)} ${esc(r.threat || "Unnamed risk")}</li>`).join("")}</ul>` : `<p class="muted small">No residual risk above low in the register.</p>`}
        <p class="small"><a href="#/report">The summary report</a> drafts the POA&amp;M from open findings.</p>
      </section>
    </div>
    <fieldset class="card"><legend>Authorization decision</legend>
      ${radios("auth.decision", "Decision", DECISIONS)}
      <div class="grid2">
        ${textField("auth.ao", "Authorizing official", { hint: state.profile.roles?.ao ? `Named in step 1: ${state.profile.roles.ao}` : "" })}
        ${textField("auth.date", "Decision date", { type: "date", rerender: true })}
        ${textField("auth.expiry", "Expiry or review date (if set by the AO)", { type: "date", rerender: true, hint: `Otherwise the tool suggests ${reauthDate(state) || "a date once the decision and date are recorded"}.` })}
      </div>
      ${textField("auth.conditions", "Conditions", { area: true, hint: "For example: close the high finding by a date; report POA&M progress monthly; no Protected B data until MFA is enforced." })}
      ${textField("auth.notes", "Other notes", { area: true })}
    </fieldset>`;
  },

  monitor() {
    const due = reauthDate(state);
    return `<div class="grid2">
      <section class="card">
        <h2 class="h4">Reauthorization</h2>
        <p>${due ? `Review the authorization by <strong>${esc(due)}</strong>${state.auth.expiry ? " (set by the AO)." : ` (decision date plus the ${esc(tier(state).label)} tier's suggested period).`}` : "Record the decision and its date in step 7 to see the review date."}</p>
        <p class="small muted">Suggested periods in this tool: Light 3 years, Standard 2 years, Enhanced 1 year, interim 6 months. Follow your departmental policy.</p>
      </section>
      <section class="card">
        <h2 class="h4">Reassess earlier when…</h2>
        <ul class="small">${REAUTH_TRIGGERS.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </section>
    </div>`;
  },
};

const itemStep = (id) => items(state).find((r) => r.item.id === id)?.item.step ?? "context";

function riskCard(r, i) {
  const rated = rateRisk(r);
  const base = `risks.${i}`;
  return `<section class="card" aria-labelledby="risk-${esc(r.id)}">
    <div class="finding-head"><h3 class="h5" id="risk-${esc(r.id)}">Risk ${i + 1}: ${esc(r.threat || "New risk")}</h3>
      <span class="pills">Inherent ${riskPill(rated.inherent)} Residual ${riskPill(rated.residual)}</span></div>
    <div class="grid2">
      ${textField(`${base}.threat`, "Threat event")}
      ${textField(`${base}.asset`, "Asset affected")}
      ${textField(`${base}.vuln`, "Vulnerability exploited")}
      ${textField(`${base}.existing`, "Existing safeguards")}
      ${selectField(`${base}.l`, "Likelihood", LIKELIHOOD.map(([n, l]) => [n, `${n} ${l}`]))}
      ${selectField(`${base}.i`, "Impact", IMPACT.map(([n, l]) => [n, `${n} ${l}`]))}
      ${selectField(`${base}.treatment`, "Treatment", TREATMENTS)}
      ${textField(`${base}.owner`, "Risk owner")}
    </div>
    ${textField(`${base}.planned`, "Planned controls", { area: true })}
    <div class="grid2">
      ${selectField(`${base}.rl`, "Residual likelihood (after planned controls)", LIKELIHOOD.map(([n, l]) => [n, `${n} ${l}`]), { blank: "Same as inherent" })}
      ${selectField(`${base}.ri`, "Residual impact", IMPACT.map(([n, l]) => [n, `${n} ${l}`]), { blank: "Same as inherent" })}
    </div>
    <button class="btn small danger" type="button" data-act="del-risk" data-i="${i}">Remove risk ${i + 1}</button>
  </section>`;
}

function findingCard(f, i) {
  const base = `findings.${i}`;
  const sev = SEVERITIES.find((s) => s.id === f.severity);
  return `<section class="card" aria-labelledby="fd-${esc(f.id)}">
    <div class="finding-head"><h3 class="h5" id="fd-${esc(f.id)}">Finding ${i + 1}: ${esc(f.title || "New finding")}</h3>
      <span class="pills">${sev ? `<span class="sev sev-${sev.rank >= 3 ? "high" : sev.rank === 2 ? "medium" : "low"}">${esc(sev.label)}</span>` : ""}<span class="pill">${esc(FINDING_STATUS.find(([k]) => k === (f.status || "open"))[1])}</span></span></div>
    ${textField(`${base}.title`, "Finding")}
    <div class="grid2">
      ${selectField(`${base}.severity`, "Severity", idOpts(SEVERITIES))}
      ${selectField(`${base}.source`, "Source", FINDING_SOURCES)}
      ${textField(`${base}.control`, "Control (e.g. AC-2)")}
      ${selectField(`${base}.status`, "Status", FINDING_STATUS, { blank: null })}
      ${textField(`${base}.owner`, "Owner")}
      ${textField(`${base}.due`, "Due date", { type: "date" })}
    </div>
    ${textField(`${base}.action`, "Remediation action", { area: true })}
    ${textField(`${base}.interim`, "Interim measures until fixed", { area: true })}
    <button class="btn small danger" type="button" data-act="del-finding" data-i="${i}">Remove finding ${i + 1}</button>
  </section>`;
}

// ---------------------------------------------------------------- report

const reportModel = () => buildReport(state, { marking: marking()?.banner ?? null });

function viewReport() {
  return `<header class="page-head no-print">
    <p class="eyebrow">Output</p>
    <h1 tabindex="-1">Summary report</h1>
    <p class="lead">A summary of the SA&amp;A for the package or a briefing, with the POA&amp;M drafted from open findings. Copy sections into your department's templates.</p>
    <div class="actions">
      <button class="btn primary" type="button" data-act="print">Print or save as PDF</button>
      <button class="btn" type="button" data-act="dl-md">Download Markdown</button>
      <button class="btn" type="button" data-act="dl-csv">Download POA&amp;M (CSV)</button>
    </div>
    ${marking()?.protected ? `<p class="callout warn small">Downloaded files carry the ${esc(marking().label)} marking but are not encrypted. Store them only where ${esc(marking().label)} information is allowed.</p>` : ""}
  </header>
  ${reportToHTML(reportModel())}`;
}

// ---------------------------------------------------------------- data and security

function viewData() {
  const s = store.settings;
  const plainOk = modeAllowed("plain", s.marking);
  return `<div class="narrow">
    <h1 tabindex="-1">Data and security</h1>
    <section class="card">
      <h2 class="h4">Where your work is kept</h2>
      <dl class="kv-list">
        <div><dt>Storage</dt><dd>${esc(MODES[s.mode].label)}</dd></div>
        <div><dt>Marking</dt><dd>${esc(MARKINGS[s.marking].label)}</dd></div>
      </dl>
      <p class="small">Nothing you enter leaves this browser: the page's Content Security Policy blocks all network connections. ${s.mode === "encrypted" ? "Your work is encrypted with AES-256-GCM using a key derived from your passphrase. It locks after 30 minutes without activity." : s.mode === "memory" ? "Your work is not saved: export it before closing the tab." : "Your work is stored unencrypted in this browser."}</p>
      <form data-form="marking" class="actions">
        <label class="block" for="marking-sel">Security marking of this SA&amp;A file
          <select id="marking-sel" name="marking">${opts(Object.entries(MARKINGS).map(([k, v]) => [k, v.label]), s.marking, null)}</select></label>
        <button class="btn" type="submit">Change marking</button>
      </form>
      ${s.mode === "encrypted" ? `<button class="btn" type="button" data-act="lock">Lock now</button>` : ""}
    </section>
    <section class="card">
      <h2 class="h4">Export</h2>
      <form data-form="export-enc" class="stack">
        <p class="small">Encrypted file, with its own passphrase (at least ${MIN_PASSPHRASE} characters), to move your work to another browser or share it with your team.</p>
        <label for="exp-p">File passphrase<input type="password" id="exp-p" name="passphrase" autocomplete="new-password"></label>
        <label for="exp-c">Confirm passphrase<input type="password" id="exp-c" name="confirm" autocomplete="new-password"></label>
        <div><button class="btn" type="submit">Download encrypted file</button></div>
      </form>
      ${plainOk ? `<p><button class="btn" type="button" data-act="export-plain">Download unencrypted JSON (Unclassified only)</button></p>` : `<p class="small muted">Unencrypted export is not available for ${esc(MARKINGS[s.marking].label)} files.</p>`}
    </section>
    <section class="card">
      <h2 class="h4">Import</h2>
      <form data-form="import" class="stack">
        <label for="imp-f">SA&amp;A Wizard file<input type="file" id="imp-f" name="file" accept=".json,application/json"></label>
        <label for="imp-p">Passphrase (encrypted files)<input type="password" id="imp-p" name="passphrase" autocomplete="off"></label>
        <p class="small">Importing replaces the SA&amp;A file in this browser.</p>
        <div><button class="btn" type="submit">Import</button></div>
      </form>
    </section>
    <section class="card">
      <h2 class="h4">Start over</h2>
      <div class="actions">
        <button class="btn" type="button" data-act="sample">Load the fictional sample system</button>
        <button class="btn danger" type="button" data-act="new">Start a new, empty SA&amp;A</button>
        <button class="btn danger" type="button" data-act="erase">Erase everything from this browser</button>
      </div>
    </section>
    <section class="card">
      <h2 class="h4">Sources</h2>
      <p class="small">Content is paraphrased from these publications. Check their current versions on canada.ca and cyber.gc.ca.</p>
      <ul class="small">${SOURCES.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    </section>
  </div>`;
}

function viewSetup() {
  return `<div class="narrow">
    <h1 tabindex="-1">Before you start</h1>
    <p class="lead">An SA&amp;A file describes the weaknesses of a government system, so treat it as at least Protected B unless you are sure it is not. Choose how this browser keeps your work.</p>
    <form data-form="setup" class="card" novalidate>
      <div id="setup-error" class="error-summary" role="alert" hidden></div>
      <fieldset id="marking-field"><legend>Security marking</legend><div class="choices stacked">
        ${Object.entries(MARKINGS).map(([k, v]) => `<label class="choice"><input type="radio" name="marking" value="${k}"${k === "pb" ? " checked" : ""}><span>${esc(v.label)}</span></label>`).join("")}
      </div></fieldset>
      <fieldset id="mode-field"><legend>Where to keep your work</legend><div class="choices stacked">
        <label class="choice"><input type="radio" name="mode" value="encrypted" checked><span>${esc(MODES.encrypted.label)}<small>Recommended. AES-256-GCM, unlocked with your passphrase.</small></span></label>
        <label class="choice"><input type="radio" name="mode" value="memory"><span>${esc(MODES.memory.label)}<small>Nothing is written. Export before closing the tab.</small></span></label>
        <label class="choice"><input type="radio" name="mode" value="plain"><span>${esc(MODES.plain.label)}<small>Refused for Protected A and B.</small></span></label>
      </div></fieldset>
      <fieldset class="pass-fields"><legend>Passphrase (encrypted storage)</legend>
        <div class="stack">
          <label for="setup-p">Passphrase, at least ${MIN_PASSPHRASE} characters<input type="password" id="setup-p" name="passphrase" autocomplete="new-password"></label>
          <label for="setup-c">Confirm passphrase<input type="password" id="setup-c" name="confirm" autocomplete="new-password"></label>
        </div>
        <p class="why">There is no recovery: if you forget it, the encrypted file cannot be opened.</p>
      </fieldset>
      <label class="check"><input type="checkbox" name="sample"> Start with the fictional sample system</label>
      <div class="actions"><button class="btn primary" type="submit">Continue</button></div>
    </form>
  </div>`;
}

function viewLock() {
  return `<div class="narrow">
    <h1 tabindex="-1">Unlock your SA&amp;A file</h1>
    <form data-form="unlock" class="card">
      <div id="unlock-error" class="error-summary" role="alert" hidden></div>
      <div class="stack"><label for="unlock-p">Passphrase<input type="password" id="unlock-p" name="passphrase" autocomplete="current-password"></label></div>
      <div class="actions"><button class="btn primary" type="submit">Unlock</button>
        <button class="btn danger" type="button" data-act="erase">Forgot it: erase and start over</button></div>
    </form>
  </div>`;
}

// ---------------------------------------------------------------- routing

const NAV = { "": "home", step: "steps", report: "report", data: "data" };

function render({ focus = true } = {}) {
  const [, view = "", a, b] = location.hash.split("/");
  const status = store.status();
  let html;
  if (status === "setup") html = viewSetup();
  else if (status === "locked") html = viewLock();
  else if (view === "step") html = viewStep(a, b);
  else if (view === "report") html = viewReport();
  else if (view === "data") html = viewData();
  else html = viewHome();
  app.innerHTML = html;
  // The CSP forbids inline style attributes; CSSOM changes are allowed.
  for (const r of app.querySelectorAll(".ring[data-deg]")) r.style.setProperty("--deg", `${r.dataset.deg}deg`);
  updateChrome(status === "ready" ? NAV[view] ?? "home" : "");
  if (focus) {
    const target = b && document.getElementById(`item-${b}`);
    if (target) { target.scrollIntoView(); target.querySelector("summary").focus(); } else {
      app.querySelector("h1")?.focus();
      window.scrollTo(0, 0);
    }
    document.title = `${app.querySelector("h1")?.textContent ?? "SA&A Wizard"} · SA&A Wizard`;
  }
}

// Re-renders the current view in place, keeping focus and scroll position.
function rerender() {
  const activeId = document.activeElement?.id;
  const open = [...app.querySelectorAll("details[open][id]")].map((d) => d.id);
  const y = window.scrollY;
  render({ focus: false });
  for (const id of open) document.getElementById(id)?.setAttribute("open", "");
  window.scrollTo(0, y);
  if (activeId) document.getElementById(activeId)?.focus({ preventScroll: true });
}

function updateChrome(nav) {
  const m = marking();
  const banner = document.getElementById("marking");
  banner.hidden = !m;
  banner.className = `marking${m?.protected ? " is-protected" : ""}`;
  banner.innerHTML = m ? `<strong>${esc(m.banner)}</strong><span>${esc(MODES[store.settings.mode].short)} · stays in this browser</span>` : "";
  for (const a of document.querySelectorAll("[data-nav]")) {
    const on = a.dataset.nav === nav;
    a.classList.toggle("active", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  }
  document.querySelector(".steps").hidden = store.status() !== "ready";
}

// ---------------------------------------------------------------- events

app.addEventListener("input", (e) => {
  const el = e.target;
  if (!el.dataset.bind || el.type === "radio" || el.tagName === "SELECT") return;
  setPath(el.dataset.bind, el.value);
  // Keep headings that echo a field in step with it without re-rendering.
  const m = el.dataset.bind.match(/^(risks|findings)\.(\d+)\.(threat|title)$/);
  if (m) {
    const h = el.closest("section")?.querySelector("h3");
    if (h) h.textContent = `${m[1] === "risks" ? "Risk" : "Finding"} ${Number(m[2]) + 1}: ${el.value || (m[1] === "risks" ? "New risk" : "New finding")}`;
  }
});

app.addEventListener("change", (e) => {
  const el = e.target;
  if (!el.dataset.bind) return;
  let v = el.value;
  if (/^(risks\.\d+\.(l|i|rl|ri))$/.test(el.dataset.bind)) v = v ? Number(v) : "";
  setPath(el.dataset.bind, v);
  if (el.dataset.rerender !== undefined) {
    rerender();
    if (el.dataset.bind.startsWith("items.")) announce(`Marked ${ITEM_STATUS.find((s) => s.id === v)?.label ?? v}`);
  }
});

app.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const act = btn.dataset.act;
  if (act === "add-threat") {
    const t = THREATS.find((x) => x.id === document.getElementById("threat-pick").value);
    if (!t) { toast("Choose a threat from the list first."); document.getElementById("threat-pick").focus(); return; }
    state.risks.push({ id: uid(), threat: t.threat, asset: t.asset, vuln: t.vuln, existing: "", l: t.l, i: t.i, treatment: "mitigate", planned: t.controls, rl: "", ri: "", owner: "" });
    save(); rerender(); focusLast("risk"); announce(`Added risk: ${t.threat}`);
  } else if (act === "add-risk") {
    state.risks.push({ id: uid(), threat: "", asset: "", vuln: "", existing: "", l: "", i: "", treatment: "", planned: "", rl: "", ri: "", owner: "" });
    save(); rerender(); focusLast("risk"); announce("Added a blank risk");
  } else if (act === "del-risk" || act === "del-finding") {
    const list = act === "del-risk" ? state.risks : state.findings;
    const kind = act === "del-risk" ? "risk" : "finding";
    if (!confirm(`Remove ${kind} ${Number(btn.dataset.i) + 1}?`)) return;
    list.splice(Number(btn.dataset.i), 1);
    save(); rerender(); document.querySelector("#panel h2")?.setAttribute("tabindex", "-1"); document.querySelector("#panel h2")?.focus(); announce(`Removed the ${kind}`);
  } else if (act === "add-finding") {
    state.findings.push({ id: uid(), title: "", source: "", severity: "", control: "", status: "open", owner: "", due: "", action: "", interim: "" });
    save(); rerender(); focusLast("finding"); announce("Added a finding");
  } else if (act === "print") {
    window.print();
  } else if (act === "dl-md") {
    download(`${slug()}-saa-summary.md`, reportToMarkdown(reportModel()), "text/markdown");
  } else if (act === "dl-csv") {
    download(`${slug()}-poam.csv`, "﻿" + poamToCSV(state, marking()?.banner), "text/csv");
  } else if (act === "lock") {
    lockNow("Locked.");
  } else if (act === "export-plain") {
    if (!modeAllowed("plain", store.settings.marking)) return;
    download(`${slug()}-saa.json`, JSON.stringify(state, null, 2), "application/json");
  } else if (act === "sample") {
    if (!confirm("Replace your current SA&A file with the fictional sample?")) return;
    state = sampleState(); save(); location.hash = "#/"; render(); toast("Sample system loaded.");
  } else if (act === "new") {
    if (!confirm("Start a new, empty SA&A? Your current file will be replaced.")) return;
    state = newState(); save(); location.hash = "#/"; render(); toast("Started a new SA&A.");
  } else if (act === "erase") {
    if (!confirm("Erase everything this tool stored in this browser? This cannot be undone.")) return;
    store.eraseAll(); state = null; location.hash = "#/"; render(); toast("Everything was erased from this browser.");
  }
});

function focusLast(kind) {
  const cards = app.querySelectorAll(`[aria-labelledby^="${kind === "risk" ? "risk-" : "fd-"}"]`);
  const card = [...cards].at(-1);
  card?.scrollIntoView();
  card?.querySelector("input, select, textarea")?.focus();
}

function formError(form, msg) {
  const box = form.querySelector(".error-summary");
  if (box) { box.hidden = false; box.textContent = msg; box.focus?.(); }
  toast(msg);
}

app.addEventListener("submit", async (e) => {
  const form = e.target;
  e.preventDefault();
  const fd = new FormData(form);
  const btn = form.querySelector("[type=submit]");
  btn.disabled = true;
  try {
    switch (form.dataset.form) {
      case "setup": {
        state = fd.get("sample") ? sampleState() : newState();
        await store.setup({ mode: fd.get("mode"), marking: fd.get("marking"), passphrase: fd.get("passphrase"), confirm: fd.get("confirm"), state });
        armAutoLock();
        location.hash = "#/";
        render();
        break;
      }
      case "unlock":
        state = normalize(await store.unlock(fd.get("passphrase")));
        armAutoLock();
        render();
        toast("Unlocked.");
        break;
      case "marking":
        store.setMarking(fd.get("marking"));
        save();
        render();
        toast(`Marking changed to ${MARKINGS[store.settings.marking].label}.`);
        break;
      case "export-enc": {
        const env = await store.exportEncrypted(state, fd.get("passphrase"), fd.get("confirm"));
        download(`${slug()}-saa-encrypted.json`, JSON.stringify(env), "application/json");
        form.reset();
        toast("Encrypted file downloaded.");
        break;
      }
      case "import": {
        const file = fd.get("file");
        if (!file || !file.size) throw new PolicyError("Choose a file to import.", "import-file");
        const { state: imported, marking: mk } = await store.importFile(await file.text(), fd.get("passphrase"));
        if (!confirm("Replace the SA&A file in this browser with the imported one?")) break;
        if (mk && MARKINGS[mk] && mk !== store.settings.marking) {
          if (!modeAllowed(store.settings.mode, mk)) throw new PolicyError(`The file is marked ${MARKINGS[mk].label}; switch to encrypted storage first.`, "import-file");
          store.setMarking(mk);
        }
        state = normalize(imported);
        save();
        location.hash = "#/";
        render();
        toast("Imported.");
        break;
      }
    }
  } catch (err) {
    if (err instanceof PolicyError || err.name === "WrongPassphraseError") formError(form, err.message);
    else { formError(form, "Something went wrong. Nothing was changed."); console.error(err); }
  } finally {
    btn.disabled = false;
  }
});

// ---------------------------------------------------------------- lock, theme, chrome

const LOCK_MINUTES = 30;
let lockTimer;
function armAutoLock() {
  clearTimeout(lockTimer);
  if (store.settings?.mode !== "encrypted" || !store.key) return;
  lockTimer = setTimeout(() => lockNow("Locked after 30 minutes without activity."), LOCK_MINUTES * 60_000);
}
for (const ev of ["pointerdown", "keydown"]) document.addEventListener(ev, () => { if (store.key) armAutoLock(); }, { passive: true });

async function lockNow(msg) {
  clearTimeout(saveTimer);
  await store.save(state);
  store.lock();
  state = null;
  render();
  toast(msg);
}

document.getElementById("toast-close").addEventListener("click", () => { document.getElementById("toast").hidden = true; });

const themeBtn = document.getElementById("theme-toggle");
function applyTheme(th) {
  if (th) document.documentElement.dataset.theme = th; else delete document.documentElement.dataset.theme;
  const dark = th ? th === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  themeBtn.setAttribute("aria-pressed", String(dark));
}
let savedTheme = null;
try { savedTheme = localStorage.getItem(KEYS.theme); } catch { /* blocked */ }
applyTheme(savedTheme);
themeBtn.addEventListener("click", () => {
  const next = themeBtn.getAttribute("aria-pressed") === "true" ? "light" : "dark";
  try { localStorage.setItem(KEYS.theme, next); } catch { /* blocked */ }
  applyTheme(next);
});

window.addEventListener("hashchange", () => render());
window.addEventListener("pagehide", () => { if (state) store.save(state); });
render();
