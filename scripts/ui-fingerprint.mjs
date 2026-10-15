// Fingerprint of the files whose changes can affect accessibility judgements
// made by code review or visual inspection. Used by build-vpat.mjs to detect
// that a manual review is out of date, and by attest-manual-review.mjs to record one.

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));

export const UI_FILES = [
  "index.html", "css/styles.css", "js/app.js", "js/report.js", "js/strings.js",
  "scripts/build-vpat.mjs", "accessibility/assets/docs.css",
];

const sha = (s) => createHash("sha256").update(s).digest("hex");

export async function uiFingerprint() {
  const files = {};
  for (const f of UI_FILES) {
    try { files[f] = sha(await readFile(join(ROOT, f))).slice(0, 16); } catch { files[f] = "missing"; }
  }
  return { files, combined: sha(JSON.stringify(files)).slice(0, 16) };
}
