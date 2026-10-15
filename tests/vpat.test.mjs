import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { WCAG, EN_FPS, EN_OTHER, LEVELS } from "../accessibility/evaluation/criteria.mjs";

const run = promisify(execFile);
const ROOT = new URL("../", import.meta.url).pathname;

// WCAG 2.2 A and AA, including the obsolete 4.1.1.
const EXPECTED_SC = "1.1.1 1.2.1 1.2.2 1.2.3 1.2.4 1.2.5 1.3.1 1.3.2 1.3.3 1.3.4 1.3.5 1.4.1 1.4.2 1.4.3 1.4.4 1.4.5 1.4.10 1.4.11 1.4.12 1.4.13 2.1.1 2.1.2 2.1.4 2.2.1 2.2.2 2.3.1 2.4.1 2.4.2 2.4.3 2.4.4 2.4.5 2.4.6 2.4.7 2.4.11 2.5.1 2.5.2 2.5.3 2.5.4 2.5.7 2.5.8 3.1.1 3.1.2 3.2.1 3.2.2 3.2.3 3.2.4 3.2.6 3.3.1 3.3.2 3.3.3 3.3.4 3.3.7 3.3.8 4.1.1 4.1.2 4.1.3".split(" ");

test("evaluation covers every WCAG 2.2 A/AA criterion exactly once", () => {
  assert.deepEqual(WCAG.map((c) => c.sc).sort(), [...EXPECTED_SC].sort());
  for (const c of WCAG) {
    assert.ok(LEVELS[c.c], `${c.sc} has invalid conformance ${c.c}`);
    assert.ok(c.remarks.length > 20, `${c.sc} needs remarks`);
    assert.ok(c.methods.length, `${c.sc} needs methods`);
  }
  for (const c of [...EN_FPS, ...EN_OTHER]) assert.ok(LEVELS[c.c], `${c.id} invalid conformance`);
});

async function compile(results) {
  const dir = await mkdtemp(join(tmpdir(), "vpat-"));
  const file = join(dir, "results.json");
  await writeFile(file, JSON.stringify(results));
  const env = { ...process.env, VPAT_OUT: dir, POLICY_OUT: dir, A11Y_RESULTS: file };
  let code = 0;
  try { await run("node", [join(ROOT, "scripts/build-vpat.mjs"), "--strict"], { env }); } catch (e) { code = e.code; }
  return { code, md: await readFile(join(dir, "VPAT.md"), "utf8"), html: await readFile(join(dir, "vpat.html"), "utf8") };
}

const baseResults = (overrides = {}) => ({
  tools: { "axe-core": "x", playwright: "x", browser: "Chromium" },
  axeTags: [], states: [], variants: [],
  axeRules: { "color-contrast": { help: "contrast", sc: ["1.4.3"] } },
  axe: [{ state: "home", theme: "light", violations: [], incomplete: [], passes: ["color-contrast"] }],
  checks: [{ id: "target-size", title: "t", sc: ["2.5.8"], state: "home", variant: "light", advisory: false, pass: true, failures: [] }],
  summary: { pageStates: 1, axeRuns: 1, wcagViolations: 0, advisoryViolations: 0, checksRun: 1, checksFailed: 0, pageErrors: 0, pass: true },
  pageErrors: [],
  ...overrides,
});

test("a passing build keeps evaluated conformance and cites automated evidence", async () => {
  const { code, md } = await compile(baseResults());
  assert.equal(code, 0);
  assert.match(md, /\| 1\.4\.3 Contrast \(Minimum\) \| Supports \|.*color-contrast/);
  assert.match(md, /\| 2\.5\.8 Target Size \(Minimum\) \| Supports \|.*target-size/);
});

test("automated failures downgrade the mapped criteria and fail strict builds", async () => {
  const r = baseResults();
  r.axe[0].violations = [{ id: "color-contrast", help: "contrast", sc: ["1.4.3"], wcag: true, nodes: [".x"], count: 1 }];
  r.checks[0] = { ...r.checks[0], pass: false, failures: ["button: 10×10 px"] };
  r.summary = { ...r.summary, wcagViolations: 1, checksFailed: 1, pass: false };
  const { code, md, html } = await compile(r);
  assert.notEqual(code, 0, "strict build must fail");
  assert.match(md, /\| 1\.4\.3 Contrast \(Minimum\) \| Partially Supports \|.*Automated regression/);
  assert.match(md, /\| 2\.5\.8 Target Size \(Minimum\) \| Partially Supports \|.*10×10 px/);
  assert.match(md, /\| 9\.1\.4\.3 Contrast \(Minimum\) \| Partially Supports \|/);
  assert.match(html, /Automated suite failed/);
});

test("missing results fail a strict build", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vpat-"));
  const env = { ...process.env, VPAT_OUT: dir, POLICY_OUT: dir, A11Y_RESULTS: join(dir, "none.json") };
  await assert.rejects(run("node", [join(ROOT, "scripts/build-vpat.mjs"), "--strict"], { env }));
});
