// The seven-gate model from the Treasury Board of Canada Secretariat's
// "A Guide to Project Gating for IT-Enabled Projects" (2010), with the
// streamlined and light gating models of the Independent Reviewer's Handbook.
// Wording is paraphrased guidance, not official text. Departments define their
// own gates under the Directive on the Management of Projects and Programmes
// (the senior designated official sets the gates, the evidence each requires
// and how gate decisions are documented), so check your departmental framework.

export const GATES = [
  {
    id: "G1", n: 1,
    name: { en: "Strategic assessment and concept", fr: "Évaluation stratégique et concept" },
    short: { en: "Concept", fr: "Concept" },
    stage: "identification",
    question: { en: "Is there a real need, and is it worth pursuing?", fr: "Le besoin est-il réel et vaut-il la peine d'être poursuivi?" },
    purpose: {
      en: "Confirms what is to be done and why: the business problem or opportunity, the outcomes sought, alignment with the department's mandate and investment plan, and the key stakeholders. No solution is chosen yet.",
      fr: "Confirme ce qui doit être fait et pourquoi : le problème ou la possibilité opérationnelle, les résultats recherchés, l'harmonisation avec le mandat et le plan d'investissement du ministère, et les principaux intervenants. Aucune solution n'est encore choisie.",
    },
    decision: {
      en: "Approve the concept and release resources to develop the project approach, or stop.",
      fr: "Approuver le concept et libérer les ressources nécessaires pour élaborer l'approche du projet, ou arrêter.",
    },
    gatekeepers: {
      en: ["Project sponsor (senior executive accountable)", "Departmental investment or project review committee", "Senior designated official for projects and programmes, or delegate"],
      fr: ["Promoteur du projet (cadre supérieur responsable)", "Comité ministériel d'examen des investissements ou des projets", "Cadre supérieur désigné pour les projets et programmes, ou son délégué"],
    },
    deliverables: {
      en: ["Concept or problem statement", "Initial outcomes and benefits hypothesis", "Stakeholder map", "Link to the departmental investment plan"],
      fr: ["Énoncé du concept ou du problème", "Hypothèse initiale des résultats et des avantages", "Carte des intervenants", "Lien avec le plan d'investissement ministériel"],
    },
    topics: ["business", "sponsorship", "concept"],
    pitfalls: {
      en: ["Starting from a solution (\"we need a new system\") instead of a problem.", "No named sponsor, so nobody can say no.", "Skipping the gate because \"the minister announced it\"; the gate still tests feasibility."],
      fr: ["Partir d'une solution (« il nous faut un nouveau système ») plutôt que d'un problème.", "Aucun promoteur désigné, donc personne ne peut dire non.", "Sauter le point de contrôle parce que « le ministre l'a annoncé »; le point de contrôle vérifie quand même la faisabilité."],
    },
  },
  {
    id: "G2", n: 2,
    name: { en: "Project approach", fr: "Approche du projet" },
    short: { en: "Approach", fr: "Approche" },
    stage: "planning",
    question: { en: "How will we achieve the outcomes, and what kind of project is this?", fr: "Comment atteindrons-nous les résultats, et de quel type de projet s'agit-il?" },
    purpose: {
      en: "Confirms how the objectives will be achieved: the options considered, the preferred delivery approach (build, buy, partner, configure), the high-level scope, a rough cost range, the initial complexity and risk assessment and the governance that will oversee the work.",
      fr: "Confirme comment les objectifs seront atteints : les options examinées, l'approche de réalisation privilégiée (développer, acheter, s'associer, configurer), la portée générale, une fourchette de coûts approximative, l'évaluation initiale de la complexité et des risques et la gouvernance qui encadrera les travaux.",
    },
    decision: {
      en: "Approve the approach and fund the business case, or send back for more options analysis.",
      fr: "Approuver l'approche et financer l'élaboration de l'analyse de rentabilisation, ou demander une analyse des options plus poussée.",
    },
    gatekeepers: {
      en: ["Project sponsor", "Departmental project review committee", "Chief information officer and departmental architecture review board (digital projects)"],
      fr: ["Promoteur du projet", "Comité ministériel d'examen des projets", "Dirigeant principal de l'information et conseil ministériel d'examen de l'architecture (projets numériques)"],
    },
    deliverables: {
      en: ["Options analysis", "Initial Project Complexity and Risk Assessment (PCRA)", "High-level scope and rough order of magnitude cost", "Governance structure", "Gating plan"],
      fr: ["Analyse des options", "Évaluation initiale de la complexité et des risques du projet (ECRP)", "Portée générale et coût approximatif", "Structure de gouvernance", "Plan des points de contrôle"],
    },
    topics: ["concept", "sponsorship", "risk", "technology"],
    pitfalls: {
      en: ["A single \"option\" with straw men around it.", "Under-scoring the PCRA to stay inside departmental authority.", "Choosing a delivery approach before talking to procurement and the CIO."],
      fr: ["Une seule « option » entourée d'options de façade.", "Sous-évaluer l'ECRP pour rester dans les limites du pouvoir ministériel.", "Choisir une approche de réalisation avant de consulter l'approvisionnement et le DPI."],
    },
  },
  {
    id: "G3", n: 3,
    name: { en: "Business case and general readiness", fr: "Analyse de rentabilisation et état de préparation général" },
    short: { en: "Business case", fr: "Analyse de rentabilisation" },
    stage: "planning",
    question: { en: "Is the investment justified, funded and is the organization ready to commit?", fr: "L'investissement est-il justifié et financé, et l'organisation est-elle prête à s'engager?" },
    purpose: {
      en: "Confirms the business case: the recommended option, its full life-cycle costs, benefits, risks and funding source, and that the organization is ready to start. For projects above departmental authority, this is typically when Treasury Board project approval is sought.",
      fr: "Confirme l'analyse de rentabilisation : l'option recommandée, ses coûts sur tout le cycle de vie, ses avantages, ses risques et sa source de financement, et que l'organisation est prête à commencer. Pour les projets qui dépassent le pouvoir ministériel, c'est généralement à ce moment qu'on demande l'approbation du projet au Conseil du Trésor.",
    },
    decision: {
      en: "Approve the business case and commit resources to plan and define the project (including any Treasury Board submission), or stop.",
      fr: "Approuver l'analyse de rentabilisation et engager les ressources pour planifier et définir le projet (y compris toute présentation au Conseil du Trésor), ou arrêter.",
    },
    gatekeepers: {
      en: ["Project sponsor", "Departmental senior management or investment committee", "Chief financial officer (costing, funding, attestation)", "Treasury Board, when the project exceeds departmental authority"],
      fr: ["Promoteur du projet", "Haute direction ou comité ministériel des investissements", "Dirigeant principal des finances (établissement des coûts, financement, attestation)", "Conseil du Trésor, lorsque le projet dépasse le pouvoir ministériel"],
    },
    deliverables: {
      en: ["Business case", "Updated PCRA", "Indicative cost estimate and funding strategy", "Benefits and outcomes", "Procurement strategy and market analysis", "Risk register", "Treasury Board submission (if required)"],
      fr: ["Analyse de rentabilisation", "ECRP mise à jour", "Estimation indicative des coûts et stratégie de financement", "Avantages et résultats", "Stratégie d'approvisionnement et analyse du marché", "Registre des risques", "Présentation au Conseil du Trésor (si requise)"],
    },
    topics: ["business", "readiness", "funding", "procurement", "risk"],
    pitfalls: {
      en: ["Benefits that cannot be measured or have no owner.", "Costing only the build, not ongoing operations.", "Funding \"to be identified\"."],
      fr: ["Des avantages non mesurables ou sans responsable.", "N'établir le coût que de la construction, pas de l'exploitation continue.", "Un financement « à déterminer »."],
    },
  },
  {
    id: "G4", n: 4,
    name: { en: "Project charter and project management plan", fr: "Charte de projet et plan de gestion de projet" },
    short: { en: "Charter", fr: "Charte" },
    stage: "definition",
    question: { en: "Is the project set up to succeed?", fr: "Le projet est-il structuré pour réussir?" },
    purpose: {
      en: "Confirms the project is properly organized: an approved charter, a project management plan, the team and its capacity, governance in operation, change control, reporting, the benefits realization plan and the organizational change approach.",
      fr: "Confirme que le projet est bien organisé : une charte approuvée, un plan de gestion de projet, l'équipe et sa capacité, une gouvernance en fonction, le contrôle des changements, les rapports, le plan de réalisation des avantages et l'approche de gestion du changement organisationnel.",
    },
    decision: {
      en: "Approve the charter and plan and proceed to detailed planning and specifications.",
      fr: "Approuver la charte et le plan et passer à la planification détaillée et aux spécifications.",
    },
    gatekeepers: {
      en: ["Project sponsor", "Project steering committee", "Departmental project management office"],
      fr: ["Promoteur du projet", "Comité directeur du projet", "Bureau ministériel de gestion de projet"],
    },
    deliverables: {
      en: ["Project charter", "Project management plan", "Resource plan", "Change control process", "Benefits realization plan", "Organizational change management plan", "Reporting plan"],
      fr: ["Charte de projet", "Plan de gestion de projet", "Plan des ressources", "Processus de contrôle des changements", "Plan de réalisation des avantages", "Plan de gestion du changement organisationnel", "Plan de production de rapports"],
    },
    topics: ["structure", "sponsorship", "human", "readiness"],
    pitfalls: {
      en: ["A charter copied from a template with no project-specific tolerances.", "A team that exists only on the org chart.", "Change management deferred to \"deployment\"."],
      fr: ["Une charte copiée d'un gabarit sans tolérances propres au projet.", "Une équipe qui n'existe que sur l'organigramme.", "La gestion du changement reportée au « déploiement »."],
    },
  },
  {
    id: "G5", n: 5,
    name: { en: "Detailed project plan and functional specifications", fr: "Plan de projet détaillé et spécifications fonctionnelles" },
    short: { en: "Detailed plan", fr: "Plan détaillé" },
    stage: "definition",
    question: { en: "Do we know enough to commit to build, at a cost and schedule we can hold?", fr: "En savons-nous assez pour nous engager à construire, à un coût et selon un calendrier que nous pouvons respecter?" },
    purpose: {
      en: "Confirms that requirements and specifications are complete enough to build, and that scope, schedule and cost are baselined with a substantive estimate. This is the last gate before major spending, contract award or construction, and typically where full expenditure authority is confirmed.",
      fr: "Confirme que les exigences et les spécifications sont assez complètes pour construire, et que la portée, le calendrier et les coûts sont établis en référence avec une estimation fondée. C'est le dernier point de contrôle avant les dépenses importantes, l'attribution du contrat ou la construction, et généralement le moment où le pouvoir de dépenser complet est confirmé.",
    },
    decision: {
      en: "Approve the baseline and authorize implementation spending and contract award, or re-plan.",
      fr: "Approuver les données de référence et autoriser les dépenses de mise en œuvre et l'attribution du contrat, ou refaire la planification.",
    },
    gatekeepers: {
      en: ["Project sponsor", "Departmental investment committee", "Chief financial officer", "Treasury Board, when expenditure authority must be confirmed"],
      fr: ["Promoteur du projet", "Comité ministériel des investissements", "Dirigeant principal des finances", "Conseil du Trésor, lorsque le pouvoir de dépenser doit être confirmé"],
    },
    deliverables: {
      en: ["Functional and non-functional requirements", "Baselined integrated schedule and work breakdown", "Substantive cost estimate with contingency", "Privacy, security and accessibility assessments under way or done", "Contract award readiness"],
      fr: ["Exigences fonctionnelles et non fonctionnelles", "Calendrier intégré et structure de répartition du travail de référence", "Estimation fondée des coûts avec provision pour éventualités", "Évaluations de la vie privée, de la sécurité et de l'accessibilité en cours ou terminées", "Préparation à l'attribution du contrat"],
    },
    topics: ["requirements", "technology", "funding", "procurement", "structure"],
    pitfalls: {
      en: ["Baselining a schedule the team does not believe.", "Contingency removed to make the number fit.", "Privacy and security assessments left until just before go-live."],
      fr: ["Établir un calendrier de référence auquel l'équipe ne croit pas.", "Supprimer la provision pour éventualités pour que le chiffre convienne.", "Laisser les évaluations de la vie privée et de la sécurité jusqu'à juste avant la mise en service."],
    },
  },
  {
    id: "G6", n: 6,
    name: { en: "Construction complete and deployment readiness", fr: "Construction terminée et état de préparation au déploiement" },
    short: { en: "Deployment", fr: "Déploiement" },
    stage: "implementation",
    question: { en: "Is the solution ready, and is the organization ready for it?", fr: "La solution est-elle prête, et l'organisation est-elle prête à l'accueillir?" },
    purpose: {
      en: "Confirms that the solution is built and tested, authorized to operate, and that the business, users and support organization are ready to take it on, with go-live criteria and a fallback plan.",
      fr: "Confirme que la solution est construite et mise à l'essai, qu'elle est autorisée à être exploitée, et que les secteurs d'activité, les utilisateurs et l'organisation de soutien sont prêts à la prendre en charge, avec des critères de mise en service et un plan de repli.",
    },
    decision: {
      en: "Authorize deployment (go-live), go live with conditions, or delay.",
      fr: "Autoriser le déploiement (mise en service), le faire sous conditions, ou le reporter.",
    },
    gatekeepers: {
      en: ["Project sponsor", "Business owner and service owner", "Authorizer (security assessment and authorization)", "Operations and support"],
      fr: ["Promoteur du projet", "Responsable opérationnel et responsable du service", "Autorité d'autorisation (évaluation de la sécurité et autorisation)", "Exploitation et soutien"],
    },
    deliverables: {
      en: ["Test results and acceptance", "Authority to operate", "Training and business readiness", "Transition to operations plan", "Go-live criteria and rollback plan"],
      fr: ["Résultats des essais et acceptation", "Autorisation d'exploitation", "Formation et préparation des secteurs d'activité", "Plan de transition vers l'exploitation", "Critères de mise en service et plan de retour arrière"],
    },
    topics: ["deployment", "readiness", "technology", "human"],
    pitfalls: {
      en: ["\"We'll fix it after go-live\" for defects that block users.", "No funded owner for the system once the project ends.", "Training delivered months before users see the system."],
      fr: ["« On corrigera après la mise en service » pour des défauts qui bloquent les utilisateurs.", "Aucun responsable financé pour le système une fois le projet terminé.", "Une formation donnée des mois avant que les utilisateurs voient le système."],
    },
  },
  {
    id: "G7", n: 7,
    name: { en: "Post-implementation review", fr: "Examen postérieur à la mise en œuvre" },
    short: { en: "Post-implementation", fr: "Après la mise en œuvre" },
    stage: "closeout",
    question: { en: "Did we get what we paid for, and what did we learn?", fr: "Avons-nous obtenu ce que nous avons payé, et qu'avons-nous appris?" },
    purpose: {
      en: "Confirms whether the project delivered the expected outcomes and benefits, records lessons learned, and formally closes the project, handing ongoing benefits tracking to the business owner.",
      fr: "Confirme si le projet a produit les résultats et les avantages attendus, consigne les leçons apprises et clôt officiellement le projet, en confiant le suivi continu des avantages au responsable opérationnel.",
    },
    decision: {
      en: "Close the project, and decide on follow-up actions for benefits not yet realized.",
      fr: "Clore le projet et décider des mesures de suivi pour les avantages non encore réalisés.",
    },
    gatekeepers: {
      en: ["Project sponsor", "Business owner", "Departmental project management office", "Senior designated official (portfolio lessons)"],
      fr: ["Promoteur du projet", "Responsable opérationnel", "Bureau ministériel de gestion de projet", "Cadre supérieur désigné (leçons à l'échelle du portefeuille)"],
    },
    deliverables: {
      en: ["Benefits realization assessment", "Lessons learned", "Project closeout report", "Financial and contract close"],
      fr: ["Évaluation de la réalisation des avantages", "Leçons apprises", "Rapport de clôture du projet", "Clôture financière et contractuelle"],
    },
    topics: ["business", "deployment"],
    pitfalls: {
      en: ["Closing the project the day after go-live, before any benefit can be measured.", "Lessons learned that are recorded but never read."],
      fr: ["Clore le projet le lendemain de la mise en service, avant qu'un avantage puisse être mesuré.", "Des leçons apprises consignées mais jamais lues."],
    },
  },
];

export const GATE_MAP = Object.fromEntries(GATES.map((g) => [g.id, g]));

// Gating models. Each model gate groups one or more of the seven reference gates.
export const MODELS = {
  full: {
    name: { en: "Full gating (seven gates)", fr: "Points de contrôle complets (sept)" },
    when: { en: "Very large, highly complex or high-risk projects.", fr: "Projets très importants, très complexes ou à risque élevé." },
    gates: GATES.map((g) => ({ id: g.id, name: g.name, includes: [g.id] })),
  },
  streamlined: {
    name: { en: "Streamlined gating (five gates)", fr: "Points de contrôle simplifiés (cinq)" },
    when: { en: "Projects of medium size, risk and complexity.", fr: "Projets de taille, de risque et de complexité moyens." },
    gates: [
      { id: "S1", name: { en: "Approach", fr: "Approche" }, includes: ["G1", "G2"] },
      { id: "S2", name: { en: "Business case", fr: "Analyse de rentabilisation" }, includes: ["G3"] },
      { id: "S3", name: { en: "Pre-construction", fr: "Préconstruction" }, includes: ["G4", "G5"] },
      { id: "S4", name: { en: "Pre-deployment", fr: "Prédéploiement" }, includes: ["G6"] },
      { id: "S5", name: { en: "Post-implementation", fr: "Après la mise en œuvre" }, includes: ["G7"] },
    ],
  },
  light: {
    name: { en: "Light gating (three gates)", fr: "Points de contrôle allégés (trois)" },
    when: { en: "Small, low-risk projects with little complexity.", fr: "Petits projets à faible risque et peu complexes." },
    note: {
      en: "Deployment readiness is not a formal gate in this model: the project board confirms it before go-live, and it is reviewed at the post-implementation gate.",
      fr: "L'état de préparation au déploiement n'est pas un point de contrôle officiel dans ce modèle : le conseil de projet le confirme avant la mise en service, et il est examiné au point de contrôle postérieur à la mise en œuvre.",
    },
    gates: [
      { id: "L1", name: { en: "Business case", fr: "Analyse de rentabilisation" }, includes: ["G1", "G2", "G3"] },
      { id: "L2", name: { en: "Pre-construction", fr: "Préconstruction" }, includes: ["G4", "G5"] },
      { id: "L3", name: { en: "Post-implementation", fr: "Après la mise en œuvre" }, includes: ["G6", "G7"] },
    ],
  },
};

// Areas of enquiry from TBS "Review Topics for Enquiry: A summary of issues by
// project gate", used to focus a gate review.
export const TOPICS = {
  business: { en: "Business proposition", fr: "Proposition opérationnelle" },
  sponsorship: { en: "Sponsorship, leadership and governance", fr: "Parrainage, leadership et gouvernance" },
  concept: { en: "Concept and approach", fr: "Concept et approche" },
  readiness: { en: "Organizational readiness", fr: "État de préparation de l'organisation" },
  risk: { en: "Risk management", fr: "Gestion des risques" },
  structure: { en: "Project structure and management", fr: "Structure et gestion du projet" },
  requirements: { en: "Business requirements", fr: "Exigences opérationnelles" },
  technology: { en: "Technology", fr: "Technologie" },
  procurement: { en: "Procurement", fr: "Approvisionnement" },
  human: { en: "Human factors", fr: "Facteurs humains" },
  funding: { en: "Funding", fr: "Financement" },
  deployment: { en: "Implementation and deployment", fr: "Mise en œuvre et déploiement" },
};

// Outcomes a gatekeeper can choose. Used in the draft gate decision record.
export const DECISIONS = {
  go: { en: "Proceed", fr: "Poursuivre" },
  conditional: { en: "Proceed with conditions", fr: "Poursuivre sous conditions" },
  hold: { en: "Hold: rework and return to the gate", fr: "Suspendre : retravailler et revenir au point de contrôle" },
  stop: { en: "Stop or redirect the project", fr: "Arrêter ou réorienter le projet" },
};
