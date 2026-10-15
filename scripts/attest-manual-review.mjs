// Records a manual accessibility review against the current user-interface code.
//
//   npm run a11y:attest -- --reviewer "Name, credential, organization" --notes "What was reviewed" [--date YYYY-MM-DD]
//
// The VPAT shows "Manual review pending" whenever the UI files listed in
// scripts/build-vpat.mjs change after the last attestation.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { uiFingerprint } from "./ui-fingerprint.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const FILE = join(ROOT, "accessibility/evaluation/manual-review.json");
const arg = (name) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : undefined; };

const reviewer = arg("reviewer");
if (!reviewer) {
  console.error('Usage: npm run a11y:attest -- --reviewer "Name, credential, organization" --notes "Scope of review" [--date YYYY-MM-DD]');
  process.exit(1);
}

const fingerprint = await uiFingerprint();

let history = [];
try { history = JSON.parse(await readFile(FILE, "utf8")).history ?? []; } catch { /* first review */ }
const record = {
  reviewedAt: arg("date") ?? new Date().toISOString().slice(0, 10),
  reviewer,
  notes: arg("notes") ?? "",
  fingerprint,
};
history.push({ reviewedAt: record.reviewedAt, reviewer: record.reviewer, notes: record.notes, fingerprint: record.fingerprint.combined });
await writeFile(FILE, `${JSON.stringify({ ...record, history }, null, 2)}\n`);
console.log(`Manual review recorded for fingerprint ${record.fingerprint.combined}. Run npm run vpat to recompile.`);
