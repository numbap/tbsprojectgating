// Scoping interview. Each answer shapes the governance profile (complexity and
// risk, approval authority, oversight, gating model) and which requirements
// apply. The "why" text is shown to the user so they understand what the
// question changes.

import { L, t } from "../i18n.js";
import { GATES } from "./gates.js";

const yes = { en: "Yes", fr: "Oui" };
const no = { en: "No", fr: "Non" };

// Estimated total project cost bands, in millions of dollars (taxes included).
// Boundaries line up with the base project approval limit ($2.5M) and the
// GC EARB thresholds so comparisons are unambiguous.
export const COST_BANDS = [
  { value: "lt1", min: 0, max: 1, label: { en: "Under $1M", fr: "Moins de 1 M$" } },
  { value: "1-2.5", min: 1, max: 2.5, label: { en: "$1M to $2.5M", fr: "De 1 M$ à 2,5 M$" } },
  { value: "2.5-5", min: 2.5, max: 5, label: { en: "$2.5M to $5M", fr: "De 2,5 M$ à 5 M$" } },
  { value: "5-10", min: 5, max: 10, label: { en: "$5M to $10M", fr: "De 5 M$ à 10 M$" } },
  { value: "10-25", min: 10, max: 25, label: { en: "$10M to $25M", fr: "De 10 M$ à 25 M$" } },
  { value: "25-50", min: 25, max: 50, label: { en: "$25M to $50M", fr: "De 25 M$ à 50 M$" } },
  { value: "50-100", min: 50, max: 100, label: { en: "$50M to $100M", fr: "De 50 M$ à 100 M$" } },
  { value: "100-1000", min: 100, max: 1000, label: { en: "$100M to $1B", fr: "De 100 M$ à 1 G$" } },
  { value: "gt1000", min: 1000, max: Infinity, label: { en: "Over $1B", fr: "Plus de 1 G$" } },
];
export const COST_MAP = Object.fromEntries(COST_BANDS.map((b) => [b.value, b]));

export const PROFILE_FIELDS = [
  { id: "projectName", type: "text",
    label: { en: "Project name", fr: "Nom du projet" },
    placeholder: { en: "e.g. Benefits Delivery Modernization, Phase 2", fr: "p. ex. Modernisation du versement des prestations, phase 2" },
    why: { en: "Used throughout the report and the draft gate statements.", fr: "Utilisé dans tout le rapport et dans les ébauches d'énoncés pour les points de contrôle." } },
  { id: "dept", type: "text",
    label: { en: "Department or agency", fr: "Ministère ou organisme" },
    placeholder: { en: "e.g. Department of Example Services", fr: "p. ex. Ministère des Services exemplaires" },
    why: { en: "The organization accountable for the project under the Directive on the Management of Projects and Programmes.", fr: "L'organisation responsable du projet en vertu de la Directive sur la gestion des projets et programmes." } },
  { id: "sponsor", type: "text",
    label: { en: "Project sponsor (title)", fr: "Promoteur du projet (titre)" },
    placeholder: { en: "e.g. Assistant Deputy Minister, Service Delivery", fr: "p. ex. Sous-ministre adjoint, Prestation des services" },
    why: { en: "The directive makes the sponsor accountable from planning to close-out. Every gate decision traces back to this person.", fr: "La directive rend le promoteur responsable de la planification à la clôture. Chaque décision aux points de contrôle remonte à cette personne." } },
  { id: "description", type: "textarea",
    label: { en: "What problem does the project solve?", fr: "Quel problème le projet résout-il?" },
    placeholder: { en: "The business need, who benefits and the outcomes sought...", fr: "Le besoin opérationnel, les bénéficiaires et les résultats recherchés..." },
    why: { en: "Gate 1 asks what is to be done and why. A one-paragraph problem statement is the first thing a gatekeeper reads.", fr: "Le point de contrôle 1 demande ce qui doit être fait et pourquoi. Un énoncé du problème d'un paragraphe est la première chose que lit un responsable de point de contrôle." } },

  { id: "projectType", type: "choice", default: "digital",
    label: { en: "What kind of project is it?", fr: "De quel type de projet s'agit-il?" },
    why: { en: "Digital projects bring in the Policy on Service and Digital (architecture review, security authorization, accessibility). Real property projects bring in real property authorities.", fr: "Les projets numériques font intervenir la Politique sur les services et le numérique (examen de l'architecture, autorisation de sécurité, accessibilité). Les projets de biens immobiliers font intervenir les pouvoirs relatifs aux biens immobiliers." },
    options: [
      { value: "digital", label: { en: "Digital or IT-enabled", fr: "Numérique ou habilité par la TI" } },
      { value: "realproperty", label: { en: "Real property or infrastructure", fr: "Biens immobiliers ou infrastructure" } },
      { value: "business", label: { en: "Business or program transformation (little IT)", fr: "Transformation opérationnelle ou de programme (peu de TI)" } },
      { value: "mixed", label: { en: "Mixed (digital and real property)", fr: "Mixte (numérique et biens immobiliers)" } },
    ] },
  { id: "cost", type: "choice", default: "5-10",
    label: { en: "Estimated total project cost (taxes included)", fr: "Coût total estimatif du projet (taxes comprises)" },
    why: { en: "Without an approved capacity class, projects over $2.5M need Treasury Board approval. Cost also sets whether a PCRA is required, whether a digital project needs a concept case and GC EARB review, and whether baseline information goes to the Office of the Comptroller General ($25M or more).", fr: "Sans catégorie de capacité approuvée, les projets de plus de 2,5 M$ doivent être approuvés par le Conseil du Trésor. Le coût détermine aussi si une ECRP est requise, si un projet numérique exige un cas conceptuel et un examen par le CEAI du GC, et si des données de référence doivent être transmises au Bureau du contrôleur général (25 M$ ou plus)." },
    options: COST_BANDS.map(({ value, label }) => ({ value, label })) },
  { id: "opmca", type: "choice", default: "unknown",
    label: { en: "Your department's approved Organizational Project Management Capacity class (OPMCA)", fr: "Catégorie approuvée de capacité organisationnelle de gestion de projets de votre ministère (ECOGP)" },
    why: { en: "The Treasury Board-approved class sets the minister's project approval authority (Directive on the Management of Projects and Programmes, Appendix C). With class 1 or higher, the department approves projects whose PCRA level does not exceed its class, whatever their cost. Ask your project management office; the class is resubmitted at least every three years.", fr: "La catégorie approuvée par le Conseil du Trésor détermine le pouvoir d'approbation des projets du ministre (Directive sur la gestion des projets et programmes, annexe C). Avec une catégorie 1 ou plus, le ministère approuve les projets dont le niveau d'ECRP ne dépasse pas sa catégorie, quel que soit leur coût. Renseignez-vous auprès de votre bureau de gestion de projet; la catégorie est soumise de nouveau au moins tous les trois ans." },
    options: [
      { value: "none", label: { en: "No approved class", fr: "Aucune catégorie approuvée" } },
      { value: "0", label: { en: "Class 0", fr: "Catégorie 0" } },
      { value: "1", label: { en: "Class 1: Sustaining", fr: "Catégorie 1 : Maintien" } },
      { value: "2", label: { en: "Class 2: Tactical", fr: "Catégorie 2 : Tactique" } },
      { value: "3", label: { en: "Class 3: Evolutionary", fr: "Catégorie 3 : Évolution" } },
      { value: "4", label: { en: "Class 4: Transformational", fr: "Catégorie 4 : Transformation" } },
      { value: "unknown", label: { en: "Don't know", fr: "Je ne sais pas" } },
    ] },
  { id: "pcra", type: "choice", default: "estimate",
    label: { en: "Project Complexity and Risk Assessment (PCRA) level", fr: "Niveau de l'évaluation de la complexité et des risques du projet (ECRP)" },
    why: { en: "If an official PCRA has been completed, use its level. Otherwise answer the indicative questions below for an estimate; the official TBS tool is still required.", fr: "Si une ECRP officielle a été réalisée, utilisez son niveau. Sinon, répondez aux questions indicatives ci-dessous pour obtenir une estimation; l'outil officiel du SCT demeure obligatoire." },
    options: [
      { value: "estimate", label: { en: "Not done yet: estimate it below", fr: "Pas encore réalisée : l'estimer ci-dessous" } },
      { value: "1", label: { en: "Level 1: Sustaining", fr: "Niveau 1 : Maintien" } },
      { value: "2", label: { en: "Level 2: Tactical", fr: "Niveau 2 : Tactique" } },
      { value: "3", label: { en: "Level 3: Evolutionary", fr: "Niveau 3 : Évolution" } },
      { value: "4", label: { en: "Level 4: Transformational", fr: "Niveau 4 : Transformation" } },
    ] },
  { id: "newFunding", type: "yesno", default: "no",
    label: { en: "Does the project need new funding or new authorities (not just existing reference levels)?", fr: "Le projet a-t-il besoin de nouveaux fonds ou de nouvelles autorisations (au-delà des niveaux de référence existants)?" },
    why: { en: "New funding usually means a Budget or Memorandum to Cabinet process followed by a Treasury Board submission, even when the project itself is within departmental approval authority.", fr: "De nouveaux fonds signifient habituellement un processus budgétaire ou un mémoire au Cabinet suivi d'une présentation au Conseil du Trésor, même lorsque le projet relève du pouvoir d'approbation ministériel." } },
  { id: "horizontal", type: "yesno", default: "no",
    label: { en: "Is it horizontal (several departments, agencies or jurisdictions)?", fr: "Est-il horizontal (plusieurs ministères, organismes ou administrations)?" },
    why: { en: "Horizontal projects are transformational by nature in the PCRA guidance, and their governance must work across organizations.", fr: "Selon le guide de l'ECRP, les projets horizontaux sont transformationnels par nature, et leur gouvernance doit fonctionner entre organisations." } },
  { id: "programme", type: "yesno", default: "no",
    label: { en: "Is it part of a programme (a group of related projects managed together)?", fr: "Fait-il partie d'un programme (un groupe de projets connexes gérés ensemble)?" },
    why: { en: "The directive also covers programmes: outcomes, interdependencies and governance are managed at programme level.", fr: "La directive vise aussi les programmes : les résultats, les interdépendances et la gouvernance sont gérés à l'échelle du programme." } },
  { id: "procurement", type: "choice", default: "competitive",
    label: { en: "How much procurement is involved?", fr: "Quelle est la part de l'approvisionnement?" },
    why: { en: "Requests for project approval must include market analysis and a procurement strategy. Large or complex contracts may need their own approvals.", fr: "Les demandes d'approbation de projet doivent comprendre une analyse du marché et une stratégie d'approvisionnement. Les contrats importants ou complexes peuvent exiger leurs propres approbations." },
    options: [
      { value: "none", label: { en: "None: delivered in-house", fr: "Aucune : réalisé à l'interne" } },
      { value: "existing", label: { en: "Call-ups on existing vehicles (standing offers, supply arrangements)", fr: "Commandes subséquentes à des instruments existants (offres à commandes, arrangements en matière d'approvisionnement)" } },
      { value: "competitive", label: { en: "New competitive procurement", fr: "Nouvel approvisionnement concurrentiel" } },
      { value: "complex", label: { en: "Major or complex procurement (beyond contracting limits)", fr: "Approvisionnement majeur ou complexe (au-delà des limites contractuelles)" } },
    ] },
  { id: "delivery", type: "choice", default: "hybrid",
    label: { en: "Delivery approach", fr: "Approche de réalisation" },
    why: { en: "Gates still apply to agile delivery, but the evidence changes: working software, release plans and outcome measures instead of complete up-front specifications.", fr: "Les points de contrôle s'appliquent aussi à la réalisation agile, mais les éléments probants changent : logiciel fonctionnel, plans de versions et mesures des résultats plutôt que des spécifications complètes dès le départ." },
    options: [
      { value: "waterfall", label: { en: "Sequential (waterfall)", fr: "Séquentielle (en cascade)" } },
      { value: "agile", label: { en: "Agile or iterative", fr: "Agile ou itérative" } },
      { value: "hybrid", label: { en: "Hybrid", fr: "Hybride" } },
      { value: "cots", label: { en: "Configure a commercial product or SaaS", fr: "Configuration d'un produit commercial ou d'un logiciel-service" } },
    ] },
  { id: "personalInfo", type: "yesno", default: "yes",
    label: { en: "Will it create or substantially change a program or activity that uses personal information?", fr: "Créera-t-il ou modifiera-t-il considérablement un programme ou une activité qui utilise des renseignements personnels?" },
    why: { en: "If so, a privacy impact assessment is required under the Directive on Privacy Impact Assessment.", fr: "Si c'est le cas, une évaluation des facteurs relatifs à la vie privée est requise en vertu de la Directive sur l'évaluation des facteurs relatifs à la vie privée." } },
  { id: "automatedDecision", type: "yesno", default: "no",
    label: { en: "Will a system make or recommend administrative decisions about people or businesses?", fr: "Un système prendra-t-il ou recommandera-t-il des décisions administratives concernant des personnes ou des entreprises?" },
    why: { en: "Automated decision systems need an Algorithmic Impact Assessment under the Directive on Automated Decision-Making.", fr: "Les systèmes décisionnels automatisés nécessitent une évaluation de l'incidence algorithmique en vertu de la Directive sur la prise de décisions automatisée." } },
  { id: "security", type: "choice", default: "pb",
    label: { en: "Most sensitive information the solution will handle", fr: "Renseignements les plus sensibles que traitera la solution" },
    why: { en: "Sets the depth of the security assessment and authorization needed before go-live, and the security requirements in contracts.", fr: "Détermine la profondeur de l'évaluation de la sécurité et de l'autorisation requises avant la mise en service, ainsi que les exigences de sécurité des contrats." },
    options: [
      { value: "unclassified", label: { en: "Unclassified", fr: "Non classifié" } },
      { value: "pa", label: { en: "Protected A", fr: "Protégé A" } },
      { value: "pb", label: { en: "Protected B", fr: "Protégé B" } },
      { value: "higher", label: { en: "Protected C or classified", fr: "Protégé C ou classifié" } },
    ] },
  { id: "emergingTech", type: "yesno", default: "no",
    label: { en: "Does it use emerging technology (for example AI), need an exception to digital policy, host Protected B or lower information outside public cloud, or extend support for an unsupported technology?", fr: "Utilise-t-il une technologie émergente (p. ex. IA), nécessite-t-il une exception à la politique numérique, héberge-t-il de l'information Protégé B ou moins ailleurs que dans le nuage public, ou prolonge-t-il le soutien d'une technologie non soutenue?" },
    why: { en: "Any of these sends a digital initiative to the GC Enterprise Architecture Review Board regardless of cost (Directive on Service and Digital, 4.3.2).", fr: "Chacun de ces éléments entraîne l'examen d'une initiative numérique par le Conseil d'examen de l'architecture intégrée du GC, quel que soit le coût (Directive sur les services et le numérique, 4.3.2)." } },
  { id: "publicFacing", type: "yesno", default: "yes",
    label: { en: "Will it deliver a service to the public?", fr: "Offrira-t-il un service au public?" },
    why: { en: "Public services bring official languages, accessibility, service standards and client feedback requirements into scope.", fr: "Les services au public font intervenir les exigences en matière de langues officielles, d'accessibilité, de normes de service et de rétroaction de la clientèle." } },
  { id: "nextGate", type: "choice", default: "G3",
    label: { en: "Which gate are you preparing for next?", fr: "Pour quel point de contrôle vous préparez-vous?" },
    why: { en: "The questionnaire and report focus on this gate and on anything still open from earlier gates.", fr: "Le questionnaire et le rapport portent sur ce point de contrôle et sur tout ce qui reste ouvert des points de contrôle antérieurs." },
    options: GATES.map((g) => ({ value: g.id, label: { en: `Gate ${g.n}: ${g.name.en}`, fr: `Point de contrôle ${g.n} : ${g.name.fr}` } })) },
  { id: "model", type: "choice", default: "auto",
    label: { en: "Gating model", fr: "Modèle de points de contrôle" },
    why: { en: "Scale the number of gates to the project. \"Recommended\" picks one from the complexity and risk level; your department's framework may prescribe its own.", fr: "Adaptez le nombre de points de contrôle au projet. « Recommandé » en choisit un selon le niveau de complexité et de risque; le cadre de votre ministère peut prescrire le sien." },
    options: [
      { value: "auto", label: { en: "Recommended for this project", fr: "Recommandé pour ce projet" } },
      { value: "full", label: { en: "Full (seven gates)", fr: "Complet (sept)" } },
      { value: "streamlined", label: { en: "Streamlined (five gates)", fr: "Simplifié (cinq)" } },
      { value: "light", label: { en: "Light (three gates)", fr: "Allégé (trois)" } },
    ] },
];

export const PROFILE_DEFAULTS = Object.fromEntries(PROFILE_FIELDS.map((f) => [f.id, f.default ?? ""]));

export const FIELD_MAP = Object.fromEntries(PROFILE_FIELDS.map((f) => [f.id, f]));

export function profileLabel(profile, field) {
  const value = profile[field];
  const def = FIELD_MAP[field];
  if (!def) return value;
  if (def.type === "yesno") return value === "yes" ? L(yes) : value === "no" ? L(no) : "";
  if (def.options) return L(def.options.find((o) => o.value === value)?.label) || value;
  return value;
}

// ------------------------------------------------------------------ indicative PCRA

// A short, indicative version of the Project Complexity and Risk Assessment. The
// official TBS tool has 64 questions in seven categories; these questions sample
// the same categories so a team can anticipate its level early. Each answer is
// worth 0 (low), 1 (medium) or 2 (high).
export const PCRA_CATEGORIES = [
  { id: "char", name: { en: "Project characteristics", fr: "Caractéristiques du projet" } },
  { id: "strategic", name: { en: "Strategic management", fr: "Gestion stratégique" } },
  { id: "procurement", name: { en: "Procurement", fr: "Approvisionnement" } },
  { id: "hr", name: { en: "Human resources", fr: "Ressources humaines" } },
  { id: "business", name: { en: "Business", fr: "Activités" } },
  { id: "pm", name: { en: "Project management integration", fr: "Intégration de la gestion de projet" } },
  { id: "requirements", name: { en: "Requirements and technology", fr: "Exigences et technologie" } },
];

const lmh = (low, med, high) => [
  { value: 0, label: low }, { value: 1, label: med }, { value: 2, label: high },
];

export const PCRA_QUESTIONS = [
  { id: "duration", cat: "char", label: { en: "Duration to deliver", fr: "Durée de réalisation" },
    options: lmh({ en: "Under 1 year", fr: "Moins d'un an" }, { en: "1 to 3 years", fr: "De 1 à 3 ans" }, { en: "More than 3 years", fr: "Plus de 3 ans" }) },
  { id: "partners", cat: "char", label: { en: "Organizations involved in delivery", fr: "Organisations participant à la réalisation" },
    options: lmh({ en: "One branch", fr: "Une direction générale" }, { en: "Several branches or one partner department", fr: "Plusieurs directions générales ou un ministère partenaire" }, { en: "Several departments or jurisdictions", fr: "Plusieurs ministères ou administrations" }) },
  { id: "visibility", cat: "strategic", label: { en: "Public and political visibility", fr: "Visibilité publique et politique" },
    options: lmh({ en: "Internal only", fr: "Interne seulement" }, { en: "Some public interest", fr: "Un certain intérêt public" }, { en: "Ministerial or government priority", fr: "Priorité ministérielle ou gouvernementale" }) },
  { id: "alignment", cat: "strategic", label: { en: "Stability of objectives and sponsorship", fr: "Stabilité des objectifs et du parrainage" },
    options: lmh({ en: "Clear and stable", fr: "Clairs et stables" }, { en: "Some open questions", fr: "Quelques questions en suspens" }, { en: "Contested or changing", fr: "Contestés ou changeants" }) },
  { id: "contracts", cat: "procurement", label: { en: "Contracting complexity", fr: "Complexité contractuelle" },
    options: lmh({ en: "None or existing vehicles", fr: "Aucune ou instruments existants" }, { en: "One new competitive contract", fr: "Un nouveau contrat concurrentiel" }, { en: "Several contracts or a novel arrangement", fr: "Plusieurs contrats ou un arrangement inédit" }) },
  { id: "skills", cat: "hr", label: { en: "Availability of skilled people", fr: "Disponibilité de personnes compétentes" },
    options: lmh({ en: "Team in place", fr: "Équipe en place" }, { en: "Some key gaps", fr: "Quelques lacunes importantes" }, { en: "Most skills to be found", fr: "La plupart des compétences à trouver" }) },
  { id: "change", cat: "business", label: { en: "Change to how people work", fr: "Changement dans la façon de travailler" },
    options: lmh({ en: "Minor", fr: "Mineur" }, { en: "Significant for some groups", fr: "Important pour certains groupes" }, { en: "Fundamental, organization-wide", fr: "Fondamental, à l'échelle de l'organisation" }) },
  { id: "service", cat: "business", label: { en: "Impact on services to Canadians if it fails", fr: "Incidence sur les services aux Canadiens en cas d'échec" },
    options: lmh({ en: "Little", fr: "Faible" }, { en: "Noticeable disruption", fr: "Perturbation notable" }, { en: "Critical service at risk", fr: "Service essentiel menacé" }) },
  { id: "experience", cat: "pm", label: { en: "Department's experience with projects like this", fr: "Expérience du ministère avec ce genre de projet" },
    options: lmh({ en: "Done several", fr: "En a réalisé plusieurs" }, { en: "Done one, or partly similar", fr: "En a réalisé un, ou partiellement semblable" }, { en: "Never done", fr: "Jamais réalisé" }) },
  { id: "dependencies", cat: "pm", label: { en: "Dependencies on other projects or systems", fr: "Dépendances envers d'autres projets ou systèmes" },
    options: lmh({ en: "Few", fr: "Peu" }, { en: "Several, manageable", fr: "Plusieurs, gérables" }, { en: "Many, or on unfinished work", fr: "Nombreuses, ou envers des travaux inachevés" }) },
  { id: "requirements", cat: "requirements", label: { en: "Clarity of requirements", fr: "Clarté des exigences" },
    options: lmh({ en: "Well understood", fr: "Bien comprises" }, { en: "Partly defined", fr: "Partiellement définies" }, { en: "Largely unknown", fr: "Largement inconnues" }) },
  { id: "technology", cat: "requirements", label: { en: "Technology novelty and integration", fr: "Nouveauté technologique et intégration" },
    options: lmh({ en: "Proven, standalone", fr: "Éprouvée, autonome" }, { en: "Proven, some integration", fr: "Éprouvée, une certaine intégration" }, { en: "New to the GC or heavy integration with legacy", fr: "Nouvelle au GC ou forte intégration avec des systèmes patrimoniaux" }) },
];

export const PCRA_LEVELS = {
  1: { en: "Sustaining", fr: "Maintien" },
  2: { en: "Tactical", fr: "Tactique" },
  3: { en: "Evolutionary", fr: "Évolution" },
  4: { en: "Transformational", fr: "Transformation" },
};

export const PCRA_LEVEL_HELP = {
  1: { en: "Low risk, affecting a specific service or program.", fr: "Faible risque, touchant un service ou un programme précis." },
  2: { en: "Spans several services and may involve significant procurement.", fr: "Touche plusieurs services et peut comporter un approvisionnement important." },
  3: { en: "Introduces change, may span programs or affect one or two other departments.", fr: "Introduit du changement, peut toucher plusieurs programmes ou un ou deux autres ministères." },
  4: { en: "Dramatic organizational impact; horizontal projects are transformational by nature.", fr: "Incidence organisationnelle considérable; les projets horizontaux sont transformationnels par nature." },
};

// Score bands of the official tool, applied to a percentage of the maximum.
export function pcraEstimate(answers = {}, profile = {}) {
  const answered = PCRA_QUESTIONS.filter((q) => answers[q.id] !== undefined && answers[q.id] !== "");
  if (answered.length < Math.ceil(PCRA_QUESTIONS.length / 2)) return { level: null, score: null, answered: answered.length };
  const points = answered.reduce((s, q) => s + Number(answers[q.id]), 0);
  const score = Math.round((points / (answered.length * 2)) * 100);
  let level = score >= 83 ? 4 : score >= 64 ? 3 : score >= 45 ? 2 : 1;
  const floors = [];
  if (profile.horizontal === "yes" && level < 4) { level = 4; floors.push("horizontal"); }
  return { level, score, answered: answered.length, floors };
}

// ------------------------------------------------------------------ warnings

export function profileWarnings(profile, gov) {
  const w = [];
  if (profile.opmca === "unknown") w.push(t("warn.opmcaUnknown"));
  if (profile.pcra === "estimate") w.push(t("warn.pcraEstimate"));
  if (gov?.pcraFloor) w.push(t("warn.horizontal"));
  if (gov && gov.pcra && gov.opmcaClass >= 1 && gov.pcra > gov.opmcaClass) w.push(t("warn.pcraExceeds", { pcra: gov.pcra, opmca: gov.opmcaClass }));
  if (profile.security === "higher") w.push(t("warn.classified"));
  if (profile.delivery === "agile") w.push(t("warn.agile"));
  if (profile.cost === "gt1000") w.push(t("warn.mega"));
  return w;
}
