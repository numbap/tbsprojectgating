// Form Autofill server: `npm start`, then open http://localhost:3000
//
// Serves the profile page and drives a real Chromium window with Playwright:
// POST /api/fill opens a URL in that window and fills its form from your
// profile. You review and submit the form yourself; nothing is submitted.
//
// Everything stays on this machine: the server listens on 127.0.0.1 only and
// your profile is saved in data/profile.json (git-ignored).

import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(here, "public");
const dataDir = process.env.AUTOFILL_DATA_DIR || join(here, "data");
const profileFile = join(dataDir, "profile.json");
const fillerFile = join(here, "lib", "filler.js");

const PROFILE_KEYS = [
  "firstName", "middleName", "lastName", "fullName", "email", "phone",
  "address1", "address2", "city", "region", "postalCode", "country",
  "birthDate", "company", "jobTitle", "website", "linkedin", "github",
];

export function cleanProfile(input) {
  const out = {};
  for (const k of PROFILE_KEYS) {
    const v = input?.[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 500);
  }
  out.custom = (Array.isArray(input?.custom) ? input.custom : [])
    .filter((c) => c && typeof c.label === "string" && c.label.trim() && typeof c.value === "string")
    .slice(0, 100)
    .map((c) => ({ label: c.label.trim().slice(0, 100), value: c.value.slice(0, 5000) }));
  return out;
}

async function loadProfile() {
  try {
    return cleanProfile(JSON.parse(await readFile(profileFile, "utf8")));
  } catch {
    return cleanProfile({});
  }
}

async function saveProfile(p) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(profileFile, JSON.stringify(p, null, 2), { mode: 0o600 });
}

// ---- Browser -------------------------------------------------------------

function wantHeadless() {
  if (process.env.HEADLESS) return process.env.HEADLESS !== "0" && process.env.HEADLESS !== "false";
  // On Linux without a display there is no window to show.
  return process.platform === "linux" && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY;
}

let contextPromise = null;
let lastPage = null;

async function browserContext() {
  if (contextPromise) {
    const ctx = await contextPromise.catch(() => null);
    if (ctx && !ctx._closed) return ctx;
  }
  contextPromise = (async () => {
    const { chromium } = await import("playwright");
    await mkdir(join(dataDir, "browser-profile"), { recursive: true });
    // A persistent profile keeps your logins between runs, so forms behind a
    // sign-in work after you sign in once in this window.
    const ctx = await chromium.launchPersistentContext(join(dataDir, "browser-profile"), {
      headless: wantHeadless(),
      viewport: null,
      bypassCSP: true,
      executablePath: process.env.CHROMIUM_PATH || undefined,
    });
    ctx.on("close", () => { ctx._closed = true; contextPromise = null; lastPage = null; });
    return ctx;
  })();
  return contextPromise;
}

async function fillPage(page, profile, overwrite) {
  const src = await readFile(fillerFile, "utf8");
  const report = [];
  // Playwright can reach every frame, including cross-origin ones.
  for (const frame of page.frames()) {
    try {
      const r = await frame.evaluate(
        `(() => { ${src}; return window.__autofill(${JSON.stringify(profile)}, ${JSON.stringify({ overwrite, frames: false })}); })()`,
      );
      const origin = frame === page.mainFrame() ? "" : new URL(frame.url()).host;
      for (const row of r) report.push(origin ? { ...row, frame: origin } : row);
    } catch {
      // Frame navigated away or was detached; ignore it.
    }
  }
  return report;
}

async function waitForForm(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.waitForSelector("input:not([type=hidden]), textarea, select", { timeout: 8000 }).catch(() => {});
}

export async function fillUrl(url, { overwrite = false } = {}) {
  const profile = await loadProfile();
  const ctx = await browserContext();
  const page = await ctx.newPage();
  lastPage = page;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await waitForForm(page);
  const report = await fillPage(page, profile, overwrite);
  await page.bringToFront().catch(() => {});
  const shot = await page.screenshot({ fullPage: true, type: "jpeg", quality: 70 }).catch(() => null);
  return { url: page.url(), title: await page.title(), headless: wantHeadless(), report, screenshot: shot && shot.toString("base64") };
}

export async function refillCurrent({ overwrite = false } = {}) {
  if (!lastPage || lastPage.isClosed()) throw new Error("No page is open. Fill a URL first.");
  const profile = await loadProfile();
  await waitForForm(lastPage);
  const report = await fillPage(lastPage, profile, overwrite);
  const shot = await lastPage.screenshot({ fullPage: true, type: "jpeg", quality: 70 }).catch(() => null);
  return { url: lastPage.url(), title: await lastPage.title(), headless: wantHeadless(), report, screenshot: shot && shot.toString("base64") };
}

// ---- HTTP ----------------------------------------------------------------

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; frame-ancestors 'none'",
  });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function readJson(req) {
  if (!String(req.headers["content-type"] || "").startsWith("application/json")) throw Object.assign(new Error("Expected JSON"), { status: 415 });
  let size = 0;
  const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > 1_000_000) throw Object.assign(new Error("Too large"), { status: 413 });
    chunks.push(c);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

export function startServer(port = 3000) {
  const server = createServer(async (req, res) => {
    // Only answer requests addressed to this machine (blocks DNS-rebinding
    // pages from reading your profile).
    const host = String(req.headers.host || "").replace(/:\d+$/, "");
    if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) return send(res, 403, { error: "Forbidden host" });

    const path = new URL(req.url, "http://x").pathname;
    try {
      if (path === "/api/profile" && req.method === "GET") return send(res, 200, await loadProfile());
      if (path === "/api/profile" && req.method === "PUT") {
        const p = cleanProfile(await readJson(req));
        await saveProfile(p);
        return send(res, 200, p);
      }
      if (path === "/api/fill" && req.method === "POST") {
        const { url, overwrite } = await readJson(req);
        const raw = String(url ?? "").trim();
        // Bare addresses get https://, except local test servers.
        const withScheme = /^[a-z]+:\/\//i.test(raw) ? raw : (/^(localhost|127\.|\[::1\])/.test(raw) ? "http://" : "https://") + raw;
        let u;
        try { u = new URL(withScheme); } catch { u = null; }
        if (!u || !/^https?:$/.test(u.protocol)) return send(res, 400, { error: "Enter a web address starting with http:// or https://" });
        return send(res, 200, await fillUrl(u.href, { overwrite: !!overwrite }));
      }
      if (path === "/api/refill" && req.method === "POST") {
        const { overwrite } = await readJson(req);
        return send(res, 200, await refillCurrent({ overwrite: !!overwrite }));
      }
      if (path === "/filler.js" && req.method === "GET") return send(res, 200, await readFile(fillerFile), types[".js"]);
      if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });

      const file = normalize(join(publicDir, path.endsWith("/") ? path + "index.html" : path));
      if (!file.startsWith(publicDir + sep)) return send(res, 403, "Forbidden", "text/plain");
      return send(res, 200, await readFile(file), types[extname(file)] ?? "application/octet-stream");
    } catch (err) {
      if (err.code === "ENOENT") return send(res, 404, "Not found", "text/plain");
      const msg = /Executable doesn't exist|browserType\.launch/.test(err.message)
        ? "Chromium is not installed. Run: npx playwright install chromium"
        : err.message.split("\n")[0].replace(/^page\.goto: (net::)?/, "Couldn't open the page: ");
      return send(res, err.status || 500, { error: msg });
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

export async function closeBrowser() {
  const ctx = contextPromise && (await contextPromise.catch(() => null));
  contextPromise = null;
  if (ctx) await ctx.close().catch(() => {});
}

if (process.argv[1] && fileURLToPath(import.meta.url) === normalize(process.argv[1])) {
  const port = Number(process.env.PORT) || 3000;
  await startServer(port);
  console.log(`Form Autofill: http://localhost:${port}`);
}
