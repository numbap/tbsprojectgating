// SA&A summary report: one model of blocks rendered to HTML (screen and print),
// Markdown, and the POA&M as CSV. Pure functions, no DOM access.

import {
  CONTROL_STATUS, DECISIONS, DEPLOYMENTS, FINDING_SOURCES, FINDING_STATUS, ITEM_STATUS, REAUTH_TRIGGERS,
  ROLES, SEVERITIES, SOURCES, SOURCING, STEPS, TREATMENTS, USERS, YES_NO,
} from "./data.js";
import {
  categorization, controlsSummary, findingSummary, items, overall, packageStatus, poam, reauthDate, recommendation,
  riskSummary, stepProgress, tier,
} from "./engine.js";

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const pick = (pairs, v) => pairs.find(([k]) => k === v)?.[1] ?? (v ? v : "Not answered");
const lbl = (list, id) => list.find((x) => x.id === id)?.label ?? "";
export const pct = (x) => `${Math.round(x * 100)}%`;
const LEVEL = { required: "Required", recommended: "Recommended", na: "Not applicable" };

export function buildReport(state, { marking = null, date = new Date().toISOString().slice(0, 10) } = {}) {
  const p = state.profile;
  const cat = categorization(state);
  const tr = tier(state);
  const ov = overall(state);
  const fs = findingSummary(state);
  const rs = riskSummary(state);
  const rec = recommendation(state);
  const cs = controlsSummary(state);
  const decision = DECISIONS.find((d) => d.id === state.auth.decision);
  const blocks = [];
  const h2 = (text) => blocks.push({ type: "h2", text });
  const para = (text) => blocks.push({ type: "p", text });
  const kv = (rows) => blocks.push({ type: "kv", rows });
  const table = (head, rows, empty) => blocks.push({ type: "table", head, rows, empty });
  const list = (items) => blocks.push({ type: "list", items });

  blocks.push({
    type: "kpis",
    items: [
      [cat.code || "—", "Security category"],
      [tr.label, "SA&A tier"],
      [pct(ov.required.pct), "Required activities complete"],
      [String(fs.open.length), "Open findings"],
      [rs.maxResidual?.label ?? "—", "Highest residual risk"],
    ],
  });

  h2("Summary");
  para(`${p.name || "The system"}${p.dept ? ` (${p.dept})` : ""} is categorized ${cat.complete ? cat.label : "— categorization not complete"}. The SA&A is planned at the ${tr.label} tier. ${ov.required.done} of ${ov.required.total} required activities are done.`);
  para(`What the evidence supports today: ${rec.label}.`);
  if (rec.reasons.length) list(rec.reasons);

  h2("System");
  kv([
    ["Name", p.name], ["Version or release", p.version], ["Department", p.dept], ["Description", p.description],
    ["Deployment", pick(DEPLOYMENTS, p.deployment)], ["Sourcing", pick(SOURCING, p.sourcing)], ["Users", pick(USERS, p.users)],
    ["Reachable from the internet", pick(YES_NO, p.internet)], ["Personal information", pick(YES_NO, p.pi)],
    ["Automated decisions", pick(YES_NO, p.adm)], ["Connects to other systems", pick(YES_NO, p.interconnect)],
    ["Supports a critical service", pick(YES_NO, p.critical)],
  ]);

  h2("Roles");
  kv(ROLES.map(([id, name]) => [name, p.roles?.[id] || "Not named"]));

  h2("Security categorization");
  kv([
    ["Confidentiality", cat.conf?.label ?? "Not set"], ["Integrity injury", cat.integrity?.label ?? "Not set"],
    ["Availability injury", cat.availability?.label ?? "Not set"], ["Security category", cat.label],
    ["Recommended control profile", cat.profile?.name ?? "Complete the categorization"],
  ]);
  if (cat.profile) para(cat.profile.detail);
  for (const [k, v] of [["Confidentiality reasoning", state.cat.confNotes], ["Integrity reasoning", state.cat.intNotes], ["Availability reasoning", state.cat.availNotes]]) {
    if (v) para(`${k}: ${v}`);
  }
  if (cat.warnings.length) list(cat.warnings);

  h2("SA&A tier");
  para(`${tr.label}${tr.overridden ? ` (chosen; the tool suggests ${tr.suggested})` : ""}: ${tr.summary}`);
  list(tr.reasons);

  h2("Progress by step");
  table(["Step", "Required done", "All activities"], stepProgress(state).map((s) => [
    `${s.step.n}. ${s.step.title}`, `${s.required.done} / ${s.required.total}`, pct(s.all.pct),
  ]));

  h2("Authorization package");
  table(["Document", "Applies", "Status"], packageStatus(state).map((d) => [d.name, LEVEL[d.level], lbl(ITEM_STATUS, d.status)]));

  h2("Security controls");
  table(["Family", "Status", "Notes"], cs.fams.map((f) => [`${f.fam.id} ${f.fam.name}`, lbl(CONTROL_STATUS, f.status), state.controls[f.fam.id]?.note ?? ""]));
  if (cs.rails.length) {
    blocks.push({ type: "h3", text: "GC Cloud Guardrails" });
    table(["Guardrail", "Status", "Notes"], cs.rails.map((r) => [`${r.g.n}. ${r.g.name}`, lbl(CONTROL_STATUS, r.status), state.guardrails[r.g.n]?.note ?? ""]));
  }

  h2("Threat and risk assessment");
  table(["Threat", "Asset", "Inherent", "Treatment", "Planned or existing controls", "Residual"], rs.rated.map((r) => [
    r.threat, r.asset, r.inherent ? `${r.inherent.label} (${r.inherent.score})` : "Not rated", pick(TREATMENTS, r.treatment),
    [r.existing, r.planned].filter(Boolean).join(" / "), r.residual ? `${r.residual.label} (${r.residual.score})` : "Not rated",
  ]), "No risks recorded yet.");
  if (rs.forAcceptance.length) {
    blocks.push({ type: "h3", text: "Residual risks for the authorizing official to accept" });
    list(rs.forAcceptance.map((r) => `${r.residual.label}: ${r.threat}${r.asset ? ` (${r.asset})` : ""}`));
  }

  h2("Findings and Plan of Action and Milestones (POA&M)");
  table(["Finding", "Severity", "Source", "Control", "Action", "Owner", "Due", "Status"], poam(state).map((f) => [
    f.title, lbl(SEVERITIES, f.severity), pick(FINDING_SOURCES, f.source), f.control, f.action, f.owner, f.due, pick(FINDING_STATUS, f.status || "open"),
  ]), "No open findings.");
  const closed = state.findings.filter((f) => f.status === "remediated" || f.status === "accepted");
  if (closed.length) para(`${closed.length} finding(s) remediated or accepted are not listed.`);

  h2("Authorization decision");
  kv([
    ["Suggested by the evidence", rec.label],
    ["Decision recorded", decision?.label ?? "Not yet decided"],
    ["Authorizing official", state.auth.ao || p.roles?.ao || "Not named"],
    ["Decision date", state.auth.date || "—"],
    ["Review or expiry date", reauthDate(state) || "—"],
    ["Conditions", state.auth.conditions || "—"],
  ]);
  if (state.auth.notes) para(state.auth.notes);

  h2("Outstanding required activities");
  const open = items(state).filter((r) => r.level === "required" && r.status !== "done" && r.status !== "na");
  table(["Step", "Activity", "Status", "Notes"], open.map((r) => [
    STEPS.find((s) => s.id === r.item.step).title, r.item.title, lbl(ITEM_STATUS, r.status), state.items[r.item.id]?.note ?? "",
  ]), "None: every required activity is done.");

  h2("Reauthorization triggers");
  list(REAUTH_TRIGGERS);

  h2("Sources and limitations");
  para("Prepared with the SA&A Wizard, a self-assessment aid. It paraphrases Treasury Board and CCCS publications and is not an official Government of Canada tool. Your departmental SA&A procedure, templates and authorities take precedence. Check the current versions of:");
  list(SOURCES);

  return { title: `SA&A summary: ${p.name || "Untitled system"}`, date, marking, blocks };
}

// ---------------------------------------------------------------- HTML

export function reportToHTML(m) {
  const mk = m.marking ? `<p class="report-marking">${esc(m.marking)}</p><p class="print-marking print-marking-top" aria-hidden="true">${esc(m.marking)}</p><p class="print-marking print-marking-bottom" aria-hidden="true">${esc(m.marking)}</p>` : "";
  const body = m.blocks.map((b) => {
    switch (b.type) {
      case "h2": return `<h2>${esc(b.text)}</h2>`;
      case "h3": return `<h3>${esc(b.text)}</h3>`;
      case "p": return `<p>${esc(b.text)}</p>`;
      case "list": return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
      case "kv": return `<dl class="kv-list">${b.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v || "—")}</dd></div>`).join("")}</dl>`;
      case "kpis": return `<div class="kpis">${b.items.map(([v, l]) => `<div class="kpi"><div class="kpi-v">${esc(v)}</div><div class="kpi-l">${esc(l)}</div></div>`).join("")}</div>`;
      case "table":
        if (!b.rows.length) return `<p class="muted">${esc(b.empty ?? "None.")}</p>`;
        return `<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(b.head.join(", "))}"><table><thead><tr>${b.head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      default: return "";
    }
  }).join("\n");
  return `<article class="report card">${mk}<h1>${esc(m.title)}</h1><p class="muted">Generated ${esc(m.date)}</p>${body}</article>`;
}

// ---------------------------------------------------------------- Markdown

const mdCell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");

export function reportToMarkdown(m) {
  const out = [];
  if (m.marking) out.push(`**${m.marking}**`, "");
  out.push(`# ${m.title}`, "", `Generated ${m.date}`, "");
  for (const b of m.blocks) {
    switch (b.type) {
      case "h2": out.push(`## ${b.text}`, ""); break;
      case "h3": out.push(`### ${b.text}`, ""); break;
      case "p": out.push(b.text, ""); break;
      case "list": out.push(...b.items.map((i) => `- ${i}`), ""); break;
      case "kv": out.push(...b.rows.map(([k, v]) => `- **${k}:** ${v || "—"}`), ""); break;
      case "kpis": out.push(...b.items.map(([v, l]) => `- **${l}:** ${v}`), ""); break;
      case "table":
        if (!b.rows.length) { out.push(`_${b.empty ?? "None."}_`, ""); break; }
        out.push(`| ${b.head.map(mdCell).join(" | ")} |`, `| ${b.head.map(() => "---").join(" | ")} |`, ...b.rows.map((r) => `| ${r.map(mdCell).join(" | ")} |`), "");
        break;
    }
  }
  if (m.marking) out.push(`**${m.marking}**`, "");
  return out.join("\n");
}

// ---------------------------------------------------------------- POA&M CSV

const csvCell = (s) => {
  let v = String(s ?? "");
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`; // keep spreadsheets from evaluating formulas
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};

export function poamToCSV(state, marking = null) {
  const head = ["Finding", "Severity", "Source", "Control", "Action", "Interim measures", "Owner", "Due", "Status"];
  const rows = poam(state).map((f) => [
    f.title, lbl(SEVERITIES, f.severity), pick(FINDING_SOURCES, f.source), f.control, f.action, f.interim, f.owner, f.due, pick(FINDING_STATUS, f.status || "open"),
  ]);
  const lines = [head, ...rows].map((r) => r.map(csvCell).join(","));
  if (marking) lines.unshift(csvCell(marking));
  return lines.join("\r\n") + "\r\n";
}
