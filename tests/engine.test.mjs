import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import {
  APPLICABILITY, AREAS, GATES, MODELS, REQUIREMENTS, REQ_MAP, analyzeText, approvalsRoadmap, deriveStatus,
  draftStatement, evaluateAll, evaluateReq, fillTemplate, gapRegister, governance, keywordRegex, moneyToBand,
  newState, rightSizing, riskOf, scoreAssessment,
} from "../js/engine.js";
import { FIELD_MAP, PCRA_QUESTIONS, PROFILE_DEFAULTS, PROFILE_FIELDS, pcraEstimate } from "../js/data/scoping.js";
import { STRINGS } from "../js/strings.js";
import { L, setLang, t } from "../js/i18n.js";
import { buildReportModel, reportToCSV, reportToHTML, reportToMarkdown, suggestedDecision } from "../js/report.js";
import { sampleState } from "../js/sample.js";

const bilingual = (x) => x && typeof x.en === "string" && typeof x.fr === "string" && x.en.length > 0 && x.fr.length > 0;
const bilingualList = (x) => x && Array.isArray(x.en) && Array.isArray(x.fr) && x.en.length > 0 && x.en.length === x.fr.length;
const withProfile = (p, pcraAnswers = {}) => ({ ...newState(), profile: { ...PROFILE_DEFAULTS, ...p }, pcraAnswers });

// ------------------------------------------------------------------ data integrity

test("requirements: unique IDs, known areas and gates, complete bilingual content", () => {
  assert.equal(Object.keys(REQ_MAP).length, REQUIREMENTS.length, "duplicate requirement id");
  const areas = new Set(AREAS.map((a) => a.id));
  const gates = new Set(GATES.map((g) => g.id));
  for (const r of REQUIREMENTS) {
    assert.ok(areas.has(r.area), `${r.id} unknown area ${r.area}`);
    assert.ok(gates.has(r.gate), `${r.id} unknown gate ${r.gate}`);
    for (const g of r.revisit) assert.ok(gates.has(g) && g !== r.gate, `${r.id} bad revisit gate ${g}`);
    assert.ok(["high", "medium", "low"].includes(r.sev), `${r.id} severity`);
    assert.ok(APPLICABILITY[r.base] && r.base !== "na", `${r.id} base applicability`);
    for (const f of ["title", "summary", "source", "describe"]) assert.ok(bilingual(r[f]), `${r.id} ${f} must be bilingual`);
    for (const f of ["look", "rightsize", "consequences", "mitigations", "questions"]) assert.ok(bilingualList(r[f]), `${r.id} ${f}: English and French lists must match`);
    assert.ok(r.keywords.en.length && r.keywords.fr.length, `${r.id} needs keywords in both languages`);
  }
});

test("requirements: scope rules use real profile fields or derived values, with bilingual reasons", () => {
  const derived = { tb: ["yes", "no"], earb: ["yes", "no"], highRisk: ["yes", "no"], digital: ["yes", "no"], pcraLevel: ["1", "2", "3", "4", "unknown"] };
  for (const r of REQUIREMENTS) {
    for (const rule of r.scope) {
      assert.ok(APPLICABILITY[rule.status], `${r.id} rule status ${rule.status}`);
      assert.ok(bilingual(rule.reason), `${r.id} rule reason must be bilingual`);
      for (const [k, v] of Object.entries(rule.when)) {
        const allowed = derived[k] ?? (FIELD_MAP[k]?.type === "yesno" ? ["yes", "no"] : FIELD_MAP[k]?.options?.map((o) => o.value));
        assert.ok(allowed, `${r.id} rule uses unknown field ${k}`);
        for (const val of [v].flat()) assert.ok(allowed.includes(val), `${r.id} rule ${k}=${val} is not a possible value`);
      }
    }
  }
});

test("templates only use known placeholders", () => {
  const known = new Set(["project", "dept", "sponsor", "description", "model", "pcra", "authority"]);
  for (const r of REQUIREMENTS) {
    for (const lang of ["en", "fr"]) {
      for (const [, k] of r.describe[lang].matchAll(/\{(\w+)\}/g)) assert.ok(known.has(k), `${r.id} ${lang} unknown placeholder {${k}}`);
    }
  }
});

test("gates, models, areas and profile fields are bilingual; every reference gate is in each model exactly once", () => {
  for (const g of GATES) for (const f of ["name", "short", "question", "purpose", "decision"]) assert.ok(bilingual(g[f]), `${g.id} ${f}`);
  for (const g of GATES) for (const f of ["gatekeepers", "deliverables", "pitfalls"]) assert.ok(bilingualList(g[f]), `${g.id} ${f}`);
  for (const [id, m] of Object.entries(MODELS)) {
    const included = m.gates.flatMap((x) => x.includes);
    assert.deepEqual(included, GATES.map((g) => g.id), `${id} must cover each gate once, in order`);
    for (const mg of m.gates) assert.ok(bilingual(mg.name), `${id} ${mg.id} name`);
  }
  for (const a of AREAS) for (const f of ["name", "intent", "tip"]) assert.ok(bilingual(a[f]), `${a.id} ${f}`);
  for (const f of PROFILE_FIELDS) {
    assert.ok(bilingual(f.label) && bilingual(f.why), `${f.id} label/why`);
    for (const o of f.options ?? []) assert.ok(bilingual(o.label), `${f.id} option ${o.value}`);
  }
  for (const q of PCRA_QUESTIONS) { assert.ok(bilingual(q.label)); q.options.forEach((o) => assert.ok(bilingual(o.label))); }
});

test("interface strings: English and French define the same keys and placeholders", () => {
  const en = Object.keys(STRINGS.en).sort();
  const fr = Object.keys(STRINGS.fr).sort();
  assert.deepEqual(fr.filter((k) => !STRINGS.en[k]), [], "keys only in French");
  assert.deepEqual(en.filter((k) => !STRINGS.fr[k]), [], "keys missing in French");
  const ph = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join();
  for (const k of en) assert.equal(ph(STRINGS.fr[k]), ph(STRINGS.en[k]), `${k}: placeholders differ`);
});

test("every interface key used in the code exists", async () => {
  const files = [...(await readdir(new URL("../js/", import.meta.url))).filter((f) => f.endsWith(".js")).map((f) => `js/${f}`), "js/data/scoping.js"];
  const used = new Set();
  for (const f of files) {
    const src = await readFile(new URL(`../${f}`, import.meta.url), "utf8");
    for (const m of src.matchAll(/\bt[nl]?\(\s*(?:m,\s*)?"([a-zA-Z0-9_.]+)"/g)) used.add(m[1]);
  }
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) used.add(m[1]);
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) m[1].split(";").forEach((p) => used.add(p.split(":")[1]));
  const missing = [...used].filter((k) => !(k in STRINGS.en) && !(`${k}_one` in STRINGS.en));
  assert.deepEqual(missing, []);
  // Keys built dynamically.
  for (const tb of ["yes", "no", "check"]) for (const p of ["home.tb", "r.kpi.tb", "gov.tbShort", "gov.earb"]) assert.ok(STRINGS.en[`${p}.${tb}`], `${p}.${tb}`);
  for (const r of ["cost", "costStraddles", "pcra", "noOpmca", "pcraUnknown"]) assert.ok(STRINGS.en[`gov.reason.${r}`]);
});

// ------------------------------------------------------------------ governance rules

test("PCRA estimate follows the official score bands and floors horizontal projects at level 4", () => {
  const all = (v) => Object.fromEntries(PCRA_QUESTIONS.map((q) => [q.id, v]));
  assert.equal(pcraEstimate({}).level, null);
  assert.equal(pcraEstimate(all(0)).level, 1);
  assert.equal(pcraEstimate(all(1)).level, 2); // 50
  assert.equal(pcraEstimate(all(2)).level, 4);
  assert.equal(pcraEstimate(all(0), { horizontal: "yes" }).level, 4);
});

test("authority: base limit without an OPMCA class, cost over limit, PCRA over capacity", () => {
  // No class: anything from $2.5M needs Treasury Board, whatever limit was selected.
  let g = governance({ ...PROFILE_DEFAULTS, opmca: "none", limit: "50", cost: "5-10", pcra: "1" });
  assert.equal(g.tb, "yes");
  assert.ok(g.tbReasons.includes("noOpmca"));
  assert.equal(g.limitIgnored, true);
  // Small project without a class stays departmental.
  g = governance({ ...PROFILE_DEFAULTS, opmca: "none", cost: "1-2.5", pcra: "1" });
  assert.equal(g.tb, "no");
  // Within limit and capacity.
  g = governance({ ...PROFILE_DEFAULTS, opmca: "3", limit: "25", cost: "10-25", pcra: "2" });
  assert.equal(g.tb, "no");
  // PCRA above capacity class.
  g = governance({ ...PROFILE_DEFAULTS, opmca: "2", limit: "25", cost: "5-10", pcra: "3" });
  assert.equal(g.tb, "yes");
  assert.deepEqual(g.tbReasons, ["pcra"]);
  // Cost above limit.
  g = governance({ ...PROFILE_DEFAULTS, opmca: "4", limit: "25", cost: "25-50", pcra: "2" });
  assert.deepEqual(g.tbReasons, ["cost"]);
  // Cost band straddling a $50M limit needs confirmation.
  g = governance({ ...PROFILE_DEFAULTS, opmca: "4", limit: "50", cost: "25-50", pcra: "2" });
  assert.equal(g.tb, "no");
  g = governance({ ...PROFILE_DEFAULTS, opmca: "4", limit: "50", cost: "50-100", pcra: "2" });
  assert.equal(g.tb, "yes");
});

test("GC EARB thresholds follow the OPMCA class; emerging technology always triggers review", () => {
  const e = (opmca, cost, extra = {}) => governance({ ...PROFILE_DEFAULTS, projectType: "digital", opmca, cost, pcra: "1", ...extra }).earb;
  assert.equal(e("1", "2.5-5"), "yes");
  assert.equal(e("2", "2.5-5"), "no");
  assert.equal(e("2", "5-10"), "yes");
  assert.equal(e("3", "5-10"), "no");
  assert.equal(e("4", "10-25"), "no");
  assert.equal(e("4", "25-50"), "yes");
  assert.equal(e("4", "lt1", { emergingTech: "yes" }), "yes");
  assert.equal(e("1", "25-50", { projectType: "realproperty" }), "no");
});

test("gating model is recommended from complexity and can be overridden", () => {
  const m = (p) => governance({ ...PROFILE_DEFAULTS, opmca: "4", limit: "100", ...p });
  assert.equal(m({ pcra: "1", cost: "lt1" }).model, "light");
  assert.equal(m({ pcra: "2", cost: "5-10" }).model, "streamlined");
  assert.equal(m({ pcra: "3", cost: "5-10" }).model, "full");
  assert.equal(m({ pcra: "3", cost: "5-10", model: "light" }).model, "light");
  assert.equal(m({ pcra: "3", cost: "5-10", model: "light" }).recommendedModel, "full");
});

test("applicability follows the profile", () => {
  const small = withProfile({ opmca: "4", limit: "100", cost: "lt1", pcra: "1", procurement: "none", personalInfo: "no", automatedDecision: "no", projectType: "business", delivery: "waterfall", newFunding: "no" });
  const status = (s, id) => evaluateReq(REQ_MAP[id], s).applicability.status;
  for (const id of ["APP-1", "APP-4", "APP-5", "APP-6", "PRO-1", "DIG-1", "DIG-2", "DIG-3", "PLN-9"]) assert.equal(status(small, id), "na", id);
  assert.equal(status(small, "GAT-2"), "recommended");
  assert.equal(status(small, "INV-7"), "recommended");
  const big = withProfile({ opmca: "2", limit: "10", cost: "25-50", pcra: "3", projectType: "digital" });
  for (const id of ["APP-1", "APP-3", "APP-4", "GAT-2", "MON-2", "INV-7"]) assert.equal(status(big, id), "required", id);
  assert.equal(status(big, "CAP-2"), "departmental");
});

test("status derivation and manual overrides", () => {
  assert.equal(deriveStatus(3, []), "unanswered");
  assert.equal(deriveStatus(2, ["yes", "yes"]), "met");
  assert.equal(deriveStatus(2, ["yes", "no"]), "partial");
  assert.equal(deriveStatus(2, ["no", "no"]), "not-met");
  assert.equal(deriveStatus(2, ["unknown", "unknown"]), "unknown");
  assert.equal(deriveStatus(2, ["na", "na"]), "na");
  const s = withProfile({});
  s.answers["GOV-1"] = { q: ["yes", "yes", "yes"], applicability: "na" };
  assert.equal(evaluateReq(REQ_MAP["GOV-1"], s).status, "na");
  s.answers["GOV-2"] = { q: ["no"], override: "planned" };
  assert.equal(evaluateReq(REQ_MAP["GOV-2"], s).status, "planned");
});

test("scoring, readiness for the next gate and risk ranking", () => {
  const s = sampleState();
  const sc = scoreAssessment(s);
  assert.ok(sc.nextGate.inScope > 0 && sc.nextGate.score >= 0 && sc.nextGate.score <= 1);
  assert.deepEqual(Object.keys(sc.byGate), MODELS[sc.gov.model].gates.map((g) => g.id));
  const gaps = gapRegister(s);
  for (let i = 1; i < gaps.length; i++) assert.ok(gaps[i - 1].risk.score >= gaps[i].risk.score, "gaps sorted by risk");
  assert.equal(riskOf("high", "not-met").level, "High");
  assert.equal(riskOf("low", "partial").level, "Low");
  assert.ok(riskOf("medium", "partial", { overdue: true }).score > riskOf("medium", "partial").score);
  assert.equal(riskOf("high", "met"), null);
  assert.equal(suggestedDecision({ progress: 0.2, score: 1 }, []), "hold");
  assert.equal(suggestedDecision({ progress: 1, score: 0.95 }, []), "go");
  assert.equal(suggestedDecision({ progress: 1, score: 0.75 }, [{ risk: { level: "High" } }]), "conditional");
});

test("the sample project needs Treasury Board approval for cost and complexity", () => {
  const g = governance(sampleState().profile, sampleState().pcraAnswers);
  assert.equal(g.pcra, 3);
  assert.equal(g.tb, "yes");
  assert.deepEqual(g.tbReasons.sort(), ["cost", "pcra"]);
  assert.equal(g.earb, "yes");
  const keys = approvalsRoadmap(sampleState(), g).map((a) => a.key);
  for (const k of ["tbProject", "funding", "earbConcept", "pia", "aia", "ato"]) assert.ok(keys.includes(k), k);
  assert.ok(rightSizing(sampleState()).length > 0);
});

// ------------------------------------------------------------------ text

test("templates fill placeholders in both languages", () => {
  const s = withProfile({ projectName: "Alpha", dept: "Dept X", sponsor: "ADM Y" });
  setLang("en");
  assert.match(fillTemplate(REQ_MAP["GOV-1"].describe, s), /^ADM Y is the designated sponsor of Alpha/);
  assert.match(fillTemplate(REQ_MAP["GOV-1"].describe, s, "fr"), /^ADM Y est le promoteur désigné de Alpha/);
  const blank = withProfile({});
  assert.doesNotMatch(draftStatement(REQ_MAP["CAP-3"], blank), /\{\w+\}/);
  assert.doesNotMatch(draftStatement(REQ_MAP["CAP-3"], blank, "fr"), /\{\w+\}/);
});

test("document review reads English and French, flags caveats and suggests scope", () => {
  const r = analyzeText("The business case was approved by the investment committee.\nUne évaluation des facteurs relatifs à la vie privée est prévue.\nLe coût total estimatif est de 12 millions de dollars.\nThe project uses agile sprints.");
  assert.equal(r.reqs["INV-4"].signal, "evidence");
  assert.equal(r.reqs["DIG-2"].signal, "caveat");
  assert.equal(r.hints.find((h) => h.field === "cost")?.value, "10-25");
  assert.equal(r.hints.find((h) => h.field === "delivery")?.value, "agile");
  assert.equal(moneyToBand("Total cost: $1.2 billion"), "gt1000");
  assert.equal(moneyToBand("budget of $3M"), "2.5-5");
  assert.ok(keywordRegex("ECRP").test("l'ECRP est faite"));
  assert.ok(!keywordRegex("PIA").test("pianist"));
});

test("report renders in both languages with markings, and keys never leak", () => {
  for (const lang of ["en", "fr"]) {
    const m = buildReportModel(sampleState(), { marking: lang === "fr" ? "PROTÉGÉ B" : "PROTECTED B", lang });
    const md = reportToMarkdown(m);
    const html = reportToHTML(m);
    const csv = reportToCSV(m);
    assert.ok(md.startsWith(`**${m.marking}**`));
    assert.ok(csv.startsWith(`"${m.marking}"`));
    assert.match(html, new RegExp(`lang="${lang}"`));
    for (const out of [md, html]) assert.doesNotMatch(out, /\b(r|gov|road|stmt|tpl|warn|sev)\.[a-z][a-zA-Z.]*\b/, `${lang}: untranslated key`);
    assert.equal(csv.split("\r\n").length, REQUIREMENTS.length + 2);
  }
  setLang("fr");
  assert.equal(L({ en: "a", fr: "b" }), "b");
  assert.equal(t("nav.home"), "Accueil");
  setLang("en");
});

test("every requirement can be evaluated for an empty project", () => {
  const results = evaluateAll(newState());
  assert.equal(results.length, REQUIREMENTS.length);
  assert.ok(results.every((r) => r.status));
});
