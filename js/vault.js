// Client-side encryption for assessments kept in the browser or exported to a file.
//
// Cipher: AES-256-GCM (authenticated encryption), a fresh random 96-bit IV per write.
// Key:    PBKDF2-HMAC-SHA-256 from the user's passphrase with a random 128-bit salt.
// Both algorithms are listed in CCCS ITSP.40.111. They run in the browser's Web
// Crypto implementation, which is not necessarily a CMVP-validated module (see
// policies/protected-b.md). Keys are non-extractable and held in memory only.
// Runs in browsers and in Node (globalThis.crypto) so it can be unit-tested.

import { t } from "./i18n.js";

export const FORMAT = "gating-navigator-encrypted";
export const ITERATIONS = 600_000;
// Refuse envelopes with weak key derivation (e.g. a crafted or downgraded file).
export const MIN_ITERATIONS = 100_000;
export const MIN_PASSPHRASE = 15;

const enc = new TextEncoder();
const dec = new TextDecoder();
const subtle = () => globalThis.crypto.subtle;

function toB64(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
}

function fromB64(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export class WrongPassphraseError extends Error {
  constructor() { super(t("err.wrongPassOrAltered")); this.name = "WrongPassphraseError"; }
}

export function passphraseProblem(p, confirm) {
  if (!p) return t("err.passEmpty");
  if ([...p].length < MIN_PASSPHRASE) return t("err.passShort", { n: MIN_PASSPHRASE });
  if (confirm !== undefined && p !== confirm) return t("err.passMismatch");
  return null;
}

async function derive(passphrase, salt, iterations) {
  const base = await subtle().importKey("raw", enc.encode(passphrase.normalize("NFKC")), "PBKDF2", false, ["deriveKey"]);
  return subtle().deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"],
  );
}

// A key bound to its salt and iteration count, reused for every save in a session.
export async function createKey(passphrase, iterations = ITERATIONS) {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return { key: await derive(passphrase, salt, iterations), salt, iterations };
}

// Header fields are authenticated (AES-GCM additional data) so the marking or
// KDF parameters cannot be changed without detection.
function header(k, marking) {
  return { format: FORMAT, version: 1, cipher: "AES-256-GCM", kdf: "PBKDF2-HMAC-SHA-256", iterations: k.iterations, salt: toB64(k.salt), marking: marking ?? null };
}
const aad = (h) => enc.encode(JSON.stringify([h.format, h.version, h.cipher, h.kdf, h.iterations, h.salt, h.marking]));

export async function seal(k, data, marking) {
  const h = header(k, marking);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const ct = await subtle().encrypt({ name: "AES-GCM", iv, additionalData: aad(h) }, k.key, enc.encode(JSON.stringify(data)));
  return { ...h, iv: toB64(iv), data: toB64(ct) };
}

export function isEnvelope(x) {
  return !!x && typeof x === "object" && x.format === FORMAT;
}

// Opens an envelope with a passphrase. Returns the data and the derived key so
// the caller can keep saving under the same key without re-deriving it.
export async function open(passphrase, envelope) {
  if (!isEnvelope(envelope) || envelope.version !== 1 || envelope.cipher !== "AES-256-GCM" || envelope.kdf !== "PBKDF2-HMAC-SHA-256") {
    throw new Error(t("err.badFile"));
  }
  if (!(envelope.iterations >= MIN_ITERATIONS)) throw new Error(t("err.weakFile"));
  const salt = fromB64(envelope.salt);
  const k = { key: await derive(passphrase, salt, envelope.iterations), salt, iterations: envelope.iterations };
  return { data: await openWithKey(k, envelope), key: k };
}

export async function openWithKey(k, envelope) {
  try {
    const pt = await subtle().decrypt({ name: "AES-GCM", iv: fromB64(envelope.iv), additionalData: aad(envelope) }, k.key, fromB64(envelope.data));
    return JSON.parse(dec.decode(pt));
  } catch {
    throw new WrongPassphraseError();
  }
}
