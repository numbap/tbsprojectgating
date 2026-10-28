// Content for the SA&A Wizard: the wizard steps, the checklist items in each step,
// security categorization scales, control families, GC Cloud Guardrails and a
// starter threat catalogue. Paraphrased from Treasury Board and Canadian Centre
// for Cyber Security (CCCS) publications; see SOURCES. Departmental SA&A
// procedures take precedence over this content.

// ---------------------------------------------------------------- profile choices

export const DEPLOYMENTS = [
  ["onprem", "On premises (departmental or SSC data centre)"],
  ["iaas", "Public cloud IaaS (GC tenancy)"],
  ["paas", "Public cloud PaaS (GC tenancy)"],
  ["saas", "Software as a service (vendor-hosted)"],
  ["hybrid", "Hybrid (on premises and cloud)"],
];

export const SOURCING = [
  ["custom", "Custom-built (in-house or contracted)"],
  ["cots", "Commercial product (COTS), configured"],
  ["cotsmod", "Commercial product, customized or extended"],
  ["oss", "Open-source product, configured"],
];

export const USERS = [
  ["internal", "Public servants only"],
  ["partners", "Public servants and partners (other governments, contractors)"],
  ["public", "Members of the public"],
];

export const YES_NO = [["yes", "Yes"], ["no", "No"], ["unknown", "Don't know yet"]];

// Highest sensitivity of the information processed, stored or transmitted.
// Protected: injury outside the national interest. Classified: injury to the national interest.
export const CONFIDENTIALITY = [
  { id: "unclassified", label: "Unclassified", rank: 0, injury: "No injury expected from disclosure." },
  { id: "pa", label: "Protected A", rank: 1, injury: "Disclosure could cause injury to an individual, organization or government (e.g. disclosure of an exact salary, a home address)." },
  { id: "pb", label: "Protected B", rank: 2, injury: "Disclosure could cause serious injury (e.g. loss of reputation or competitive position, medical or criminal records, information that could enable identity theft, solicitor-client privilege)." },
  { id: "pc", label: "Protected C", rank: 3, injury: "Disclosure could cause extremely grave injury, such as loss of life (e.g. identities of informants or protected witnesses)." },
  { id: "confidential", label: "Confidential", rank: 4, classified: true, injury: "Disclosure could cause injury to the national interest." },
  { id: "secret", label: "Secret", rank: 5, classified: true, injury: "Disclosure could cause serious injury to the national interest." },
  { id: "topsecret", label: "Top Secret", rank: 6, classified: true, injury: "Disclosure could cause exceptionally grave injury to the national interest." },
];

// Injury levels used for integrity and availability.
export const INJURY = [
  { id: "low", label: "Low", rank: 1, help: "Limited injury: minor inconvenience, small financial loss, a short delay in a non-critical service." },
  { id: "medium", label: "Medium", rank: 2, help: "Serious injury: significant financial loss, harm to reputation or privacy, prolonged disruption of a service people rely on." },
  { id: "high", label: "High", rank: 3, help: "Severe or extremely grave injury: loss of life, serious harm to health or safety, failure of a critical service, major damage to the economy." },
];

export const INTEGRITY_PROMPTS = [
  "If the information were altered or the system produced wrong results, what would happen? (wrong payments, wrong eligibility decisions, corrupted records)",
  "Would anyone rely on the output to make decisions about people, money, health or safety?",
  "Could altered data go undetected long enough to cause harm?",
];

export const AVAILABILITY_PROMPTS = [
  "If the system were unavailable for an hour, a day, a week, what would happen?",
  "Is it part of a critical service (Directive on Service and Digital) or does a critical service depend on it?",
  "Is there a manual workaround, and for how long can it be sustained?",
];

export const CONFIDENTIALITY_PROMPTS = [
  "What is the most sensitive information the system holds? Consider every data store, log, backup, attachment and free-text field.",
  "Would combining many records (aggregation) make the set more sensitive than any single record?",
  "Does the system hold personal information, solicitor-client advice, Cabinet confidences, security or law-enforcement information?",
];

export const ROLES = [
  ["businessOwner", "Business owner", "Accountable for the program the system supports and for accepting its residual risk on the program's behalf."],
  ["ao", "Authorizing official (AO)", "Signs the authorization to operate. Who can authorize is set by the department (often the business owner at Director General level or above, on the advice of the CSO or DSO and the CIO)."],
  ["dso", "Chief Security Officer / Departmental Security Officer", "Sets departmental security requirements, advises the AO, and manages the departmental security plan (Policy on Government Security)."],
  ["ciso", "Chief Information Security Officer / IT security lead", "Leads IT security for the department and usually signs the security recommendation to the AO."],
  ["assessor", "Security assessor", "Plans and conducts the security assessment and writes the Security Assessment Report. Should be independent of the delivery team."],
  ["practitioner", "Project security practitioner", "Works with the delivery team on requirements, design, evidence and remediation."],
  ["privacy", "ATIP / privacy officer", "Leads the Privacy Impact Assessment when personal information is involved."],
  ["pm", "Project manager / product owner", "Builds SA&A activities into the plan, schedule and budget."],
];

// ---------------------------------------------------------------- tiers

// How much rigour the SA&A needs. Departments define their own tiers; these three
// are a planning aid so effort matches risk.
export const TIERS = {
  light: { label: "Light", summary: "Low-sensitivity system with limited exposure. A streamlined SA&A: short categorization, TRA focused on the main threats, self-attested controls with key evidence, and a short assessment report.", reauthYears: 3 },
  standard: { label: "Standard", summary: "Typical Protected B system. Full SA&A package: SoS, TRA, SRTM against the selected profile, independent assessment with vulnerability scanning, residual risk and POA&M.", reauthYears: 2 },
  enhanced: { label: "Enhanced", summary: "High-injury, highly exposed or critical system. Everything in Standard plus a security concept of operations, independent assessor, penetration testing, and closer continuous monitoring.", reauthYears: 1 },
};

// ---------------------------------------------------------------- steps

export const STEPS = [
  {
    id: "context", n: 1, title: "Context and roles",
    why: "SA&A goes wrong most often because nobody knows who owns the risk or who can sign. Settle the system description and the people first.",
    produces: ["System description", "Roles and responsibilities"],
  },
  {
    id: "categorize", n: 2, title: "Security categorization",
    why: "The injury test sets the security category (for example Protected B / Medium integrity / Medium availability), which selects the control profile and drives everything else. Over-categorizing wastes effort; under-categorizing leaves real risk unmanaged.",
    produces: ["Statement of Sensitivity (security categorization)", "PIA (if personal information)"],
  },
  {
    id: "plan", n: 3, title: "Plan and scope",
    why: "Agree what is being authorized (the boundary), which controls apply (the tailored profile) and what the SA&A will deliver, when and by whom. Align it with the project's gates.",
    produces: ["Authorization boundary", "Tailored control profile", "SA&A plan"],
  },
  {
    id: "tra", n: 4, title: "Threat and risk assessment",
    why: "The TRA identifies what could go wrong, how likely it is and how bad it would be, and proposes treatments. It justifies the controls you select and the residual risk the AO will accept.",
    produces: ["Threat and risk assessment (TRA) report", "Risk register"],
  },
  {
    id: "controls", n: 5, title: "Controls and requirements",
    why: "Turn the profile and TRA into security requirements, design them in, and trace each one to where it is implemented and how it will be verified.",
    produces: ["Security design", "Security Requirements Traceability Matrix (SRTM)"],
  },
  {
    id: "assess", n: 6, title: "Security assessment",
    why: "Verify that the controls are implemented and effective: collect evidence, scan, test and record findings. The assessment report is the factual basis for the authorization decision.",
    produces: ["Security assessment plan", "Security Assessment Report (SAR)", "Findings register"],
  },
  {
    id: "authorize", n: 7, title: "Authorization",
    why: "Assemble the package, state the residual risk plainly, and get an informed decision from the authorizing official: authorize, authorize with conditions, authorize for a limited time, or not authorize.",
    produces: ["Residual risk assessment", "Plan of Action and Milestones (POA&M)", "Authorization decision"],
  },
  {
    id: "monitor", n: 8, title: "Continuous monitoring",
    why: "Authorization is not the end. Keep the security posture current, track the POA&M to closure, assess changes and know when to reauthorize.",
    produces: ["Continuous monitoring plan", "Reauthorization schedule"],
  },
];

export const STEP_MAP = Object.fromEntries(STEPS.map((s) => [s.id, s]));

// Item status values in the checklist.
export const ITEM_STATUS = [
  { id: "done", label: "Done", score: 1 },
  { id: "progress", label: "In progress", score: 0.5 },
  { id: "todo", label: "Not started", score: 0 },
  { id: "na", label: "N/A", score: null },
];

// ---------------------------------------------------------------- checklist items
//
// level(ctx) returns "required", "recommended" or "na" for the system; ctx is built
// by engine.context(): { tier, cloud, saas, tenancy, pi, adm, internet, public,
// custom, cots, interconnect, critical, confRank, classified, high }.
// artifact: true marks an item that produces a document for the package.

const always = () => "required";
const fromTier = (min) => (c) => (rank(c.tier) >= rank(min) ? "required" : "recommended");
const only = (cond, lvl = always) => (c) => (cond(c) ? lvl(c) : "na");
function rank(tier) { return { light: 1, standard: 2, enhanced: 3 }[tier] ?? 2; }

export const ITEMS = [
  // 1. Context
  { id: "ctx-desc", step: "context", level: always, artifact: true,
    title: "System description written",
    help: "One or two pages: business purpose, the program and service it supports, users and how they connect, information handled, main components, hosting, external connections and who operates it.",
    evidence: "A dated system description that the business owner and the delivery team agree on." },
  { id: "ctx-owner", step: "context", level: always,
    title: "Business owner identified and accepts accountability for the system's risk",
    help: "Risk belongs to the program, not to IT security. The business owner decides what level of risk the program can tolerate and funds the controls.",
    evidence: "Named business owner in the project charter or SA&A plan." },
  { id: "ctx-ao", step: "context", level: always,
    title: "Authorizing official (AO) confirmed",
    help: "Check your departmental SA&A procedure or delegation instrument for who may authorize systems at this category. Ask early: an AO who first hears about the system at authorization time will (rightly) ask for more.",
    evidence: "Name and position of the AO, with the departmental rule that gives them the authority." },
  { id: "ctx-security", step: "context", level: always,
    title: "IT security practitioner and assessor assigned",
    help: "Engage the departmental IT security team (CISO's office) as soon as the project starts. Ask how they run SA&A, what templates they use and their lead times.",
    evidence: "Named contacts and agreed engagement, ideally in the project schedule." },
  { id: "ctx-dso", step: "context", level: fromTier("standard"),
    title: "CSO / DSO office engaged",
    help: "The Chief Security Officer (Departmental Security Officer) sets departmental security requirements and may need to be consulted on categorization, physical and personnel security, and authorization.",
    evidence: "Record of consultation (email, meeting notes)." },
  { id: "ctx-privacy", step: "context", level: only((c) => c.pi !== "no"),
    title: "ATIP / privacy office engaged",
    help: "Personal information triggers the Directive on Privacy Impact Assessment. Run the PIA in parallel with SA&A; they share much of the same analysis.",
    evidence: "Privacy office contact and PIA (or PIA checklist) started." },
  { id: "ctx-gating", step: "context", level: fromTier("standard"),
    title: "SA&A built into the project plan, budget and gates",
    help: "Assessments, remediation and penetration tests take time and money. Plan for them, and align SA&A deliverables with project gates (for example categorization before the business case, authorization before go-live).",
    evidence: "SA&A activities and costs in the project schedule and budget." },

  // 2. Categorization
  { id: "cat-assets", step: "categorize", level: always,
    title: "Information assets and business processes listed",
    help: "List the information types (records, attachments, logs, reports, backups) and the business processes the system supports. Categorization applies to these, not to the technology.",
    evidence: "Asset inventory table with owner and sensitivity for each information type." },
  { id: "cat-injury", step: "categorize", level: always,
    title: "Injury tests completed for confidentiality, integrity and availability",
    help: "For each asset, ask what injury would result if it were disclosed, altered or unavailable, and how severe it would be. Record the reasoning, not just the level.",
    evidence: "Injury test worksheet with justification for each rating (use the categorization panel above)." },
  { id: "cat-agg", step: "categorize", level: fromTier("standard"),
    title: "Aggregation and data in logs, backups and test environments considered",
    help: "A large collection of Protected A records can warrant Protected B. Logs and analytics copies often hold the same information as production. Test environments must not hold real Protected data without the same controls.",
    evidence: "Note on aggregation in the SoS; test data approach documented." },
  { id: "cat-sos", step: "categorize", level: always, artifact: true,
    title: "Statement of Sensitivity (security categorization) approved by the business owner",
    help: "Records the security category (confidentiality level, integrity and availability injury) and the reasoning. For cloud services, follow ITSP.50.103 (Guidance on the security categorization of cloud-based services).",
    evidence: "Signed or approved SoS document." },
  { id: "cat-critical", step: "categorize", level: only((c) => c.critical !== "no", fromTier("standard")),
    title: "Critical service and continuity dependencies identified",
    help: "If the system supports a critical service, availability and continuity requirements rise, and business continuity planning must cover it.",
    evidence: "Business impact analysis or continuity plan reference." },
  { id: "cat-pia", step: "categorize", level: only((c) => c.pi !== "no"),
    title: "Privacy Impact Assessment (PIA) initiated",
    help: "Required before personal information is used in a new or substantially modified program or activity (Directive on Privacy Impact Assessment).",
    evidence: "PIA draft or core PIA questionnaire, and the personal information bank." },
  { id: "cat-aia", step: "categorize", level: only((c) => c.adm === "yes"),
    title: "Algorithmic Impact Assessment (AIA) completed",
    help: "Automated systems that make or support administrative decisions about clients fall under the Directive on Automated Decision-Making.",
    evidence: "AIA result and impact level." },

  // 3. Plan
  { id: "plan-boundary", step: "plan", level: always, artifact: true,
    title: "Authorization boundary defined",
    help: "What is in scope: components, environments (production, DR, staging), interfaces and administrative access paths. What is inherited: departmental services (identity, network, logging), SSC services, the cloud provider's controls.",
    evidence: "Boundary diagram with interfaces and inherited services labelled." },
  { id: "plan-profile", step: "plan", level: always, artifact: true,
    title: "Security control profile selected and tailored",
    help: "Start from the profile that matches the category (see the categorization summary) and tailor: remove controls that do not apply with a reason, add controls the TRA calls for, and mark inherited controls.",
    evidence: "Tailored control list with rationale for each removal or addition." },
  { id: "plan-saa", step: "plan", level: fromTier("standard"), artifact: true,
    title: "SA&A plan agreed",
    help: "Scope, approach (tier), activities, deliverables, schedule, roles, assessor, tools and assumptions. Agree it with IT security and the AO's office so there are no surprises at the end.",
    evidence: "SA&A plan endorsed by IT security and the business owner." },
  { id: "plan-conops", step: "plan", level: fromTier("enhanced"), artifact: true,
    title: "Security concept of operations",
    help: "How the system will be operated securely: who administers it, from where, how incidents are handled, how changes are made, and what the business does when it is down.",
    evidence: "Security CONOPS document." },
  { id: "plan-csp", step: "plan", level: only((c) => c.cloud),
    title: "Cloud service provider assessment status confirmed",
    help: "Check whether the provider and the specific services you will use were assessed by CCCS (ITSM.50.100 process) against the CCCS Medium Cloud Control Profile, and whether they are available through an SSC or PSPC arrangement. Use the CCCS assessment summary to identify inherited controls and customer responsibilities.",
    evidence: "CCCS assessment summary or confirmation of status; list of in-scope services." },
  { id: "plan-residency", step: "plan", level: only((c) => c.cloud && c.confRank >= 2),
    title: "Data residency evaluated",
    help: "The Directive on Service and Digital requires computing facilities in Canada to be considered and evaluated as the principal delivery option for information categorized Protected B, Protected C or classified.",
    evidence: "Region selection and the evaluation, with any exception approved as your department requires." },
  { id: "plan-sci", step: "plan", level: only((c) => c.cots || c.saas, fromTier("standard")),
    title: "Supply chain integrity considered",
    help: "Ask your IT security team whether a supply chain integrity (SCI) review is needed for the vendor or product. It is often required for network equipment and cloud or managed services procured through SSC or PSPC.",
    evidence: "SCI request or result, or a recorded decision that it is not needed." },
  { id: "plan-interconnect", step: "plan", level: only((c) => c.interconnect !== "no"),
    title: "Interconnections and information-sharing agreements identified",
    help: "Every connection to another system or organization needs an agreement covering the information exchanged, its security category and each party's responsibilities.",
    evidence: "List of interconnections with agreement status (MOU, ISA)." },

  // 4. TRA
  { id: "tra-method", step: "tra", level: always,
    title: "TRA method chosen",
    help: "Use your department's method, or the Harmonized TRA Methodology (RCMP and CSE). Size it to the tier: a light TRA can be a facilitated workshop and a risk table.",
    evidence: "Method named in the SA&A plan." },
  { id: "tra-threats", step: "tra", level: always,
    title: "Threat agents and threat events identified",
    help: "Consider deliberate threats (criminals, state actors, insiders, hacktivists), accidents (administrator error, misconfiguration) and hazards (outages, natural events). The CCCS National Cyber Threat Assessment gives the current picture.",
    evidence: "Threat list in the risk register below." },
  { id: "tra-vulns", step: "tra", level: always,
    title: "Vulnerabilities and existing safeguards identified",
    help: "For each threat, note the weaknesses it could exploit and the safeguards already in place (including inherited ones).",
    evidence: "Vulnerability and safeguard columns completed in the risk register." },
  { id: "tra-rated", step: "tra", level: always,
    title: "Risks rated and treatments proposed",
    help: "Rate likelihood and impact, decide a treatment (mitigate, transfer, avoid, accept) and estimate residual risk after the proposed controls.",
    evidence: "Risk register with every risk rated and a treatment for each." },
  { id: "tra-report", step: "tra", level: fromTier("standard"), artifact: true,
    title: "TRA report reviewed with the business owner",
    help: "The business owner should understand the main risks now: it is far cheaper to change the design than to accept a high risk at authorization.",
    evidence: "TRA report with business owner review recorded." },
  { id: "tra-privacy", step: "tra", level: only((c) => c.pi !== "no"),
    title: "Privacy risks cross-referenced with the PIA",
    help: "Keep the TRA and PIA consistent: the same data flows, the same safeguards, no contradictions.",
    evidence: "Cross-reference table or PIA section citing the TRA." },

  // 5. Controls
  { id: "ctl-common", step: "controls", level: always,
    title: "Inherited and shared controls identified",
    help: "Mark which controls come from the department (identity, perimeter, logging), SSC, or the cloud provider, and which are shared. Get evidence that inherited controls exist; do not assume.",
    evidence: "Control families table below with inherited items marked, and the source of each." },
  { id: "ctl-design", step: "controls", level: always, artifact: true,
    title: "Security design documented",
    help: "Architecture with trust boundaries and data flows, network zones, identity and access design, encryption points, logging, administration paths and backup.",
    evidence: "Security design section or document, reviewed by IT security." },
  { id: "ctl-srtm", step: "controls", level: fromTier("standard"), artifact: true,
    title: "Security Requirements Traceability Matrix (SRTM)",
    help: "For each control in the tailored profile: the requirement, where and how it is implemented, who is responsible (system, inherited, shared), and how it will be verified. The assessor uses it as the test plan backbone.",
    evidence: "SRTM spreadsheet covering every control in the tailored profile." },
  { id: "ctl-auth", step: "controls", level: always,
    title: "Authentication and access control designed",
    help: "Multi-factor authentication for privileged, remote and (where the category warrants it) all users; least privilege; separate admin accounts; follow ITSP.30.031 (user authentication guidance). Use departmental or GC identity services where possible.",
    evidence: "Identity and access design; role matrix." },
  { id: "ctl-crypto", step: "controls", level: always,
    title: "Cryptography uses CCCS-approved algorithms and protocols",
    help: "Encryption in transit and at rest for Protected data, using algorithms in ITSP.40.111 and protocol configurations in ITSP.40.062 (for example TLS 1.2 or 1.3 with approved cipher suites). Manage keys deliberately.",
    evidence: "TLS configuration, encryption settings, key management description." },
  { id: "ctl-zones", step: "controls", level: only((c) => !c.saas, fromTier("standard")),
    title: "Network security zoning applied",
    help: "Separate public-facing, operations and restricted zones and control traffic between them (ITSG-22, ITSG-38). In cloud, use the equivalent virtual network segmentation.",
    evidence: "Network diagram with zones and permitted flows." },
  { id: "ctl-guardrails", step: "controls", level: only((c) => c.tenancy),
    title: "GC Cloud Guardrails validated for the cloud tenancy",
    help: "The guardrails are the minimum configuration for GC cloud tenancies and are usually validated by the department's cloud team within 30 days of tenancy creation. Confirm they are in place for the account or subscription that hosts the system (see the guardrails list below).",
    evidence: "Guardrails validation result for the tenancy." },
  { id: "ctl-hardening", step: "controls", level: only((c) => !c.saas),
    title: "Hardening baselines applied",
    help: "Apply departmental, CIS or vendor hardening baselines to operating systems, databases, containers, web servers and cloud services. Remove defaults and unused services.",
    evidence: "Baselines chosen and compliance scan results." },
  { id: "ctl-logging", step: "controls", level: fromTier("standard"),
    title: "Security logging and monitoring designed",
    help: "Log authentication, privileged actions, access to Protected data and security events; protect the logs; send them to departmental monitoring (SIEM) so incidents can be detected and handled under the GC Cyber Security Event Management Plan.",
    evidence: "Logging design with event list, retention and integration with departmental monitoring." },
  { id: "ctl-sdlc", step: "controls", level: only((c) => c.custom),
    title: "Secure development practices in place",
    help: "Threat modelling for major features, peer code review, static analysis (SAST), dependency and container scanning, secrets scanning, and dynamic testing (DAST) in the pipeline. Security requirements in the backlog with acceptance criteria.",
    evidence: "Pipeline configuration and recent scan results." },
  { id: "ctl-saasconfig", step: "controls", level: only((c) => c.saas),
    title: "SaaS configuration responsibilities understood",
    help: "In SaaS, most controls are the vendor's, but tenant configuration is yours: identity federation and MFA, roles, sharing settings, data retention, audit logging and export. Review the customer responsibility matrix.",
    evidence: "Customer responsibility matrix and tenant configuration review." },

  // 6. Assessment
  { id: "as-plan", step: "assess", level: fromTier("standard"), artifact: true,
    title: "Security assessment plan",
    help: "Which controls will be assessed, how (examine, interview, test), by whom, against which environment, and what tools. Agree rules of engagement for scanning and testing.",
    evidence: "Assessment plan and rules of engagement approved." },
  { id: "as-controls", step: "assess", level: always,
    title: "Controls assessed against the SRTM with evidence",
    help: "For each control: is it implemented as described, and is it effective? Collect evidence (screenshots, configurations, reports, interviews). Record each gap as a finding.",
    evidence: "Completed SRTM with assessment result and evidence reference for each control." },
  { id: "as-va", step: "assess", level: only((c) => !c.saas),
    title: "Vulnerability assessment completed",
    help: "Authenticated vulnerability scans of hosts, containers and web applications in the production-equivalent environment. Retest after remediation.",
    evidence: "Scan reports, before and after remediation." },
  { id: "as-pentest", step: "assess", level: (c) => (c.saas ? "na" : c.tier === "enhanced" || (c.internet && c.tier === "standard") ? "required" : "recommended"),
    title: "Penetration test",
    help: "Testing by qualified testers of the internet-facing and high-value parts of the system, against agreed rules of engagement. Required for internet-facing systems at Standard tier and for all Enhanced-tier systems in this tool's model; follow your departmental rule.",
    evidence: "Penetration test report and retest results." },
  { id: "as-code", step: "assess", level: only((c) => c.custom, fromTier("standard")),
    title: "Application security testing",
    help: "Review SAST and dependency scan results, run DAST against the deployed application, and test the OWASP Top 10 categories that apply.",
    evidence: "Application security test reports." },
  { id: "as-vendor", step: "assess", level: only((c) => c.saas || c.cots || c.cloud),
    title: "Vendor and provider assurance evidence obtained",
    help: "CCCS assessment summary for cloud services; otherwise independent reports such as SOC 2 Type II, ISO/IEC 27001 certificate and statement of applicability, or CSA STAR. Check the scope and date of each report.",
    evidence: "Assurance reports on file with their scope and validity dates." },
  { id: "as-independent", step: "assess", level: fromTier("enhanced"),
    title: "Assessor independent of the delivery team",
    help: "The assessor should not assess work they built. For Enhanced-tier systems use the departmental assessment team or a third party.",
    evidence: "Assessor named and independence noted in the SAR." },
  { id: "as-sar", step: "assess", level: always, artifact: true,
    title: "Security Assessment Report (SAR)",
    help: "Scope, method, results for each control, findings with severity and recommendations, and an overall statement of the security posture.",
    evidence: "SAR issued by the assessor." },

  // 7. Authorization
  { id: "au-residual", step: "authorize", level: always, artifact: true,
    title: "Residual risk assessment",
    help: "Plain statement of the risk that remains after controls and remediation: what could happen, how likely, how bad, and why it is (or is not) acceptable. Write it for the AO, not for security specialists.",
    evidence: "Residual risk section built from the risk register and open findings." },
  { id: "au-poam", step: "authorize", level: always, artifact: true,
    title: "Plan of Action and Milestones (POA&M)",
    help: "Every open finding and unmitigated risk with its action, owner, milestone dates and interim measures. The report section of this tool drafts it from your registers.",
    evidence: "POA&M with owners and dates." },
  { id: "au-package", step: "authorize", level: always,
    title: "Authorization package assembled",
    help: "Typically: system description, Statement of Sensitivity, TRA, tailored profile and SRTM, Security Assessment Report, residual risk assessment, POA&M, PIA status, and the draft decision. Use your department's package template.",
    evidence: "Complete package (see the package checklist above)." },
  { id: "au-recommend", step: "authorize", level: always,
    title: "Security recommendation to the AO",
    help: "IT security (usually the CISO or delegate) recommends a decision and any conditions, based on the assessment.",
    evidence: "Signed recommendation." },
  { id: "au-brief", step: "authorize", level: fromTier("standard"),
    title: "AO briefed on residual risk and conditions",
    help: "A short briefing: what the system does, its category, the main residual risks, open findings and the POA&M, and the recommendation. Give the AO room to ask for changes.",
    evidence: "Briefing deck or note." },
  { id: "au-privacy", step: "authorize", level: only((c) => c.pi !== "no"),
    title: "PIA completed and provided to the Office of the Privacy Commissioner and TBS as required",
    help: "Do not start using personal information until the PIA requirements are met.",
    evidence: "Approved PIA and submission record." },
  { id: "au-decision", step: "authorize", level: always, artifact: true,
    title: "Authorization decision signed",
    help: "The AO's decision with its date, any conditions, and when it expires or must be reviewed. Record it in the authorization panel above.",
    evidence: "Signed authorization letter or decision record." },

  // 8. Continuous monitoring
  { id: "mo-plan", step: "monitor", level: always, artifact: true,
    title: "Continuous monitoring plan",
    help: "Which controls and indicators are monitored, how often, by whom, and how results reach the business owner and AO. Include recurring scans, access reviews and log review.",
    evidence: "Continuous monitoring plan with frequencies and owners." },
  { id: "mo-patch", step: "monitor", level: always,
    title: "Patch and vulnerability management meets departmental timelines",
    help: "Critical vulnerabilities, especially those known to be exploited, need to be fixed fast. Follow your departmental patch timelines and CCCS alerts.",
    evidence: "Patch compliance reports." },
  { id: "mo-change", step: "monitor", level: always,
    title: "Changes go through security impact analysis",
    help: "Each significant change is assessed for its effect on security. Some changes trigger reassessment or reauthorization (see the triggers below).",
    evidence: "Change management procedure with a security impact step; recent examples." },
  { id: "mo-incident", step: "monitor", level: always,
    title: "Incident response ready",
    help: "The system is covered by the departmental incident response plan; contacts are known; logs reach the security operations team; cyber incidents are reported as required by the GC Cyber Security Event Management Plan and to CCCS.",
    evidence: "Incident response procedure and contact list; a tabletop exercise for Enhanced tier." },
  { id: "mo-access", step: "monitor", level: fromTier("standard"),
    title: "Periodic access reviews",
    help: "Review user and especially privileged accounts regularly and remove access that is no longer needed.",
    evidence: "Access review records." },
  { id: "mo-poam", step: "monitor", level: always,
    title: "POA&M tracked to closure and conditions reported to the AO",
    help: "Review the POA&M on a fixed schedule; escalate missed dates; report progress on authorization conditions to the AO.",
    evidence: "Updated POA&M with closure evidence." },
  { id: "mo-continuity", step: "monitor", level: (c) => (c.high || c.critical === "yes" ? "required" : rank(c.tier) >= 2 ? "recommended" : "na"),
    title: "Backup, recovery and continuity tested",
    help: "Restore from backup and fail over at least once a year; confirm recovery time and point objectives match the availability category.",
    evidence: "Test records with actual recovery times." },
  { id: "mo-reauth", step: "monitor", level: always,
    title: "Reauthorization date and triggers agreed",
    help: "Set a date to revisit the authorization and the events that will trigger it earlier (see below).",
    evidence: "Date and triggers recorded in the authorization decision." },
  { id: "mo-dispose", step: "monitor", level: fromTier("standard"),
    title: "Disposal planned",
    help: "When the system is retired: information is kept or transferred according to its retention schedule, and media are sanitized as set out in ITSP.40.006 (IT media sanitization).",
    evidence: "Decommissioning section in the operations plan." },
];

export const ITEM_MAP = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

// ---------------------------------------------------------------- controls

// ITSG-33 Annex 3A security control families, with controls that are commonly
// the focus of an assessment. Identifiers follow ITSG-33 (aligned with NIST SP 800-53).
export const CONTROL_FAMILIES = [
  { id: "AC", name: "Access control", class: "Technical", key: ["AC-2 Account management", "AC-3 Access enforcement", "AC-6 Least privilege", "AC-17 Remote access"] },
  { id: "AT", name: "Awareness and training", class: "Operational", key: ["AT-2 Security awareness", "AT-3 Role-based security training"] },
  { id: "AU", name: "Audit and accountability", class: "Technical", key: ["AU-2 Auditable events", "AU-6 Audit review, analysis and reporting", "AU-9 Protection of audit information"] },
  { id: "CA", name: "Security assessment and authorization", class: "Management", key: ["CA-2 Security assessments", "CA-5 Plan of action and milestones", "CA-6 Security authorization", "CA-7 Continuous monitoring"] },
  { id: "CM", name: "Configuration management", class: "Operational", key: ["CM-2 Baseline configuration", "CM-4 Security impact analysis", "CM-6 Configuration settings", "CM-8 Component inventory"] },
  { id: "CP", name: "Contingency planning", class: "Operational", key: ["CP-2 Contingency plan", "CP-4 Contingency plan testing", "CP-9 Information system backup", "CP-10 Recovery and reconstitution"] },
  { id: "IA", name: "Identification and authentication", class: "Technical", key: ["IA-2 User identification and authentication (MFA)", "IA-5 Authenticator management"] },
  { id: "IR", name: "Incident response", class: "Operational", key: ["IR-4 Incident handling", "IR-6 Incident reporting", "IR-8 Incident response plan"] },
  { id: "MA", name: "Maintenance", class: "Operational", key: ["MA-2 Controlled maintenance", "MA-4 Non-local maintenance"] },
  { id: "MP", name: "Media protection", class: "Operational", key: ["MP-4 Media storage", "MP-6 Media sanitization"] },
  { id: "PE", name: "Physical and environmental protection", class: "Operational", key: ["PE-2 Physical access authorizations", "PE-3 Physical access control"] },
  { id: "PL", name: "Planning", class: "Management", key: ["PL-2 System security plan", "PL-4 Rules of behaviour"] },
  { id: "PS", name: "Personnel security", class: "Operational", key: ["PS-3 Personnel screening", "PS-4 Personnel termination"] },
  { id: "RA", name: "Risk assessment", class: "Management", key: ["RA-2 Security categorization", "RA-3 Risk assessment", "RA-5 Vulnerability scanning"] },
  { id: "SA", name: "System and services acquisition", class: "Management", key: ["SA-4 Acquisition process", "SA-9 External information system services", "SA-11 Developer security testing"] },
  { id: "SC", name: "System and communications protection", class: "Technical", key: ["SC-7 Boundary protection", "SC-8 Transmission confidentiality and integrity", "SC-12 Cryptographic key management", "SC-13 Cryptographic protection", "SC-28 Protection of information at rest"] },
  { id: "SI", name: "System and information integrity", class: "Operational", key: ["SI-2 Flaw remediation", "SI-3 Malicious code protection", "SI-4 Information system monitoring"] },
];

export const CONTROL_STATUS = [
  { id: "implemented", label: "Implemented", score: 1 },
  { id: "inherited", label: "Inherited", score: 1 },
  { id: "partial", label: "Partial", score: 0.5 },
  { id: "planned", label: "Planned", score: 0.25 },
  { id: "notstarted", label: "Not started", score: 0 },
  { id: "na", label: "N/A", score: null },
];

// GC Cloud Guardrails (current list on canada.ca; previous version on github.com/canada-ca/cloud-guardrails).
export const GUARDRAILS = [
  { n: 1, name: "Protect user accounts and identities", hint: "MFA on privileged and global administrator accounts; break-glass accounts controlled and monitored." },
  { n: 2, name: "Manage access", hint: "Least privilege, role-based access, periodic access review, guest and external user policies." },
  { n: 3, name: "Secure endpoints", hint: "Cloud console and administration only from managed, compliant devices and approved locations." },
  { n: 4, name: "Enterprise monitoring accounts", hint: "Accounts or roles for departmental and GC monitoring (e.g. CCCS) are created with appropriate permissions." },
  { n: 5, name: "Data location", hint: "Protected B and above stored in Canadian regions unless an exception is approved." },
  { n: 6, name: "Protection of data-at-rest", hint: "Encryption at rest using CCCS-approved algorithms; key management defined." },
  { n: 7, name: "Protection of data-in-transit", hint: "TLS with approved configurations for all external and internal flows of Protected data." },
  { n: 8, name: "Segment and separate", hint: "Network segmentation and separation of environments (production, development) aligned with zoning." },
  { n: 9, name: "Network security services", hint: "Perimeter and network security controls (firewalls, WAF, controlled ingress and egress)." },
  { n: 10, name: "Cyber defense services", hint: "Departmental agreement with CCCS for cyber defence services (e.g. cloud-based sensors)." },
  { n: 11, name: "Logging and monitoring", hint: "Logging enabled for the tenancy and sent to departmental monitoring; retention set." },
  { n: 12, name: "Configuration of cloud marketplaces", hint: "Marketplace restricted to approved products." },
  { n: 13, name: "Plan for continuity", hint: "Continuity of administrative access and of the workload (break-glass procedures, backups)." },
];

// ---------------------------------------------------------------- risk and findings

export const LIKELIHOOD = [
  [1, "Rare"], [2, "Unlikely"], [3, "Possible"], [4, "Likely"], [5, "Almost certain"],
];
export const IMPACT = [
  [1, "Negligible"], [2, "Minor"], [3, "Moderate"], [4, "Major"], [5, "Severe"],
];
export const TREATMENTS = [
  ["mitigate", "Mitigate (add controls)"],
  ["accept", "Accept"],
  ["transfer", "Transfer (e.g. to a provider through contract terms)"],
  ["avoid", "Avoid (change the design or scope)"],
];

// Starter threat catalogue for the TRA: quick-add rows the user then adjusts.
export const THREATS = [
  { id: "phish", threat: "Credential theft through phishing or password spraying", asset: "User and administrator accounts", vuln: "Password-only sign-in, no MFA, weak conditional access", l: 4, i: 4, controls: "MFA for all users, phishing-resistant MFA for admins, conditional access, sign-in monitoring (IA-2, AC-7, SI-4)" },
  { id: "ransom", threat: "Ransomware or destructive malware", asset: "Servers, databases and backups", vuln: "Unpatched systems, backups reachable from production", l: 3, i: 5, controls: "Patching, immutable or offline backups, restore testing, EDR, network segmentation (SI-2, SI-3, CP-9)" },
  { id: "webapp", threat: "Attack on the web application (injection, broken access control)", asset: "Application and its data", vuln: "Coding flaws, missing authorization checks", l: 3, i: 4, controls: "Secure coding, SAST/DAST, WAF, penetration test, authorization tests (SA-11, SC-7)" },
  { id: "misconfig", threat: "Cloud or service misconfiguration exposes data", asset: "Storage, databases, admin consoles", vuln: "Public storage, permissive network rules, default settings", l: 3, i: 4, controls: "Guardrails, infrastructure as code with review, configuration scanning, least privilege (CM-2, CM-6, AC-6)" },
  { id: "insider", threat: "Misuse of access by an insider", asset: "Protected information", vuln: "Broad access, weak logging of data access", l: 2, i: 4, controls: "Least privilege, access reviews, logging of access to Protected data, screening (AC-6, AU-2, PS-3)" },
  { id: "admin", threat: "Compromise of a privileged or administrator account", asset: "Whole system", vuln: "Shared admin accounts, admin from unmanaged devices", l: 3, i: 5, controls: "Separate admin accounts, PAM, MFA, admin from managed devices only (AC-2, AC-6, IA-2)" },
  { id: "supply", threat: "Compromised software dependency or vendor update", asset: "Application and infrastructure", vuln: "Unvetted dependencies, no SBOM, automatic updates without checks", l: 2, i: 4, controls: "Dependency scanning, SBOM, signed artifacts, vendor assurance, SCI review (SA-12, SA-11)" },
  { id: "vuln", threat: "Exploitation of a known, unpatched vulnerability", asset: "Internet-facing components", vuln: "Slow patch cycle", l: 4, i: 4, controls: "Patch timelines, vulnerability scanning, CCCS alerts subscription (SI-2, RA-5)" },
  { id: "ddos", threat: "Denial of service", asset: "Public-facing service", vuln: "No DDoS protection or rate limiting", l: 2, i: 3, controls: "DDoS protection, rate limiting, autoscaling, CDN (SC-5)" },
  { id: "outage", threat: "Provider or data centre outage", asset: "Service availability", vuln: "Single region or single site, untested recovery", l: 2, i: 3, controls: "Multi-zone deployment, DR plan, recovery testing (CP-2, CP-4, CP-10)" },
  { id: "interconnect", threat: "Compromise through a connected partner system", asset: "Interfaces and shared data", vuln: "Trusted connections without validation or monitoring", l: 2, i: 4, controls: "Interconnection agreements, mutual authentication, input validation, monitoring (CA-3, SC-7)" },
  { id: "error", threat: "Administrator or user error deletes or corrupts data", asset: "Records and configurations", vuln: "No change control, no versioning", l: 3, i: 3, controls: "Change management, versioning and soft delete, backups (CM-3, CP-9)" },
  { id: "leak", threat: "Data leakage through exports, sharing or logs", asset: "Protected information", vuln: "Unrestricted exports and external sharing, sensitive data in logs", l: 3, i: 3, controls: "Restrict sharing, DLP where available, log hygiene, data minimization (AC-21, AU-9)" },
];

export const FINDING_SOURCES = [
  ["control", "Control assessment"],
  ["va", "Vulnerability scan"],
  ["pentest", "Penetration test"],
  ["appsec", "Application security testing"],
  ["config", "Configuration review"],
  ["vendor", "Vendor / provider assurance"],
  ["other", "Other"],
];

export const SEVERITIES = [
  { id: "critical", label: "Critical", rank: 4 },
  { id: "high", label: "High", rank: 3 },
  { id: "medium", label: "Medium", rank: 2 },
  { id: "low", label: "Low", rank: 1 },
];

export const FINDING_STATUS = [
  ["open", "Open"],
  ["poam", "Open, in POA&M"],
  ["remediated", "Remediated and verified"],
  ["accepted", "Risk accepted by AO"],
];

// ---------------------------------------------------------------- authorization

export const DECISIONS = [
  { id: "ato", label: "Authorize to operate", help: "Residual risk is acceptable; no conditions beyond normal continuous monitoring." },
  { id: "conditional", label: "Authorize with conditions", help: "Residual risk is acceptable provided the POA&M items and stated conditions are completed by their dates." },
  { id: "interim", label: "Interim authorization (time-limited)", help: "Operation is allowed for a limited period while significant gaps are closed. Reassessed before it expires." },
  { id: "deny", label: "Do not authorize", help: "Residual risk is not acceptable. The system does not go into (or stays out of) production." },
];

export const REAUTH_TRIGGERS = [
  "Change in the security category (more sensitive information, higher integrity or availability needs)",
  "Significant change in architecture, hosting, provider or region",
  "New interconnection or new class of users (for example opening the service to the public)",
  "Major new functionality that processes information differently",
  "Serious security incident or a newly discovered critical vulnerability without a timely fix",
  "Expiry of an interim authorization or of a condition's deadline",
  "Change of authorizing official or business owner (confirm the risk acceptance)",
  "The reauthorization date is reached",
];

// The documents that make up a typical authorization package, with the checklist
// item that produces each.
export const PACKAGE = [
  ["System description", "ctx-desc"],
  ["Statement of Sensitivity", "cat-sos"],
  ["Privacy Impact Assessment", "cat-pia"],
  ["Algorithmic Impact Assessment", "cat-aia"],
  ["Authorization boundary", "plan-boundary"],
  ["Tailored control profile", "plan-profile"],
  ["SA&A plan", "plan-saa"],
  ["Threat and risk assessment", "tra-report"],
  ["Security design", "ctl-design"],
  ["SRTM", "ctl-srtm"],
  ["Security assessment plan", "as-plan"],
  ["Security Assessment Report", "as-sar"],
  ["Residual risk assessment", "au-residual"],
  ["POA&M", "au-poam"],
  ["Security recommendation", "au-recommend"],
];

// ---------------------------------------------------------------- sources

export const SOURCES = [
  "Policy on Government Security and Directive on Security Management, including Appendix B: Mandatory Procedures for Information Technology Security Control (Treasury Board)",
  "Policy on Service and Digital and Directive on Service and Digital (Treasury Board)",
  "ITSG-33 IT Security Risk Management: A Lifecycle Approach, with Annex 1 (departmental activities), Annex 2 (information system activities), Annex 3A (security control catalogue) and Annex 4A (security control profiles) (CCCS)",
  "ITSP.50.103 Guidance on the security categorization of cloud-based services, and the CCCS Medium Cloud Control Profile (which replaced the GC PBMM cloud profile)",
  "ITSM.50.100 Cloud service provider information technology security assessment process (CCCS)",
  "GC Cloud Guardrails (Treasury Board of Canada Secretariat)",
  "Harmonized Threat and Risk Assessment Methodology (RCMP and CSE); CCCS National Cyber Threat Assessment",
  "ITSP.40.111 Cryptographic algorithms, ITSP.40.062 Guidance on securely configuring network protocols, ITSP.30.031 User authentication guidance, ITSG-22 and ITSG-38 Network security zoning, ITSP.40.006 IT media sanitization (CCCS)",
  "Government of Canada Cyber Security Event Management Plan (GC CSEMP)",
  "Directive on Privacy Impact Assessment; Directive on Automated Decision-Making (Treasury Board)",
];
