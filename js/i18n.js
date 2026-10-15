// Bilingual support (English / French). No DOM access, so the engine, report
// and storage layers can use it under `node --test`.
//
//   t(key, vars)  interface string from js/strings.js, with {placeholders}
//   L(x)          picks the current language from bilingual content
//                 ({ en, fr } objects); plain strings and arrays pass through
//
// Content is written once as { en: ..., fr: ... }. The French text was drafted
// with machine assistance and should be reviewed by a qualified translator
// before official use (see README).

import { STRINGS } from "./strings.js";

export const LANGS = ["en", "fr"];
let current = "en";

export function setLang(lang) {
  current = LANGS.includes(lang) ? lang : "en";
  return current;
}

export const getLang = () => current;

// The other official language, for the language toggle.
export const otherLang = (lang = current) => (lang === "fr" ? "en" : "fr");

export function L(x, lang = current) {
  if (x === null || x === undefined) return "";
  if (typeof x === "string" || Array.isArray(x) || typeof x !== "object") return x;
  if ("en" in x || "fr" in x) return x[lang] ?? x.en;
  return x;
}

export function t(key, vars = {}, lang = current) {
  const s = STRINGS[lang]?.[key] ?? STRINGS.en[key];
  if (s === undefined) return key;
  return String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

// Plural-aware lookup: uses `${key}_one` when n === 1, otherwise `${key}_other`.
export function tn(key, n, vars = {}, lang = current) {
  return t(`${key}_${n === 1 ? "one" : "other"}`, { n, ...vars }, lang);
}

// Number formatting in the official style of each language (1 000 in French).
export function fmtNumber(n, lang = current) {
  return new Intl.NumberFormat(lang === "fr" ? "fr-CA" : "en-CA").format(n);
}

export function fmtPct(x, lang = current) {
  const v = Math.round(x * 100);
  return lang === "fr" ? `${v} %` : `${v}%`;
}

// Dollar amounts in millions: "$2.5M" / "2,5 M$".
export function fmtMoney(millions, lang = current) {
  if (millions === null || millions === undefined) return "—";
  if (millions >= 1000) {
    const b = millions / 1000;
    return lang === "fr" ? `${fmtNumber(b, lang)} G$` : `$${fmtNumber(b, lang)}B`;
  }
  return lang === "fr" ? `${fmtNumber(millions, lang)} M$` : `$${fmtNumber(millions, lang)}M`;
}
