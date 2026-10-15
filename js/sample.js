// Sample project used by "Load sample project" and by the accessibility test
// fixtures. Fictional: any resemblance to a real project is coincidental.

import { newState } from "./engine.js";

export const SAMPLE_TEXT = `ClaimPath Online will replace the paper application process for the Example Benefit with a digital service for Canadians.
The problem: applicants wait an average of 14 weeks for a decision, and 30% of paper applications are returned as incomplete.
The project sponsor is the Assistant Deputy Minister, Service Delivery Branch, who chairs the steering committee.
The steering committee terms of reference set tolerances of 10% on cost and 3 months on schedule.
The estimated total cost is $38 million over four years, including ongoing operations for the first two years.
Funding will come from Budget 2026 through a Memorandum to Cabinet and a Treasury Board submission; new funding is required.
Our PCRA is expected to be level 3 (Evolutionary); the department holds an OPMCA class 2 rating.
An options analysis compared the status quo, enhancing the legacy case system and a SaaS case management platform.
The recommended option is to configure a commercial SaaS case management platform hosted in a Canadian cloud region.
The solution will collect personal information from applicants and process Protected B data.
A privacy impact assessment is planned with the ATIP office during design.
Eligibility triage will use a rules engine to recommend decisions; an Algorithmic Impact Assessment is to be determined.
Delivery will be agile, with releases every quarter and a minimum viable product for one region first.
Procurement will use the existing supply arrangement for cloud services; a request for proposals is not expected.
The business case is in draft and will be presented to the departmental investment committee in the spring.
Benefits include reducing average processing time from 14 weeks to 4 weeks and cutting incomplete applications in half.
A risk register is maintained and reviewed monthly by the project team.
The project will be presented to the GC EARB at concept stage.
Change management and training plans are not yet developed.
Lessons learned from the 2019 modernization pilot have been reviewed.`;

export function sampleState() {
  const s = newState();
  s.profile = {
    ...s.profile,
    projectName: "ClaimPath Online",
    dept: "Department of Example Services",
    sponsor: "Assistant Deputy Minister, Service Delivery",
    description: "Applicants for the Example Benefit wait an average of 14 weeks for a decision and 30% of paper applications are returned as incomplete. The project will deliver an online application and case management service so that most applicants get a decision within four weeks.",
    projectType: "digital",
    cost: "25-50",
    opmca: "2",
    limit: "10",
    pcra: "estimate",
    newFunding: "yes",
    horizontal: "no",
    programme: "no",
    procurement: "existing",
    delivery: "agile",
    personalInfo: "yes",
    automatedDecision: "yes",
    security: "pb",
    emergingTech: "no",
    publicFacing: "yes",
    nextGate: "G3",
    model: "auto",
  };
  s.pcraAnswers = { duration: 2, partners: 0, visibility: 2, alignment: 1, contracts: 1, skills: 1, change: 2, service: 2, experience: 1, dependencies: 1, requirements: 1, technology: 2 };
  s.review.text = SAMPLE_TEXT;
  const a = (q, extra = {}) => ({ q, override: "", applicability: "", notes: "", owner: "", plan: "", target: "", statement: "", compensating: "", ...extra });
  s.answers = {
    "GOV-1": a(["yes", "yes", "yes"], { notes: "Designated in the deputy minister's decision record of 2026-02-10." }),
    "GOV-2": a(["yes", "yes", "partial"], { plan: "Start a decision log", owner: "Project manager", target: "2026-11-30" }),
    "INV-1": a(["yes", "yes", "yes"]),
    "INV-2": a(["yes", "yes"]),
    "INV-3": a(["yes", "yes", "partial"], { notes: "Three options compared; GC enterprise case management not assessed.", plan: "Add reuse assessment of the enterprise case management platform", owner: "Enterprise architect", target: "2026-12-15" }),
    "INV-4": a(["partial", "no"], { notes: "Business case in draft.", plan: "Present to investment committee", owner: "Sponsor", target: "2027-03-31" }),
    "INV-5": a(["yes", "partial", "unknown"], { plan: "Confirm funding profile with CFO after Budget", owner: "CFO office", target: "2027-04-30" }),
    "INV-6": a(["yes", "yes", "no"], { plan: "Request CFO costing challenge review", owner: "Finance lead", target: "2027-01-31" }),
    "CAP-1": a(["no", "no", "no"], { notes: "Indicative estimate in this tool only.", plan: "Complete the official PCRA with the PMO", owner: "Project manager", target: "2026-11-15" }),
    "CAP-3": a(["partial", "unknown"]),
    "APP-1": a(["partial", "no", "unknown"], { plan: "Book briefing with TBS program sector", owner: "Director, Planning", target: "2026-11-30" }),
    "APP-4": a(["no", "no"], { plan: "Book GC EARB concept presentation", owner: "Enterprise architect", target: "2027-01-15" }),
    "BEN-1": a(["yes", "yes"]),
    "RSK-1": a(["yes", "yes", "unknown"]),
    "DIG-3": a(["no", "no"], { compensating: "A person makes every final eligibility decision during the pilot." }),
  };
  return s;
}
