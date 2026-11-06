// Form filler that runs inside the target web page.
//
// It is plain browser JavaScript with no imports so the same file can be
// (1) injected into a page by the Playwright server and (2) embedded in the
// bookmarklet. It defines window.__autofill(profile, options) and returns a
// report of what it filled. It never submits a form.

window.__autofill = function autofill(profile, options) {
  "use strict";
  const opts = Object.assign({ overwrite: false, frames: true, highlight: true }, options || {});

  // Built-in fields. Order matters: earlier rules win ties, so specific
  // rules come before generic ones. `ac` = HTML autocomplete tokens,
  // `re` = pattern tested against each name/id/label/placeholder separately,
  // `not` = pattern that disqualifies the rule for that text.
  const RULES = [
    { key: "email", ac: ["email"], type: ["email"], re: /\be-?mail\b|courriel/ },
    { key: "firstName", ac: ["given-name"], re: /\bfirst ?name\b|\bgiven ?name\b|\bfname\b|\bforename\b|pr[ée]nom/ },
    { key: "middleName", ac: ["additional-name"], re: /\bmiddle ?name\b|\bmiddle initial\b/ },
    { key: "lastName", ac: ["family-name"], re: /\blast ?name\b|\bsurname\b|\bfamily ?name\b|\blname\b|nom de famille/ },
    { key: "fullName", ac: ["name"], re: /^(your |full |legal )?name$|^nom( complet)?$|^full ?name\b|^applicant name$|^contact name$/ },
    { key: "phone", ac: ["tel", "tel-national"], type: ["tel"], re: /phone|mobile|\bcell\b|t[ée]l[ée]phone|^tel$/, not: /extension|\bext\b|fax/ },
    { key: "address2", ac: ["address-line2"], re: /address ?(line)? ?2\b|\bapt\b|apartment|\bsuite\b|\bunit\b/ },
    { key: "address1", ac: ["address-line1", "street-address"], re: /address ?(line)? ?1\b|street|^(home |mailing |street )?address$|^adresse$/, not: /e-?mail|web|\bip\b|url/ },
    { key: "city", ac: ["address-level2"], re: /\bcity\b|\btown\b|ville|locality/, not: /ethnic|capacity/ },
    { key: "region", ac: ["address-level1"], re: /\bstate\b|province|\bregion\b|\bcounty\b/, not: /statement/ },
    { key: "postalCode", ac: ["postal-code"], re: /\bzip\b|zip ?code|postal|post ?code|code postal/ },
    { key: "country", ac: ["country", "country-name"], re: /\bcountry\b|\bpays\b/, not: /code/ },
    { key: "birthDate", ac: ["bday"], re: /birth|\bdob\b|date de naissance/ },
    { key: "company", ac: ["organization"], re: /company|organi[sz]ation|employer|entreprise|\bbusiness name\b/ },
    { key: "jobTitle", ac: ["organization-title"], re: /job ?title|\bposition\b|^title$|^current title$|\brole\b|poste/ },
    { key: "linkedin", re: /linked ?in/ },
    { key: "github", re: /git ?hub/ },
    { key: "website", ac: ["url"], type: ["url"], re: /website|homepage|portfolio|personal (site|url)|site web/, not: /linked ?in|git ?hub/ },
  ];

  const SKIP_TYPES = /^(hidden|password|file|submit|button|reset|image|search)$/;
  const SKIP_TEXT = /captcha|password|\bcvv\b|\bcvc\b|card number|credit card|security code|\bssn\b|social security|\bsin\b|one.?time code|\botp\b/;

  const norm = (s) =>
    String(s || "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_\-\[\].:*]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const short = (s) => norm(s).slice(0, 100);

  function values() {
    const p = Object.assign({}, profile || {});
    if (!p.fullName) p.fullName = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");
    return p;
  }
  const data = values();
  const custom = (Array.isArray(data.custom) ? data.custom : [])
    .filter((c) => c && c.label && c.value != null && String(c.value) !== "")
    .map((c) => ({ label: norm(c.label), value: String(c.value) }));

  function labelText(el, doc) {
    const parts = [];
    if (el.labels) for (const l of el.labels) parts.push(l.innerText || l.textContent);
    const by = el.getAttribute("aria-labelledby");
    if (by) for (const id of by.split(/\s+/)) { const n = doc.getElementById(id); if (n) parts.push(n.textContent); }
    if (!parts.length) {
      const wrap = el.closest("label");
      if (wrap) parts.push(wrap.innerText || wrap.textContent);
    }
    if (!parts.length) {
      // Fall back to a short text node just before the field.
      let prev = el.previousElementSibling;
      if (!prev && el.parentElement) prev = el.parentElement.previousElementSibling;
      const t = prev && (prev.innerText || prev.textContent);
      if (t && t.trim().length < 60) parts.push(t);
    }
    return parts.map(short).filter(Boolean);
  }

  function descriptors(el, doc) {
    const groupLabel = [];
    if (el.type === "radio" || el.type === "checkbox") {
      const fs = el.closest("fieldset");
      const lg = fs && fs.querySelector("legend");
      if (lg) groupLabel.push(short(lg.textContent));
      const rg = el.closest("[role=radiogroup],[role=group]");
      if (rg && rg.getAttribute("aria-label")) groupLabel.push(short(rg.getAttribute("aria-label")));
    }
    return {
      attrs: [el.name, el.id].map(short).filter(Boolean),
      texts: [
        ...(el.type === "radio" ? [] : labelText(el, doc)),
        ...groupLabel,
        short(el.getAttribute("aria-label")),
        short(el.getAttribute("placeholder")),
        short(el.getAttribute("title")),
        short(el.getAttribute("data-testid")),
      ].filter(Boolean),
    };
  }

  // Returns { key, value, score } or null.
  function classify(el, doc) {
    const d = descriptors(el, doc);
    const all = d.attrs.concat(d.texts);
    if (all.some((t) => SKIP_TEXT.test(t))) return null;
    const ac = String(el.getAttribute("autocomplete") || "").toLowerCase().split(/\s+/);
    if (ac.some((t) => t.startsWith("cc-") || t.includes("password") || t === "one-time-code")) return null;

    let best = null;
    // Custom fields the user defined win when their label appears in the field's text.
    for (const c of custom) {
      if (all.some((t) => t === c.label)) best = { key: "custom:" + c.label, value: c.value, score: 90 };
      else if (!best && all.some((t) => t.includes(c.label))) best = { key: "custom:" + c.label, value: c.value, score: 60 };
    }
    RULES.forEach((r, i) => {
      const v = data[r.key];
      if (v == null || String(v) === "") return;
      let score = 0;
      if (r.ac && ac.some((t) => r.ac.includes(t))) score = 100;
      const hit = (t) => r.re.test(t) && !(r.not && r.not.test(t));
      if (d.attrs.some(hit)) score = Math.max(score, 50);
      if (d.texts.some(hit)) score = Math.max(score, 45);
      if (r.type && r.type.includes(el.type)) score += 20;
      if (!score) return;
      score -= i * 0.01; // stable tie-break by rule order
      if (!best || score > best.score) best = { key: r.key, value: String(v), score };
    });
    return best;
  }

  function setNativeValue(el, value) {
    const proto = el instanceof el.ownerDocument.defaultView.HTMLTextAreaElement
      ? el.ownerDocument.defaultView.HTMLTextAreaElement.prototype
      : el instanceof el.ownerDocument.defaultView.HTMLSelectElement
        ? el.ownerDocument.defaultView.HTMLSelectElement.prototype
        : el.ownerDocument.defaultView.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, value); // works with React/Vue controlled inputs
    for (const type of ["input", "change"]) el.dispatchEvent(new Event(type, { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: false }));
  }

  function formatFor(el, key, value) {
    if (key === "birthDate" && el.type === "date") return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
    if (el.type === "email" && !value.includes("@")) return null;
    if (el.maxLength > 0 && value.length > el.maxLength) return value.slice(0, el.maxLength);
    return value;
  }

  function pickOption(select, value) {
    const v = norm(value);
    const opts = Array.from(select.options).filter((o) => !o.disabled);
    return (
      opts.find((o) => norm(o.value) === v || norm(o.text) === v) ||
      opts.find((o) => v.length > 2 && (norm(o.text).startsWith(v) || v.startsWith(norm(o.text)) && norm(o.text).length > 2)) ||
      null
    );
  }

  function radioLabel(el) {
    const parts = [el.value];
    if (el.labels) for (const l of el.labels) parts.push(l.textContent);
    const wrap = el.closest("label");
    if (wrap) parts.push(wrap.textContent);
    return parts.map(norm);
  }

  function visible(el) {
    if (el.disabled || el.readOnly) return false;
    const st = el.ownerDocument.defaultView.getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function mark(el) {
    if (!opts.highlight) return;
    el.style.outline = "2px solid #2e8b57";
    el.style.outlineOffset = "1px";
  }

  const report = [];
  const where = (el) => (el.name || el.id || el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.tagName.toLowerCase());

  function fillRoot(root, doc) {
    const fields = root.querySelectorAll("input, textarea, select");
    const doneGroups = new Set();
    for (const el of fields) {
      const type = (el.type || "").toLowerCase();
      if (SKIP_TYPES.test(type) || !visible(el)) continue;

      if (type === "radio" || type === "checkbox") {
        const group = type + ":" + (el.name || el.id);
        if (doneGroups.has(group)) continue;
        const m = classify(el, doc);
        if (!m) continue;
        doneGroups.add(group);
        const peers = el.name ? Array.from(root.querySelectorAll(`input[type=${type}][name="${CSS.escape(el.name)}"]`)) : [el];
        if (!opts.overwrite && peers.some((p) => p.checked)) { report.push({ field: where(el), key: m.key, status: "already set" }); continue; }
        const want = norm(m.value);
        const target = peers.find((p) => radioLabel(p).some((t) => t === want)) ||
          peers.find((p) => radioLabel(p).some((t) => t && (t.startsWith(want) || want.startsWith(t))));
        if (target) {
          target.click();
          mark(target);
          report.push({ field: where(el), key: m.key, value: m.value, status: "filled" });
        } else report.push({ field: where(el), key: m.key, value: m.value, status: "no matching choice" });
        continue;
      }

      const m = classify(el, doc);
      if (!m) continue;
      if (!opts.overwrite && el.value && el.tagName !== "SELECT") { report.push({ field: where(el), key: m.key, status: "already set" }); continue; }

      if (el.tagName === "SELECT") {
        if (!opts.overwrite && el.selectedIndex > 0) { report.push({ field: where(el), key: m.key, status: "already set" }); continue; }
        const o = pickOption(el, m.value);
        if (!o) { report.push({ field: where(el), key: m.key, value: m.value, status: "no matching choice" }); continue; }
        setNativeValue(el, o.value);
        mark(el);
        report.push({ field: where(el), key: m.key, value: o.text.trim(), status: "filled" });
        continue;
      }

      const value = formatFor(el, m.key, m.value);
      if (value == null) { report.push({ field: where(el), key: m.key, status: "format not supported" }); continue; }
      el.focus({ preventScroll: true });
      setNativeValue(el, value);
      mark(el);
      report.push({ field: where(el), key: m.key, value, status: "filled" });
    }
    // Open shadow roots (web components).
    for (const host of root.querySelectorAll("*")) if (host.shadowRoot) fillRoot(host.shadowRoot, doc);
  }

  fillRoot(document, document);
  if (opts.frames) {
    // Same-origin iframes only; the browser blocks the rest (the server-side filler handles those).
    for (const f of document.querySelectorAll("iframe")) {
      try { if (f.contentDocument) fillRoot(f.contentDocument, f.contentDocument); } catch (e) { /* cross-origin */ }
    }
  }
  return report;
};
