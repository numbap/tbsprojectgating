// Scripted accessibility checks for WCAG success criteria that axe-core cannot
// fully verify. Each check returns { pass, failures[] }. Functions passed to
// page.evaluate run in the browser and must be self-contained.

// ------------------------------------------------------------------ browser helpers

// Installed into every page before checks run.
export const BROWSER_HELPERS = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0.5) return c;
    }
    return parse(getComputedStyle(document.body).backgroundColor) ?? { r: 255, g: 255, b: 255, a: 1 };
  };
  const describe = (el) => {
    if (!el || el === document.body) return "body";
    const id = el.id ? `#${el.id}` : "";
    const name = el.getAttribute("name") ? `[name="${el.getAttribute("name")}"]` : "";
    const val = el.getAttribute("value") && el.type === "radio" ? `[value="${el.getAttribute("value")}"]` : "";
    const txt = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `${el.tagName.toLowerCase()}${id}${name}${val}${txt ? ` "${txt}"` : ""}`;
  };
  // Content of a closed <details> (other than its summary) is not rendered.
  const visible = (el) => {
    if (!el.getClientRects().length) return false;
    const closed = el.closest("details:not([open])");
    if (closed && el !== closed.querySelector(":scope > summary") && !closed.querySelector(":scope > summary").contains(el)) return false;
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && s.display !== "none";
  };
  // Visually hidden radio/file inputs show focus and size on their label.
  const indicatorOwner = (el) => {
    if (el.matches("input[type=radio], input[type=checkbox]") && Number(getComputedStyle(el).opacity) === 0) return el.nextElementSibling ?? el;
    if (el.matches("input[type=file]")) return el.closest("label") ?? el;
    return el;
  };
  const FOCUSABLE = "a[href], button, input:not([type=hidden]), select, textarea, summary, [tabindex]:not([tabindex='-1'])";
  window.__a11y = { parse, lum, ratio, bgOf, describe, visible, indicatorOwner, FOCUSABLE };
};

// ------------------------------------------------------------------ keyboard traversal

// Tab through the whole page once, checking at every stop that focus is visible
// (2.4.7), its indicator has 3:1 contrast (1.4.11) and it is not hidden behind
// sticky content (2.4.11). Then compare stops with all focusable elements (2.1.1)
// and confirm focus leaves the page cleanly rather than looping inside it (2.1.2).
export async function keyboardTraversal(page, maxStops = 900) {
  await page.evaluate(() => {
    document.querySelectorAll("[data-a11y]").forEach((e) => e.removeAttribute("data-a11y"));
    let i = 0;
    document.querySelectorAll(window.__a11y.FOCUSABLE).forEach((e) => e.setAttribute("data-a11y", String(i++)));
    // Start sequential navigation from the top of the document, as a user arriving on the page would.
    const start = document.createElement("span");
    start.tabIndex = -1;
    start.id = "__a11y-start";
    document.body.prepend(start);
    start.focus();
    window.scrollTo(0, 0);
  });
  const stops = [];
  const focusFail = [];
  const obscured = [];
  let trapped = false;
  for (let n = 0; n < maxStops; n++) {
    await page.keyboard.press("Tab");
    const s = await page.evaluate(() => {
      const A = window.__a11y;
      const el = document.activeElement;
      if (!el || el === document.body || el.id === "__a11y-start") return { end: true };
      const owner = A.indicatorOwner(el);
      const cs = getComputedStyle(owner);
      const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 1;
      const shadow = cs.boxShadow && cs.boxShadow !== "none";
      let contrast = null;
      if (outline) {
        const oc = A.parse(cs.outlineColor);
        contrast = oc ? A.ratio(oc, A.bgOf(owner.parentElement ?? owner)) : null;
      }
      const r = owner.getBoundingClientRect();
      const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 2, r.top + 2], [r.right - 2, r.bottom - 2]];
      const covered = pts.every(([x, y]) => {
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return true;
        const hit = document.elementFromPoint(x, y);
        return !(hit && (owner.contains(hit) || hit.contains(owner) || el.contains(hit) || el.closest("label")?.contains(hit)));
      });
      return {
        id: el.getAttribute("data-a11y"),
        name: el.type === "radio" ? el.name : null,
        desc: A.describe(el),
        visibleFocus: outline || shadow,
        contrast,
        covered,
      };
    });
    if (s.end) break;
    if (stops.length && s.id === stops[0].id) { break; }
    stops.push(s);
    if (!s.visibleFocus) focusFail.push(`${s.desc}: no visible focus indicator`);
    else if (s.contrast !== null && s.contrast < 3) focusFail.push(`${s.desc}: focus indicator contrast ${s.contrast.toFixed(2)}:1`);
    if (s.covered) obscured.push(`${s.desc}: focused element hidden behind other content`);
    if (n === maxStops - 1) trapped = true;
  }
  await page.evaluate(() => document.getElementById("__a11y-start")?.remove());
  const missing = await page.evaluate((reached) => {
    const A = window.__a11y;
    const reachedSet = new Set(reached.map((r) => r.id));
    const radioGroups = new Set(reached.filter((r) => r.name).map((r) => r.name));
    return [...document.querySelectorAll("[data-a11y]")]
      // tabindex=-1 elements (e.g. inactive tabs in a roving-tabindex tablist) are deliberately
      // outside the Tab sequence; their arrow-key access is verified by the tabs-pattern check.
      .filter((e) => A.visible(e) && !e.disabled && !e.closest("[inert]") && e.tabIndex >= 0)
      .filter((e) => !reachedSet.has(e.getAttribute("data-a11y")) && !(e.type === "radio" && radioGroups.has(e.name)))
      .map((e) => A.describe(e));
  }, stops.map(({ id, name }) => ({ id, name })));
  const unique = (a) => [...new Set(a)];
  return {
    stops: stops.length,
    reach: { pass: missing.length === 0, failures: unique(missing) },
    trap: { pass: !trapped, failures: trapped ? [`Focus did not leave the page after ${maxStops} Tab presses`] : [] },
    focusVisible: { pass: focusFail.length === 0, failures: unique(focusFail) },
    notObscured: { pass: obscured.length === 0, failures: unique(obscured) },
  };
}

// ------------------------------------------------------------------ static page checks

// Things that look like buttons must be operable by keyboard (2.1.1).
export async function lookalikeControls(page) {
  const failures = await page.evaluate(() => {
    const A = window.__a11y;
    return [...document.querySelectorAll(".btn, [role=button], .tab, .choice, .seg-opt")]
      .filter((e) => A.visible(e))
      .filter((e) => !e.matches(A.FOCUSABLE) && ![...e.querySelectorAll(A.FOCUSABLE)].some((c) => getComputedStyle(c).display !== "none" && c.getClientRects().length))
      .map((e) => `${A.describe(e)}: looks interactive but cannot receive keyboard focus`);
  });
  return { pass: failures.length === 0, failures };
}

// 2.5.8 Target Size (Minimum): 24 by 24 CSS px, excluding inline links in text.
export async function targetSize(page) {
  const failures = await page.evaluate(() => {
    const A = window.__a11y;
    const out = [];
    for (const el of document.querySelectorAll(A.FOCUSABLE)) {
      if (!A.visible(el) && !el.matches("input[type=radio]")) continue;
      const owner = A.indicatorOwner(el);
      if (!A.visible(owner)) continue;
      if (el.tagName === "A") {
        const block = el.parentElement.closest("p, li, td, th, blockquote, dd, span, div");
        const own = el.textContent.trim().length;
        if (block && block.textContent.trim().length > own + 3 && getComputedStyle(el).display === "inline") continue;
      }
      const r = owner.getBoundingClientRect();
      if (r.width < 24 - 0.5 || r.height < 24 - 0.5) out.push(`${A.describe(el)}: ${Math.round(r.width)}×${Math.round(r.height)} px`);
    }
    return [...new Set(out)];
  });
  return { pass: failures.length === 0, failures };
}

// 1.4.11 Non-text Contrast: boundaries of form fields and choice controls need 3:1.
export async function nonTextContrast(page) {
  const failures = await page.evaluate(() => {
    const A = window.__a11y;
    const out = [];
    const targets = [...document.querySelectorAll("input[type=text], input[type=search], input[type=date], input[type=password], input[type=file], textarea, select, .seg, .choice span, .seg-opt span")]
      .filter((e) => A.visible(e));
    for (const el of targets) {
      const cs = getComputedStyle(el);
      const sides = ["Top", "Right", "Bottom", "Left"].filter((s) => parseFloat(cs[`border${s}Width`]) >= 1 && cs[`border${s}Style`] !== "none");
      if (!sides.length) {
        // A segmented option has no own border on its last side; the group border carries the boundary.
        if (el.matches(".seg-opt span")) continue;
        out.push(`${A.describe(el)}: no visible boundary`);
        continue;
      }
      const border = A.parse(cs[`border${sides[0]}Color`]);
      const outside = A.bgOf(el.parentElement);
      const c = A.ratio(border, outside);
      const inner = A.bgOf(el);
      const c2 = A.ratio(inner, outside);
      if (c < 3 && c2 < 3) out.push(`${A.describe(el)}: boundary contrast ${c.toFixed(2)}:1`);
    }
    return [...new Set(out)].slice(0, 25);
  });
  return { pass: failures.length === 0, failures };
}

// 1.4.10 Reflow / 1.4.4 Resize Text: no page-level horizontal scrolling at the given width.
// Data tables may scroll inside their own container (WCAG exception for 2-D content).
export async function noHorizontalScroll(page) {
  const r = await page.evaluate(() => {
    const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const culprits = [];
    if (over > 1) {
      for (const el of document.querySelectorAll("body *")) {
        const b = el.getBoundingClientRect();
        if (b.right > document.documentElement.clientWidth + 1 && !el.closest(".table-wrap, pre")) culprits.push(window.__a11y.describe(el));
        if (culprits.length > 8) break;
      }
    }
    return { over, culprits };
  });
  return { pass: r.over <= 1, failures: r.over > 1 ? [`Page scrolls horizontally by ${r.over}px`, ...r.culprits] : [] };
}

// 1.4.12 Text Spacing: apply the WCAG text spacing overrides and look for clipped text.
export const TEXT_SPACING_CSS = `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
p { margin-bottom: 2em !important; }`;

export async function textSpacing(page) {
  await page.addStyleTag({ content: TEXT_SPACING_CSS });
  const clipped = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (!["hidden", "clip"].includes(cs.overflowX) && !["hidden", "clip"].includes(cs.overflowY)) continue;
      if (!el.textContent.trim() || !window.__a11y.visible(el)) continue;
      if (el.matches(".sr-only")) continue; // visually hidden by design; read by assistive technology
      if (el.matches(".ring, .bar, .tabs, .table-wrap, pre")) continue; // decorative or scrollable containers
      if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2) out.push(window.__a11y.describe(el));
    }
    return out.slice(0, 20);
  });
  const scroll = await noHorizontalScroll(page);
  const failures = [...clipped.map((d) => `${d}: text clipped with text-spacing overrides`), ...scroll.failures];
  return { pass: failures.length === 0, failures };
}

// ------------------------------------------------------------------ interaction checks

// 2.4.3 / 2.4.2: after in-app navigation focus moves to the new page heading and the title changes.
export async function routeFocus(page, base) {
  await page.goto(`${base}/#/`);
  const failures = [];
  const titles = new Set();
  for (const nav of ["profile", "review", "assess", "report", "library", "gates", "process", "security", "home"]) {
    await page.focus(`[data-nav="${nav}"]`);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => ({
      tag: document.activeElement?.tagName, inMain: !!document.activeElement?.closest("main"), title: document.title,
      current: document.querySelector("[aria-current=page]")?.dataset.nav ?? null,
    }));
    if (r.tag !== "H1" || !r.inMain) failures.push(`${nav}: focus after navigation is on ${r.tag}, expected the page h1`);
    if (r.current !== nav) failures.push(`${nav}: navigation link not marked aria-current="page"`);
    if (!r.title.trim() || titles.has(r.title)) failures.push(`${nav}: page title "${r.title}" missing or not unique`);
    titles.add(r.title);
  }
  return { pass: failures.length === 0, failures };
}

// 2.1.1 / 4.1.2: requirement lens tabs follow the ARIA tabs pattern and work with arrow keys.
export async function tabsPattern(page, base) {
  await page.goto(`${base}/#/assess/G3/INV-4`);
  await page.waitForSelector("#c-INV-4 [role=tab]");
  const failures = [];
  const first = page.locator("#c-INV-4 [role=tab]").first();
  await first.focus();
  await page.keyboard.press("ArrowRight");
  const r = await page.evaluate(() => {
    const el = document.activeElement;
    const tabs = [...el.closest("[role=tablist]").querySelectorAll("[role=tab]")];
    const panel = document.getElementById(el.getAttribute("aria-controls") ?? "");
    return {
      index: tabs.indexOf(el),
      selected: el.getAttribute("aria-selected"),
      panelVisible: !!panel && !panel.hidden && panel.getAttribute("role") === "tabpanel",
      labelled: panel?.getAttribute("aria-labelledby") === el.id,
      tabindexes: tabs.map((t) => t.getAttribute("tabindex")),
    };
  });
  if (r.index !== 1) failures.push("ArrowRight did not move focus to the next tab");
  if (r.selected !== "true") failures.push("Focused tab is not aria-selected=true");
  if (!r.panelVisible) failures.push("Selected tab does not control a visible role=tabpanel");
  if (!r.labelled) failures.push("Tab panel is not labelled by its tab");
  if (r.tabindexes.filter((t) => t === "0").length !== 1) failures.push("Tabs do not use a single tab stop (roving tabindex)");
  await page.keyboard.press("End");
  const end = await page.evaluate(() => { const t = [...document.activeElement.parentElement.children]; return t.indexOf(document.activeElement) === t.length - 1; });
  if (!end) failures.push("End key did not move to the last tab");
  return { pass: failures.length === 0, failures };
}

// 4.1.3 Status Messages: results of actions are announced through a live region
// without moving focus. Also checks keyboard operation of answer radios (2.1.1).
export async function statusMessages(page, base) {
  const failures = [];
  const live = () => page.evaluate(() => [...document.querySelectorAll("[role=status], [aria-live=polite], [aria-live=assertive]")]
    .map((e) => e.textContent.trim()).join(" | "));

  await page.goto(`${base}/#/assess/G2/GOV-6`);
  await page.waitForSelector('#c-GOV-6 input[name="GOV-6.q0"]');
  await page.locator('#c-GOV-6 input[name="GOV-6.q0"]').first().focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(150);
  const checked = await page.evaluate(() => document.querySelector('input[name="GOV-6.q0"]:checked')?.value);
  if (checked !== "yes") failures.push(`Space on a focused answer did not select it (got ${checked})`);
  if (!/GOV-6/.test(await live())) failures.push("Answering a question did not announce the requirement's new status");

  await page.goto(`${base}/#/review`);
  await page.focus('[data-action="analyze"]');
  await page.keyboard.press("Enter");
  await page.waitForTimeout(250);
  if (!/evidence|requirements/i.test(await live())) failures.push("Analyze did not announce its result");

  await page.goto(`${base}/#/library`);
  await page.focus("#lib-q");
  await page.keyboard.type("benefits");
  await page.waitForTimeout(600);
  const focusKept = await page.evaluate(() => document.activeElement?.id === "lib-q");
  if (!focusKept) failures.push("Typing in the library search lost focus");
  if (!/\d+ requirements? found/.test(await live())) failures.push("Library search did not announce the result count");
  return { pass: failures.length === 0, failures };
}

// 3.1.1 / 3.1.2 / 4.1.3: switching language updates the page language, keeps
// focus on the toggle, labels the toggle in its own language and announces the change.
export async function languageSwitch(page, base) {
  const failures = [];
  await page.goto(`${base}/#/profile`);
  await page.focus("#lang-toggle");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  const r = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    focus: document.activeElement?.id,
    toggleLang: document.getElementById("lang-toggle").lang,
    live: document.getElementById("live").textContent,
    h1: document.querySelector("h1")?.textContent ?? "",
  }));
  if (r.lang !== "fr") failures.push(`html lang is "${r.lang}" after switching to French`);
  if (r.focus !== "lang-toggle") failures.push("Focus left the language toggle");
  if (r.toggleLang !== "en") failures.push("The toggle (now offering English) is not marked lang=\"en\"");
  if (!/français/i.test(r.live)) failures.push("The language change was not announced");
  if (!/portée/i.test(r.h1)) failures.push("The page content was not translated");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  if ((await page.evaluate(() => document.documentElement.lang)) !== "en") failures.push("Switching back did not restore lang=\"en\"");
  return { pass: failures.length === 0, failures };
}
