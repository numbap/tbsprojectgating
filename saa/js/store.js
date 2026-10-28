// Where the SA&A file is kept in this browser, and how. No DOM access, so it can
// be unit-tested with an in-memory storage object and Node's Web Crypto.
//
// Modes:
//   encrypted  AES-256-GCM ciphertext in localStorage, key from a passphrase
//              (PBKDF2-HMAC-SHA-256); the default
//   memory     nothing written; work is lost when the tab closes
//   plain      unencrypted JSON in localStorage; refused for Protected A or B
//
// SA&A files describe weaknesses in government systems, so the default marking
// is Protected B and the rule against unencrypted storage is enforced here.

export const KEYS = {
  settings: "saa-wizard-settings",
  vault: "saa-wizard-vault",
  plain: "saa-wizard-state",
  theme: "gating-theme", // shared with the Project Gating Navigator on the same site
};

export const FORMAT = "saa-wizard-encrypted";
export const ITERATIONS = 600_000;
export const MIN_ITERATIONS = 100_000;
export const MIN_PASSPHRASE = 15;

export const MARKINGS = {
  unclassified: { label: "Unclassified", banner: "UNCLASSIFIED", protected: false },
  pa: { label: "Protected A", banner: "PROTECTED A", protected: true },
  pb: { label: "Protected B", banner: "PROTECTED B", protected: true },
};

export const MODES = {
  encrypted: { label: "Encrypted in this browser", short: "Encrypted" },
  memory: { label: "Not saved (this tab only)", short: "Not saved" },
  plain: { label: "Unencrypted in this browser (Unclassified only)", short: "Unencrypted" },
};

export class PolicyError extends Error {
  constructor(msg, field) { super(msg); this.name = "PolicyError"; this.field = field; }
}
export class WrongPassphraseError extends Error {
  constructor() { super("Wrong passphrase, or the data has been altered."); this.name = "WrongPassphraseError"; }
}

export const modeAllowed = (mode, marking) => mode !== "plain" || !MARKINGS[marking]?.protected;

export function passphraseProblem(p, confirm) {
  if (!p) return "Enter a passphrase.";
  if ([...p].length < MIN_PASSPHRASE) return `Use at least ${MIN_PASSPHRASE} characters. A few unrelated words work well.`;
  if (confirm !== undefined && p !== confirm) return "The passphrases do not match.";
  return null;
}

// ---------------------------------------------------------------- crypto

const enc = new TextEncoder();
const dec = new TextDecoder();
const subtle = () => globalThis.crypto.subtle;

function toB64(bytes) {
  let s = "";
  const u8 = new Uint8Array(bytes);
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
}
function fromB64(s) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

async function derive(passphrase, salt, iterations) {
  const base = await subtle().importKey("raw", enc.encode(passphrase.normalize("NFKC")), "PBKDF2", false, ["deriveKey"]);
  return subtle().deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function createKey(passphrase, iterations = ITERATIONS) {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return { key: await derive(passphrase, salt, iterations), salt, iterations };
}

// The marking and key-derivation parameters are authenticated as additional data.
const aad = (h) => enc.encode(JSON.stringify([h.format, h.version, h.iterations, h.salt, h.marking]));

export async function seal(k, data, marking) {
  const h = { format: FORMAT, version: 1, cipher: "AES-256-GCM", kdf: "PBKDF2-HMAC-SHA-256", iterations: k.iterations, salt: toB64(k.salt), marking: marking ?? null };
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const ct = await subtle().encrypt({ name: "AES-GCM", iv, additionalData: aad(h) }, k.key, enc.encode(JSON.stringify(data)));
  return { ...h, iv: toB64(iv), data: toB64(ct) };
}

export const isEnvelope = (x) => !!x && typeof x === "object" && x.format === FORMAT;

export async function open(passphrase, env) {
  if (!isEnvelope(env) || env.version !== 1) throw new Error("This is not an SA&A Wizard encrypted file.");
  if (!(env.iterations >= MIN_ITERATIONS)) throw new Error("The file uses too few key-derivation iterations to be trusted.");
  const salt = fromB64(env.salt);
  const k = { key: await derive(passphrase, salt, env.iterations), salt, iterations: env.iterations };
  try {
    const pt = await subtle().decrypt({ name: "AES-GCM", iv: fromB64(env.iv), additionalData: aad(env) }, k.key, fromB64(env.data));
    return { data: JSON.parse(dec.decode(pt)), key: k };
  } catch {
    throw new WrongPassphraseError();
  }
}

// ---------------------------------------------------------------- store

export class Store {
  constructor(storage) {
    this.storage = storage;
    this.key = null;
    this.writing = Promise.resolve();
    this.available = this.#probe();
    this.settings = this.#read(KEYS.settings);
  }

  #probe() {
    try { this.storage.setItem("saa-wizard-probe", "1"); this.storage.removeItem("saa-wizard-probe"); return true; } catch { return false; }
  }
  #read(k) {
    try { const raw = this.storage.getItem(k); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  #write(k, v) { if (this.available) this.storage.setItem(k, JSON.stringify(v)); }
  #remove(k) { try { this.storage.removeItem(k); } catch { /* ignore */ } }

  // "setup": no choice yet; "locked": encrypted data awaiting the passphrase; "ready".
  status() {
    if (!this.settings) return "setup";
    if (this.settings.mode === "encrypted" && !this.key) return this.#read(KEYS.vault) ? "locked" : "setup";
    return "ready";
  }

  loadReady() {
    return this.settings?.mode === "plain" ? this.#read(KEYS.plain) : null;
  }

  async setup({ mode, marking, passphrase, confirm, state }) {
    if (!MODES[mode]) throw new PolicyError("Choose where to keep your work.", "mode");
    if (!MARKINGS[marking]) throw new PolicyError("Choose the security marking.", "marking");
    if (!modeAllowed(mode, marking)) throw new PolicyError(`${MARKINGS[marking].label} information cannot be stored unencrypted. Choose encrypted storage or not saved.`, "mode");
    if (mode !== "memory" && !this.available) throw new PolicyError("This browser blocks storage. Choose “Not saved”.", "mode");
    if (mode === "encrypted") {
      const problem = passphraseProblem(passphrase, confirm);
      if (problem) throw new PolicyError(problem, "passphrase");
      this.key = await createKey(passphrase);
    } else {
      this.key = null;
    }
    this.settings = { mode, marking };
    if (mode === "memory") this.#remove(KEYS.settings); else this.#write(KEYS.settings, this.settings);
    this.#remove(KEYS.vault);
    if (mode !== "plain") this.#remove(KEYS.plain);
    if (state) await this.save(state);
  }

  async unlock(passphrase) {
    const env = this.#read(KEYS.vault);
    if (!env) throw new PolicyError("There is no encrypted SA&A file in this browser.", "passphrase");
    try {
      const { data, key } = await open(passphrase, env);
      this.key = key;
      return data;
    } catch (e) {
      throw new PolicyError(e.message, "passphrase");
    }
  }

  lock() { this.key = null; }

  // Writes are serialized so an older encryption cannot overwrite a newer one.
  save(state) {
    const settings = this.settings;
    if (!settings || settings.mode === "memory") return this.writing;
    this.writing = this.writing.then(async () => {
      if (settings.mode === "plain") {
        if (!modeAllowed("plain", settings.marking)) throw new PolicyError("Refusing to store protected information unencrypted.", "mode");
        this.#write(KEYS.plain, state);
      } else if (this.key) {
        this.#write(KEYS.vault, await seal(this.key, state, settings.marking));
      }
    }).catch((e) => { this.lastError = e; });
    return this.writing;
  }

  setMarking(marking) {
    if (!MARKINGS[marking]) throw new PolicyError("Choose the security marking.", "marking");
    if (!modeAllowed(this.settings.mode, marking)) throw new PolicyError(`Switch to encrypted storage before marking this file ${MARKINGS[marking].label}.`, "marking");
    this.settings = { ...this.settings, marking };
    if (this.settings.mode !== "memory") this.#write(KEYS.settings, this.settings);
  }

  eraseAll() {
    for (const k of [KEYS.settings, KEYS.vault, KEYS.plain]) this.#remove(k);
    this.key = null;
    this.settings = null;
  }

  async exportEncrypted(state, passphrase, confirm) {
    const problem = passphraseProblem(passphrase, confirm);
    if (problem) throw new PolicyError(problem, "export-passphrase");
    return seal(await createKey(passphrase), state, this.settings?.marking ?? null);
  }

  async importFile(text, passphrase) {
    let parsed;
    try { parsed = JSON.parse(text); } catch { throw new PolicyError("This file is not an SA&A Wizard export.", "import-file"); }
    if (isEnvelope(parsed)) {
      if (!passphrase) throw new PolicyError("This file is encrypted. Enter its passphrase.", "import-passphrase");
      try { return { state: (await open(passphrase, parsed)).data, marking: parsed.marking }; } catch (e) {
        throw new PolicyError(e.message, "import-passphrase");
      }
    }
    if (!parsed || typeof parsed !== "object" || !parsed.profile || !parsed.cat) throw new PolicyError("This file is not an SA&A Wizard export.", "import-file");
    return { state: parsed, marking: null };
  }
}
