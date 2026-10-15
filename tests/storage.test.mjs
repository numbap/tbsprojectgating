import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createKey, open, seal, passphraseProblem, MIN_ITERATIONS, WrongPassphraseError } from "../js/vault.js";
import { KEYS, Store, PolicyError } from "../js/storage.js";

const PASS = "correct horse battery staple";
const FAST = MIN_ITERATIONS; // keep tests quick; production uses ITERATIONS

class MemoryStorage {
  constructor() { this.m = new Map(); }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
}

test("vault round-trips data and authenticates header fields", async () => {
  const k = await createKey(PASS, FAST);
  const env = await seal(k, { secret: "Protected B content" }, "pb");
  assert.equal(env.cipher, "AES-256-GCM");
  assert.doesNotMatch(JSON.stringify(env), /Protected B content/);
  assert.deepEqual((await open(PASS, env)).data, { secret: "Protected B content" });
  await assert.rejects(open("wrong passphrase entirely", env), WrongPassphraseError);
  await assert.rejects(open(PASS, { ...env, marking: "unclassified" }), WrongPassphraseError, "marking is authenticated");
  await assert.rejects(open(PASS, { ...env, iterations: 1000 }), /too few/);
});

test("each save uses a fresh IV", async () => {
  const k = await createKey(PASS, FAST);
  const a = await seal(k, { x: 1 }, "pb");
  const b = await seal(k, { x: 1 }, "pb");
  assert.notEqual(a.iv, b.iv);
  assert.notEqual(a.data, b.data);
});

test("passphrase rules", () => {
  assert.match(passphraseProblem("short"), /at least 15/);
  assert.match(passphraseProblem(PASS, "different"), /do not match/);
  assert.equal(passphraseProblem(PASS, PASS), null);
});

test("protected information is never stored unencrypted", async () => {
  const s = new Store(new MemoryStorage());
  await assert.rejects(s.setup({ mode: "plain", marking: "pb" }), PolicyError);
  await s.setup({ mode: "plain", marking: "unclassified" });
  assert.throws(() => s.setMarking("pa"), PolicyError);
});

test("encrypted mode stores only ciphertext and locks and unlocks", async () => {
  const storage = new MemoryStorage();
  const s = new Store(storage);
  assert.equal(s.status(), "setup");
  await s.setup({ mode: "encrypted", marking: "pb", passphrase: PASS, confirm: PASS, state: { note: "sensitive finding" } });
  assert.equal(s.status(), "ready");
  const raw = [...storage.m.values()].join("\n");
  assert.doesNotMatch(raw, /sensitive finding/);
  assert.equal(storage.getItem(KEYS.plain), null);

  const s2 = new Store(storage);
  assert.equal(s2.status(), "locked");
  await assert.rejects(s2.unlock("not the right passphrase"));
  assert.deepEqual(await s2.unlock(PASS), { note: "sensitive finding" });
  await s2.save({ note: "updated" });
  s2.lock();
  assert.equal(s2.status(), "locked");
  assert.deepEqual(await new Store(storage).unlock(PASS), { note: "updated" });
});

test("memory mode writes nothing; erase removes everything", async () => {
  const storage = new MemoryStorage();
  const s = new Store(storage);
  await s.setup({ mode: "memory", marking: "pb", state: { note: "x" } });
  await s.save({ note: "y" });
  assert.deepEqual([...storage.m.keys()], [KEYS.settings]);
  s.eraseAll();
  assert.equal(storage.m.size, 0);
  assert.equal(s.status(), "setup");
});

test("migrating unencrypted legacy data to encrypted storage removes the plaintext copy", async () => {
  const storage = new MemoryStorage();
  storage.setItem(KEYS.plain, JSON.stringify({ profile: {}, answers: { "AC-2": {} } }));
  const s = new Store(storage);
  assert.ok(s.hasLegacyPlain());
  await s.setup({ mode: "encrypted", marking: "pb", passphrase: PASS, confirm: PASS, state: s.legacyState() });
  assert.equal(storage.getItem(KEYS.plain), null);
  assert.ok(storage.getItem(KEYS.vault));
});

test("encrypted exports use their own passphrase and import back", async () => {
  const s = new Store(new MemoryStorage());
  await s.setup({ mode: "memory", marking: "pb" });
  const file = JSON.stringify(await s.exportEncrypted({ profile: {}, answers: {} }, "another long export passphrase", "another long export passphrase"));
  await assert.rejects(s.importFile(file), /encrypted/);
  const r = await s.importFile(file, "another long export passphrase");
  assert.equal(r.marking, "pb");
  assert.deepEqual(r.state, { profile: {}, answers: {} });
});

test("unavailable browser storage forces memory mode", async () => {
  const broken = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); }, removeItem() {} };
  const s = new Store(broken);
  await assert.rejects(s.setup({ mode: "encrypted", marking: "pb", passphrase: PASS, confirm: PASS }), /does not allow storage/);
  await s.setup({ mode: "memory", marking: "pb" });
  assert.equal(s.status(), "ready");
});

// The application must never send data anywhere. Besides the Content Security
// Policy (connect-src 'none'), the client code must not use network APIs at all.
test("client code contains no network APIs", async () => {
  const files = ["index.html", ...(await readdir(new URL("../js/", import.meta.url))).filter((f) => f.endsWith(".js")).map((f) => `js/${f}`),
    ...(await readdir(new URL("../js/data/", import.meta.url))).map((f) => `js/data/${f}`)];
  const banned = /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|navigator\.sendBeacon|RTCPeerConnection|importScripts|new\s+Worker|document\.cookie/;
  for (const f of files) {
    const src = await readFile(new URL(`../${f}`, import.meta.url), "utf8");
    assert.doesNotMatch(src, banned, `${f} uses a network or cookie API`);
  }
});

test("index.html declares a Content Security Policy that blocks all network connections", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1] ?? "";
  for (const d of ["default-src 'none'", "connect-src 'none'", "form-action 'none'", "base-uri 'none'", "script-src 'self'", "object-src 'none'"]) {
    assert.ok(csp.includes(d), `CSP missing ${d}`);
  }
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval|https?:/, "CSP must not allow inline code or remote origins");
  assert.match(html, /<meta name="referrer" content="no-referrer">/);
});
