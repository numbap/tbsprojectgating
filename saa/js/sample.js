// A fictional system for trying the wizard. Any resemblance to a real system is
// coincidental.

import { newState } from "./engine.js";

export function sampleState() {
  const s = newState();
  s.profile = {
    ...s.profile,
    name: "Grant Application Portal",
    version: "Release 1.0",
    dept: "Example Department",
    description: "Online portal where organizations apply for program grants, upload supporting documents and track their applications. Officers assess applications in a back-office module. Hosted on a PaaS in the department's cloud tenancy, with sign-in through the GC sign-in service.",
    deployment: "paas", sourcing: "custom", users: "public", internet: "yes", pi: "yes", adm: "no", interconnect: "yes", critical: "no",
    roles: {
      businessOwner: "Director General, Grants and Contributions",
      ao: "Director General, Grants and Contributions",
      ciso: "Departmental CISO",
      assessor: "IT Security Assessment Team",
      privacy: "ATIP Office",
      pm: "Product owner, Grants Modernization",
    },
  };
  s.cat = {
    conf: "pb", integrity: "medium", availability: "medium",
    confNotes: "Applications contain personal information of contacts and financial statements of organizations; in aggregate, serious injury if disclosed.",
    intNotes: "Altered assessments could lead to wrong funding decisions; detected through reconciliation within weeks.",
    availNotes: "Intake can pause for several days with deadline extensions; not a critical service.",
  };
  for (const id of ["ctx-desc", "ctx-owner", "ctx-ao", "ctx-security", "ctx-dso", "ctx-privacy", "cat-assets", "cat-injury", "cat-sos", "cat-pia", "plan-boundary", "plan-profile", "plan-csp", "plan-residency", "tra-method", "tra-threats"]) {
    s.items[id] = { status: "done", note: "" };
  }
  s.items["ctx-gating"] = { status: "progress", note: "Assessment and pen test budgeted; schedule to confirm." };
  s.items["plan-saa"] = { status: "progress", note: "Draft with IT security." };
  s.items["tra-vulns"] = { status: "progress", note: "" };
  s.risks = [
    { id: "r1", threat: "Credential theft through phishing or password spraying", asset: "Officer accounts", vuln: "Officers sign in with passwords only today", existing: "Departmental identity provider", l: 4, i: 4, treatment: "mitigate", planned: "MFA for all officers; phishing-resistant MFA for administrators", rl: 2, ri: 4, owner: "Product owner" },
    { id: "r2", threat: "Attack on the web application (injection, broken access control)", asset: "Application data", vuln: "Applicants can upload files; complex role model", existing: "Framework protections", l: 3, i: 4, treatment: "mitigate", planned: "SAST/DAST in pipeline, authorization tests, file scanning, penetration test", rl: 2, ri: 3, owner: "Tech lead" },
    { id: "r3", threat: "Provider or data centre outage", asset: "Service availability", vuln: "Single region", existing: "Zone-redundant services", l: 2, i: 3, treatment: "accept", planned: "", rl: 2, ri: 3, owner: "Business owner" },
  ];
  s.findings = [
    { id: "f1", title: "TLS 1.0 enabled on legacy file-upload endpoint", source: "va", severity: "high", control: "SC-8", status: "poam", owner: "Platform team", due: "2026-12-15", action: "Disable TLS 1.0/1.1; restrict to approved cipher suites", interim: "Endpoint behind WAF" },
    { id: "f2", title: "Audit logs not forwarded to departmental SIEM", source: "control", severity: "medium", control: "AU-6", status: "open", owner: "Security operations", due: "2027-01-31", action: "Configure log export and alert rules", interim: "" },
  ];
  s.controls = { AC: { status: "partial", note: "MFA rollout under way" }, IA: { status: "partial", note: "" }, SC: { status: "implemented", note: "" }, PE: { status: "inherited", note: "Cloud provider (CCCS-assessed)" } };
  return s;
}
