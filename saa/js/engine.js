// SA&A rules as pure functions: security categorization, control profile,
// SA&A tier, checklist applicability, progress, risk ratings, POA&M and the
// suggested authorization decision. No DOM access, so it can be unit-tested.

import {
  CONFIDENTIALITY, CONTROL_FAMILIES, CONTROL_STATUS, GUARDRAILS, INJURY, ITEMS, ITEM_MAP, ITEM_STATUS,
  PACKAGE, SEVERITIES, STEPS, TIERS,
} from "./data.js";

export const STATE_VERSION = 1;

export function newState() {
  return {
    version: STATE_VERSION,
    profile: {
      name: "", dept: "", version: "", description: "",
      deployment: "", sourcing: "", users: "", internet: "", pi: "", adm: "", interconnect: "", critical: "",
      roles: {}, tierOverride: "",
    },
    cat: { conf: "", integrity: "", availability: "", confNotes: "", intNotes: "", availNotes: "" },
    items: {},
    controls: {},
    guardrails: {},
    risks: [],
    findings: [],
    auth: { decision: "", ao: "", date: "", expiry: "", conditions: "", notes: "" },
  };
}

// Fills in fields added since the state was saved, so older saves keep working.
export function normalize(s) {
  const base = newState();
  const out = { ...base, ...s };
  out.profile = { ...base.profile, ...(s?.profile ?? {}), roles: { ...(s?.profile?.roles ?? {}) } };
  out.cat = { ...base.cat, ...(s?.cat ?? {}) };
  out.auth = { ...base.auth, ...(s?.auth ?? {}) };
  for (const k of ["items", "controls", "guardrails"]) out[k] = { ...(s?.[k] ?? {}) };
  for (const k of ["risks", "findings"]) out[k] = Array.isArray(s?.[k]) ? s[k] : [];
  out.version = STATE_VERSION;
  return out;
}

const CONF = Object.fromEntries(CONFIDENTIALITY.map((c) => [c.id, c]));
const INJ = Object.fromEntries(INJURY.map((c) => [c.id, c]));
const CLOUD = new Set(["iaas", "paas", "saas", "hybrid"]);
const TENANCY = new Set(["iaas", "paas", "hybrid"]);

// ---------------------------------------------------------------- categorization

export function categorization(state) {
  const { conf, integrity, availability } = state.cat;
  const c = CONF[conf], i = INJ[integrity], a = INJ[availability];
  const complete = !!(c && i && a);
  const cloud = CLOUD.has(state.profile.deployment);
  const warnings = [];
  let label = "Not yet categorized", code = "", profile = null;

  if (complete) {
    label = `${c.label} / ${i.label} integrity / ${a.label} availability`;
    code = `${abbrev(c)}${i.label[0]}${a.label[0]}`;
    profile = controlProfile(c, i, a, cloud);
    if (c.classified) warnings.push("Classified information: the system must run on infrastructure accredited for that level. Public cloud and most departmental networks are not. Engage the CSO/DSO and CCCS before going further.");
    if (c.id === "pc") warnings.push("Protected C information needs controls beyond the standard profiles. Engage the CSO/DSO and CCCS; standard public cloud offerings are generally not appropriate.");
    if (cloud && c.rank >= 2 && state.profile.deployment === "saas") warnings.push("Protected B in SaaS: confirm the service is assessed against the CCCS Medium Cloud Control Profile and hosted in Canada, or obtain the required approvals.");
    if (c.rank <= 1 && (i.rank >= 3 || a.rank >= 3)) warnings.push("Low confidentiality but high integrity or availability: make sure the profile is tailored for integrity and availability rather than chosen on confidentiality alone.");
  }
  if (state.profile.pi === "yes" && c && c.rank === 0) warnings.push("Personal information is usually at least Protected A. Check the confidentiality level.");
  return { complete, conf: c ?? null, integrity: i ?? null, availability: a ?? null, label, code, profile, warnings };
}

function abbrev(c) {
  return { unclassified: "U", pa: "PA", pb: "PB", pc: "PC", confidential: "C", secret: "S", topsecret: "TS" }[c.id];
}

function controlProfile(c, i, a, cloud) {
  const high = i.rank >= 3 || a.rank >= 3;
  if (c.classified) {
    return {
      name: c.id === "secret" ? "ITSG-33 Annex 4A Profile 3 (SECRET / Medium / Medium) as a starting point" : "Specialized profile for classified systems",
      detail: "Classified systems follow specialized requirements set with the CSO/DSO and CCCS. Confirm the profile and the accredited infrastructure before design.",
    };
  }
  if (c.id === "pc") {
    return { name: "Tailored profile above PBMM (no standard profile)", detail: "Start from ITSG-33 Annex 4A Profile 1 and add controls for extremely grave injury with CSO/DSO and CCCS advice." };
  }
  const tailorUp = high ? " Tailor upward: add control enhancements for high integrity or availability (for example stronger change control, redundancy, tested recovery)." : "";
  if (cloud) {
    if (c.rank === 0 && i.rank === 1 && a.rank === 1) {
      return { name: "CCCS Low Cloud Control Profile", detail: "For cloud services handling Unclassified information with low integrity and availability needs (ITSP.50.103)." };
    }
    return { name: "CCCS Medium Cloud Control Profile", detail: "The cloud profile for up to Protected B / Medium / Medium (ITSP.50.103). It replaced the GC PBMM cloud profile." + tailorUp };
  }
  if (c.rank <= 1 && i.rank === 1 && a.rank === 1) {
    return { name: "ITSG-33 Annex 4A Profile 1 (PBMM), tailored down", detail: "No separate low profile exists for on-premises systems: start from Profile 1 and remove controls the lower injury does not justify, recording the reason for each." };
  }
  return { name: "ITSG-33 Annex 4A Profile 1 (PROTECTED B / Medium / Medium)", detail: "The baseline profile for most GC systems up to Protected B." + tailorUp };
}

// ---------------------------------------------------------------- tier

export function tier(state) {
  const p = state.profile;
  const cat = categorization(state);
  const enhanced = [], standard = [];
  if (cat.conf?.rank >= 3) enhanced.push(`Confidentiality is ${cat.conf.label}`);
  if (cat.integrity?.rank >= 3) enhanced.push("High integrity injury");
  if (cat.availability?.rank >= 3) enhanced.push("High availability injury");
  if (p.critical === "yes" && (p.users === "public" || p.internet === "yes")) enhanced.push("Supports a critical service and is exposed to the internet or the public");

  if (cat.conf?.rank === 2) standard.push("Protected B information");
  if (cat.integrity?.rank === 2) standard.push("Medium integrity injury");
  if (cat.availability?.rank === 2) standard.push("Medium availability injury");
  if (p.users === "public") standard.push("Used by members of the public");
  if (p.internet === "yes") standard.push("Reachable from the internet");
  if (p.pi === "yes") standard.push("Handles personal information");
  if (p.adm === "yes") standard.push("Supports automated decisions");
  if (p.interconnect === "yes") standard.push("Connects to other systems");
  if (p.critical === "yes") standard.push("Supports a critical service");

  let id, reasons;
  if (enhanced.length) { id = "enhanced"; reasons = enhanced; }
  else if (standard.length) { id = "standard"; reasons = standard; }
  else if (!cat.complete) { id = "standard"; reasons = ["Categorization not complete: Standard assumed until it is"]; }
  else { id = "light"; reasons = ["Unclassified or Protected A with low integrity and availability injury, and limited exposure"]; }

  const suggested = id;
  if (TIERS[p.tierOverride]) id = p.tierOverride;
  return { id, suggested, overridden: id !== suggested, reasons, ...TIERS[id] };
}

// ---------------------------------------------------------------- applicability

export function context(state) {
  const p = state.profile;
  const cat = categorization(state);
  return {
    tier: tier(state).id,
    cloud: CLOUD.has(p.deployment),
    tenancy: TENANCY.has(p.deployment),
    saas: p.deployment === "saas",
    custom: p.sourcing === "custom" || p.sourcing === "cotsmod",
    cots: p.sourcing === "cots" || p.sourcing === "cotsmod" || p.sourcing === "oss",
    internet: p.internet === "yes",
    public: p.users === "public",
    pi: p.pi || "unknown",
    adm: p.adm || "unknown",
    interconnect: p.interconnect || "unknown",
    critical: p.critical || "unknown",
    confRank: cat.conf?.rank ?? 2,
    classified: !!cat.conf?.classified,
    high: (cat.integrity?.rank ?? 0) >= 3 || (cat.availability?.rank ?? 0) >= 3,
  };
}

export function itemLevel(item, ctx) {
  return item.level(ctx);
}

export const itemStatus = (state, id) => state.items[id]?.status || "todo";
const STATUS_SCORE = Object.fromEntries(ITEM_STATUS.map((s) => [s.id, s.score]));

// Items of a step (or all steps) with their applicability and status.
export function items(state, stepId) {
  const ctx = context(state);
  return ITEMS.filter((i) => !stepId || i.step === stepId).map((item) => {
    const level = itemLevel(item, ctx);
    let status = itemStatus(state, item.id);
    if (level === "na") status = "na";
    return { item, level, status };
  });
}

function score(rows) {
  const counted = rows.filter((r) => r.level !== "na" && r.status !== "na");
  const total = counted.length;
  const done = counted.filter((r) => r.status === "done").length;
  const points = counted.reduce((s, r) => s + (STATUS_SCORE[r.status] ?? 0), 0);
  return { total, done, pct: total ? points / total : 0 };
}

export function progress(state, stepId) {
  const rows = items(state, stepId);
  return { all: score(rows), required: score(rows.filter((r) => r.level === "required")) };
}

export function stepProgress(state) {
  return STEPS.map((s) => ({ step: s, ...progress(state, s.id) }));
}

// ---------------------------------------------------------------- controls

const CTL_SCORE = Object.fromEntries(CONTROL_STATUS.map((s) => [s.id, s.score]));

export function controlsSummary(state) {
  const fams = CONTROL_FAMILIES.map((f) => ({ fam: f, status: state.controls[f.id]?.status || "notstarted" }));
  const counted = fams.filter((f) => f.status !== "na");
  const pct = counted.length ? counted.reduce((s, f) => s + CTL_SCORE[f.status], 0) / counted.length : 0;
  const ctx = context(state);
  const rails = ctx.tenancy ? GUARDRAILS.map((g) => ({ g, status: state.guardrails[g.n]?.status || "notstarted" })) : [];
  const railsMet = rails.filter((r) => r.status === "implemented" || r.status === "inherited" || r.status === "na").length;
  return { fams, pct, rails, railsMet, gaps: fams.filter((f) => ["notstarted", "planned", "partial"].includes(f.status)) };
}

// ---------------------------------------------------------------- risk

export const RISK_LEVELS = {
  low: { label: "Low", rank: 1 },
  medium: { label: "Medium", rank: 2 },
  high: { label: "High", rank: 3 },
  veryhigh: { label: "Very high", rank: 4 },
};

// 5 × 5 matrix: 1–4 low, 5–9 medium, 10–15 high, 16–25 very high.
export function riskLevel(l, i) {
  const s = Number(l) * Number(i);
  if (!s) return null;
  const id = s >= 16 ? "veryhigh" : s >= 10 ? "high" : s >= 5 ? "medium" : "low";
  return { score: s, id, ...RISK_LEVELS[id] };
}

export function rateRisk(r) {
  const inherent = riskLevel(r.l, r.i);
  const residual = riskLevel(r.rl || r.l, r.ri || r.i);
  return { ...r, inherent, residual };
}

export function riskSummary(state) {
  const rated = state.risks.map(rateRisk);
  const count = (key) => Object.fromEntries(Object.keys(RISK_LEVELS).map((k) => [k, rated.filter((r) => r[key]?.id === k).length]));
  const maxResidual = rated.reduce((m, r) => (r.residual && r.residual.rank > (m?.rank ?? 0) ? r.residual : m), null);
  return {
    rated,
    inherent: count("inherent"),
    residual: count("residual"),
    maxResidual,
    // Residual risks the AO is asked to accept explicitly.
    forAcceptance: rated.filter((r) => r.residual && r.residual.rank >= 2),
    untreated: rated.filter((r) => !r.treatment),
  };
}

// ---------------------------------------------------------------- findings

const SEV = Object.fromEntries(SEVERITIES.map((s) => [s.id, s]));
const isOpen = (f) => f.status === "open" || f.status === "poam" || !f.status;

export function findingSummary(state) {
  const open = state.findings.filter(isOpen);
  const bySev = Object.fromEntries(SEVERITIES.map((s) => [s.id, open.filter((f) => f.severity === s.id).length]));
  return {
    total: state.findings.length,
    open,
    bySev,
    criticalOpen: open.filter((f) => f.severity === "critical"),
    highOpen: open.filter((f) => f.severity === "high"),
    notInPoam: open.filter((f) => f.status !== "poam"),
    overdue: open.filter((f) => f.due && f.due < today()),
  };
}

export function poam(state) {
  return state.findings
    .filter(isOpen)
    .slice()
    .sort((a, b) => (SEV[b.severity]?.rank ?? 0) - (SEV[a.severity]?.rank ?? 0) || String(a.due || "9999").localeCompare(String(b.due || "9999")));
}

// ---------------------------------------------------------------- package and decision

export function packageStatus(state) {
  const ctx = context(state);
  return PACKAGE.map(([name, id]) => {
    const item = ITEM_MAP[id];
    const level = itemLevel(item, ctx);
    return { name, id, level, status: level === "na" ? "na" : itemStatus(state, id) };
  });
}

// The decision the evidence supports. The AO decides; this only states what the
// package shows and what to fix first.
export function recommendation(state) {
  const pkg = packageStatus(state);
  const missing = pkg.filter((p) => p.level === "required" && p.status !== "done" && p.status !== "na");
  const f = findingSummary(state);
  const r = riskSummary(state);
  const cat = categorization(state);
  const reasons = [];
  const blockers = [];

  if (!cat.complete) blockers.push("The system is not yet categorized.");
  if (missing.length) blockers.push(`Package documents not complete: ${missing.map((m) => m.name).join(", ")}.`);
  if (f.criticalOpen.length) blockers.push(`${f.criticalOpen.length} critical finding(s) open. Remediate before seeking authorization.`);
  if (r.untreated.length) blockers.push(`${r.untreated.length} risk(s) in the register have no treatment decision.`);

  if (blockers.length) {
    return { id: "notready", label: "Not ready for an authorization decision", tone: "bad", reasons: blockers };
  }
  if (r.residual.veryhigh) {
    return {
      id: "deny", label: "Do not authorize, or escalate", tone: "bad",
      reasons: [`${r.residual.veryhigh} residual risk(s) rated very high. Reduce them, or escalate to a level that can accept them (for example the CSO and deputy head) before operating.`],
    };
  }
  if (f.highOpen.length) reasons.push(`${f.highOpen.length} high-severity finding(s) still open.`);
  if (r.residual.high) reasons.push(`${r.residual.high} residual risk(s) rated high.`);
  if (reasons.length) {
    if (f.notInPoam.length) reasons.push(`${f.notInPoam.length} open finding(s) not yet in the POA&M.`);
    return { id: "interim", label: "Interim (time-limited) authorization, or authorization with strict conditions", tone: "warn", reasons };
  }
  if (f.open.length || r.residual.medium) {
    if (f.open.length) reasons.push(`${f.open.length} open finding(s) of medium or low severity, to be tracked in the POA&M.`);
    if (r.residual.medium) reasons.push(`${r.residual.medium} residual risk(s) rated medium for the AO to accept.`);
    return { id: "conditional", label: "Authorize with conditions (POA&M)", tone: "warn", reasons };
  }
  return { id: "ato", label: "Authorize to operate", tone: "ok", reasons: ["Package complete, no open findings, residual risks low."] };
}

// When the authorization should be revisited: the interim expiry if set, otherwise
// the decision date plus the tier's period.
export function reauthDate(state) {
  const { decision, date, expiry } = state.auth;
  if (expiry) return expiry;
  if (!date || !decision || decision === "deny") return "";
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  const years = decision === "interim" ? 0.5 : tier(state).reauthYears;
  d.setUTCMonth(d.getUTCMonth() + Math.round(years * 12));
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------- overall

export function overall(state) {
  const rows = items(state);
  return { all: score(rows), required: score(rows.filter((r) => r.level === "required")) };
}

// Next things to do: required items not done, earliest step first.
export function nextActions(state, n = 5) {
  return items(state)
    .filter((r) => r.level === "required" && r.status !== "done" && r.status !== "na")
    .slice(0, n);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
