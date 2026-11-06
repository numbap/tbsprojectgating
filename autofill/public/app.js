"use strict";

const $ = (s) => document.querySelector(s);
const KEYS = ["firstName", "middleName", "lastName", "fullName", "email", "phone", "address1", "address2",
  "city", "region", "postalCode", "country", "birthDate", "company", "jobTitle", "website", "linkedin", "github"];
const NAMES = {
  firstName: "First name", middleName: "Middle name", lastName: "Last name", fullName: "Full name", email: "Email",
  phone: "Phone", address1: "Street address", address2: "Apartment / unit", city: "City", region: "Province / state",
  postalCode: "Postal code", country: "Country", birthDate: "Date of birth", company: "Company", jobTitle: "Job title",
  website: "Website", linkedin: "LinkedIn", github: "GitHub",
};

let fillerSource = "";

async function api(path, method = "GET", body) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function addCustom(label = "", value = "") {
  const node = $("#custom-tpl").content.firstElementChild.cloneNode(true);
  const n = document.querySelectorAll(".custom").length + 1;
  const [l1, l2] = node.querySelectorAll("label");
  const li = node.querySelector(".c-label"), vi = node.querySelector(".c-value");
  li.id = `c-label-${n}-${Date.now()}`; vi.id = `c-value-${n}-${Date.now()}`;
  l1.htmlFor = li.id; l2.htmlFor = vi.id;
  li.value = label; vi.value = value;
  node.querySelector(".remove").addEventListener("click", () => { node.remove(); updateBookmarklet(); });
  $("#custom-list").append(node);
  return li;
}

function readProfile() {
  const p = {};
  for (const k of KEYS) p[k] = $("#" + k).value.trim();
  p.custom = [...document.querySelectorAll(".custom")]
    .map((c) => ({ label: c.querySelector(".c-label").value.trim(), value: c.querySelector(".c-value").value }))
    .filter((c) => c.label);
  return p;
}

function writeProfile(p) {
  for (const k of KEYS) $("#" + k).value = p[k] || "";
  $("#custom-list").replaceChildren();
  for (const c of p.custom || []) addCustom(c.label, c.value);
}

function updateBookmarklet() {
  if (!fillerSource) return;
  const p = readProfile();
  const code = `(function(){${fillerSource};var r=window.__autofill(${JSON.stringify(p)});` +
    `var n=r.filter(function(x){return x.status==="filled"}).length;` +
    `alert("Autofill: filled "+n+" field"+(n===1?"":"s")+". Check them before you submit.")})();`;
  $("#bookmarklet").href = "javascript:" + encodeURIComponent(code);
}

function showResult(r) {
  const filled = r.report.filter((x) => x.status === "filled").length;
  $("#result-caption").textContent = `${r.title || r.url}: ${filled} of ${r.report.length} matched field${r.report.length === 1 ? "" : "s"} filled`;
  const body = $("#result-body");
  body.replaceChildren();
  for (const row of r.report) {
    const tr = document.createElement("tr");
    const key = row.key.startsWith("custom:") ? `“${row.key.slice(7)}”` : NAMES[row.key] || row.key;
    for (const text of [row.field + (row.frame ? ` (in ${row.frame})` : ""), key, row.value ?? "", row.status]) {
      const td = document.createElement("td");
      td.textContent = text;
      tr.append(td);
    }
    tr.className = row.status === "filled" ? "ok" : "warn";
    body.append(tr);
  }
  if (!r.report.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td colspan="4">No fields on this page matched your details. If the form appears after a click, open it in the browser window, then use “Fill the open page again”.</td>';
    body.append(tr);
  }
  $("#shot").src = r.screenshot ? "data:image/jpeg;base64," + r.screenshot : "";
  $("#shot-wrap").hidden = !r.screenshot;
  $("#shot-wrap").open = !!r.headless;
  $("#result").hidden = false;
  $("#refill-btn").hidden = false;
  $("#status").textContent = r.headless
    ? "Filled in a hidden browser (no display found), so you can only see the screenshot. Run this app on your own computer to get a window you can submit from."
    : "Done. Switch to the browser window to check the answers and submit the form.";
}

async function run(path, body) {
  const btns = [$("#fill-btn"), $("#refill-btn")];
  btns.forEach((b) => (b.disabled = true));
  $("#status").textContent = "Opening the page and filling the form…";
  try {
    await api("/api/profile", "PUT", readProfile()); // use the latest details
    showResult(await api(path, "POST", body));
  } catch (e) {
    $("#status").textContent = "Couldn't fill the form: " + e.message;
  } finally {
    btns.forEach((b) => (b.disabled = false));
  }
}

$("#fill-form").addEventListener("submit", (e) => {
  e.preventDefault();
  run("/api/fill", { url: $("#url").value, overwrite: $("#overwrite").checked });
});
$("#refill-btn").addEventListener("click", () => run("/api/refill", { overwrite: $("#overwrite").checked }));

$("#profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    writeProfile(await api("/api/profile", "PUT", readProfile()));
    $("#saved").textContent = "Saved.";
    updateBookmarklet();
  } catch (err) {
    $("#saved").textContent = "Couldn't save: " + err.message;
  }
  setTimeout(() => ($("#saved").textContent = ""), 3000);
});
$("#profile-form").addEventListener("input", updateBookmarklet);
$("#add-custom").addEventListener("click", () => addCustom().focus());
$("#bookmarklet").addEventListener("click", (e) => {
  e.preventDefault();
  $("#status").textContent = "";
  alert("Drag this button to your bookmarks bar instead of clicking it here.");
});

(async () => {
  try {
    writeProfile(await api("/api/profile"));
    fillerSource = await (await fetch("/filler.js")).text();
    updateBookmarklet();
  } catch (e) {
    $("#saved").textContent = "Couldn't load your details: " + e.message;
  }
})();
