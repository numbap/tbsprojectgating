import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer, request } from "node:http";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.HEADLESS = "1";
process.env.AUTOFILL_DATA_DIR = await mkdtemp(join(tmpdir(), "autofill-test-"));
const { startServer, closeBrowser, cleanProfile } = await import("../server.mjs");

const fixture = await readFile(new URL("./fixture.html", import.meta.url), "utf8");
let app, site, base, siteUrl;

before(async () => {
  app = await startServer(0);
  base = `http://localhost:${app.address().port}`;
  site = createServer((req, res) => res.writeHead(200, { "Content-Type": "text/html" }).end(fixture));
  await new Promise((r) => site.listen(0, "127.0.0.1", r));
  siteUrl = `http://127.0.0.1:${site.address().port}/`;
});
after(async () => { await closeBrowser(); app.close(); site.close(); });

const profile = {
  firstName: "Alex", lastName: "Doe", middleName: "Q", email: "alex@example.com", phone: "613-555-0100",
  address1: "1 Main St", city: "Ottawa", region: "Ontario", postalCode: "K1A 0A1", country: "Canada",
  birthDate: "1990-04-02", company: "Acme", linkedin: "https://linkedin.com/in/alex", website: "https://alex.dev",
  custom: [{ label: "Pronouns", value: "they/them" }, { label: "how did you hear", value: "A friend" }],
};

const json = (method, body) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("cleanProfile drops unknown keys and empty values", () => {
  assert.deepEqual(cleanProfile({ email: " a@b.c ", evil: "x", phone: "" }), { email: "a@b.c", custom: [] });
});

test("rejects requests for other host names", async () => {
  // fetch() ignores a custom Host header, so use a raw request.
  const status = await new Promise((resolve, reject) => {
    request(base + "/api/profile", { headers: { Host: "attacker.example" } }, (res) => { res.resume(); resolve(res.statusCode); })
      .on("error", reject).end();
  });
  assert.equal(status, 403);
});

test("rejects non-JSON writes", async () => {
  const res = await fetch(base + "/api/profile", { method: "PUT", body: "email=x" });
  assert.equal(res.status, 415);
});

test("fills the form from the saved profile without submitting", async () => {
  assert.equal((await fetch(base + "/api/profile", json("PUT", profile))).status, 200);
  const r = await (await fetch(base + "/api/fill", json("POST", { url: siteUrl }))).json();
  const by = Object.fromEntries(r.report.map((x) => [x.key, x]));
  for (const k of ["firstName", "lastName", "email", "phone", "address1", "city", "region", "postalCode",
    "country", "birthDate", "company", "linkedin", "website", "custom:pronouns", "custom:how did you hear"]) {
    assert.equal(by[k]?.status, "filled", `${k}: ${JSON.stringify(by[k])}`);
  }
  assert.equal(by.region.value, "Ontario");
  assert.equal(by.country.value, "Canada");
  assert.equal(by.middleName.status, "already set");
  assert.equal(by.linkedin.value, "https://linkedin.com/in/alex");
  assert.ok(!r.report.some((x) => /pw|card/.test(x.field)), "password and card fields are never touched");
  assert.ok(r.screenshot.length > 1000);
});

test("refill with overwrite replaces existing answers", async () => {
  const r = await (await fetch(base + "/api/refill", json("POST", { overwrite: true }))).json();
  assert.equal(r.report.find((x) => x.key === "middleName").status, "filled");
});
