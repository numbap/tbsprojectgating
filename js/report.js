// Gate readiness report: one model, rendered as HTML (screen/print), Markdown
// and CSV, in English or French.

import {
  APPLICABILITY, AREAS, GATE_MAP, MODELS, RISK_LABELS, STATUS, approvalsRoadmap, authoritySentence,
  evaluateAll, gapRegister, pcraLabel, rightSizing, scoreAssessment, statementFor,
} from "./engine.js";
import { DECISIONS } from "./data/gates.js";
import { PROFILE_FIELDS, profileLabel, profileWarnings } from "./data/scoping.js";
import { L, fmtMoney, fmtPct, getLang, setLang, t } from "./i18n.js";

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// Gate decision a gatekeeper would most likely reach on this evidence. Never
// "stop": that is a judgement about value, not readiness.
export function suggestedDecision(readiness, dueGaps) {
  const highDue = dueGaps.filter((g) => g.risk.level === "High").length;
  if (readiness.progress < 0.5) return "hold";
  if (readiness.score >= 0.9 && highDue === 0) return "go";
  if (readiness.score >= 0.7 && highDue <= 2) return "conditional";
  return "hold";
}

// options.marking: security marking (e.g. "PROTECTED B") placed on the report,
// on every printed page and in exported files. options.lang: report language.
export function buildReportModel(state, { marking = null, lang = getLang() } = {}) {
  const prev = getLang();
  setLang(lang);
  try {
    const results = evaluateAll(state);
    const score = scoreAssessment(state, results);
    const gov = score.gov;
    const gaps = gapRegister(state, results);
    const model = MODELS[gov.model];
    const nextModelGate = model.gates.find((g) => g.includes.includes(gov.nextGate));
    const dueGaps = gaps.filter((g) => g.due);
    const decision = suggestedDecision(score.nextGate, dueGaps);
    return {
      lang,
      title: t("r.title", { project: state.profile.projectName || t("r.unnamed") }),
      marking,
      generated: new Date().toISOString().slice(0, 10),
      profile: state.profile,
      profileRows: PROFILE_FIELDS
        .filter((f) => !["description", "projectName"].includes(f.id))
        .map((f) => ({ label: L(f.label), value: profileLabel(state.profile, f.id) || "—" })),
      warnings: profileWarnings(state.profile, gov),
      score, gov, model, nextModelGate,
      gates: model.gates.map((g) => ({ ...g, ...score.byGate[g.id], isNext: g === nextModelGate })),
      roadmap: approvalsRoadmap(state, gov),
      levers: rightSizing(state, results),
      gaps, dueGaps, decision,
      openQuestions: results.filter((r) => r.openQuestions.length && r.status !== "na"),
      unassessed: results.filter((r) => r.status === "unanswered"),
      statements: results.map((r) => ({ ...r, statement: statementFor(r.req, state, lang) })),
      departmental: results.filter((r) => r.applicability.status === "departmental"),
      review: state.review?.results ?? null,
    };
  } finally {
    setLang(prev);
  }
}

// Every text helper below takes the model's language explicitly so a report can
// be rendered in a language other than the interface's.
const tl = (m, key, vars) => t(key, vars, m.lang);
const ll = (m, x) => L(x, m.lang);
const pct = (m, x) => fmtPct(x, m.lang);
const gateLabel = (m, refId) => {
  const g = GATE_MAP[refId];
  return `${tl(m, "gate.short", { n: g.n })} · ${ll(m, g.short)}`;
};
const modelGateLabel = (m, mg) => `${mg.id} ${ll(m, mg.name)}`;
// "Label: value" with the French typographic space before the colon.
const colon = (m) => (m.lang === "fr" ? " : " : ": ");

function verdict(m) {
  const s = m.score.nextGate;
  const vars = { gate: modelGateLabel(m, m.nextModelGate) };
  if (s.progress < 0.5) return tl(m, "r.verdict.incomplete", vars);
  if (s.score >= 0.9) return tl(m, "r.verdict.ready", vars);
  if (s.score >= 0.7) return tl(m, "r.verdict.conditions", vars);
  if (s.score >= 0.5) return tl(m, "r.verdict.gaps", vars);
  return tl(m, "r.verdict.notReady", vars);
}

export function governanceRows(m) {
  const g = m.gov;
  const reasons = g.tbReasons.map((r) => tl(m, `gov.reason.${r}`, { pcra: g.pcra, opmca: g.opmcaClass, limit: fmtMoney(2.5, m.lang) }));
  const earbReasons = g.earbReasons.map((r) => tl(m, `gov.earb.${r}`, { threshold: fmtMoney(g.earbThreshold, m.lang) }));
  const assessments = [
    m.profile.personalInfo === "yes" && tl(m, "gov.assess.pia"),
    m.profile.automatedDecision === "yes" && tl(m, "gov.assess.aia"),
    g.digital && tl(m, "gov.assess.saa"),
    g.submission && tl(m, "gov.assess.gba"),
  ].filter(Boolean);
  return [
    { label: tl(m, "gov.pcra"), value: `${pcraLabel(g.pcra, m.lang)}${g.pcraSource === "estimate" ? ` · ${tl(m, "gov.estimated", { score: g.pcraScore })}` : g.pcraSource === "official" ? ` · ${tl(m, "gov.official")}` : ""}` },
    { label: tl(m, "gov.opmca"), value: g.opmcaClass ? tl(m, "gov.classN", { n: g.opmcaClass }) : tl(m, "gov.noClass") },
    { label: tl(m, "gov.cost"), value: ll(m, g.band.label) },
    { label: tl(m, "gov.pcraRequiredLabel"), value: tl(m, `gov.pcraRequired.${g.pcraRequired}`, { threshold: fmtMoney(g.pcraThreshold, m.lang) }) },
    { label: tl(m, "gov.authority"), value: authoritySentence(g, m.lang), list: reasons, tone: g.tb === "yes" ? "warn" : g.tb === "check" ? "check" : "ok" },
    ...(g.tb === "yes" ? [{ label: tl(m, "gov.tbStages"), value: tl(m, "gov.tbStagesText"), list: [tl(m, `gov.estimateFor.${g.pcra === 4 ? "l4" : "l13"}`)] }] : []),
    { label: tl(m, "gov.funding"), value: g.newFunding ? tl(m, "gov.fundingYes") : tl(m, "gov.fundingNo") },
    { label: tl(m, "gov.earbLabel"), value: tl(m, `gov.earb.${g.earb}`), list: earbReasons, tone: g.earb === "yes" ? "warn" : g.earb === "check" ? "check" : "ok" },
    { label: tl(m, "gov.model"), value: `${ll(m, MODELS[g.model].name)}${g.model === g.recommendedModel ? ` · ${tl(m, "gov.recommended")}` : ` · ${tl(m, "gov.recommendedIs", { model: ll(m, MODELS[g.recommendedModel].name) })}`}`, list: m.model.gates.map((mg) => (mg.includes.length > 1 ? `${modelGateLabel(m, mg)}${colon(m)}${mg.includes.map((id) => ll(m, GATE_MAP[id].name)).join(" + ")}` : modelGateLabel(m, mg))) },
    ...(g.digital ? [{ label: tl(m, "gov.conceptCase"), value: tl(m, `gov.conceptCase.${g.conceptCase}`, { threshold: fmtMoney(g.earbThreshold, m.lang) }) }] : []),
    { label: tl(m, "gov.ocg"), value: tl(m, `gov.ocg.${g.ocg}`) },
    { label: tl(m, "gov.independent"), value: g.independentReview ? tl(m, "gov.independentYes") : tl(m, "gov.independentNo") },
    { label: tl(m, "gov.assessments"), value: assessments.length ? assessments.join("; ") : tl(m, "gov.none") },
  ];
}

const decisionText = (m) => ll(m, DECISIONS[m.decision]);

// ------------------------------------------------------------------ HTML

export function reportToHTML(m) {
  const o = m.score.overall;
  const nx = m.score.nextGate;
  const highGaps = m.gaps.filter((g) => g.risk.level === "High").length;
  const statusLabel = (s) => ll(m, STATUS[s].label);
  const risk = (g) => `<span class="pill risk-${g.risk.level.toLowerCase()}">${esc(ll(m, RISK_LABELS[g.risk.level]))}</span>`;
  const region = (label, inner) => `<div class="table-wrap" role="region" tabindex="0" aria-label="${esc(label)}">${inner}</div>`;

  const govRows = governanceRows(m).map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${r.tone ? `<span class="tone tone-${r.tone}">${esc(r.value)}</span>` : esc(r.value)}${r.list?.length ? `<ul class="tight">${r.list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</td></tr>`).join("");

  const roadmap = m.roadmap.map((a) => `<tr><td>${esc(modelGateLabel(m, a.modelGate))}<br><span class="muted small">${esc(gateLabel(m, a.gate))}</span></td><td><strong>${esc(tl(m, `road.${a.key}`))}</strong></td><td>${esc(tl(m, `road.${a.key}.who`))}</td></tr>`).join("");

  const gateRows = m.gates.map((g) => `
    <tr${g.isNext ? ' class="is-next"' : ""}>
      <td><strong>${esc(g.id)}</strong> ${esc(ll(m, g.name))}${g.isNext ? ` <span class="pill next">${esc(tl(m, "r.next"))}</span>` : ""}</td>
      <td class="num">${g.inScope}</td>
      <td class="num">${g.counts.met}</td>
      <td class="num">${g.counts.partial + g.counts.planned}</td>
      <td class="num">${g.counts["not-met"]}</td>
      <td class="num">${g.counts.unknown + g.counts.unanswered}</td>
      <td><div class="bar" role="img" aria-label="${esc(tl(m, "r.readyPct", { pct: pct(m, g.score) }))}"><span data-pct="${Math.round(g.score * 100)}"></span></div> ${pct(m, g.score)}</td>
    </tr>`).join("");

  const levers = m.levers.length ? m.levers.map((l) => `
    <li><strong>${esc(ll(m, l.title))}</strong>. ${esc(ll(m, l.why))}
      <div class="muted small">${esc(tl(m, "r.affects"))} ${l.reqs.join(", ")}${l.gaps.length ? ` · ${esc(tl(m, "r.leverGaps", { n: l.gaps.length }))} ${l.gaps.map((g) => g.req.id).join(", ")}` : ""}</div>
    </li>`).join("") : `<li>${esc(tl(m, "r.noLevers"))}</li>`;

  const gaps = m.gaps.length ? m.gaps.map((g) => `
    <tr>
      <td><strong>${g.req.id}</strong><br>${esc(ll(m, g.req.title))}</td>
      <td>${esc(gateLabel(m, g.req.gate))}${g.overdue ? `<br><span class="pill overdue">${esc(tl(m, "r.overdue"))}</span>` : ""}</td>
      <td>${risk(g)}</td>
      <td>${esc(statusLabel(g.status))}</td>
      <td><ul>${ll(m, g.req.consequences).map((c) => `<li>${esc(c)}</li>`).join("")}</ul></td>
      <td>${g.answer.compensating ? `<p><em>${esc(tl(m, "r.inPlace"))}</em> ${esc(g.answer.compensating)}</p>` : ""}<ul>${ll(m, g.req.mitigations).map((c) => `<li>${esc(c)}</li>`).join("")}</ul></td>
      <td>${esc(g.answer.plan || tl(m, "r.tbd"))}${g.answer.owner ? `<br><span class="small">${esc(tl(m, "r.owner"))} ${esc(g.answer.owner)}</span>` : ""}${g.answer.target ? `<br><span class="muted small">${esc(tl(m, "r.target"))} ${esc(g.answer.target)}</span>` : ""}</td>
    </tr>`).join("") : `<tr><td colspan="7">${esc(tl(m, "r.noGaps"))}</td></tr>`;

  const conditions = m.dueGaps.slice(0, 10);
  const decisionRecord = `
    <div class="decision card-inset">
      <dl class="kv-list">
        <div><dt>${esc(tl(m, "r.dr.project"))}</dt><dd>${esc(m.profile.projectName || tl(m, "r.unnamed"))}</dd></div>
        <div><dt>${esc(tl(m, "r.dr.gate"))}</dt><dd>${esc(modelGateLabel(m, m.nextModelGate))}</dd></div>
        <div><dt>${esc(tl(m, "r.dr.readiness"))}</dt><dd>${pct(m, nx.score)} · ${esc(tl(m, "r.dr.assessed", { a: nx.assessed, n: nx.inScope }))}</dd></div>
        <div><dt>${esc(tl(m, "r.dr.suggested"))}</dt><dd><strong>${esc(decisionText(m))}</strong></dd></div>
      </dl>
      <h3 class="h5">${esc(tl(m, "r.dr.conditions"))}</h3>
      ${conditions.length ? `<ol>${conditions.map((g) => `<li><strong>${g.req.id}</strong> ${esc(ll(m, g.req.title))} (${esc(statusLabel(g.status))}): ${esc(g.answer.plan || ll(m, g.req.mitigations)[0])}${g.answer.target ? ` · ${esc(tl(m, "r.target"))} ${esc(g.answer.target)}` : ""}</li>`).join("")}</ol>` : `<p>${esc(tl(m, "r.dr.none"))}</p>`}
      <h3 class="h5">${esc(tl(m, "r.dr.decision"))}</h3>
      <ul class="decision-options">${Object.keys(DECISIONS).map((k) => `<li><span class="box" aria-hidden="true">☐</span> ${esc(ll(m, DECISIONS[k]))}</li>`).join("")}</ul>
      <p class="sign">${esc(tl(m, "r.dr.sign"))}</p>
    </div>`;

  const open = m.openQuestions.length
    ? `<ul>${m.openQuestions.map((r) => `<li><strong>${r.req.id}</strong> ${esc(ll(m, r.req.title))}<ul>${r.openQuestions.map((i) => `<li>${esc(ll(m, r.req.questions)[i])}</li>`).join("")}</ul></li>`).join("")}</ul>`
    : `<p>${esc(tl(m, "r.noOpen"))}</p>`;

  const statements = m.model.gates.map((mg) => {
    const items = m.statements.filter((s) => mg.includes.includes(s.req.gate) && s.status !== "na");
    if (!items.length) return "";
    return `<h3>${esc(modelGateLabel(m, mg))}</h3>${items.map((s) => `
      <div class="stmt">
        <div class="stmt-head"><strong>${s.req.id} ${esc(ll(m, s.req.title))}</strong>
          <span class="pill app-${s.applicability.status}">${esc(ll(m, APPLICABILITY[s.applicability.status].label))}</span>
          <span class="pill st-${s.status}">${esc(statusLabel(s.status))}</span>
          ${s.statement.draft ? `<span class="pill draft">${esc(tl(m, "r.draft"))}</span>` : ""}</div>
        <p>${esc(s.statement.text)}</p>
        ${s.answer.notes ? `<p class="small"><em>${esc(tl(m, "r.evidence"))}</em> ${esc(s.answer.notes)}</p>` : ""}
      </div>`).join("")}`;
  }).join("");

  const review = m.review ? `
    <h2>${esc(tl(m, "r.h.review"))}</h2>
    <p>${esc(tl(m, "r.reviewText", { covered: m.review.covered, total: m.score.overall.total, sentences: m.review.sentenceCount }))}</p>` : "";

  const mark = m.marking ? `<p class="report-marking">${esc(m.marking)}</p>` : "";
  return `
  <article class="report" lang="${m.lang}">
    ${m.marking ? `<div class="print-marking print-marking-top" aria-hidden="true">${esc(m.marking)}</div><div class="print-marking print-marking-bottom" aria-hidden="true">${esc(m.marking)}</div>` : ""}
    ${mark}
    <header class="report-head">
      <h1>${esc(m.title)}</h1>
      <p class="muted">${esc(tl(m, "r.meta", { dept: m.profile.dept || "—", date: m.generated, model: ll(m, m.model.name) }))}</p>
    </header>

    <h2>1. ${esc(tl(m, "r.h.summary"))}</h2>
    <div class="kpis">
      <div class="kpi"><div class="kpi-v">${pct(m, nx.score)}</div><div class="kpi-l">${esc(tl(m, "r.kpi.ready", { gate: m.nextModelGate.id }))}</div></div>
      <div class="kpi"><div class="kpi-v">${pct(m, o.progress)}</div><div class="kpi-l">${esc(tl(m, "r.kpi.progress"))}</div></div>
      <div class="kpi"><div class="kpi-v">${highGaps}</div><div class="kpi-l">${esc(tl(m, "r.kpi.high"))}</div></div>
      <div class="kpi"><div class="kpi-v">${esc(tl(m, `r.kpi.tb.${m.gov.tb}`))}</div><div class="kpi-l">${esc(tl(m, "r.kpi.tb"))}</div></div>
    </div>
    <p>${esc(verdict(m))}</p>
    ${m.warnings.length ? `<div class="callout warn"><strong>${esc(tl(m, "r.warnings"))}</strong><ul>${m.warnings.map((w) => `<li>${esc(w)}</li>`).join("")}</ul></div>` : ""}

    <h2>2. ${esc(tl(m, "r.h.profile"))}</h2>
    ${m.profile.description ? `<p>${esc(m.profile.description)}</p>` : ""}
    ${region(tl(m, "r.h.profile"), `<table class="kv"><caption class="sr-only">${esc(tl(m, "r.h.profile"))}</caption>${m.profileRows.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table>`)}

    <h2>3. ${esc(tl(m, "r.h.governance"))}</h2>
    <p>${esc(tl(m, "r.governanceIntro"))}</p>
    ${region(tl(m, "r.h.governance"), `<table class="kv"><caption class="sr-only">${esc(tl(m, "r.h.governance"))}</caption>${govRows}</table>`)}

    <h2>4. ${esc(tl(m, "r.h.roadmap"))}</h2>
    ${region(tl(m, "r.h.roadmap"), `<table class="grid"><caption class="sr-only">${esc(tl(m, "r.h.roadmap"))}</caption>
      <thead><tr><th scope="col">${esc(tl(m, "r.col.gate"))}</th><th scope="col">${esc(tl(m, "r.col.approval"))}</th><th scope="col">${esc(tl(m, "r.col.who"))}</th></tr></thead>
      <tbody>${roadmap}</tbody></table>`)}

    <h2>5. ${esc(tl(m, "r.h.gates"))}</h2>
    ${region(tl(m, "r.h.gates"), `<table class="grid"><caption class="sr-only">${esc(tl(m, "r.h.gates"))}</caption>
      <thead><tr><th scope="col">${esc(tl(m, "r.col.gate"))}</th><th scope="col">${esc(tl(m, "r.col.inScope"))}</th><th scope="col">${esc(tl(m, "r.col.met"))}</th><th scope="col">${esc(tl(m, "r.col.partial"))}</th><th scope="col">${esc(tl(m, "r.col.notMet"))}</th><th scope="col">${esc(tl(m, "r.col.unknown"))}</th><th scope="col">${esc(tl(m, "r.col.readiness"))}</th></tr></thead>
      <tbody>${gateRows}</tbody></table>`)}

    <h2>6. ${esc(tl(m, "r.h.levers"))}</h2>
    <p>${esc(tl(m, "r.leversIntro"))}</p>
    <ul>${levers}</ul>

    <h2>7. ${esc(tl(m, "r.h.gaps"))}</h2>
    ${region(tl(m, "r.h.gaps"), `<table class="grid gaps"><caption class="sr-only">${esc(tl(m, "r.h.gaps"))}</caption>
      <thead><tr><th scope="col">${esc(tl(m, "r.col.req"))}</th><th scope="col">${esc(tl(m, "r.col.gate"))}</th><th scope="col">${esc(tl(m, "r.col.risk"))}</th><th scope="col">${esc(tl(m, "r.col.status"))}</th><th scope="col">${esc(tl(m, "r.col.consequences"))}</th><th scope="col">${esc(tl(m, "r.col.recovery"))}</th><th scope="col">${esc(tl(m, "r.col.action"))}</th></tr></thead>
      <tbody>${gaps}</tbody></table>`)}

    <h2>8. ${esc(tl(m, "r.h.decision", { gate: m.nextModelGate.id }))}</h2>
    <p class="muted small">${esc(tl(m, "r.decisionIntro"))}</p>
    ${decisionRecord}

    <h2>9. ${esc(tl(m, "r.h.open"))}</h2>
    ${open}
    ${m.unassessed.length ? `<p><strong>${esc(tl(m, "r.unassessed", { n: m.unassessed.length }))}</strong> ${m.unassessed.map((r) => r.req.id).join(", ")}. ${esc(tl(m, "r.unassessedNote"))}</p>` : ""}

    <h2>10. ${esc(tl(m, "r.h.departmental"))}</h2>
    <p>${esc(tl(m, "r.departmentalIntro"))}</p>
    <ul>${m.departmental.map((r) => `<li><strong>${r.req.id}</strong> ${esc(ll(m, r.req.title))}</li>`).join("") || `<li>${esc(tl(m, "gov.none"))}</li>`}</ul>

    ${review}

    <h2>11. ${esc(tl(m, "r.h.statements"))}</h2>
    <p class="muted">${esc(tl(m, "r.statementsIntro"))}</p>
    ${statements}

    <h2>${esc(tl(m, "r.h.method"))}</h2>
    ${mark}
    <p class="small">${esc(tl(m, "r.method"))}</p>
  </article>`;
}

// ------------------------------------------------------------------ Markdown

const mdCell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n+/g, " ");

export function reportToMarkdown(m) {
  const o = m.score.overall;
  const nx = m.score.nextGate;
  const statusLabel = (s) => ll(m, STATUS[s].label);
  const out = [];
  if (m.marking) out.push(`**${m.marking}**`, "");
  out.push(`# ${m.title}`, "", tl(m, "r.meta", { dept: m.profile.dept || "—", date: m.generated, model: ll(m, m.model.name) }), "");

  out.push(`## 1. ${tl(m, "r.h.summary")}`, "");
  const c = colon(m);
  out.push(`- ${tl(m, "r.kpi.ready", { gate: m.nextModelGate.id })}${c}**${pct(m, nx.score)}**`,
    `- ${tl(m, "r.kpi.progress")}${c}${pct(m, o.progress)}`,
    `- ${tl(m, "r.kpi.high")}${c}${m.gaps.filter((g) => g.risk.level === "High").length}`,
    `- ${tl(m, "r.kpi.tb")}${c}${tl(m, `r.kpi.tb.${m.gov.tb}`)}`, "");
  out.push(verdict(m), "");
  if (m.warnings.length) { out.push(`**${tl(m, "r.warnings")}**`, ""); m.warnings.forEach((w) => out.push(`- ${w}`)); out.push(""); }

  out.push(`## 2. ${tl(m, "r.h.profile")}`, "");
  if (m.profile.description) out.push(m.profile.description, "");
  out.push(`| ${tl(m, "r.col.attribute")} | ${tl(m, "r.col.value")} |`, "|---|---|");
  m.profileRows.forEach((r) => out.push(`| ${mdCell(r.label)} | ${mdCell(r.value)} |`));
  out.push("");

  out.push(`## 3. ${tl(m, "r.h.governance")}`, "");
  out.push(`| ${tl(m, "r.col.attribute")} | ${tl(m, "r.col.value")} |`, "|---|---|");
  governanceRows(m).forEach((r) => out.push(`| ${mdCell(r.label)} | ${mdCell(r.value)}${r.list?.length ? `${c}${mdCell(r.list.join("; "))}` : ""} |`));
  out.push("");

  out.push(`## 4. ${tl(m, "r.h.roadmap")}`, "");
  out.push(`| ${tl(m, "r.col.gate")} | ${tl(m, "r.col.approval")} | ${tl(m, "r.col.who")} |`, "|---|---|---|");
  m.roadmap.forEach((a) => out.push(`| ${mdCell(modelGateLabel(m, a.modelGate))} | ${mdCell(tl(m, `road.${a.key}`))} | ${mdCell(tl(m, `road.${a.key}.who`))} |`));
  out.push("");

  out.push(`## 5. ${tl(m, "r.h.gates")}`, "");
  out.push(`| ${tl(m, "r.col.gate")} | ${tl(m, "r.col.inScope")} | ${tl(m, "r.col.met")} | ${tl(m, "r.col.partial")} | ${tl(m, "r.col.notMet")} | ${tl(m, "r.col.unknown")} | ${tl(m, "r.col.readiness")} |`, "|---|---:|---:|---:|---:|---:|---:|");
  m.gates.forEach((g) => out.push(`| ${g.id} ${mdCell(ll(m, g.name))}${g.isNext ? ` (${tl(m, "r.next")})` : ""} | ${g.inScope} | ${g.counts.met} | ${g.counts.partial + g.counts.planned} | ${g.counts["not-met"]} | ${g.counts.unknown + g.counts.unanswered} | ${pct(m, g.score)} |`));
  out.push("");

  out.push(`## 6. ${tl(m, "r.h.levers")}`, "");
  if (!m.levers.length) out.push(tl(m, "r.noLevers"));
  m.levers.forEach((l) => out.push(`- **${ll(m, l.title)}.** ${ll(m, l.why)} _(${tl(m, "r.affects")} ${l.reqs.join(", ")})_`));
  out.push("");

  out.push(`## 7. ${tl(m, "r.h.gaps")}`, "");
  if (!m.gaps.length) out.push(tl(m, "r.noGaps"), "");
  m.gaps.forEach((g) => {
    out.push(`### ${g.req.id} ${ll(m, g.req.title)} — ${ll(m, RISK_LABELS[g.risk.level])} · ${statusLabel(g.status)} · ${gateLabel(m, g.req.gate)}${g.overdue ? ` · ${tl(m, "r.overdue")}` : ""}`, "");
    out.push(`**${tl(m, "r.col.consequences")}**`, ""); ll(m, g.req.consequences).forEach((c) => out.push(`- ${c}`)); out.push("");
    if (g.answer.compensating) out.push(`**${tl(m, "r.inPlace")}** ${g.answer.compensating}`, "");
    out.push(`**${tl(m, "r.col.recovery")}**`, ""); ll(m, g.req.mitigations).forEach((c) => out.push(`- ${c}`)); out.push("");
    out.push(`**${tl(m, "r.col.action")}${c.trimEnd()}** ${g.answer.plan || tl(m, "r.tbd")}${g.answer.owner ? ` · ${tl(m, "r.owner")} ${g.answer.owner}` : ""}${g.answer.target ? ` · ${tl(m, "r.target")} ${g.answer.target}` : ""}`, "");
  });

  out.push(`## 8. ${tl(m, "r.h.decision", { gate: m.nextModelGate.id })}`, "", `_${tl(m, "r.decisionIntro")}_`, "");
  out.push(`- ${tl(m, "r.dr.gate")}${c}${modelGateLabel(m, m.nextModelGate)}`, `- ${tl(m, "r.dr.readiness")}${c}${pct(m, nx.score)}`, `- ${tl(m, "r.dr.suggested")}${c}**${decisionText(m)}**`, "");
  out.push(`**${tl(m, "r.dr.conditions")}**`, "");
  if (!m.dueGaps.length) out.push(tl(m, "r.dr.none"));
  m.dueGaps.slice(0, 10).forEach((g, i) => out.push(`${i + 1}. **${g.req.id}** ${ll(m, g.req.title)}${c}${g.answer.plan || ll(m, g.req.mitigations)[0]}`));
  out.push("", `**${tl(m, "r.dr.decision")}**`, "");
  Object.keys(DECISIONS).forEach((k) => out.push(`- [ ] ${ll(m, DECISIONS[k])}`));
  out.push("", tl(m, "r.dr.sign"), "");

  out.push(`## 9. ${tl(m, "r.h.open")}`, "");
  if (!m.openQuestions.length) out.push(tl(m, "r.noOpen"));
  m.openQuestions.forEach((r) => { out.push(`- **${r.req.id} ${ll(m, r.req.title)}**`); r.openQuestions.forEach((i) => out.push(`  - ${ll(m, r.req.questions)[i]}`)); });
  out.push("");
  if (m.unassessed.length) out.push(`**${tl(m, "r.unassessed", { n: m.unassessed.length })}** ${m.unassessed.map((r) => r.req.id).join(", ")}. ${tl(m, "r.unassessedNote")}`, "");

  out.push(`## 10. ${tl(m, "r.h.departmental")}`, "");
  m.departmental.forEach((r) => out.push(`- **${r.req.id}** ${ll(m, r.req.title)}`));
  if (!m.departmental.length) out.push(tl(m, "gov.none"));
  out.push("");

  if (m.review) out.push(`## ${tl(m, "r.h.review")}`, "", tl(m, "r.reviewText", { covered: m.review.covered, total: o.total, sentences: m.review.sentenceCount }), "");

  out.push(`## 11. ${tl(m, "r.h.statements")}`, "", `_${tl(m, "r.statementsIntro")}_`, "");
  m.model.gates.forEach((mg) => {
    const items = m.statements.filter((s) => mg.includes.includes(s.req.gate) && s.status !== "na");
    if (!items.length) return;
    out.push(`### ${modelGateLabel(m, mg)}`, "");
    items.forEach((s) => {
      out.push(`**${s.req.id} ${ll(m, s.req.title)}** — ${ll(m, APPLICABILITY[s.applicability.status].label)} · ${statusLabel(s.status)}${s.statement.draft ? ` (${tl(m, "r.draft").toLowerCase()})` : ""}`, "");
      out.push(s.statement.text, "");
      if (s.answer.notes) out.push(`_${tl(m, "r.evidence")}_ ${s.answer.notes}`, "");
    });
  });

  out.push(`## ${tl(m, "r.h.method")}`, "", tl(m, "r.method"), "");
  if (m.marking) out.push(`**${m.marking}**`, "");
  return out.join("\n");
}

// ------------------------------------------------------------------ CSV

const csvCell = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;

export function reportToCSV(m) {
  const header = ["r.csv.id", "r.csv.title", "r.csv.area", "r.csv.gate", "r.csv.modelGate", "r.csv.severity", "r.csv.applicability", "r.csv.status", "r.csv.risk", "r.csv.statement", "r.csv.notes", "r.csv.interim", "r.csv.action", "r.csv.owner", "r.csv.target", "r.csv.source"].map((k) => tl(m, k));
  const gapRisk = Object.fromEntries(m.gaps.map((g) => [g.req.id, ll(m, RISK_LABELS[g.risk.level])]));
  const areaName = Object.fromEntries(AREAS.map((a) => [a.id, ll(m, a.name)]));
  const rows = m.statements.map((s) => [
    s.req.id, ll(m, s.req.title), areaName[s.req.area], GATE_MAP[s.req.gate].n,
    m.model.gates.find((g) => g.includes.includes(s.req.gate)).id, tl(m, `sev.${s.req.sev}`),
    ll(m, APPLICABILITY[s.applicability.status].label), ll(m, STATUS[s.status].label), gapRisk[s.req.id] ?? "",
    s.statement.text, s.answer.notes, s.answer.compensating, s.answer.plan, s.answer.owner, s.answer.target, ll(m, s.req.source),
  ]);
  const marked = m.marking ? [[m.marking]] : [];
  return [...marked, header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}
