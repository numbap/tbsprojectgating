// SA&A Wizard: content integrity, categorization and tier rules, risk ratings,
// the suggested decision, report output and encrypted storage.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { ITEMS, PACKAGE, STEPS, STEP_MAP, THREATS } from "../saa/js/data.js";
import {
  categorization, context, items, newState, normalize, overall, poam, reauthDate, recommendation, riskLevel, tier,
} from "../saa/js/engine.js";
import { buildReport, poamToCSV, reportToHTML, reportToMarkdown } from "../saa/js/report.js";
import { sampleState } from "../saa/js/sample.js";
import { KEYS, MIN_ITERATIONS, PolicyError, Store, WrongPassphraseError, createKey, open, seal } from "../saa/js/store.js";

const PASS = "correct horse battery staple";

class MemoryStorage {
  constructor() { this.m = new Map(); }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
}

function withCat(conf, integrity, availability, profile = {}) {
  const s = newState();
  s.cat = { ...s.cat, conf, integrity, availability };
  s.profile = { ...s.profile, ...profile };
  return s;
}

test("every item has a known step, unique id, content and a valid level for any context", () => {
  const ids = new Set();
  for (const i of ITEMS) {
    assert.ok(STEP_MAP[i.step], `${i.id} step`);
    assert.ok(!ids.has(i.id), `${i.id} duplicated`);
    ids.add(i.id);
    for (const k of ["title", "help", "evidence"]) assert.ok(i[k]?.length > 10, `${i.id} ${k}`);
    for (const tier of ["light", "standard", "enhanced"]) {
      for (const deployment of ["onprem", "saas", "iaas"]) {
        const ctx = context(withCat("pb", "medium", "medium", { deployment, tierOverride: tier }));
        assert.ok(["required", "recommended", "na"].includes(i.level(ctx)), `${i.id} level`);
      }
    }
  }
  for (const s of STEPS) assert.ok(ITEMS.some((i) => i.step === s.id), `${s.id} has items`);
  for (const [, id] of PACKAGE) assert.ok(ids.has(id), `package item ${id}`);
  for (const t of THREATS) assert.ok(t.l >= 1 && t.l <= 5 && t.i >= 1 && t.i <= 5, t.id);
});

test("categorization selects the profile", () => {
  assert.equal(categorization(newState()).complete, false);
  const pbmm = categorization(withCat("pb", "medium", "medium", { deployment: "onprem" }));
  assert.equal(pbmm.code, "PBMM");
  assert.match(pbmm.profile.name, /Profile 1/);
  assert.match(categorization(withCat("pb", "medium", "medium", { deployment: "paas" })).profile.name, /CCCS Medium Cloud/);
  assert.match(categorization(withCat("unclassified", "low", "low", { deployment: "saas" })).profile.name, /CCCS Low Cloud/);
  const pbhh = categorization(withCat("pb", "high", "medium", { deployment: "paas" }));
  assert.match(pbhh.profile.detail, /Tailor upward/);
  const secret = categorization(withCat("secret", "medium", "medium"));
  assert.ok(secret.warnings.some((w) => /accredited/.test(w)));
  assert.ok(categorization(withCat("unclassified", "low", "low", { pi: "yes" })).warnings.some((w) => /Personal information/.test(w)));
});

test("tier follows sensitivity and exposure, and can be overridden", () => {
  assert.equal(tier(newState()).id, "standard", "standard until categorized");
  assert.equal(tier(withCat("unclassified", "low", "low", { users: "internal", internet: "no", pi: "no" })).id, "light");
  assert.equal(tier(withCat("pb", "medium", "medium")).id, "standard");
  assert.equal(tier(withCat("pa", "low", "high")).id, "enhanced");
  assert.equal(tier(withCat("pb", "medium", "medium", { critical: "yes", users: "public" })).id, "enhanced");
  const t = tier(withCat("pb", "medium", "medium", { tierOverride: "light" }));
  assert.equal(t.id, "light");
  assert.equal(t.suggested, "standard");
  assert.ok(t.overridden);
});

test("applicability follows the profile", () => {
  const level = (s, id) => items(s).find((r) => r.item.id === id).level;
  const saas = withCat("pb", "medium", "medium", { deployment: "saas", pi: "no" });
  assert.equal(level(saas, "ctl-guardrails"), "na");
  assert.equal(level(saas, "as-va"), "na");
  assert.equal(level(saas, "ctl-saasconfig"), "required");
  assert.equal(level(saas, "cat-pia"), "na");
  const paas = withCat("pb", "medium", "medium", { deployment: "paas", internet: "yes" });
  assert.equal(level(paas, "ctl-guardrails"), "required");
  assert.equal(level(paas, "plan-residency"), "required");
  assert.equal(level(paas, "as-pentest"), "required");
  const light = withCat("unclassified", "low", "low", { deployment: "onprem", internet: "no", pi: "no", users: "internal" });
  assert.equal(level(light, "ctl-srtm"), "recommended");
  assert.equal(level(light, "as-pentest"), "recommended");
});

test("risk levels on the 5 × 5 matrix", () => {
  assert.equal(riskLevel("", 3), null);
  assert.equal(riskLevel(2, 2).id, "low");
  assert.equal(riskLevel(1, 5).id, "medium");
  assert.equal(riskLevel(2, 5).id, "high");
  assert.equal(riskLevel(4, 4).id, "veryhigh");
});

test("suggested decision reflects package, findings and residual risk", () => {
  assert.equal(recommendation(newState()).id, "notready");

  const s = withCat("unclassified", "low", "low", { deployment: "onprem", internet: "no", pi: "no", users: "internal", interconnect: "no", adm: "no", critical: "no" });
  for (const r of items(s)) if (r.level === "required") s.items[r.item.id] = { status: "done" };
  assert.equal(recommendation(s).id, "ato");

  s.findings.push({ id: "a", title: "x", severity: "low", status: "open" });
  assert.equal(recommendation(s).id, "conditional");
  s.findings.push({ id: "b", title: "y", severity: "high", status: "poam" });
  assert.equal(recommendation(s).id, "interim");
  s.findings.push({ id: "c", title: "z", severity: "critical", status: "open" });
  assert.equal(recommendation(s).id, "notready");
  s.findings = [];
  s.risks.push({ id: "r", threat: "t", l: 5, i: 5, treatment: "accept" });
  assert.equal(recommendation(s).id, "deny");
  s.risks[0].treatment = "";
  assert.equal(recommendation(s).id, "notready", "untreated risk blocks");
});

test("POA&M lists open findings by severity; reauthorization date", () => {
  const s = sampleState();
  s.findings.push({ id: "z", title: "closed", severity: "critical", status: "remediated" });
  const rows = poam(s);
  assert.deepEqual(rows.map((f) => f.severity), ["high", "medium"]);
  s.auth = { ...s.auth, decision: "conditional", date: "2026-11-01" };
  assert.equal(reauthDate(s), "2028-11-01", "standard tier: two years");
  s.auth.decision = "interim";
  assert.equal(reauthDate(s), "2027-05-01");
  s.auth.expiry = "2027-02-01";
  assert.equal(reauthDate(s), "2027-02-01");
});

test("normalize fills missing fields of older saves", () => {
  const s = normalize({ profile: { name: "x" } });
  assert.equal(s.profile.name, "x");
  assert.deepEqual(s.risks, []);
  assert.equal(s.cat.conf, "");
  assert.ok(overall(s).required.total > 0);
});

test("report renders in HTML and Markdown with the marking, escaping content", () => {
  const s = sampleState();
  s.profile.name = "<script>alert(1)</script> | pipe";
  const m = buildReport(s, { marking: "PROTECTED B", date: "2026-10-28" });
  const html = reportToHTML(m);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /PROTECTED B/);
  const md = reportToMarkdown(m);
  assert.match(md, /^\*\*PROTECTED B\*\*/);
  assert.match(md, /## Findings and Plan of Action and Milestones/);
  assert.match(md, /TLS 1\.0/);
  const csv = poamToCSV({ ...s, findings: [{ title: "=HYPERLINK(1)", severity: "high", status: "open" }] }, "PROTECTED B");
  assert.match(csv, /^PROTECTED B\r\n/);
  assert.match(csv, /'=HYPERLINK/);
});

test("vault authenticates the marking and rejects a wrong passphrase", async () => {
  const k = await createKey(PASS, MIN_ITERATIONS);
  const env = await seal(k, { secret: "finding about a weakness" }, "pb");
  assert.doesNotMatch(JSON.stringify(env), /weakness/);
  assert.deepEqual((await open(PASS, env)).data, { secret: "finding about a weakness" });
  await assert.rejects(open("wrong passphrase entirely", env), WrongPassphraseError);
  await assert.rejects(open(PASS, { ...env, marking: "unclassified" }), WrongPassphraseError);
  await assert.rejects(open(PASS, { ...env, iterations: 1000 }), /too few/);
});

test("store never writes protected information unencrypted", async () => {
  const storage = new MemoryStorage();
  const s = new Store(storage);
  await assert.rejects(s.setup({ mode: "plain", marking: "pb" }), PolicyError);
  await s.setup({ mode: "plain", marking: "unclassified" });
  assert.throws(() => s.setMarking("pa"), PolicyError);

  const s2 = new Store(new MemoryStorage());
  await s2.setup({ mode: "encrypted", marking: "pb", passphrase: PASS, confirm: PASS, state: { note: "open critical finding" } });
  await s2.writing;
  const raw = [...s2.storage.m.values()].join("\n");
  assert.doesNotMatch(raw, /critical finding/);
  assert.equal(s2.storage.getItem(KEYS.plain), null);
  const s3 = new Store(s2.storage);
  assert.equal(s3.status(), "locked");
  await assert.rejects(s3.unlock("not the right passphrase"), PolicyError);
  assert.deepEqual(await s3.unlock(PASS), { note: "open critical finding" });

  const mem = new Store(new MemoryStorage());
  await mem.setup({ mode: "memory", marking: "pb", state: { x: 1 } });
  assert.equal(mem.status(), "ready");
  assert.equal(mem.storage.m.size, 0, "memory mode writes nothing");
});

test("SA&A client code makes no network or cookie calls and has no inline styles", async () => {
  const dir = new URL("../saa/js/", import.meta.url);
  for (const f of await readdir(dir)) {
    const src = await readFile(new URL(f, dir), "utf8");
    assert.doesNotMatch(src, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|document\.cookie|EventSource/, f);
    assert.doesNotMatch(src, /style="/, `${f}: the CSP blocks inline style attributes`);
  }
  const html = await readFile(new URL("../saa/index.html", import.meta.url), "utf8");
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(html, /unsafe-inline/);
});
