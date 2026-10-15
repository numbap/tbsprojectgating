// UI layer: hash routing, rendering and event handling, in English or French.
// All data stays in the browser: encrypted, in memory only, or (Unclassified
// only) unencrypted in localStorage. See js/storage.js and policies/protected-b.md.

// Refuse to run inside a frame. Any page on the same origin (on github.io, every
// project site of the same account) could otherwise read the decrypted project
// out of a framed copy. Content Security Policy frame-ancestors cannot be set from
// a <meta> tag, so this check is the available defence on static hosting.
if (window.top !== window.self) {
  document.body.textContent = "For security, the Project Gating Navigator cannot be used inside a frame. Open it directly in a browser tab. / Pour des raisons de sécurité, le Navigateur des points de contrôle de projet ne peut pas être utilisé dans un cadre. Ouvrez-le directement dans un onglet du navigateur.";
  throw new Error("Refusing to run inside a frame");
}

import {
  ANSWER_OPTIONS, APPLICABILITY, AREAS, AREA_MAP, GATES, GATE_MAP, MODELS, OVERRIDE_OPTIONS, REQUIREMENTS, REQ_MAP,
  STATE_VERSION, STATUS, analyzeText, draftStatement, evaluateAll, evaluateReq, getAnswer, governance,
  modelGateFor, newState, pcraLabel, reqsForGates, scopeContext, scoreAssessment,
} from "./engine.js";
import { TOPICS } from "./data/gates.js";
import {
  FIELD_MAP, PCRA_CATEGORIES, PCRA_LEVEL_HELP, PCRA_QUESTIONS, PROFILE_DEFAULTS, pcraEstimate, profileWarnings,
} from "./data/scoping.js";
import { KINDS, PHASES, PHASE_MAP, PROCESS_MAP, PROCESS_NODES, PROCESS_START } from "./data/process.js";
import { buildReportModel, esc, reportToCSV, reportToHTML, reportToMarkdown } from "./report.js";
import { SAMPLE_TEXT, sampleState } from "./sample.js";
import { KEYS, LOCK_OPTIONS, MARKINGS, MODES, PolicyError, Store, modeAllowed } from "./storage.js";
import { MIN_PASSPHRASE } from "./vault.js";
import { L, fmtPct, getLang, otherLang, setLang, t, tn } from "./i18n.js";

const app = document.getElementById("app");

// ------------------------------------------------------------------ language

function initialLang() {
  try {
    const saved = localStorage.getItem(KEYS.lang);
    if (saved) return saved;
  } catch { /* ignore */ }
  return (navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
}
setLang(initialLang());

// Static text in index.html carries data-i18n keys; attributes use data-i18n-attr="attr:key".
function applyStaticStrings() {
  document.documentElement.lang = getLang();
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    for (const pair of el.dataset.i18nAttr.split(";")) {
      const [attr, key] = pair.split(":");
      el.setAttribute(attr, t(key));
    }
  });
  const btn = document.getElementById("lang-toggle");
  const other = otherLang();
  btn.lang = other;
  btn.textContent = t("lang.switchTo", {}, other);
  btn.setAttribute("aria-label", t("lang.switchLabel", {}, other));
}

// ------------------------------------------------------------------ state

function migrate(s) {
  const base = newState();
  return {
    ...base, ...s,
    version: STATE_VERSION,
    profile: { ...PROFILE_DEFAULTS, ...(s.profile ?? {}) },
    pcraAnswers: s.pcraAnswers ?? {},
    answers: s.answers ?? {},
    review: { ...base.review, ...(s.review ?? {}) },
  };
}

let browserStorage = null;
try { browserStorage = window.localStorage; } catch { /* blocked: memory mode only */ }
const store = new Store(browserStorage ?? { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() {} });

// null while the setup or lock screen is showing.
let state = store.status() === "ready" ? migrate(store.loadReady() ?? newState()) : null;
let saveTimer;

function save() {
  if (!state) return;
  state.updatedAt = new Date().toISOString();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => store.save(state), 250);
}

const marking = () => MARKINGS[store.settings?.marking] ?? null;
const markLabel = () => L(marking()?.label);
const markBanner = () => L(marking()?.banner);
const isProtected = () => !!marking()?.protected;
const gov = () => governance(state.profile, state.pcraAnswers);

function setAnswer(id, patch) {
  state.answers[id] = { ...getAnswer(state, id), ...patch };
  save();
}

// ------------------------------------------------------------------ helpers

// Screen reader announcement through the polite live region (WCAG 4.1.3).
let liveTimer;
function announce(msg) {
  const live = document.getElementById("live");
  live.textContent = "";
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => { live.textContent = msg; }, 60);
}

// Visible confirmation that stays until dismissed (no time limit, WCAG 2.2.1);
// the same text is announced through the live region.
function toast(msg) {
  announce(msg);
  document.getElementById("toast-msg").textContent = msg;
  document.getElementById("toast").hidden = false;
}

function hideToast() {
  document.getElementById("toast").hidden = true;
}

document.getElementById("toast-close").addEventListener("click", hideToast);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideToast(); });

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = () => {
  const base = (state.profile.projectName || "project").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  return marking() ? `${base}-${L(marking().banner, "en").replace(/ /g, "-")}` : base;
};

// Plain-text exports cannot be encrypted (Markdown, CSV); for protected
// projects the user confirms they will store the file appropriately.
function confirmPlainExport() {
  if (!isProtected()) return true;
  return confirm(t("export.confirmPlain", { marking: markLabel() }));
}

const pct = (x) => fmtPct(x);
const list = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
const gateName = (refId) => `${t("gate.short", { n: GATE_MAP[refId].n })} · ${L(GATE_MAP[refId].short)}`;
const mgLabel = (mg) => `${mg.id} ${L(mg.name)}`;
// "Label: text", with the French typographic space before the colon.
const colon = () => (getLang() === "fr" ? " : " : ": ");

function pills(r) {
  const a = r.applicability.status;
  return `<span class="pill app-${a}" title="${esc(L(APPLICABILITY[a].help))}">${esc(L(APPLICABILITY[a].label))}</span>
    <span class="pill st-${r.status}">${esc(L(STATUS[r.status].label))}</span>`;
}

const sevBadge = (req) => `<span class="sev sev-${req.sev}" title="${esc(t("sev.title"))}">${esc(t(`sev.${req.sev}`))}</span>`;

function progressRing(value, label) {
  const deg = Math.round(value * 360);
  return `<div class="ring" data-deg="${deg}" role="img" aria-label="${esc(label)} ${pct(value)}"><span>${pct(value)}</span></div>`;
}

// ------------------------------------------------------------------ home

function viewHome() {
  const sc = scoreAssessment(state);
  const g = sc.gov;
  const mg = modelGateFor(g.model, g.nextGate);
  const started = Object.keys(state.answers).length > 0 || state.profile.projectName;
  return `
  <section class="hero">
    <div>
      <h1>${esc(t("home.title"))}</h1>
      <p class="lead">${esc(t("home.lead"))}</p>
      <p>${t("home.lenses")}</p>
      <div class="actions">
        <a class="btn primary" href="#/profile">${esc(started ? t("home.continue") : t("home.start"))}</a>
        <a class="btn" href="#/process">${esc(t("home.path"))}</a>
        <a class="btn" href="#/gates">${esc(t("home.gates"))}</a>
      </div>
    </div>
    ${started ? `<div class="hero-stats card">
      <h2 class="h4">${esc(state.profile.projectName || t("home.current"))}</h2>
      <div class="ring-row">${progressRing(sc.nextGate.score, t("home.readiness"))}<div><strong>${esc(t("home.readinessFor", { gate: mgLabel(mg) }))}</strong><br><span class="muted">${esc(t("home.assessedOf", { a: sc.nextGate.assessed, n: sc.nextGate.inScope }))}</span></div></div>
      <div class="ring-row">${progressRing(sc.overall.progress, t("home.progress"))}<div><strong>${esc(t("home.progress"))}</strong><br><span class="muted">${esc(t("home.allGates"))}</span></div></div>
      <p class="small"><span class="tone tone-${g.tb === "yes" ? "warn" : g.tb === "check" ? "check" : "ok"}">${esc(t(`home.tb.${g.tb}`))}</span></p>
    </div>` : ""}
  </section>

  <section class="steps-grid">
    <a class="card step" href="#/profile"><b>1</b><h3>${esc(t("home.s1.title"))}</h3><p>${esc(t("home.s1.text"))}</p></a>
    <a class="card step" href="#/review"><b>2</b><h3>${esc(t("home.s2.title"))}</h3><p>${esc(t("home.s2.text"))}</p></a>
    <a class="card step" href="#/assess"><b>3</b><h3>${esc(t("home.s3.title"))}</h3><p>${esc(t("home.s3.text", { n: REQUIREMENTS.length }))}</p></a>
    <a class="card step" href="#/report"><b>4</b><h3>${esc(t("home.s4.title"))}</h3><p>${esc(t("home.s4.text"))}</p></a>
  </section>

  <section class="card">
    <h2 class="h4">${esc(t("home.data"))}</h2>
    <p>${t("home.dataText", { marking: esc(markLabel()), mode: esc(L(MODES[store.settings.mode].label)) })}</p>
    <div class="actions">
      <a class="btn" href="#/security">${esc(t("home.dataLink"))}</a>
      <button class="btn" data-action="load-sample">${esc(t("home.sample"))}</button>
      <button class="btn danger" data-action="reset">${esc(t("home.reset"))}</button>
    </div>
  </section>`;
}

// ------------------------------------------------------------------ scope

function fieldHTML(f) {
  const v = state.profile[f.id] ?? "";
  let input;
  if (f.type === "text") input = `<input type="text" id="p-${f.id}" data-profile="${f.id}" value="${esc(v)}" placeholder="${esc(L(f.placeholder) ?? "")}">`;
  else if (f.type === "textarea") input = `<textarea id="p-${f.id}" data-profile="${f.id}" rows="3" placeholder="${esc(L(f.placeholder) ?? "")}">${esc(v)}</textarea>`;
  else {
    const opts = f.type === "yesno" ? [{ value: "yes", label: { en: "Yes", fr: "Oui" } }, { value: "no", label: { en: "No", fr: "Non" } }] : f.options;
    let shown = opts;
    if (f.id === "model") {
      const rec = gov().recommendedModel;
      shown = opts.map((o) => (o.value === "auto" ? { ...o, label: { en: `${o.label.en} (${MODELS[rec].name.en})`, fr: `${o.label.fr} (${MODELS[rec].name.fr})` } } : o));
    }
    input = `<div class="choices${shown.length > 4 ? " stacked" : ""}" role="radiogroup" aria-labelledby="l-${f.id}">${shown.map((o) => `
      <label class="choice"><input type="radio" name="p-${f.id}" value="${o.value}" data-profile="${f.id}" ${v === o.value ? "checked" : ""}><span>${esc(L(o.label))}</span></label>`).join("")}</div>`;
  }
  return `<div class="field">
    <label class="field-label" id="l-${f.id}" ${["text", "textarea"].includes(f.type) ? `for="p-${f.id}"` : ""}>${esc(L(f.label))}</label>
    ${input}
    <p class="why"><span>${esc(t("scope.why"))}</span> ${esc(L(f.why))}</p>
  </div>`;
}

function pcraEstimator() {
  const est = pcraEstimate(state.pcraAnswers, state.profile);
  return `<fieldset class="card" id="pcra-estimator"><legend>${esc(t("pcra.legend"))}</legend>
    <p class="why">${esc(t("pcra.intro"))}</p>
    ${PCRA_CATEGORIES.map((c) => {
      const qs = PCRA_QUESTIONS.filter((q) => q.cat === c.id);
      return `<h2 class="h5 pcra-cat">${esc(L(c.name))}</h2>${qs.map((q) => `
        <div class="field"><span class="field-label" id="l-pcra-${q.id}">${esc(L(q.label))}</span>
        <div class="choices" role="radiogroup" aria-labelledby="l-pcra-${q.id}">${q.options.map((o) => `
          <label class="choice"><input type="radio" name="pcra-${q.id}" value="${o.value}" data-pcra="${q.id}" ${String(state.pcraAnswers[q.id]) === String(o.value) ? "checked" : ""}><span>${esc(L(o.label))}</span></label>`).join("")}</div></div>`).join("")}`;
    }).join("")}
    <p class="callout info" id="pcra-result">${pcraResultText(est)}</p>
  </fieldset>`;
}

function pcraResultText(est) {
  if (!est.level) return esc(t("pcra.needMore", { n: Math.ceil(PCRA_QUESTIONS.length / 2) - est.answered }));
  return `<strong>${esc(t("pcra.result", { level: pcraLabel(est.level) }))}</strong> ${esc(t("pcra.score", { score: est.score }))} ${esc(L(PCRA_LEVEL_HELP[est.level]))}${est.floors?.includes("horizontal") ? ` ${esc(t("pcra.horizontal"))}` : ""}`;
}

function scopeSummary() {
  const g = gov();
  const ctx = scopeContext(state, g);
  const counts = { required: 0, recommended: 0, departmental: 0, na: 0 };
  const changed = [];
  for (const r of REQUIREMENTS) {
    const ev = evaluateReq(r, state, ctx);
    counts[ev.applicability.status]++;
    if (ev.applicability.status === "na") changed.push(ev);
  }
  const warnings = profileWarnings(state.profile, g);
  const tone = (v) => (v === "yes" ? "warn" : v === "check" ? "check" : "ok");
  return `
    <h2 class="h4">${esc(t("scope.summary"))}</h2>
    <dl class="gov-list">
      <div><dt>${esc(t("gov.pcra"))}</dt><dd>${esc(pcraLabel(g.pcra))}${g.pcraSource === "estimate" ? ` <span class="muted small">(${esc(t("gov.estimatedShort"))})</span>` : ""}</dd></div>
      <div><dt>${esc(t("gov.authority"))}</dt><dd><span class="tone tone-${tone(g.tb)}">${esc(t(`gov.tbShort.${g.tb}`))}</span></dd></div>
      <div><dt>${esc(t("gov.earbLabel"))}</dt><dd><span class="tone tone-${tone(g.earb)}">${esc(t(`gov.earb.${g.earb}`))}</span></dd></div>
      <div><dt>${esc(t("gov.model"))}</dt><dd>${esc(L(MODELS[g.model].name))}</dd></div>
      <div><dt>${esc(t("gov.independent"))}</dt><dd>${esc(g.independentReview ? t("gov.independentYes") : t("gov.independentNo"))}</dd></div>
    </dl>
    <div class="scope-counts">
      ${Object.entries(counts).map(([k, n]) => `<div class="sc sc-${k}"><b>${n}</b><span>${esc(L(APPLICABILITY[k].label))}</span></div>`).join("")}
    </div>
    ${warnings.length ? `<div class="callout warn">${list(warnings)}</div>` : ""}
    <details class="scope-detail"><summary>${esc(t("scope.removed", { n: changed.length }))}</summary>
      <ul class="tight">${changed.map((r) => `<li><a href="#/req/${r.req.id}">${r.req.id}</a> ${esc(L(r.req.title))}${r.applicability.reason ? `: ${esc(L(r.applicability.reason))}` : ""}</li>`).join("")}</ul>
    </details>
    <p class="small scope-link"><a href="#/report">${esc(t("scope.fullProfile"))}</a></p>`;
}

function viewProfile() {
  const groups = [
    ["grp.project", ["projectName", "dept", "sponsor", "description"]],
    ["grp.size", ["projectType", "cost", "newFunding", "horizontal", "programme"]],
    ["grp.authority", ["opmca", "limit", "pcra"]],
    ["grp.delivery", ["procurement", "delivery", "nextGate", "model"]],
    ["grp.policy", ["personalInfo", "automatedDecision", "security", "emergingTech", "publicFacing"]],
  ];
  return `
  <div class="page-head"><h1>1. ${esc(t("scope.title"))}</h1>
    <p class="lead">${esc(t("scope.lead"))}</p></div>
  <div class="split">
    <form class="profile-form" onsubmit="return false">
      ${groups.map(([key, ids]) => `<fieldset class="card"><legend>${esc(t(key))}</legend>${ids.map((id) => fieldHTML(FIELD_MAP[id])).join("")}</fieldset>${key === "grp.authority" && state.profile.pcra === "estimate" ? pcraEstimator() : ""}`).join("")}
      <div class="actions"><a class="btn primary" href="#/review">${esc(t("scope.next"))}</a><a class="btn" href="#/assess">${esc(t("scope.skip"))}</a></div>
    </form>
    <aside class="card sticky" id="scope-summary" aria-label="${esc(t("scope.summary"))}">${scopeSummary()}</aside>
  </div>`;
}

// ------------------------------------------------------------------ document review

function hintValueLabel(field, value) {
  const f = FIELD_MAP[field];
  if (f.type === "yesno") return value === "yes" ? t("yes") : t("no");
  return L(f.options?.find((o) => o.value === value)?.label) || value;
}

function viewReview() {
  const res = state.review.results;
  let results = "";
  if (res) {
    const hints = res.hints.filter((h) => state.profile[h.field] !== h.value);
    results = `
      <section class="card">
        <h2 class="h4">${esc(t("review.findings"))}</h2>
        <p>${esc(t("review.summary", { sentences: res.sentenceCount, covered: res.covered, total: REQUIREMENTS.length }))}</p>
        ${hints.length ? `<h3 class="h5">${esc(t("review.hints"))}</h3><ul class="hints">${hints.map((h) => `
          <li><div><strong>${esc(L(FIELD_MAP[h.field].label))}</strong> → ${esc(hintValueLabel(h.field, h.value))}
          <blockquote>${esc(h.evidence)}</blockquote></div>
          <button class="btn small" data-action="apply-hint" data-field="${h.field}" data-value="${esc(h.value)}" aria-label="${esc(t("review.applyLabel", { field: L(FIELD_MAP[h.field].label) }))}">${esc(t("review.apply"))}</button></li>`).join("")}</ul>` : ""}
        <div class="actions"><button class="btn" data-action="copy-evidence">${esc(t("review.copy"))}</button></div>
      </section>
      ${AREAS.map((a) => {
        const items = REQUIREMENTS.filter((r) => r.area === a.id && res.reqs[r.id]);
        if (!items.length) return "";
        return `<section class="card"><h3 class="h5">${esc(L(a.name))}</h3>${items.map((r) => {
          const m = res.reqs[r.id];
          return `<div class="finding ${m.signal}">
            <div class="finding-head"><a href="#/assess/${r.gate}/${r.id}"><strong>${r.id}</strong> ${esc(L(r.title))}</a>
            <span class="pill ${m.signal === "evidence" ? "st-met" : "st-partial"}">${esc(m.signal === "evidence" ? t("review.evidence") : t("review.caveated"))}</span></div>
            <div class="muted small">${esc(t("review.matched"))} ${m.terms.map(esc).join(", ")}</div>
            ${m.evidence.map((s) => `<blockquote>${esc(s)}</blockquote>`).join("")}
            ${m.caveats.map((s) => `<blockquote class="caveat" title="${esc(t("review.caveatTitle"))}">${esc(s)}</blockquote>`).join("")}
          </div>`;
        }).join("")}</section>`;
      }).join("")}
      <section class="card"><h3 class="h5">${esc(t("review.none"))}</h3>
        <p class="muted small">${REQUIREMENTS.filter((r) => !res.reqs[r.id] && evaluateReq(r, state).applicability.status !== "na").map((r) => `<a href="#/req/${r.id}">${r.id}</a>`).join(" · ")}</p>
        <p class="small">${esc(t("review.noneHelp"))}</p></section>`;
  }
  return `
  <div class="page-head"><h1>2. ${esc(t("review.title"))}</h1>
  <p class="lead">${esc(t("review.lead"))}</p></div>
  <section class="card">
    <label class="field-label" for="review-text">${esc(t("review.label"))}</label>
    <textarea id="review-text" rows="12" placeholder="${esc(t("review.placeholder"))}">${esc(state.review.text)}</textarea>
    <div class="actions">
      <button class="btn primary" data-action="analyze">${esc(t("review.analyze"))}</button>
      <label class="btn file-btn">${esc(t("review.load"))}<input type="file" class="sr-only" accept=".txt,.md,.markdown,.csv,.json,.html,.htm,text/*" data-action="load-text"></label>
      <button class="btn" data-action="sample-text">${esc(t("review.sample"))}</button>
      ${res ? `<button class="btn" data-action="clear-review">${esc(t("review.clear"))}</button>` : ""}
    </div>
    <p class="muted small">${esc(t("review.local"))}</p>
  </section>
  ${results}`;
}

// ------------------------------------------------------------------ gate readiness questionnaire

function sidebar(activeId) {
  const sc = scoreAssessment(state);
  const g = sc.gov;
  const next = modelGateFor(g.model, g.nextGate);
  return `<nav class="fam-nav" aria-label="${esc(t("assess.gatesNav"))}">
    <div class="fam-class">${esc(L(MODELS[g.model].name))}</div>
    ${MODELS[g.model].gates.map((mg) => {
      const s = sc.byGate[mg.id];
      return `<a href="#/assess/${mg.id}" class="${mg.id === activeId ? "active" : ""}" ${mg.id === activeId ? 'aria-current="page"' : ""}>
        <span><b>${mg.id}</b> ${esc(L(mg.name))}${mg === next ? ` <span class="pill next">${esc(t("r.next"))}</span>` : ""}</span>
        <span class="fam-prog" title="${esc(t("assess.assessedOf", { a: s.assessed, n: s.inScope }))}">${s.inScope ? `${s.assessed}/${s.inScope}` : "—"}</span></a>`;
    }).join("")}
    <p class="small muted side-note"><a href="#/profile">${esc(t("assess.changeModel"))}</a></p>
  </nav>`;
}

function lensTabs(req) {
  const tabs = [
    ["look", t("lens.look"), `<p class="muted small">${esc(t("lens.lookHelp"))}</p>${list(L(req.look))}`],
    ["rightsize", t("lens.rightsize"), `<p class="muted small">${esc(t("lens.rightsizeHelp"))}</p>${list(L(req.rightsize))}`],
    ["missing", t("lens.missing"), `<p class="muted small">${esc(t("lens.missingHelp"))}</p>${list(L(req.consequences))}`],
    ["recover", t("lens.recover"), `<p class="muted small">${esc(t("lens.recoverHelp"))}</p>${list(L(req.mitigations))}`],
    ["describe", t("lens.describe"), `<p class="muted small">${esc(t("lens.describeHelp"))}</p><blockquote>${esc(draftStatement(req, state))}</blockquote>
      <p class="small">${t("lens.describeTips")}</p>`],
  ];
  const id = (part, k) => `${req.id}-${part}-${k}`;
  return `<div class="gemba" data-gemba="${req.id}">
    <div class="tabs" role="tablist" aria-label="${esc(t("lens.label", { id: req.id }))}">${tabs.map(([k, label], i) => `<button type="button" role="tab" class="tab ${i === 0 ? "on" : ""}" id="${id("tab", k)}" aria-controls="${id("panel", k)}" data-tab="${k}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(label)}</button>`).join("")}</div>
    ${tabs.map(([k, , body], i) => `<div class="tab-panel" role="tabpanel" id="${id("panel", k)}" aria-labelledby="${id("tab", k)}" tabindex="0" data-panel="${k}" ${i === 0 ? "" : "hidden"}>${body}</div>`).join("")}
  </div>`;
}

function reqBody(req) {
  const r = evaluateReq(req, state);
  const a = r.answer;
  const out = r.applicability.status === "na" || (r.applicability.status === "departmental" && r.status === "departmental");
  const rev = state.review.results?.reqs?.[req.id];
  const questions = L(req.questions);
  return `
    <p>${esc(L(req.summary))}</p>
    <p class="muted small"><strong>${esc(t("req.source"))}</strong> ${esc(L(req.source))}</p>
    <div class="app-row">
      <label>${esc(t("req.applicability"))}
        <select data-field="applicability" data-id="${req.id}">
          <option value="">${esc(t("req.auto"))}${a.applicability ? "" : ` (${esc(L(APPLICABILITY[r.applicability.status].label))})`}</option>
          ${Object.entries(APPLICABILITY).map(([k, v]) => `<option value="${k}" ${a.applicability === k ? "selected" : ""}>${esc(L(v.label))}</option>`).join("")}
        </select></label>
      ${r.applicability.overridden ? `<span class="muted small">${esc(t("req.manual"))}</span>` : r.applicability.reason ? `<span class="muted small">${esc(L(r.applicability.reason))}</span>` : ""}
    </div>
    ${lensTabs(req)}
    ${rev ? `<div class="callout info small"><strong>${esc(t("req.fromReview"))}</strong>${[...rev.evidence, ...rev.caveats].slice(0, 3).map((s) => `<blockquote>${esc(s)}</blockquote>`).join("")}</div>` : ""}
    ${out ? `<p class="callout muted">${esc(r.applicability.status === "na" ? t("req.naNote") : t("req.deptNote"))}</p>` : `
    <div class="questions">
      <h2 class="h5">${esc(t("req.questions"))}<span class="sr-only"> ${esc(t("req.for", { id: req.id }))}</span></h2>
      ${questions.map((q, i) => `<fieldset class="q"><legend>${esc(q)}</legend><div class="seg">
        ${ANSWER_OPTIONS.map((o) => `<label class="seg-opt seg-${o.value}"><input type="radio" name="${req.id}.q${i}" value="${o.value}" data-q="${i}" data-id="${req.id}" ${a.q[i] === o.value ? "checked" : ""}><span>${esc(L(o.label))}</span></label>`).join("")}
      </div></fieldset>`).join("")}
    </div>
    <div class="grid2">
      <label>${esc(t("req.notes"))}<textarea rows="3" data-field="notes" data-id="${req.id}" placeholder="${esc(t("req.notesPh"))}">${esc(a.notes)}</textarea></label>
      <label>${esc(t("req.interim"))}<textarea rows="3" data-field="compensating" data-id="${req.id}" placeholder="${esc(t("req.interimPh"))}">${esc(a.compensating)}</textarea></label>
      <label>${esc(t("req.plan"))}<textarea rows="2" data-field="plan" data-id="${req.id}" placeholder="${esc(t("req.planPh"))}">${esc(a.plan)}</textarea></label>
      <div class="stack">
        <label>${esc(t("req.owner"))}<input type="text" data-field="owner" data-id="${req.id}" value="${esc(a.owner)}"></label>
        <label>${esc(t("req.target"))}<input type="date" data-field="target" data-id="${req.id}" value="${esc(a.target)}"></label>
        <label>${esc(t("req.override"))}
          <select data-field="override" data-id="${req.id}">
            <option value="">${esc(t("req.derive"))}</option>
            ${OVERRIDE_OPTIONS.map((k) => `<option value="${k}" ${a.override === k ? "selected" : ""}>${esc(L(STATUS[k].label))}</option>`).join("")}
          </select></label>
      </div>
    </div>`}
    <label class="block">${esc(t("req.statement"))}
      <textarea rows="4" data-field="statement" data-id="${req.id}" placeholder="${esc(t("req.statementPh"))}">${esc(a.statement)}</textarea></label>
    <div class="actions"><button type="button" class="btn small" data-action="draft" data-id="${req.id}">${esc(t("req.draft"))}</button>
    <a class="btn small ghost" href="#/req/${req.id}">${esc(t("req.openPage"))}</a></div>`;
}

function reqCard(req, open) {
  const r = evaluateReq(req, state);
  return `<details class="ctl" id="c-${req.id}" data-id="${req.id}" ${open ? "open" : ""}>
    <summary><span class="cid">${req.id}</span><span class="ctitle">${esc(L(req.title))}</span>
      ${sevBadge(req)}<span class="pills">${pills(r)}</span></summary>
    <div class="ctl-body">${open ? reqBody(req) : ""}</div>
  </details>`;
}

// The model gate for a route parameter: a model gate id (S3) or a reference gate (G5).
function resolveModelGate(param) {
  const g = gov();
  const gates = MODELS[g.model].gates;
  return gates.find((mg) => mg.id === param) ?? (GATE_MAP[param] ? modelGateFor(g.model, param) : null) ?? modelGateFor(g.model, g.nextGate);
}

function viewAssess(param, reqId) {
  const g = gov();
  const gates = MODELS[g.model].gates;
  const mg = resolveModelGate(param);
  const idx = gates.indexOf(mg);
  const next = gates[idx + 1];
  const prev = gates[idx - 1];
  const s = scoreAssessment(state).byGate[mg.id];
  const ref = mg.includes.map((id) => GATE_MAP[id]);
  const items = reqsForGates(mg.includes);
  // Gaps still open from gates before this one.
  const earlier = evaluateAll(state).filter((r) => GATES.findIndex((x) => x.id === r.req.gate) < GATES.findIndex((x) => x.id === mg.includes[0]) && ["not-met", "partial", "planned", "unknown"].includes(r.status));
  return `
  <div class="assess">
    <aside class="side">${sidebar(mg.id)}</aside>
    <section>
      <div class="page-head fam-head">
        <div><div class="eyebrow">${esc(t("assess.eyebrow"))} · ${esc(L(MODELS[g.model].name))}</div><h1>${esc(mgLabel(mg))}</h1>
        <p class="lead">${ref.map((x) => `<strong>${esc(t("gate.short", { n: x.n }))}</strong> ${esc(L(x.question))}`).join("<br>")}</p>
        <p class="gemba-tip">${ref.map((x) => esc(L(x.purpose))).join(" ")} <a href="#/gate/${ref[0].id}">${esc(t("assess.guide"))}</a></p></div>
        <div class="fam-score">${progressRing(s.score, t("assess.readiness"))}<span class="muted small">${esc(t("assess.assessedOf", { a: s.assessed, n: s.inScope }))}</span></div>
      </div>
      ${MODELS[g.model].note && mg.includes.includes("G6") ? `<p class="callout info small">${esc(L(MODELS[g.model].note))}</p>` : ""}
      ${earlier.length ? `<details class="callout warn carried"><summary>${esc(tn("assess.carried", earlier.length))}</summary>
        <ul class="tight">${earlier.map((r) => `<li><a href="#/assess/${r.req.gate}/${r.req.id}">${r.req.id}</a> ${esc(L(r.req.title))} <span class="pill st-${r.status}">${esc(L(STATUS[r.status].label))}</span></li>`).join("")}</ul></details>` : ""}
      <div class="toolbar"><button class="btn small" data-action="expand-all">${esc(t("assess.expand"))}</button><button class="btn small" data-action="collapse-all">${esc(t("assess.collapse"))}</button></div>
      <div class="ctl-list">${items.map((r) => reqCard(r, r.id === reqId)).join("")}</div>
      <div class="actions pager">
        ${prev ? `<a class="btn" href="#/assess/${prev.id}"><span aria-hidden="true">←</span> ${esc(mgLabel(prev))}</a>` : `<a class="btn" href="#/review"><span aria-hidden="true">←</span> ${esc(t("nav.review"))}</a>`}
        ${next ? `<a class="btn primary" href="#/assess/${next.id}">${esc(mgLabel(next))} <span aria-hidden="true">→</span></a>` : `<a class="btn primary" href="#/report">${esc(t("assess.toReport"))} <span aria-hidden="true">→</span></a>`}
      </div>
    </section>
  </div>`;
}

// ------------------------------------------------------------------ requirements library

let libQuery = "";
let libArea = "";
let libGate = "";

function libraryItems(query, area, gate) {
  const q = query.toLowerCase();
  return REQUIREMENTS.filter((r) => (!area || r.area === area) && (!gate || r.gate === gate) &&
    (!q || [r.id, L(r.title), L(r.summary), ...L(r.rightsize), ...r.keywords.en, ...r.keywords.fr, L(r.source)].join(" ").toLowerCase().includes(q)));
}

function libraryResults(items) {
  const ctx = scopeContext(state);
  return items.map((req) => {
    const r = evaluateReq(req, state, ctx);
    return `<a class="card lib-item" href="#/req/${req.id}">
      <div class="lib-top"><span class="cid">${req.id}</span>${sevBadge(req)}${pills(r)}</div>
      <h2 class="h5">${esc(L(req.title))}</h2><p class="small muted">${esc(L(req.summary))}</p>
      <p class="small"><strong>${esc(gateName(req.gate))}</strong> · ${esc(t("lens.rightsize"))}: ${esc(L(req.rightsize)[0])}</p></a>`;
  }).join("") || `<p>${esc(t("lib.none"))}</p>`;
}

function updateLibrary() {
  const items = libraryItems(libQuery, libArea, libGate);
  document.getElementById("lib-results").innerHTML = libraryResults(items);
  document.getElementById("lib-count").textContent = tn("lib.count", items.length);
  clearTimeout(updateLibrary.t);
  updateLibrary.t = setTimeout(() => announce(tn("lib.found", items.length)), 400);
}

function viewLibrary() {
  const items = libraryItems(libQuery, libArea, libGate);
  return `
  <div class="page-head"><h1>${esc(t("lib.title"))}</h1>
    <p class="lead">${esc(t("lib.lead"))}</p></div>
  <div class="filters card">
    <label class="sr-only" for="lib-q">${esc(t("lib.search"))}</label><input type="search" id="lib-q" placeholder="${esc(t("lib.searchPh"))}" value="${esc(libQuery)}">
    <select id="lib-area" aria-label="${esc(t("lib.byArea"))}"><option value="">${esc(t("lib.allAreas"))}</option>${AREAS.map((a) => `<option value="${a.id}" ${libArea === a.id ? "selected" : ""}>${esc(L(a.name))}</option>`).join("")}</select>
    <select id="lib-gate" aria-label="${esc(t("lib.byGate"))}"><option value="">${esc(t("lib.allGates"))}</option>${GATES.map((g) => `<option value="${g.id}" ${libGate === g.id ? "selected" : ""}>${esc(gateName(g.id))}</option>`).join("")}</select>
    <span class="muted small" id="lib-count">${esc(tn("lib.count", items.length))}</span>
  </div>
  <div class="lib-grid" id="lib-results">${libraryResults(items)}</div>`;
}

function viewReq(id) {
  const req = REQ_MAP[id];
  if (!req) return `<div class="page-head"><h1>${esc(t("req.unknownTitle"))}</h1></div><p>${esc(t("req.unknown", { id }))} <a href="#/library">${esc(t("req.back"))}</a></p>`;
  const area = AREA_MAP[req.area];
  const r = evaluateReq(req, state);
  const i = REQUIREMENTS.indexOf(req);
  const prev = REQUIREMENTS[i - 1];
  const next = REQUIREMENTS[i + 1];
  const keywords = [...new Set(L(req.keywords))];
  return `
  <div class="page-head">
    <div class="eyebrow"><a href="#/library">${esc(t("lib.title"))}</a> / ${esc(L(area.name))}</div>
    <h1>${req.id}${colon()}${esc(L(req.title))}</h1>
    <div class="pills">${pills(r)} ${sevBadge(req)}</div>
    <p class="lead">${esc(L(req.summary))}</p>
    <p class="small"><strong>${esc(t("req.source"))}</strong> ${esc(L(req.source))}</p>
    <p class="small"><strong>${esc(t("req.expected"))}</strong> <a href="#/gate/${req.gate}">${esc(gateName(req.gate))}</a>${req.revisit.length ? ` · ${esc(t("req.revisited"))} ${req.revisit.map((g) => `<a href="#/gate/${g}">${esc(t("gate.short", { n: GATE_MAP[g].n }))}</a>`).join(", ")}` : ""}</p>
    ${r.applicability.reason ? `<p class="callout info">${esc(L(r.applicability.reason))}</p>` : ""}
  </div>
  <div class="gemba-page">
    <section class="card g-look"><h2 class="h4">${esc(t("lens.look"))}</h2><p class="muted small">${esc(t("lens.lookHelp"))}</p>${list(L(req.look))}</section>
    <section class="card g-elim"><h2 class="h4">${esc(t("lens.rightsize"))}</h2><p class="muted small">${esc(t("lens.rightsizeHelp"))}</p>${list(L(req.rightsize))}</section>
    <section class="card g-break"><h2 class="h4">${esc(t("lens.missing"))}</h2><p class="muted small">${esc(t("lens.missingHelp"))}</p>${list(L(req.consequences))}</section>
    <section class="card g-mit"><h2 class="h4">${esc(t("lens.recover"))}</h2><p class="muted small">${esc(t("lens.recoverHelp"))}</p>${list(L(req.mitigations))}</section>
    <section class="card g-desc wide"><h2 class="h4">${esc(t("lens.describe"))}</h2>
      <p class="muted small">${esc(t("lens.describePage"))}</p>
      <blockquote>${esc(draftStatement(req, state))}</blockquote>
      <p class="small">${t("lens.describeTips")}</p></section>
    <section class="card g-ask wide"><h2 class="h4">${esc(t("lens.ask"))}</h2><p class="muted small">${esc(t("lens.askHelp"))}</p>${list(L(req.questions))}
      <p class="small muted">${esc(t("lens.keywords"))} ${keywords.map((k) => `<code>${esc(k.replace(/\*$/, ""))}</code>`).join(" ")}</p></section>
  </div>
  <div class="actions pager">
    ${prev ? `<a class="btn" href="#/req/${prev.id}"><span aria-hidden="true">←</span> ${prev.id}</a>` : "<span></span>"}
    <a class="btn primary" href="#/assess/${req.gate}/${req.id}">${esc(t("req.assess"))}</a>
    ${next ? `<a class="btn" href="#/req/${next.id}">${next.id} <span aria-hidden="true">→</span></a>` : "<span></span>"}
  </div>`;
}

// ------------------------------------------------------------------ gate guide

function viewGates() {
  const g = gov();
  return `
  <div class="page-head"><h1>${esc(t("gates.title"))}</h1>
    <p class="lead">${esc(t("gates.lead"))}</p></div>
  <section class="card">
    <h2 class="h4">${esc(t("gates.models"))}</h2>
    <p>${esc(t("gates.modelsIntro"))}</p>
    <div class="models">${Object.entries(MODELS).map(([id, m]) => `
      <div class="model ${id === g.model ? "is-current" : ""}">
        <h3 class="h5">${esc(L(m.name))}${id === g.recommendedModel ? ` <span class="pill next">${esc(t("gov.recommended"))}</span>` : ""}</h3>
        <p class="small muted">${esc(L(m.when))}</p>
        <ol class="model-gates">${m.gates.map((mg) => `<li><strong>${mg.id}</strong> ${esc(L(mg.name))} <span class="muted small">(${mg.includes.map((x) => GATE_MAP[x].n).join(" + ")})</span></li>`).join("")}</ol>
        ${m.note ? `<p class="small">${esc(L(m.note))}</p>` : ""}
      </div>`).join("")}</div>
  </section>
  <div class="lib-grid">${GATES.map((x) => `<a class="card lib-item" href="#/gate/${x.id}">
      <div class="lib-top"><span class="cid">${esc(t("gate.short", { n: x.n }))}</span>${g.model === "full" ? "" : `<span class="pill">${esc(mgLabel(modelGateFor(g.model, x.id)))}</span>`}</div>
      <h2 class="h5">${esc(L(x.name))}</h2><p class="small"><em>${esc(L(x.question))}</em></p><p class="small muted">${esc(L(x.purpose))}</p></a>`).join("")}</div>
  <p class="small muted">${esc(t("gates.source"))}</p>`;
}

function viewGate(id) {
  const x = GATE_MAP[id];
  if (!x) return `<div class="page-head"><h1>${esc(t("gates.title"))}</h1></div><p><a href="#/gates">${esc(t("gates.back"))}</a></p>`;
  const g = gov();
  const ctx = scopeContext(state, g);
  const due = reqsForGates([x.id]).map((r) => evaluateReq(r, state, ctx));
  const revisit = REQUIREMENTS.filter((r) => r.revisit.includes(x.id)).map((r) => evaluateReq(r, state, ctx));
  const i = GATES.indexOf(x);
  const row = (r) => `<li><a href="#/req/${r.req.id}"><span class="cid">${r.req.id}</span> ${esc(L(r.req.title))}</a> ${pills(r)}</li>`;
  const block = (title, body, cls = "") => `<section class="proc-sec ${cls}"><h2 class="h5">${esc(title)}</h2>${body}</section>`;
  return `
  <div class="page-head">
    <div class="eyebrow"><a href="#/gates">${esc(t("gates.title"))}</a> / ${esc(mgLabel(modelGateFor(g.model, x.id)))}</div>
    <h1>${esc(t("gate.short", { n: x.n }))}${colon()}${esc(L(x.name))}</h1>
    <p class="lead"><em>${esc(L(x.question))}</em></p>
    <p>${esc(L(x.purpose))}</p>
  </div>
  <div class="card"><div class="proc-grid">
    ${block(t("gate.decision"), `<p>${esc(L(x.decision))}</p>`, "wide")}
    ${block(t("gate.gatekeepers"), list(L(x.gatekeepers)))}
    ${block(t("gate.deliverables"), list(L(x.deliverables)))}
    ${block(t("gate.topics"), list(x.topics.map((k) => L(TOPICS[k]))))}
    ${block(t("gate.pitfalls"), list(L(x.pitfalls)), "warn")}
    ${block(t("gate.due"), `<ul class="proc-ctls">${due.map(row).join("")}</ul>`, "wide")}
    ${revisit.length ? block(t("gate.revisit"), `<ul class="proc-ctls">${revisit.map(row).join("")}</ul>`, "wide") : ""}
  </div></div>
  <div class="actions pager">
    ${GATES[i - 1] ? `<a class="btn" href="#/gate/${GATES[i - 1].id}"><span aria-hidden="true">←</span> ${esc(t("gate.short", { n: x.n - 1 }))}</a>` : "<span></span>"}
    <a class="btn primary" href="#/assess/${x.id}">${esc(t("gate.check"))}</a>
    ${GATES[i + 1] ? `<a class="btn" href="#/gate/${GATES[i + 1].id}">${esc(t("gate.short", { n: x.n + 1 }))} <span aria-hidden="true">→</span></a>` : "<span></span>"}
  </div>`;
}

// ------------------------------------------------------------------ governance path (decision tree)

// The path taken through the decision tree in this tab: [{ id, choice }].
// Kept in memory only; it contains no project data.
let procPath = [];
let procPending = null;

function trackPath(id) {
  const p = procPending;
  procPending = null;
  if (p?.jump !== undefined) procPath = procPath.slice(0, p.jump + 1);
  else if (!p && procPath.at(-2)?.id === id) { procPath.pop(); return; } // browser Back
  const last = procPath.at(-1);
  if (last?.id === id) return; // re-render of the same step
  if (last && p?.from === last.id) last.choice = p.choice;
  procPath.push({ id });
  if (procPath.length > 100) procPath = procPath.slice(-100);
}

const procList = (items, tag = "ul") => `<${tag}>${L(items).map((i) => `<li>${esc(i)}</li>`).join("")}</${tag}>`;
const kindBadge = (n) => `<span class="kind kind-${n.kind}"><span aria-hidden="true">${KINDS[n.kind].icon}</span> ${esc(L(KINDS[n.kind].label))}</span>`;

function procDetails(n) {
  const block = (title, body, cls = "") => `<section class="proc-sec ${cls}"><h3 class="h5">${esc(title)}</h3>${body}</section>`;
  const parts = [];
  const has = (x) => x && L(x).length;
  if (has(n.who)) parts.push(block(t("proc.who"), procList(n.who)));
  if (has(n.inputs)) parts.push(block(t("proc.inputs"), procList(n.inputs)));
  if (has(n.tasks)) parts.push(block(n.kind === "outcome" ? t("proc.todo") : t("proc.tasks"), procList(n.tasks, "ol"), "wide"));
  if (has(n.outputs)) parts.push(block(t("proc.outputs"), procList(n.outputs)));
  if (has(n.evidence)) parts.push(block(t("proc.evidence"), procList(n.evidence)));
  if (has(n.pitfalls)) parts.push(block(t("proc.pitfalls"), procList(n.pitfalls), "warn"));
  if (n.reqs?.length) parts.push(block(t("proc.reqs"), `<ul class="proc-ctls">${n.reqs.map((id) => `<li><a href="#/req/${id}"><span class="cid">${id}</span> ${esc(L(REQ_MAP[id]?.title))}</a></li>`).join("")}</ul>`));
  if (has(n.refs)) parts.push(block(t("proc.refs"), procList(n.refs)));
  return parts.length ? `<div class="proc-grid">${parts.join("")}</div>` : "";
}

function procMap(currentId) {
  const visited = new Set(procPath.map((p) => p.id));
  return PHASES.map((ph) => {
    const nodes = PROCESS_NODES.filter((n) => n.phase === ph.id);
    return `<section class="proc-map-phase"><h3 class="h5">${esc(L(ph.name))} <span class="muted small">${esc(L(ph.ref))}</span></h3>
      <ul class="proc-map-list">${nodes.map((n) => {
        const edges = n.kind === "question"
          ? `<ul class="proc-edges">${n.options.map((o) => `<li>${esc(L(o.label))} → <a href="#/process/${o.next}">${esc(L(PROCESS_MAP[o.next].title))}</a></li>`).join("")}</ul>`
          : n.next ? `<p class="proc-edges">${esc(t("proc.then"))} → <a href="#/process/${n.next}">${esc(L(PROCESS_MAP[n.next].title))}</a></p>` : "";
        const st = n.id === currentId ? " is-current" : visited.has(n.id) ? " is-visited" : "";
        return `<li class="proc-map-item${st}"><a class="proc-chip kind-${n.kind}" href="#/process/${n.id}" ${n.id === currentId ? 'aria-current="location"' : ""}><span aria-hidden="true">${KINDS[n.kind].icon}</span> ${esc(L(n.title))}<span class="sr-only">, ${esc(L(KINDS[n.kind].label).toLowerCase())}${st === " is-visited" ? `, ${esc(t("proc.visited"))}` : ""}</span></a>${edges}</li>`;
      }).join("")}</ul></section>`;
  }).join("");
}

function viewProcess(id) {
  const n = PROCESS_MAP[id || PROCESS_START];
  if (!n) return `<div class="page-head"><h1>${esc(t("proc.title"))}</h1></div><p>${esc(t("proc.unknown", { id }))} <a href="#/process">${esc(t("proc.restart"))}</a></p>`;
  if (!id) procPath = []; // the tree's entry point always starts a new path
  trackPath(n.id);
  const phase = PHASE_MAP[n.phase];
  const phaseIndex = PHASES.indexOf(phase);
  const prev = procPath.at(-2);
  const total = PROCESS_NODES.length;
  const questions = PROCESS_NODES.filter((x) => x.kind === "question").length;

  let body = "";
  if (n.kind === "question") {
    body = `<h3 class="h5" id="proc-choose">${esc(t("proc.choose"))}</h3>
      <ul class="proc-options" aria-labelledby="proc-choose">${n.options.map((o, i) => `<li><a class="proc-opt" href="#/process/${o.next}" data-from="${n.id}" data-choice="${i}">
        <strong>${esc(L(o.label))}</strong><span>${esc(L(o.help))}</span><span class="proc-to"><span aria-hidden="true">→</span> ${esc(L(PROCESS_MAP[o.next].title))}</span></a></li>`).join("")}</ul>`;
  }
  const actions = [];
  if (n.next) actions.push(`<a class="btn primary" href="#/process/${n.next}" data-from="${n.id}">${esc(t("proc.continue", { title: L(PROCESS_MAP[n.next].title) }))} <span aria-hidden="true">→</span></a>`);
  if (n.app) actions.push(`<a class="btn" href="${n.app.href}">${esc(L(n.app.label))}</a>`);
  if (prev) actions.push(`<a class="btn" href="#/process/${prev.id}" data-path="${procPath.length - 2}"><span aria-hidden="true">←</span> ${esc(t("proc.back"))}<span class="sr-only">: ${esc(L(PROCESS_MAP[prev.id].title))}</span></a>`);
  if (n.kind === "outcome") actions.push(`<a class="btn primary" href="#/process" data-path="-1">${esc(t("proc.again"))}</a>`);

  return `
  <div class="page-head">
    <h1>${esc(t("proc.title"))}</h1>
    <p class="lead">${esc(t("proc.lead"))}</p>
  </div>
  <nav class="proc-phases" aria-label="${esc(t("proc.phases"))}"><ol>${PHASES.map((p, i) => {
    const first = PROCESS_NODES.find((x) => x.phase === p.id);
    const cls = i === phaseIndex ? "is-current" : "";
    return `<li><a class="${cls}" href="#/process/${first.id}" ${i === phaseIndex ? 'aria-current="step"' : ""}>${esc(L(p.name))}</a></li>`;
  }).join("")}</ol></nav>
  <div class="proc">
    <section class="card proc-node kind-${n.kind}" id="proc-node" aria-labelledby="proc-title">
      <p class="eyebrow">${esc(L(phase.name))} · ${esc(L(phase.ref))}</p>
      <p class="proc-kind">${kindBadge(n)}</p>
      <h2 id="proc-title" tabindex="-1">${esc(L(n.title))}</h2>
      <p class="proc-summary">${esc(L(n.summary))}</p>
      ${body}
      ${procDetails(n)}
      ${actions.length ? `<div class="actions">${actions.join("")}</div>` : ""}
    </section>
    <aside class="card proc-path" aria-labelledby="proc-path-h">
      <h2 class="h5" id="proc-path-h">${esc(t("proc.path"))}</h2>
      <ol class="proc-trail">${procPath.map((p, i) => {
        const pn = PROCESS_MAP[p.id];
        const choice = p.choice !== undefined && pn.kind === "question" ? `<span class="proc-choice">${esc(L(pn.options[p.choice]?.label))}</span>` : "";
        return i === procPath.length - 1
          ? `<li aria-current="step"><strong>${esc(L(pn.title))}</strong></li>`
          : `<li><a href="#/process/${p.id}" data-path="${i}">${esc(L(pn.title))}</a>${choice}</li>`;
      }).join("")}</ol>
      ${procPath.length > 1 ? `<a class="btn small" href="#/process" data-path="-1">${esc(t("proc.over"))}</a>` : `<p class="muted small">${esc(t("proc.pathHelp"))}</p>`}
    </aside>
  </div>
  <section class="card proc-map-wrap">
    <h2 class="h4">${esc(t("proc.whole"))}</h2>
    <p class="muted small">${esc(t("proc.stats", { total, phases: PHASES.length, questions }))} <span aria-hidden="true">${KINDS.question.icon}</span> ${esc(L(KINDS.question.label).toLowerCase())}, <span aria-hidden="true">${KINDS.step.icon}</span> ${esc(L(KINDS.step.label).toLowerCase())}, <span aria-hidden="true">${KINDS.outcome.icon}</span> ${esc(L(KINDS.outcome.label).toLowerCase())}. ${esc(t("proc.jump"))}</p>
    <details class="proc-map"><summary>${esc(t("proc.show"))}</summary>${procMap(n.id)}</details>
  </section>
  <p class="small muted">${esc(t("proc.disclaimer"))}</p>`;
}

// ------------------------------------------------------------------ report

function viewReport() {
  const m = buildReportModel(state, { marking: markBanner() || null });
  return `
  <div class="page-head no-print"><h1>4. ${esc(t("report.title"))}</h1>
    <p class="lead">${esc(t("report.lead"))}</p>
    <div class="actions">
      <button class="btn primary" data-action="print">${esc(t("report.print"))}</button>
      <button class="btn" data-action="export-md">${esc(t("report.md"))}</button>
      <button class="btn" data-action="export-csv">${esc(t("report.csv"))}</button>
    </div>
    ${isProtected() ? `<p class="small">${esc(t("report.protected", { marking: markLabel() }))}</p>` : ""}</div>
  <div class="card">${reportToHTML(m)}</div>`;
}

// ------------------------------------------------------------------ data protection views

const radios = (name, options, checked, extra = () => "") => `<div class="choices stacked">${options.map(([value, label, hint]) => `
  <label class="choice"><input type="radio" name="${name}" value="${value}" ${value === checked ? "checked" : ""} ${extra(value)}><span>${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ""}</span></label>`).join("")}</div>`;

const markingOptions = () => [
  ["pb", L(MARKINGS.pb.label), t("setup.pbHint")],
  ["pa", L(MARKINGS.pa.label), ""],
  ["unclassified", L(MARKINGS.unclassified.label), ""],
];
const modeOptions = () => [
  ["encrypted", L(MODES.encrypted.label), t("setup.encHint")],
  ["memory", L(MODES.memory.label), t("setup.memHint")],
  ["plain", L(MODES.plain.label), t("setup.plainHint")],
];

function passFields(prefix, { legend = t("pass.legend"), current = false, confirmField = true, hidden = false } = {}) {
  const auto = current ? "current-password" : "new-password";
  return `<fieldset class="pass-fields" id="${prefix}-fields" ${hidden ? "hidden" : ""}><legend>${esc(legend)}</legend>
    ${current ? "" : `<p class="why" id="${prefix}-hint">${esc(t("pass.hint", { n: MIN_PASSPHRASE }))}</p>`}
    <div class="field"><label class="field-label" for="${prefix}">${esc(t("pass.label"))}</label>
      <input type="password" id="${prefix}" name="${prefix}" autocomplete="${auto}" spellcheck="false" ${current ? "" : `aria-describedby="${prefix}-hint"`}></div>
    ${confirmField ? `<div class="field"><label class="field-label" for="${prefix}-2">${esc(t("pass.confirm"))}</label>
      <input type="password" id="${prefix}-2" name="${prefix}-2" autocomplete="${auto}" spellcheck="false"></div>` : ""}
    <label class="check"><input type="checkbox" data-action="show-pass" data-target="${prefix}"> ${esc(t("pass.show"))}</label>
  </fieldset>`;
}

function viewSetup() {
  const legacy = store.hasLegacyPlain();
  return `
  <div class="page-head"><h1>${esc(t("setup.title"))}</h1>
    <p class="lead">${esc(t("setup.lead"))}</p></div>
  ${legacy ? `<p class="callout warn">${esc(t("setup.legacy"))}</p>` : ""}
  ${store.available ? "" : `<p class="callout warn">${esc(t("setup.noStorage"))}</p>`}
  <form id="setup-form" class="card narrow" novalidate>
    <div class="form-errors"></div>
    <fieldset id="marking-field"><legend>${esc(t("setup.marking"))}</legend>${radios("marking", markingOptions(), "pb")}</fieldset>
    <fieldset id="mode-field"><legend>${esc(t("setup.mode"))}</legend>${radios("mode", modeOptions(), store.available ? "encrypted" : "memory")}</fieldset>
    ${passFields("setup-pass", { hidden: !store.available })}
    <button class="btn primary" type="submit">${esc(t("setup.continue"))}</button>
  </form>
  <p class="narrow small">${t("setup.policies")}</p>`;
}

function viewLock() {
  return `
  <div class="page-head"><h1>${esc(t("lock.title"))}</h1>
    <p class="lead">${esc(t("lock.lead"))}</p></div>
  <form id="unlock-form" class="card narrow" novalidate>
    <div class="form-errors"></div>
    ${passFields("unlock-pass", { legend: t("lock.unlock"), current: true, confirmField: false })}
    <button class="btn primary" type="submit">${esc(t("lock.unlock"))}</button>
  </form>
  <section class="card narrow" aria-labelledby="forgot-h"><h2 class="h5" id="forgot-h">${esc(t("lock.forgot"))}</h2>
    <p>${esc(t("lock.forgotText"))}</p>
    <button type="button" class="btn danger" data-action="erase-all">${esc(t("lock.erase"))}</button></section>`;
}

function lockLabel(m) {
  if (!m) return t("sec.never");
  if (m >= 60) return tn("sec.hours", m / 60);
  return t("sec.minutes", { n: m });
}

function viewSecurity() {
  const st = store.settings;
  const enc = st.mode === "encrypted";
  return `
  <div class="page-head"><h1>${esc(t("sec.title"))}</h1>
    <p class="lead">${esc(t("sec.lead"))}</p></div>
  <section class="card" aria-labelledby="sec-status"><h2 class="h4" id="sec-status">${esc(t("sec.current"))}</h2>
    <dl class="kv-list">
      <div><dt>${esc(t("sec.marking"))}</dt><dd>${esc(markLabel())}</dd></div>
      <div><dt>${esc(t("sec.storage"))}</dt><dd>${esc(L(MODES[st.mode].label))}</dd></div>
      <div><dt>${esc(t("sec.autolock"))}</dt><dd>${esc(enc ? (st.lockMinutes ? t("sec.after", { time: lockLabel(st.lockMinutes) }) : t("sec.off")) : t("sec.notEnc"))}</dd></div>
    </dl>
    <p class="small">${t("sec.policies")}</p></section>

  <form id="marking-form" class="card" novalidate><h2 class="h4">${esc(t("sec.marking"))}</h2><div class="form-errors"></div>
    <fieldset id="marking-field"><legend>${esc(t("sec.markingLegend"))}</legend>${radios("marking", markingOptions(), st.marking)}</fieldset>
    <button class="btn" type="submit">${esc(t("sec.saveMarking"))}</button></form>

  <form id="mode-form" class="card" novalidate><h2 class="h4">${esc(t("sec.storage"))}</h2><div class="form-errors"></div>
    <fieldset id="mode-field"><legend>${esc(t("setup.mode"))}</legend>${radios("mode", modeOptions(), st.mode)}</fieldset>
    ${passFields("mode-pass", { legend: t("sec.modePass"), hidden: true })}
    <p class="small muted">${esc(t("sec.modeNote"))}</p>
    <button class="btn" type="submit">${esc(t("sec.changeStorage"))}</button></form>

  ${enc ? `<form id="pass-form" class="card" novalidate><h2 class="h4">${esc(t("sec.changePass"))}</h2><div class="form-errors"></div>
    ${passFields("new-pass", { legend: t("sec.newPass") })}
    <button class="btn" type="submit">${esc(t("sec.changePass"))}</button></form>

  <form id="lock-form" class="card" novalidate><h2 class="h4">${esc(t("sec.autolock"))}</h2><div class="form-errors"></div>
    <div class="field"><label class="field-label" for="lock-min">${esc(t("sec.lockAfter"))}</label>
    <select id="lock-min" name="lock-min">${LOCK_OPTIONS.map((m) => `<option value="${m}" ${m === st.lockMinutes ? "selected" : ""}>${esc(lockLabel(m))}</option>`).join("")}</select></div>
    <p class="why">${esc(t("sec.lockWhy"))}</p>
    <button class="btn" type="submit">${esc(t("sec.saveLock"))}</button></form>` : ""}

  <form id="export-form" class="card" novalidate><h2 class="h4">${esc(t("sec.export"))}</h2><div class="form-errors"></div>
    <p>${esc(t("sec.exportText"))}</p>
    ${passFields("export-pass", { legend: t("sec.exportPass") })}
    <div class="actions"><button class="btn primary" type="submit">${esc(t("sec.exportEnc"))}</button>
    <button type="button" class="btn" data-action="export-json">${esc(t("sec.exportPlain"))}</button></div></form>

  <form id="import-form" class="card" novalidate><h2 class="h4">${esc(t("sec.import"))}</h2><div class="form-errors"></div>
    <div class="field"><label class="field-label" for="import-file">${esc(t("sec.importFile"))}</label>
      <input type="file" id="import-file" name="import-file" accept="application/json,.json"></div>
    <div class="field"><label class="field-label" for="import-pass">${esc(t("sec.importPass"))}</label>
      <input type="password" id="import-pass" name="import-pass" autocomplete="off" spellcheck="false"></div>
    <p class="small muted">${esc(t("sec.importNote"))}</p>
    <button class="btn" type="submit">${esc(t("sec.import"))}</button></form>

  <section class="card" aria-labelledby="erase-h"><h2 class="h4" id="erase-h">${esc(t("sec.erase"))}</h2>
    <p>${esc(t("sec.eraseText"))}</p>
    ${enc ? `<div class="actions"><button type="button" class="btn" data-action="lock-now">${esc(t("sec.lockNow"))}</button>` : `<div class="actions">`}
    <button type="button" class="btn danger" data-action="erase-all">${esc(t("sec.eraseAll"))}</button></div></section>`;
}

// Accessible form errors: a summary that takes focus, linked to each field,
// plus aria-invalid and an inline message on the field itself (WCAG 3.3.1, 3.3.3).
const FIELD_TARGET = {
  marking: "[name=marking]", mode: "[name=mode]", passphrase: "input[type=password]", lock: "#lock-min",
  "export-passphrase": "#export-pass", "import-file": "#import-file", "import-passphrase": "#import-pass",
};

function clearErrors(form) {
  form.querySelector(".form-errors").innerHTML = "";
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  form.querySelectorAll(".field-error").forEach((el) => el.remove());
}

function showError(form, err) {
  clearErrors(form);
  const target = form.querySelector(FIELD_TARGET[err.field] ?? "input, select") ?? form.querySelector("input, select");
  const id = target?.id || `${form.id}-err-target`;
  if (target && !target.id) target.id = id;
  const msgId = `${form.id}-error`;
  if (target) {
    target.setAttribute("aria-invalid", "true");
    const host = target.closest("fieldset") ?? target.closest(".field") ?? target.parentElement;
    host.insertAdjacentHTML("afterbegin", `<p class="field-error" id="${msgId}">${esc(err.message)}</p>`);
    const described = (target.getAttribute("aria-describedby") ?? "").split(" ").filter((x) => x && x !== msgId);
    target.setAttribute("aria-describedby", [msgId, ...described].join(" "));
  }
  const box = form.querySelector(".form-errors");
  box.innerHTML = `<div class="error-summary" role="alert" tabindex="-1"><h2 class="h5">${esc(t("err.title"))}</h2>
    <ul><li><a href="#${id}" data-focus="${id}">${esc(err.message)}</a></li></ul></div>`;
  box.firstElementChild.focus();
}

async function busy(form, fn) {
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  form.setAttribute("aria-busy", "true");
  try { await fn(); } catch (e) {
    if (e instanceof PolicyError || e.name === "WrongPassphraseError") showError(form, e instanceof PolicyError ? e : new PolicyError(t("err.wrongPass"), "passphrase"));
    else showError(form, new PolicyError(e.message || t("err.generic"), ""));
  } finally {
    if (form.isConnected) { btn.disabled = false; form.removeAttribute("aria-busy"); }
  }
}

const formValue = (form, name) => new FormData(form).get(name) ?? "";

async function onSubmit(form) {
  const v = (n) => formValue(form, n);
  switch (form.id) {
    case "setup-form": return busy(form, async () => {
      const legacy = store.legacyState();
      const initial = migrate(legacy ?? newState());
      await store.setup({ mode: v("mode"), marking: v("marking"), passphrase: v("setup-pass"), confirm: v("setup-pass-2"), state: initial });
      state = initial;
      afterUnlock(t("msg.ready", { mode: L(MODES[store.settings.mode].label) }));
    });
    case "unlock-form": return busy(form, async () => {
      state = migrate(await store.unlock(v("unlock-pass")));
      afterUnlock(t("msg.unlocked"));
    });
    case "marking-form": return busy(form, async () => {
      store.setMarking(v("marking"));
      await store.save(state);
      updateChrome(); rerender(); toast(t("msg.marking", { marking: markLabel() }));
    });
    case "mode-form": return busy(form, async () => {
      const mode = v("mode");
      if (mode === store.settings.mode) throw new PolicyError(t("err.sameMode", { mode: L(MODES[mode].label) }), "mode");
      if (!modeAllowed(mode, store.settings.marking)) throw new PolicyError(t("err.protectedPlain", { marking: markLabel() }), "mode");
      await store.changeMode(mode, { passphrase: v("mode-pass"), confirm: v("mode-pass-2"), state });
      updateChrome(); armAutoLock(); rerender(); toast(t("msg.storage", { mode: L(MODES[mode].label) }));
    });
    case "pass-form": return busy(form, async () => {
      await store.changePassphrase(v("new-pass"), v("new-pass-2"), state);
      rerender(); toast(t("msg.pass"));
    });
    case "lock-form": return busy(form, async () => {
      store.setLockMinutes(Number(v("lock-min")));
      armAutoLock(); rerender(); toast(t("msg.lock"));
    });
    case "export-form": return busy(form, async () => {
      const env = await store.exportEncrypted(state, v("export-pass"), v("export-pass-2"));
      download(`gating-${slug()}.encrypted.json`, JSON.stringify(env, null, 2), "application/json");
      form.reset(); toast(t("msg.exported"));
    });
    case "import-form": return busy(form, async () => {
      const file = form.querySelector("#import-file").files[0];
      if (!file) throw new PolicyError(t("err.chooseFile"), "import-file");
      const r = await store.importFile(await file.text(), v("import-pass"));
      if (r.marking && r.marking !== store.settings.marking) {
        if (!modeAllowed(store.settings.mode, r.marking)) throw new PolicyError(t("err.importMarking", { marking: L(MARKINGS[r.marking].label) }), "import-file");
        store.setMarking(r.marking);
      }
      state = migrate(r.state);
      save(); updateChrome(); rerender(); toast(t("msg.imported"));
    });
  }
}

function afterUnlock(msg) {
  updateChrome();
  armAutoLock();
  route();
  toast(msg);
}

// Security marking banner and lock button in the header.
function updateChrome() {
  const m = marking();
  const banner = document.getElementById("marking");
  const mode = store.settings ? L(MODES[store.settings.mode].short) : null;
  banner.className = `marking ${m?.protected ? "is-protected" : ""}`;
  banner.innerHTML = `${m ? `<strong>${esc(L(m.banner))}</strong> ` : ""}<span>${mode ? `${esc(mode)} · ` : ""}${esc(t("chrome.local"))}</span>`;
  banner.setAttribute("aria-label", t("chrome.marking"));
  document.getElementById("lock-btn").hidden = !(state && store.settings?.mode === "encrypted");
}

// Auto-lock after inactivity (encrypted mode only). The delay is user-adjustable,
// including off, and locking loses no work (WCAG 2.2.1).
let lockTimer;
function armAutoLock() {
  clearTimeout(lockTimer);
  const min = store.settings?.lockMinutes;
  if (state && store.settings?.mode === "encrypted" && min) lockTimer = setTimeout(() => lockNow(t("msg.autoLocked", { n: min })), min * 60_000);
}
for (const ev of ["pointerdown", "keydown", "input"]) document.addEventListener(ev, () => { if (state) armAutoLock(); }, { passive: true });

async function lockNow(msg = t("msg.locked")) {
  clearTimeout(saveTimer);
  clearTimeout(lockTimer);
  if (state) await store.save(state);
  store.lock();
  state = null;
  updateChrome();
  route();
  toast(msg);
}

document.getElementById("lock-btn").addEventListener("click", () => lockNow());

// Work kept only in memory is lost on close; ask the browser to confirm.
window.addEventListener("beforeunload", (e) => {
  if (state && store.settings?.mode === "memory" && Object.keys(state.answers).length) e.preventDefault();
});

// Dynamic sizes are applied through the CSSOM because the Content Security Policy
// forbids inline style attributes.
function hydrateStyles() {
  document.querySelectorAll("[data-deg]").forEach((el) => el.style.setProperty("--deg", `${el.dataset.deg}deg`));
  document.querySelectorAll("[data-pct]").forEach((el) => { el.style.width = `${el.dataset.pct}%`; });
}
new MutationObserver(hydrateStyles).observe(document.body, { childList: true, subtree: true });

// ------------------------------------------------------------------ routing

const NAV_FOR = { "": "home", profile: "profile", review: "review", assess: "assess", report: "report", library: "library", req: "library", gates: "gates", gate: "gates", process: "process", security: "security" };

// focus: "heading" moves focus to the new page's h1 (in-app navigation),
// "none" leaves it (first load); rerender() restores focus to the same control.
function route({ focus = "heading" } = {}) {
  const [, view = "", a, b] = location.hash.replace(/^#/, "").split("/");
  let nav = NAV_FOR[view] ?? "home";
  if (!state) nav = store.status() === "locked" ? "locked" : "setup";
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.classList.toggle("active", el.dataset.nav === nav);
    if (el.dataset.nav === nav) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  });
  let html;
  if (nav === "locked") html = viewLock();
  else if (nav === "setup") html = viewSetup();
  else switch (view) {
    case "security": html = viewSecurity(); break;
    case "profile": html = viewProfile(); break;
    case "review": html = viewReview(); break;
    case "assess": html = viewAssess(a, b); break;
    case "report": html = viewReport(); break;
    case "library": html = viewLibrary(); break;
    case "req": html = viewReq(a); break;
    case "gates": html = viewGates(); break;
    case "gate": html = viewGate(a); break;
    case "process": html = viewProcess(a); break;
    default: html = viewHome();
  }
  app.innerHTML = html;
  let title = nav === "home" ? "" : t(`title.${nav}`);
  if (nav === "process" && a && PROCESS_MAP[a]) title = `${L(PROCESS_MAP[a].title)} · ${title}`;
  if (view === "req" && REQ_MAP[a]) title = `${a} · ${title}`;
  if (view === "gate" && GATE_MAP[a]) title = `${t("gate.short", { n: GATE_MAP[a].n })} · ${title}`;
  document.title = `${title ? `${title} · ` : ""}${t("app.name")}`;
  const h1 = app.querySelector("h1");
  if (h1) h1.tabIndex = -1;
  if (view === "assess" && b) {
    const card = document.getElementById(`c-${b}`);
    card?.scrollIntoView({ block: "start" });
    if (focus === "heading") card?.querySelector("summary").focus({ preventScroll: true });
  } else if (view === "process" && a && PROCESS_MAP[a]) {
    // Moving through the tree: focus the step's heading, below the phase bar.
    const h2 = document.getElementById("proc-title");
    window.scrollTo(0, 0);
    if (focus === "heading") h2.focus();
  } else {
    window.scrollTo(0, 0);
    if (focus === "heading") h1?.focus({ preventScroll: true });
  }
}

// Re-render the current view after an action, keeping keyboard focus on the
// equivalent control (or the page heading if it no longer exists).
function rerender() {
  const a = document.activeElement;
  let key = null;
  if (a?.id) key = `#${CSS.escape(a.id)}`;
  else if (a?.name && a.type === "radio") key = `input[name="${CSS.escape(a.name)}"][value="${CSS.escape(a.value)}"]`;
  else if (a?.dataset?.action) key = `[data-action="${a.dataset.action}"]`;
  route({ focus: "none" });
  const target = (key && app.querySelector(key)) || app.querySelector("h1");
  target?.focus({ preventScroll: !key });
}

// Refresh the parts of the questionnaire that depend on an answer without
// re-rendering the whole page (which would steal focus from inputs).
function refreshReq(id, rebuildBody = false) {
  const card = document.getElementById(`c-${id}`);
  if (!card) return;
  const r = evaluateReq(REQ_MAP[id], state);
  card.querySelector(".pills").innerHTML = pills(r);
  if (rebuildBody) card.querySelector(".ctl-body").innerHTML = reqBody(REQ_MAP[id]);
  const mg = modelGateFor(gov().model, REQ_MAP[id].gate);
  const side = document.querySelector(".side");
  if (side) side.innerHTML = sidebar(mg.id);
  const s = scoreAssessment(state).byGate[mg.id];
  const fs = document.querySelector(".fam-score");
  if (fs) fs.innerHTML = `${progressRing(s.score, t("assess.readiness"))}<span class="muted small">${esc(t("assess.assessedOf", { a: s.assessed, n: s.inScope }))}</span>`;
}

// ------------------------------------------------------------------ events

app.addEventListener("toggle", (e) => {
  const d = e.target;
  if (d.matches?.("details.ctl") && d.open) {
    const body = d.querySelector(".ctl-body");
    if (!body.innerHTML.trim()) body.innerHTML = reqBody(REQ_MAP[d.dataset.id]);
  }
}, true);

app.addEventListener("input", (e) => {
  const tg = e.target;
  if (tg.dataset.profile && ["text", "textarea"].includes(tg.type)) {
    state.profile[tg.dataset.profile] = tg.value;
    save();
  } else if (tg.dataset.field && (tg.tagName === "TEXTAREA" || tg.type === "text")) {
    setAnswer(tg.dataset.id, { [tg.dataset.field]: tg.value });
  } else if (tg.id === "review-text") {
    state.review.text = tg.value;
    save();
  } else if (tg.id === "lib-q") {
    libQuery = tg.value;
    updateLibrary();
  }
});

function refreshScope() {
  document.getElementById("scope-summary").innerHTML = scopeSummary();
  const g = gov();
  announce(t("scope.announce", { pcra: pcraLabel(g.pcra), authority: t(`gov.tbShort.${g.tb}`), model: L(MODELS[g.model].name) }));
}

app.addEventListener("change", async (e) => {
  const tg = e.target;
  if (tg.dataset.profile && tg.type === "radio") {
    state.profile[tg.dataset.profile] = tg.value;
    save();
    // Choices that add or remove form sections re-render the form.
    if (["pcra", "opmca", "horizontal", "cost", "projectType", "emergingTech"].includes(tg.dataset.profile)) rerender();
    refreshScope();
  } else if (tg.dataset.pcra && tg.type === "radio") {
    state.pcraAnswers[tg.dataset.pcra] = Number(tg.value);
    save();
    document.getElementById("pcra-result").innerHTML = pcraResultText(pcraEstimate(state.pcraAnswers, state.profile));
    refreshScope();
  } else if (tg.dataset.q !== undefined && tg.dataset.id) {
    const a = getAnswer(state, tg.dataset.id);
    const q = [...a.q];
    q[Number(tg.dataset.q)] = tg.value;
    setAnswer(tg.dataset.id, { q });
    refreshReq(tg.dataset.id);
    const r = evaluateReq(REQ_MAP[tg.dataset.id], state);
    announce(`${tg.dataset.id}: ${L(STATUS[r.status].label)}`);
  } else if (tg.dataset.field && (tg.tagName === "SELECT" || tg.type === "date")) {
    setAnswer(tg.dataset.id, { [tg.dataset.field]: tg.value });
    refreshReq(tg.dataset.id, tg.dataset.field === "applicability");
    if (tg.tagName === "SELECT") {
      const r = evaluateReq(REQ_MAP[tg.dataset.id], state);
      announce(`${tg.dataset.id}: ${L(APPLICABILITY[r.applicability.status].label)}, ${L(STATUS[r.status].label)}`);
      if (tg.dataset.field === "applicability") document.querySelector(`select[data-field="applicability"][data-id="${tg.dataset.id}"]`)?.focus();
    }
  } else if (tg.id === "lib-area") {
    libArea = tg.value;
    updateLibrary();
  } else if (tg.id === "lib-gate") {
    libGate = tg.value;
    updateLibrary();
  } else if (tg.name === "mode" && tg.type === "radio") {
    // Passphrase fields are needed only when switching to encrypted storage.
    const fields = tg.form.querySelector(".pass-fields");
    if (fields) fields.hidden = !(tg.value === "encrypted" && (tg.form.id === "setup-form" || store.settings?.mode !== "encrypted"));
  } else if (tg.dataset.action === "show-pass") {
    for (const id of [tg.dataset.target, `${tg.dataset.target}-2`]) {
      const input = document.getElementById(id);
      if (input) input.type = tg.checked ? "text" : "password";
    }
  } else if (tg.dataset.action === "load-text" && tg.files[0]) {
    let text = await tg.files[0].text();
    if (/\.html?$/i.test(tg.files[0].name)) text = new DOMParser().parseFromString(text, "text/html").body.textContent ?? "";
    state.review.text = text;
    save();
    rerender();
    toast(t("msg.loaded", { name: tg.files[0].name }));
  }
});

app.addEventListener("submit", (e) => {
  e.preventDefault();
  onSubmit(e.target);
});

function selectTab(tab) {
  const g = tab.closest(".gemba");
  g.querySelectorAll("[data-tab]").forEach((b) => {
    const on = b === tab;
    b.classList.toggle("on", on);
    b.setAttribute("aria-selected", String(on));
    b.tabIndex = on ? 0 : -1;
  });
  g.querySelectorAll("[data-panel]").forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
}

// ARIA tabs keyboard pattern: arrows move between tabs, Home/End jump.
app.addEventListener("keydown", (e) => {
  const tab = e.target.closest?.("[role=tab]");
  if (!tab) return;
  const tabs = [...tab.parentElement.querySelectorAll("[role=tab]")];
  const i = tabs.indexOf(tab);
  const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  const tb = tabs[(next + tabs.length) % tabs.length];
  selectTab(tb);
  tb.focus();
});

const reportModel = () => buildReportModel(state, { marking: markBanner() || null });

app.addEventListener("click", (e) => {
  const errLink = e.target.closest("[data-focus]");
  if (errLink) {
    e.preventDefault();
    document.getElementById(errLink.dataset.focus)?.focus();
    return;
  }
  const proc = e.target.closest("a[data-from], a[data-path]");
  if (proc) {
    procPending = proc.dataset.path !== undefined
      ? { jump: Number(proc.dataset.path) }
      : { from: proc.dataset.from, choice: proc.dataset.choice !== undefined ? Number(proc.dataset.choice) : undefined };
    return;
  }
  const tab = e.target.closest("[data-tab]");
  if (tab) {
    selectTab(tab);
    return;
  }
  const el = e.target.closest("[data-action]");
  if (!el || el.tagName === "INPUT") return;
  const action = el.dataset.action;
  const actions = {
    "export-json": () => confirmPlainExport() && download(`gating-${slug()}.json`, JSON.stringify(state, null, 2), "application/json"),
    "export-md": () => confirmPlainExport() && download(`gating-report-${slug()}-${getLang()}.md`, reportToMarkdown(reportModel()), "text/markdown"),
    "export-csv": () => confirmPlainExport() && download(`gating-requirements-${slug()}-${getLang()}.csv`, reportToCSV(reportModel()), "text/csv"),
    "lock-now": () => lockNow(),
    "erase-all": () => {
      if (!confirm(t("confirm.erase"))) return;
      clearTimeout(saveTimer);
      clearTimeout(lockTimer);
      store.eraseAll();
      state = null;
      applyTheme(null);
      updateChrome();
      location.hash = "#/";
      route();
      toast(t("msg.erased"));
    },
    print: () => window.print(),
    reset: () => {
      if (!confirm(t("confirm.reset"))) return;
      state = newState();
      save();
      rerender();
      toast(t("msg.reset"));
    },
    "load-sample": () => {
      if (Object.keys(state.answers).length && !confirm(t("confirm.sample"))) return;
      state = sampleState();
      save();
      toast(t("msg.sample"));
      if (location.hash === "#/review") rerender();
      else location.hash = "#/review";
    },
    "sample-text": () => {
      state.review.text = SAMPLE_TEXT;
      save();
      rerender();
    },
    analyze: () => {
      const text = document.getElementById("review-text").value;
      if (!text.trim()) { toast(t("msg.pasteFirst")); return; }
      state.review = { text, results: analyzeText(text), analyzedAt: new Date().toISOString() };
      save();
      rerender();
      toast(t("msg.analyzed", { n: state.review.results.covered }));
    },
    "clear-review": () => {
      state.review.results = null;
      save();
      rerender();
    },
    "apply-hint": () => {
      state.profile[el.dataset.field] = el.dataset.value;
      save();
      rerender();
      toast(t("msg.scope"));
    },
    "copy-evidence": () => {
      let n = 0;
      const tag = `[${t("review.tag")}]`;
      for (const [id, m] of Object.entries(state.review.results.reqs)) {
        const a = getAnswer(state, id);
        if (a.notes.includes(tag)) continue;
        const lines = [...m.evidence, ...m.caveats.map((s) => `(${t("review.caveatShort")}) ${s}`)];
        const block = `${tag} ${lines.join(" | ")}`;
        setAnswer(id, { notes: a.notes ? `${a.notes}\n${block}` : block });
        n++;
      }
      toast(tn("msg.copied", n));
    },
    draft: () => {
      const id = el.dataset.id;
      const ta = document.querySelector(`textarea[data-field="statement"][data-id="${id}"]`);
      if (ta.value.trim() && !confirm(t("confirm.draft"))) return;
      ta.value = draftStatement(REQ_MAP[id], state);
      setAnswer(id, { statement: ta.value });
      announce(t("msg.drafted", { id }));
    },
    "expand-all": () => document.querySelectorAll("details.ctl").forEach((d) => { d.open = true; }),
    "collapse-all": () => document.querySelectorAll("details.ctl").forEach((d) => { d.open = false; }),
  };
  actions[action]?.();
});

// ------------------------------------------------------------------ language toggle

document.getElementById("lang-toggle").addEventListener("click", () => {
  setLang(otherLang());
  try { localStorage.setItem(KEYS.lang, getLang()); } catch { /* ignore */ }
  applyStaticStrings();
  updateChrome();
  route({ focus: "none" });
  document.getElementById("lang-toggle").focus();
  announce(t("lang.changed"));
});

// ------------------------------------------------------------------ theme

const themeBtn = document.getElementById("theme-toggle");
function applyTheme(th) {
  if (th) document.documentElement.dataset.theme = th;
  else delete document.documentElement.dataset.theme;
  const dark = th ? th === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  themeBtn.setAttribute("aria-pressed", String(dark));
}
try { applyTheme(localStorage.getItem(KEYS.theme)); } catch { /* ignore */ }
themeBtn.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  const th = dark ? "light" : "dark";
  applyTheme(th);
  try { localStorage.setItem(KEYS.theme, th); } catch { /* ignore */ }
});

// ------------------------------------------------------------------ start

window.addEventListener("hashchange", () => { hideToast(); route(); });
applyStaticStrings();
updateChrome();
armAutoLock();
route({ focus: "none" });
