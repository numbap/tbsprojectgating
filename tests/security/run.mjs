// Browser security checks for Protected B handling (see policies/protected-b.md).
// Runs the real application in Chromium with the Content Security Policy enforced.
//
//   node tests/security/run.mjs      exit 1 on any failure

import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { startServer } from "../../server.mjs";

const PORT = Number(process.env.SECURITY_PORT) || 8766;
const BASE = `http://localhost:${PORT}`;
const PASS = "maple river copper lantern";
const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log(`  ✓ ${name}`);
  } catch (e) {
    results.push({ name, pass: false, error: e.message });
    console.log(`  ✗ ${name}: ${e.message}`);
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const server = await startServer(PORT);
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.on("dialog", (d) => d.accept());
const cspViolations = [];
page.on("console", (m) => { if (/Content Security Policy/i.test(m.text())) cspViolations.push(m.text()); });

const storage = () => page.evaluate(() => JSON.stringify(localStorage));
async function setupEncrypted() {
  await page.goto(`${BASE}/`);
  await page.click('input[name=mode][value=encrypted] + span');
  await page.fill("#setup-pass", PASS);
  await page.fill("#setup-pass-2", PASS);
  await page.click("#setup-form button[type=submit]");
  await page.waitForSelector(".hero", { timeout: 15000 });
}

console.log("Security checks");

await check("first run asks how to store data before showing any assessment", async () => {
  await page.goto(`${BASE}/`);
  assert((await page.textContent("h1")).includes("Choose how this browser keeps your work"), "setup screen not shown");
  assert(!(await page.isVisible("#lock-btn")), "lock button shown with nothing to lock");
  assert(await page.isChecked('input[name=marking][value=pb]'), "Protected B is not the default marking");
});

await check("Protected B cannot be stored unencrypted", async () => {
  await page.click('input[name=mode][value=plain] + span');
  await page.click("#setup-form button[type=submit]");
  await page.waitForSelector(".error-summary");
  assert(/cannot be stored unencrypted/.test(await page.textContent(".error-summary")), "no refusal message");
  assert(!(await storage()).includes("gating-navigator-state"), "unencrypted state was written");
});

await check("short passphrases are refused", async () => {
  await page.click('input[name=mode][value=encrypted] + span');
  await page.fill("#setup-pass", "too short");
  await page.fill("#setup-pass-2", "too short");
  await page.click("#setup-form button[type=submit]");
  await page.waitForFunction(() => /at least 15/.test(document.querySelector(".error-summary")?.textContent ?? ""));
});

await check("encrypted mode stores only ciphertext", async () => {
  await setupEncrypted();
  await page.click('[data-action="load-sample"]');
  await page.waitForTimeout(600);
  const s = await storage();
  assert(!s.includes("ClaimPath"), "plaintext assessment content found in localStorage");
  assert(s.includes("AES-256-GCM"), "encrypted vault not found");
  assert(await page.isVisible("#lock-btn"), "lock button missing while unlocked");
});

await check("the page cannot make network connections (CSP connect-src 'none')", async () => {
  const r = await page.evaluate(async () => {
    const out = {};
    try { await fetch("https://example.com/"); out.fetch = "allowed"; } catch { out.fetch = "blocked"; }
    try { await fetch("/index.html"); out.sameOrigin = "allowed"; } catch { out.sameOrigin = "blocked"; }
    return out;
  });
  assert(r.fetch === "blocked", "cross-origin fetch was allowed");
  assert(r.sameOrigin === "blocked", "same-origin fetch was allowed");
  assert(cspViolations.length > 0, "no CSP violation was reported");
});

await check("inline script injection is blocked (CSP script-src 'self')", async () => {
  const ran = await page.evaluate(() => {
    window.__injected = false;
    const d = document.createElement("div");
    d.innerHTML = '<img src="x" onerror="window.__injected = true">';
    document.body.append(d);
    return new Promise((r) => setTimeout(() => { d.remove(); r(window.__injected); }, 300));
  });
  assert(!ran, "inline event handler executed");
});

await check("reports and file names carry the Protected B marking", async () => {
  await page.goto(`${BASE}/#/report`);
  await page.waitForSelector(".report");
  assert((await page.textContent(".report-marking")).trim() === "PROTECTED B", "report marking missing");
  assert((await page.textContent("#marking")).includes("PROTECTED B"), "banner marking missing");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click('[data-action="export-md"]')]);
  assert(/PROTECTED-B-en\.md$/.test(dl.suggestedFilename()), `file name ${dl.suggestedFilename()}`);
  const text = await readFile(await dl.path(), "utf8");
  assert(text.startsWith("**PROTECTED B**"), "Markdown export does not start with the marking");
});

await check("locking removes decrypted content from the page; reload stays locked", async () => {
  await page.click("#lock-btn");
  await page.waitForFunction(() => document.querySelector("h1")?.textContent.includes("locked"));
  assert(!(await page.content()).includes("ClaimPath Online"), "assessment content still in the DOM");
  await page.reload();
  assert((await page.textContent("h1")).includes("locked"), "reload did not require unlock");
  assert(!(await page.isVisible("#lock-btn")), "lock button shown while locked");
});

await check("wrong passphrase is refused; right passphrase restores the assessment", async () => {
  await page.fill("#unlock-pass", "definitely not the passphrase");
  await page.click("#unlock-form button[type=submit]");
  await page.waitForSelector(".error-summary", { timeout: 15000 });
  await page.fill("#unlock-pass", PASS);
  await page.click("#unlock-form button[type=submit]");
  // Unlocking returns to the page the user was on (here, the report).
  await page.waitForSelector(".report", { timeout: 15000 });
  assert((await page.content()).includes("ClaimPath Online"), "assessment not restored");
});

await check("encrypted export contains no plaintext", async () => {
  await page.goto(`${BASE}/#/security`);
  await page.fill("#export-pass", "separate export passphrase");
  await page.fill("#export-pass-2", "separate export passphrase");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#export-form button[type=submit]")]);
  const text = await readFile(await dl.path(), "utf8");
  assert(!text.includes("ClaimPath"), "plaintext in encrypted export");
  assert(JSON.parse(text).marking === "pb", "export header lacks marking");
});

await check("the application refuses to run inside a frame", async () => {
  const p2 = await context.newPage();
  await p2.setContent(`<iframe src="${BASE}/" width="800" height="400"></iframe>`);
  await p2.waitForTimeout(800);
  const text = await p2.frames()[1].evaluate(() => document.body.textContent);
  assert(/cannot be used inside a frame/.test(text), "app rendered inside a frame");
  await p2.close();
});

await check("erase removes everything the application stored", async () => {
  await page.goto(`${BASE}/#/security`);
  await page.click('[data-action="erase-all"]');
  await page.waitForTimeout(300);
  assert((await page.evaluate(() => localStorage.length)) === 0, "keys remain after erase");
});

await check("documentation pages also forbid network connections", async () => {
  for (const url of ["/policies/privacy.html", "/policies/protected-b.html", "/policies/privacy-fr.html", "/policies/protected-b-fr.html", "/accessibility/vpat.html", "/accessibility/declaration.html"]) {
    const html = await (await page.context().request.get(`${BASE}${url}`)).text();
    assert(/connect-src 'none'/.test(html), `${url} has no restrictive CSP`);
  }
});

await browser.close();
server.close();
const failed = results.filter((r) => !r.pass);
console.log(`${results.length - failed.length}/${results.length} security checks passed`);
process.exit(failed.length ? 1 : 0);
