// Gating engine. Pure functions only (no DOM) so it runs in the browser and
// under `node --test`. Bilingual content stays as { en, fr } objects here; the
// UI and report pick the language with L().

import { AREAS, AREA_MAP, APPLICABILITY } from "./data/areas.js";
import { GATES, GATE_MAP, MODELS } from "./data/gates.js";
import { GOVERNANCE } from "./data/req-governance.js";
import { DELIVERY } from "./data/req-delivery.js";
import { READINESS } from "./data/req-readiness.js";
import { COST_MAP, PCRA_LEVELS, PROFILE_DEFAULTS, pcraEstimate } from "./data/scoping.js";
import { L, fmtMoney, getLang, t } from "./i18n.js";

// ------------------------------------------------------------------ catalog

const AREA_ORDER = Object.fromEntries(AREAS.map((a, i) => [a.id, i]));
const GATE_ORDER = Object.fromEntries(GATES.map((g, i) => [g.id, i]));

function sortKey(r) {
  const [prefix, num] = r.id.split("-");
  return AREA_ORDER[r.area] * 10000 + (prefix === r.area ? 0 : 5000) + Number(num);
}

export const REQUIREMENTS = [...GOVERNANCE, ...DELIVERY, ...READINESS]
  .map((r) => ({ ...r, area: r.area ?? r.id.split("-")[0], scope: r.scope ?? [], revisit: r.revisit ?? [] }))
  .sort((a, b) => sortKey(a) - sortKey(b));

export const REQ_MAP = Object.fromEntries(REQUIREMENTS.map((r) => [r.id, r]));

export const reqsByArea = (areaId) => REQUIREMENTS.filter((r) => r.area === areaId);

// Requirements first expected at one of the given reference gates (G1..G7).
export const reqsForGates = (gateIds) => REQUIREMENTS
  .filter((r) => gateIds.includes(r.gate))
  .sort((a, b) => GATE_ORDER[a.gate] - GATE_ORDER[b.gate] || sortKey(a) - sortKey(b));

// ------------------------------------------------------------------ state

export const STATE_VERSION = 1;

export function newState() {
  return {
    version: STATE_VERSION,
    profile: { ...PROFILE_DEFAULTS },
    pcraAnswers: {},
    answers: {},
    review: { text: "", results: null, analyzedAt: null },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const EMPTY_ANSWER = Object.freeze({ q: [], override: "", applicability: "", notes: "", owner: "", plan: "", target: "", statement: "", compensating: "" });

export function getAnswer(state, id) {
  return { ...EMPTY_ANSWER, ...(state.answers[id] ?? {}) };
}

// ------------------------------------------------------------------ governance profile

// Thresholds from the source instruments, in millions of dollars:
// - GC EARB review and digital concept cases, by OPMCA class (Directive on
//   Service and Digital 4.3.2.1; Policy on the Planning and Management of
//   Investments, Appendix B). National Defence ($15M) is noted in the interface.
// - Completing a PCRA, by OPMCA class (Directive on the Management of Projects
//   and Programmes, Appendix C).
export const EARB_THRESHOLDS = { none: 2.5, unknown: 2.5, 0: 2.5, 1: 2.5, 2: 5, 3: 10, 4: 25 };
export const PCRA_THRESHOLDS = { none: 2.5, unknown: 2.5, 0: 2.5, 1: 5, 2: 10, 3: 25, 4: 50 };
export const BASE_LIMIT = 2.5;
export const OCG_THRESHOLD = 25;

const compare = (band, limit) => (band.min >= limit ? "above" : band.max <= limit ? "within" : "straddles");
const tri = (c) => (c === "above" ? "yes" : c === "within" ? "no" : "check");

// Derives complexity, authority, oversight and gating model from the profile.
//
// Approval authority follows Appendix C of the Directive on the Management of
// Projects and Programmes: departments without an approved OPMCA class (or with
// class 0) need Treasury Board approval for every project over the $2.5M base
// limit; with class 1 or higher, the minister may approve projects whose PCRA
// level does not exceed the class, whatever their cost. Treasury Board may
// still call in any project.
export function governance(profile, pcraAnswers = {}) {
  const p = { ...PROFILE_DEFAULTS, ...profile };
  const band = COST_MAP[p.cost] ?? COST_MAP["5-10"];
  const opmcaClass = ["0", "1", "2", "3", "4"].includes(p.opmca) ? Number(p.opmca) : null;
  const hasClass = opmcaClass >= 1;

  // Complexity and risk.
  let pcra = null;
  let pcraSource = null;
  let pcraScore = null;
  let pcraFloor = false;
  if (["1", "2", "3", "4"].includes(p.pcra)) {
    pcra = Number(p.pcra);
    pcraSource = "official";
  } else {
    const est = pcraEstimate(pcraAnswers, p);
    if (est.level) {
      pcra = est.level;
      pcraSource = "estimate";
      pcraScore = est.score;
      pcraFloor = est.floors.includes("horizontal");
    }
  }
  const pcraThreshold = PCRA_THRESHOLDS[p.opmca] ?? BASE_LIMIT;
  const pcraRequired = tri(compare(band, pcraThreshold));

  // Project approval authority (Appendix C).
  const reasons = [];
  let tb;
  let tbBasis;
  if (!hasClass) {
    tbBasis = "base";
    tb = tri(compare(band, BASE_LIMIT));
    if (tb !== "no") reasons.push("noOpmca");
  } else {
    tbBasis = "class";
    if (pcra && pcra > opmcaClass) { tb = "yes"; reasons.push("pcra"); }
    else if (pcra) tb = "no";
    else if (pcraRequired === "no") { tb = "no"; tbBasis = "belowThreshold"; }
    else { tb = "check"; reasons.push("pcraUnknown"); }
  }

  // Oversight.
  const digital = ["digital", "mixed"].includes(p.projectType);
  const earbThreshold = EARB_THRESHOLDS[p.opmca] ?? BASE_LIMIT;
  const earbCost = digital ? compare(band, earbThreshold) : "within";
  const earbReasons = [];
  if (earbCost === "above") earbReasons.push("cost");
  if (earbCost === "straddles") earbReasons.push("costStraddles");
  if (digital && p.emergingTech === "yes") earbReasons.push("emerging");
  const earb = earbReasons.some((r) => r !== "costStraddles") ? "yes" : earbReasons.length ? "check" : "no";
  const conceptCase = tri(earbCost);
  const ocg = tri(compare(band, OCG_THRESHOLD));

  const highRisk = (pcra ?? 0) >= 3 || tb === "yes";
  const submission = tb !== "no" || p.newFunding === "yes";

  // Gating model.
  let recommended;
  if (pcra >= 3 || tb === "yes" || band.min >= 100) recommended = "full";
  else if (pcra === 2) recommended = "streamlined";
  else if (pcra === 1) recommended = "light";
  else recommended = band.min >= 25 ? "full" : band.min >= 2.5 ? "streamlined" : "light";
  const model = MODELS[p.model] ? p.model : recommended;

  return {
    band, opmcaClass, hasClass, pcra, pcraSource, pcraScore, pcraFloor, pcraThreshold, pcraRequired,
    tb, tbBasis, tbReasons: reasons,
    newFunding: p.newFunding === "yes", submission,
    digital, earb, earbReasons, earbThreshold, conceptCase, ocg,
    highRisk, independentReview: highRisk,
    model, recommendedModel: recommended,
    nextGate: GATE_MAP[p.nextGate] ? p.nextGate : "G3",
  };
}

// Values that requirement scope rules can test, in addition to profile fields.
export function scopeContext(state, gov = governance(state.profile, state.pcraAnswers)) {
  return {
    ...PROFILE_DEFAULTS, ...state.profile,
    tb: gov.tb === "no" && !gov.newFunding ? "no" : "yes",
    earb: gov.earb === "no" ? "no" : "yes",
    highRisk: gov.highRisk ? "yes" : "no",
    digital: gov.digital ? "yes" : "no",
    pcraLevel: gov.pcra ? String(gov.pcra) : "unknown",
    pcraRequired: gov.pcraRequired === "no" ? "no" : "yes",
    conceptCase: gov.conceptCase === "no" ? "no" : "yes",
    ocg: gov.ocg === "no" ? "no" : "yes",
  };
}

// The model gate (e.g. S3) that contains a reference gate (e.g. G5).
export function modelGateFor(model, gateId) {
  return MODELS[model].gates.find((g) => g.includes.includes(gateId));
}

export function modelGates(state, gov = governance(state.profile, state.pcraAnswers)) {
  return MODELS[gov.model].gates;
}

// ------------------------------------------------------------------ applicability

export { APPLICABILITY };

function matches(when, ctx) {
  return Object.entries(when).every(([k, v]) => (Array.isArray(v) ? v.includes(ctx[k]) : ctx[k] === v));
}

// A manual override wins; then the first matching scope rule; then the base status.
export function evaluateApplicability(req, ctx, answer = {}) {
  if (answer.applicability) return { status: answer.applicability, reason: null, overridden: true };
  for (const rule of req.scope) {
    if (matches(rule.when, ctx)) return { status: rule.status, reason: rule.reason, overridden: false };
  }
  return { status: req.base, reason: null, overridden: false };
}

// ------------------------------------------------------------------ status

export const ANSWER_OPTIONS = [
  { value: "yes", label: { en: "Yes", fr: "Oui" } },
  { value: "partial", label: { en: "Partly", fr: "En partie" } },
  { value: "no", label: { en: "No", fr: "Non" } },
  { value: "unknown", label: { en: "Don't know", fr: "Je ne sais pas" } },
  { value: "na", label: { en: "N/A", fr: "S.O." } },
];

export const STATUS = {
  met: { label: { en: "Met", fr: "Satisfait" }, score: 1 },
  departmental: { label: { en: "Departmental", fr: "Ministériel" }, score: 1 },
  partial: { label: { en: "Partly met", fr: "Partiellement satisfait" }, score: 0.5 },
  planned: { label: { en: "Planned", fr: "Prévu" }, score: 0.25 },
  "not-met": { label: { en: "Not met", fr: "Non satisfait" }, score: 0 },
  unknown: { label: { en: "Unknown", fr: "Inconnu" }, score: 0 },
  unanswered: { label: { en: "Not assessed", fr: "Non évalué" }, score: 0 },
  na: { label: { en: "Not applicable", fr: "Sans objet" }, score: null },
};

export const OVERRIDE_OPTIONS = ["met", "partial", "planned", "not-met"];

export function deriveStatus(questionCount, q = []) {
  const counts = { yes: 0, partial: 0, no: 0, unknown: 0, na: 0 };
  for (let i = 0; i < questionCount; i++) if (q[i]) counts[q[i]]++;
  const answered = counts.yes + counts.partial + counts.no + counts.unknown + counts.na;
  if (answered === 0) return "unanswered";
  if (counts.na === answered) return "na";
  const decided = counts.yes + counts.partial + counts.no;
  if (decided === 0) return "unknown";
  if (counts.no === 0 && counts.partial === 0 && counts.unknown === 0 && answered === questionCount) return "met";
  if (counts.yes === 0 && counts.partial === 0 && counts.unknown === 0) return "not-met";
  return "partial";
}

export function evaluateReq(req, state, ctx = scopeContext(state)) {
  const answer = getAnswer(state, req.id);
  const applicability = evaluateApplicability(req, ctx, answer);
  const questions = L(req.questions, "en");
  let status;
  if (applicability.status === "na") status = "na";
  else if (applicability.status === "departmental" && !answer.override && !answer.q.length) status = "departmental";
  else if (answer.override) status = answer.override;
  else status = deriveStatus(questions.length, answer.q);
  const openQuestions = questions.map((_, i) => i).filter((i) => answer.q[i] === "unknown");
  return { req, answer, applicability, status, openQuestions };
}

export function evaluateAll(state) {
  const ctx = scopeContext(state);
  return REQUIREMENTS.map((r) => evaluateReq(r, state, ctx));
}

// ------------------------------------------------------------------ scoring

function summarize(results) {
  const counts = Object.fromEntries(Object.keys(STATUS).map((k) => [k, 0]));
  let earned = 0;
  let possible = 0;
  for (const r of results) {
    counts[r.status]++;
    const s = STATUS[r.status].score;
    if (s !== null) { earned += s; possible += 1; }
  }
  const assessed = results.filter((r) => !["unanswered", "na", "departmental"].includes(r.status)).length;
  const inScope = results.filter((r) => !["na", "departmental"].includes(r.status)).length;
  return {
    counts, total: results.length, inScope, assessed,
    progress: inScope ? assessed / inScope : 1,
    score: possible ? earned / possible : 1,
  };
}

export function scoreAssessment(state, results = evaluateAll(state)) {
  const gov = governance(state.profile, state.pcraAnswers);
  const byArea = {};
  for (const a of AREAS) byArea[a.id] = summarize(results.filter((r) => r.req.area === a.id));
  const byGate = {};
  for (const g of MODELS[gov.model].gates) byGate[g.id] = summarize(results.filter((r) => g.includes.includes(r.req.gate)));
  // Readiness for the next gate counts everything due at or before it.
  const due = results.filter((r) => GATE_ORDER[r.req.gate] <= GATE_ORDER[gov.nextGate]);
  return { overall: summarize(results), byArea, byGate, nextGate: summarize(due), gov };
}

// ------------------------------------------------------------------ risk and gaps

const SEV_WEIGHT = { high: 3, medium: 2, low: 1 };
const GAP_FACTOR = { "not-met": 1, unknown: 0.8, planned: 0.75, partial: 0.5 };
export const RISK_LABELS = {
  High: { en: "High", fr: "Élevé" },
  Medium: { en: "Medium", fr: "Moyen" },
  Low: { en: "Low", fr: "Faible" },
};

// Overdue items (due at a gate already passed) weigh more than ones still ahead.
export function riskOf(severity, status, { recommended = false, overdue = false } = {}) {
  const factor = GAP_FACTOR[status];
  if (factor === undefined) return null;
  const score = SEV_WEIGHT[severity] * factor * (recommended ? 0.67 : 1) * (overdue ? 1.25 : 1);
  const level = score >= 2.25 ? "High" : score >= 1 ? "Medium" : "Low";
  return { score, level };
}

export function gapRegister(state, results = evaluateAll(state)) {
  const next = GATE_ORDER[governance(state.profile, state.pcraAnswers).nextGate];
  return results
    .map((r) => {
      const overdue = GATE_ORDER[r.req.gate] < next;
      return { ...r, overdue, due: GATE_ORDER[r.req.gate] <= next, risk: riskOf(r.req.sev, r.status, { recommended: r.applicability.status === "recommended", overdue }) };
    })
    .filter((r) => r.risk)
    .sort((a, b) => b.risk.score - a.risk.score || GATE_ORDER[a.req.gate] - GATE_ORDER[b.req.gate] || sortKey(a.req) - sortKey(b.req));
}

// ------------------------------------------------------------------ text

export const pcraLabel = (level, lang = getLang()) => (level ? `${level} (${L(PCRA_LEVELS[level], lang)})` : t("gov.pcraUnknown", {}, lang));

export function authoritySentence(gov, lang = getLang()) {
  if (gov.tb === "yes") return t("gov.tbYesSentence", {}, lang);
  if (gov.tb === "check") return t("gov.tbCheckSentence", {}, lang);
  return t(`gov.tbNo.${gov.tbBasis}`, { pcra: gov.pcra, opmca: gov.opmcaClass, threshold: fmtMoney(gov.pcraThreshold, lang), base: fmtMoney(BASE_LIMIT, lang) }, lang);
}

export function fillTemplate(template, state, lang = getLang(), gov = governance(state.profile, state.pcraAnswers)) {
  const p = state.profile;
  const vars = {
    project: p.projectName?.trim() || t("tpl.project", {}, lang),
    dept: p.dept?.trim() || t("tpl.dept", {}, lang),
    sponsor: p.sponsor?.trim() || t("tpl.sponsor", {}, lang),
    description: p.description?.trim() || t("tpl.description", {}, lang),
    model: L(MODELS[gov.model].name, lang).toLowerCase(),
    pcra: pcraLabel(gov.pcra, lang),
    authority: authoritySentence(gov, lang),
  };
  return L(template, lang)
    .replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m))
    // Placeholder text may land mid-sentence; lower-case its article there.
    .replace(/([^.!?:]\s)(The|Le|La|L') (project|department|sponsor|projet|ministère|promoteur)\b/g, (m, pre, art, noun) => `${pre}${art.toLowerCase()} ${noun}`);
}

export function draftStatement(req, state, lang = getLang()) {
  const { applicability, status, answer } = evaluateReq(req, state);
  const base = fillTemplate(req.describe, state, lang);
  if (applicability.status === "na") return `${t("stmt.na", {}, lang)}${applicability.reason ? ` ${L(applicability.reason, lang)}` : ""}`;
  if (applicability.status === "departmental" && status === "departmental") return `${t("stmt.departmental", {}, lang)} ${base}`;
  const parts = [base];
  if (["partial", "planned", "not-met"].includes(status)) parts.push(t("stmt.target", {}, lang));
  if (answer.compensating?.trim()) parts.push(`${t("stmt.interim", {}, lang)} ${answer.compensating.trim()}`);
  return parts.join(" ");
}

export function statementFor(req, state, lang = getLang()) {
  const custom = getAnswer(state, req.id).statement?.trim();
  return custom ? { text: custom, draft: false } : { text: draftStatement(req, state, lang), draft: true };
}

// ------------------------------------------------------------------ document review

// Wording that weakens a statement in English or French ("planned", "TBD", "à déterminer").
const CAVEAT = /\b(not|without|lacks?|lacking|missing|planned|will be|to be (determined|confirmed|developed)|tbd|tbc|todo|draft|optional(ly)?|partial(ly)?|not yet|in progress|under development|pending|pas|aucun|aucune|prévue?s?|sera|seront|à déterminer|à confirmer|àd|ébauche|facultati(f|ve)|partiel(le)?(ment)?|pas encore|en cours|en attente)\b|n't\b/i;

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Keywords match on word boundaries; a trailing "*" makes the keyword a prefix.
// Boundaries are Unicode-aware so French accented words match correctly.
export function keywordRegex(keyword) {
  const prefix = keyword.endsWith("*");
  const k = prefix ? keyword.slice(0, -1) : keyword;
  const start = /^[\p{L}\p{N}]/u.test(k) ? "(?<![\\p{L}\\p{N}])" : "";
  const end = !prefix && /[\p{L}\p{N}]$/u.test(k) ? "(?![\\p{L}\\p{N}])" : "";
  return new RegExp(`${start}${escapeRegex(k)}${end}`, "iu");
}

export function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 3);
}

// Dollar amounts such as "$12 million", "$12M", "12 M$", "12 millions de dollars".
const MONEY = /(?:\$\s?(\d+(?:[.,]\d+)?)\s?(million|m|billion|b)\b)|(?:(\d+(?:[.,]\d+)?)\s?(millions?|milliards?|m|g)\s?(?:\$|de dollars))/iu;

export function moneyToBand(sentence) {
  const m = sentence.match(MONEY);
  if (!m) return null;
  const num = Number((m[1] ?? m[3]).replace(",", "."));
  const unit = (m[2] ?? m[4]).toLowerCase();
  const millions = /^(billion|b|milliards?|g)$/.test(unit) ? num * 1000 : num;
  const band = Object.values(COST_MAP).find((b) => millions >= b.min && millions < b.max);
  return band?.value ?? null;
}

const PROFILE_HINTS = [
  { field: "personalInfo", value: "yes", re: /\b(personal information|renseignements personnels|privacy impact|vie privée)\b/iu },
  { field: "delivery", value: "agile", re: /\b(agile|scrum|sprints?|itérati(f|ve)|iterative)\b/iu },
  { field: "delivery", value: "cots", re: /\b(saas|software as a service|logiciel-service|cots|commercial off-the-shelf|progiciel)\b/iu },
  { field: "horizontal", value: "yes", re: /\b(horizontal|interdepartmental|multiple departments|several departments|interministériel|plusieurs ministères|provinces and territories|provinces et territoires)\b/iu },
  { field: "emergingTech", value: "yes", re: /\b(artificial intelligence|machine learning|intelligence artificielle|apprentissage automatique|blockchain|chaîne de blocs|generative ai|ia générative)\b/iu },
  { field: "automatedDecision", value: "yes", re: /\b(automated decision|décision(s)? automatisée(s)?|eligibility determination|automatically (approve|assess)|algorithm)\b/iu },
  { field: "security", value: "pb", re: /\b(protected b|protégé b)\b/iu },
  { field: "security", value: "pa", re: /\b(protected a|protégé a)\b/iu },
  { field: "security", value: "higher", re: /\b(protected c|protégé c|secret|top secret|très secret)\b/iu },
  { field: "procurement", value: "existing", re: /\b(standing offer|supply arrangement|offre à commandes|arrangement en matière d'approvisionnement|call-up)\b/iu },
  { field: "procurement", value: "competitive", re: /\b(request for proposals?|rfp|demande de propositions|competitive procurement|appel d'offres)\b/iu },
  { field: "newFunding", value: "yes", re: /\b(new funding|budget 20\d\d|incremental funding|nouveau financement|fonds supplémentaires|memorandum to cabinet|mémoire au cabinet)\b/iu },
  { field: "programme", value: "yes", re: /\b(programme|program of projects|part of the .* program|fait partie du programme)\b/iu },
  { field: "publicFacing", value: "yes", re: /\b(canadians|clients|applicants|public-facing|service to the public|canadiens|demandeurs|service au public)\b/iu },
  { field: "projectType", value: "realproperty", re: /\b(construction|building|facility|real property|lease|immeuble|installation|biens immobiliers|bail)\b/iu },
];

const PCRA_HINT = /\b(?:pcra|ecrp)\b[^.]*?\b(?:level|niveau)\s*([1-4])\b/iu;
const OPMCA_HINT = /\b(?:opmca|ecogp)\b[^.]*?\b(?:class|catégorie)\s*([1-4])\b/iu;

export function analyzeText(text) {
  const sentences = splitSentences(text);
  const reqs = {};
  for (const r of REQUIREMENTS) {
    const keywords = [...r.keywords.en, ...r.keywords.fr];
    const regexes = keywords.map((k) => [k, keywordRegex(k)]);
    const evidence = [];
    const caveats = [];
    const terms = new Set();
    for (const s of sentences) {
      const hit = regexes.filter(([, re]) => re.test(s)).map(([k]) => k.replace(/\*$/, ""));
      if (!hit.length) continue;
      hit.forEach((k) => terms.add(k));
      (CAVEAT.test(s) ? caveats : evidence).push(s);
    }
    if (!evidence.length && !caveats.length) continue;
    reqs[r.id] = { signal: evidence.length ? "evidence" : "caveat", terms: [...terms], evidence: evidence.slice(0, 4), caveats: caveats.slice(0, 4) };
  }
  const hints = [];
  const add = (field, value, evidence) => { if (!hints.some((x) => x.field === field)) hints.push({ field, value, evidence }); };
  for (const s of sentences) {
    if (CAVEAT.test(s)) continue;
    const band = /\b(cost|budget|coût|total|estimate|estimation|valued|investment|investissement)\b/iu.test(s) ? moneyToBand(s) : null;
    if (band) add("cost", band, s);
    const pc = s.match(PCRA_HINT);
    if (pc) add("pcra", pc[1], s);
    const op = s.match(OPMCA_HINT);
    if (op) add("opmca", op[1], s);
  }
  for (const h of PROFILE_HINTS) {
    // A caveated sentence ("no personal information is planned") is not evidence for scope.
    const s = sentences.find((x) => h.re.test(x) && !CAVEAT.test(x));
    if (s) add(h.field, h.value, s);
  }
  return { reqs, hints, sentenceCount: sentences.length, covered: Object.keys(reqs).length };
}

// ------------------------------------------------------------------ right-sizing levers

// Legitimate choices that reduce complexity, risk or governance burden across
// several requirements at once.
export const LEVERS = [
  {
    id: "smaller",
    title: { en: "Reduce real complexity: smaller, independent releases", fr: "Réduire la complexité réelle : des versions plus petites et indépendantes" },
    why: { en: "Delivering in increments with their own outcomes lowers the PCRA honestly, shortens feedback loops and limits what is at risk at each gate.", fr: "La réalisation par incréments ayant leurs propres résultats abaisse honnêtement l'ECRP, raccourcit les boucles de rétroaction et limite ce qui est à risque à chaque point de contrôle." },
    when: (p, g) => (g.pcra ?? 0) >= 3,
    reqs: ["CAP-1", "CAP-3", "PLN-4", "PLN-5", "RSK-1", "PLN-9"],
  },
  {
    id: "reuse",
    title: { en: "Reuse an enterprise or commercial solution", fr: "Réutiliser une solution ministérielle ou commerciale" },
    why: { en: "Configuring a proven GC platform or SaaS product removes custom design and build risk, simplifies architecture review and inherits security controls.", fr: "La configuration d'une plateforme éprouvée du GC ou d'un logiciel-service élimine les risques de conception et de développement sur mesure, simplifie l'examen de l'architecture et permet d'hériter des mesures de sécurité." },
    when: (p, g) => g.digital && p.delivery !== "cots",
    reqs: ["INV-3", "DIG-6", "APP-4", "DIG-1", "PLN-6", "DIG-4"],
  },
  {
    id: "vehicles",
    title: { en: "Use existing procurement vehicles", fr: "Utiliser les instruments d'approvisionnement existants" },
    why: { en: "Standing offers and supply arrangements already carry approved terms, security requirements and authorities, which can save months.", fr: "Les offres à commandes et les arrangements en matière d'approvisionnement comportent déjà des modalités, des exigences de sécurité et des pouvoirs approuvés, ce qui peut faire gagner des mois." },
    when: (p) => ["competitive", "complex"].includes(p.procurement),
    reqs: ["PRO-1", "PRO-2", "PRO-3", "APP-6"],
  },
  {
    id: "combined",
    title: { en: "Seek integrated authorities in one Treasury Board submission", fr: "Demander des pouvoirs intégrés dans une seule présentation au Conseil du Trésor" },
    why: { en: "Project, procurement and real property authorities can be sought together, avoiding sequential approvals.", fr: "Les pouvoirs relatifs au projet, à l'approvisionnement et aux biens immobiliers peuvent être demandés ensemble, ce qui évite des approbations successives." },
    when: (p, g) => g.tb === "yes" && (p.procurement === "complex" || ["realproperty", "mixed"].includes(p.projectType)),
    reqs: ["APP-1", "APP-6", "APP-7", "APP-2"],
  },
  {
    id: "minimize",
    title: { en: "Collect less personal information", fr: "Recueillir moins de renseignements personnels" },
    why: { en: "Every element of personal information you do not collect shrinks the privacy assessment, the security categorization and the breach exposure.", fr: "Chaque élément de renseignement personnel que vous ne recueillez pas réduit l'évaluation de la vie privée, la catégorisation de sécurité et l'exposition aux atteintes." },
    when: (p) => p.personalInfo === "yes",
    reqs: ["DIG-2", "DIG-1", "DIG-7"],
  },
  {
    id: "human",
    title: { en: "Keep a person in the decision loop", fr: "Garder une personne dans la boucle décisionnelle" },
    why: { en: "Using automation to support, rather than make, high-impact decisions lowers the algorithmic impact level and its requirements.", fr: "Utiliser l'automatisation pour appuyer plutôt que prendre les décisions à forte incidence abaisse le niveau d'incidence algorithmique et ses exigences." },
    when: (p) => p.automatedDecision === "yes",
    reqs: ["DIG-3"],
  },
  {
    id: "programme-board",
    title: { en: "Govern through the programme board", fr: "Assurer la gouvernance par le conseil du programme" },
    why: { en: "One board for related projects removes duplicate committees and makes interdependencies visible.", fr: "Un seul conseil pour des projets connexes élimine les comités en double et rend les interdépendances visibles." },
    when: (p) => p.programme === "yes",
    reqs: ["GOV-2", "PGM-1", "MON-2"],
  },
  {
    id: "evidence-map",
    title: { en: "Agree an agile evidence map with gatekeepers", fr: "Convenir d'une carte agile des éléments probants avec les responsables" },
    why: { en: "Gatekeepers accept working software, release plans and measured outcomes in place of up-front documents when this is agreed in advance.", fr: "Les responsables acceptent du logiciel fonctionnel, des plans de versions et des résultats mesurés au lieu de documents préalables lorsque c'est convenu à l'avance." },
    when: (p) => ["agile", "hybrid"].includes(p.delivery),
    reqs: ["PLN-9", "PLN-6", "PLN-4", "PLN-3"],
  },
  {
    id: "tranches",
    title: { en: "Release funding in tranches tied to gates", fr: "Débloquer le financement par tranches liées aux points de contrôle" },
    why: { en: "Committing money only to the next gate limits exposure and gives gatekeepers a real decision at each step.", fr: "N'engager l'argent que jusqu'au prochain point de contrôle limite l'exposition et donne aux responsables une véritable décision à chaque étape." },
    when: (p, g) => g.band.min >= 25,
    reqs: ["INV-5", "APP-2", "PLN-5"],
  },
];

export function rightSizing(state, results = evaluateAll(state)) {
  const gov = governance(state.profile, state.pcraAnswers);
  const p = { ...PROFILE_DEFAULTS, ...state.profile };
  const byId = Object.fromEntries(results.map((r) => [r.req.id, r]));
  return LEVERS.map((l) => {
    const affected = l.reqs.map((id) => byId[id]).filter(Boolean);
    const gaps = affected.filter((r) => GAP_FACTOR[r.status] !== undefined);
    return { ...l, recommended: l.when(p, gov), affected, gaps };
  }).filter((l) => l.recommended).sort((a, b) => b.gaps.length - a.gaps.length);
}

// ------------------------------------------------------------------ approvals roadmap

// The approvals and reviews this project should plan for, by gate.
export function approvalsRoadmap(state, gov = governance(state.profile, state.pcraAnswers)) {
  const p = { ...PROFILE_DEFAULTS, ...state.profile };
  const items = [
    { gate: "G1", key: "concept" },
    gov.conceptCase !== "no" && { gate: "G1", key: "conceptCase" },
    gov.pcraRequired !== "no" && { gate: "G2", key: "pcra" },
    gov.digital && { gate: "G2", key: "darb" },
    gov.earb !== "no" && { gate: "G2", key: "earb" },
    { gate: "G3", key: "businessCase" },
    gov.newFunding && { gate: "G3", key: "funding" },
    gov.tb === "yes" && { gate: "G3", key: "tbDefinition" },
    gov.tb === "check" && { gate: "G3", key: "tbCheck" },
    gov.independentReview && { gate: "G3", key: "independent" },
    p.personalInfo === "yes" && { gate: "G5", key: "pia" },
    p.automatedDecision === "yes" && { gate: "G5", key: "aia" },
    p.procurement === "complex" && { gate: "G5", key: "contract" },
    gov.tb === "yes" ? { gate: "G5", key: "tbImplementation" } : { gate: "G5", key: "expenditure" },
    gov.ocg !== "no" && { gate: "G5", key: "ocg" },
    gov.independentReview && { gate: "G5", key: "independent" },
    gov.digital && { gate: "G6", key: "ato" },
    { gate: "G6", key: "golive" },
    { gate: "G7", key: "closeout" },
  ].filter(Boolean);
  return items.map((i) => ({ ...i, modelGate: modelGateFor(gov.model, i.gate) }));
}

export { AREAS, AREA_MAP, GATES, GATE_MAP, MODELS };
