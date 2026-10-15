// Project governance as a decision tree: from the departmental foundation
// (framework, capacity assessment) through the gates to close-out, with the
// decisions that change a project's path (approval authority, oversight,
// gating model, failing a gate, rebaselining). Paraphrased guidance, not
// official text: your departmental framework and the current TBS instruments
// take precedence.
//
// Node kinds:
//   question  a decision; each option leads to another node
//   step      an activity with roles, inputs, tasks, outputs; "next" continues
//   outcome   an end point
//
// Text fields are bilingual ({ en, fr }); list fields are { en: [], fr: [] }.
// reqs: requirement IDs (linked to their library pages). app: where this tool helps.

export const PROCESS_START = "start";

export const PHASES = [
  { id: "start", name: { en: "Start", fr: "Départ" }, ref: { en: "Choose your entry point", fr: "Choisissez votre point d'entrée" } },
  { id: "dept", name: { en: "Departmental foundation", fr: "Fondements ministériels" }, ref: { en: "Framework and capacity", fr: "Cadre et capacité" } },
  { id: "identify", name: { en: "1. Identification", fr: "1. Détermination" }, ref: { en: "Gate 1", fr: "Point de contrôle 1" } },
  { id: "plan", name: { en: "2. Planning and approval", fr: "2. Planification et approbation" }, ref: { en: "Gates 2 and 3", fr: "Points de contrôle 2 et 3" } },
  { id: "define", name: { en: "3. Definition", fr: "3. Définition" }, ref: { en: "Gates 4 and 5", fr: "Points de contrôle 4 et 5" } },
  { id: "implement", name: { en: "4. Implementation", fr: "4. Mise en œuvre" }, ref: { en: "Gate 6", fr: "Point de contrôle 6" } },
  { id: "close", name: { en: "5. Close-out", fr: "5. Clôture" }, ref: { en: "Gate 7", fr: "Point de contrôle 7" } },
  { id: "change", name: { en: "When things change", fr: "Quand les choses changent" }, ref: { en: "Exceptions", fr: "Exceptions" } },
];

export const KINDS = {
  question: { label: { en: "Decision", fr: "Décision" }, icon: "◆" },
  step: { label: { en: "Activity", fr: "Activité" }, icon: "●" },
  outcome: { label: { en: "End point", fr: "Point d'arrivée" }, icon: "■" },
};

const DMPP = { en: "Directive on the Management of Projects and Programmes", fr: "Directive sur la gestion des projets et programmes" };
const PPMI = { en: "Policy on the Planning and Management of Investments", fr: "Politique sur la planification et la gestion des investissements" };
const GUIDE = { en: "A Guide to Project Gating for IT-Enabled Projects (TBS, 2010)", fr: "Guide sur le contrôle des projets de TI par points de contrôle (SCT, 2010)" };
const IRH = { en: "The Independent Reviewer's Handbook (TBS)", fr: "Guide de l'examinateur indépendant (SCT)" };
const PCRAG = { en: "Guide to Using the Project Complexity and Risk Assessment Tool (TBS)", fr: "Guide d'utilisation de l'outil d'évaluation de la complexité et des risques des projets (SCT)" };
const DSD = { en: "Directive on Service and Digital", fr: "Directive sur les services et le numérique" };
const refs = (...r) => ({ en: r.map((x) => x.en), fr: r.map((x) => x.fr) });

export const PROCESS_NODES = [
  // ---------------------------------------------------------------- start
  { id: "start", phase: "start", kind: "question",
    title: { en: "Where is your project today?", fr: "Où en est votre projet aujourd'hui?" },
    summary: { en: "The Directive on the Management of Projects and Programmes asks departments to plan, implement, monitor, control and close projects so that expected results are realized. Gates are the checkpoints where senior management decides whether a project continues. Pick the situation that matches yours.", fr: "La Directive sur la gestion des projets et programmes demande aux ministères de planifier, mettre en œuvre, surveiller, contrôler et clore les projets afin que les résultats attendus soient obtenus. Les points de contrôle sont les étapes où la haute direction décide si un projet se poursuit. Choisissez la situation qui correspond à la vôtre." },
    options: [
      { label: { en: "We have an idea or a business problem", fr: "Nous avons une idée ou un problème opérationnel" }, help: { en: "Start at identification: define the problem before any solution.", fr: "Commencez à la détermination : définissez le problème avant toute solution." }, next: "id-problem" },
      { label: { en: "We are choosing an approach or writing the business case", fr: "Nous choisissons une approche ou rédigeons l'analyse de rentabilisation" }, help: { en: "Work out complexity, approval authority and oversight, then the business case.", fr: "Déterminez la complexité, le pouvoir d'approbation et la surveillance, puis l'analyse de rentabilisation." }, next: "plan-options" },
      { label: { en: "The project is approved and we are planning the detail", fr: "Le projet est approuvé et nous planifions les détails" }, help: { en: "Charter, plans, requirements and the baseline.", fr: "Charte, plans, exigences et données de référence." }, next: "def-charter" },
      { label: { en: "We are building and preparing to go live", fr: "Nous construisons et nous préparons la mise en service" }, help: { en: "Construction, testing, authorization and readiness.", fr: "Construction, essais, autorisation et état de préparation." }, next: "impl-build" },
      { label: { en: "Something has gone off track", fr: "Quelque chose a dérapé" }, help: { en: "A failed gate, a breach of tolerance, or a project in trouble.", fr: "Un point de contrôle raté, un dépassement des tolérances ou un projet en difficulté." }, next: "chg-what" },
      { label: { en: "I'm setting up our department's framework", fr: "J'établis le cadre de notre ministère" }, help: { en: "Responsibilities of the senior designated official.", fr: "Responsabilités du cadre supérieur désigné." }, next: "dept-framework" },
    ] },

  // ---------------------------------------------------------------- departmental
  { id: "dept-framework", phase: "dept", kind: "step",
    title: { en: "Establish the departmental project management framework", fr: "Établir le cadre ministériel de gestion de projet" },
    summary: { en: "The senior designated official for projects and programmes sets up a department-wide framework: the gates each project must pass, the evidence each gate requires, how decisions are documented, and how internal enabling functions are consulted.", fr: "Le cadre supérieur désigné pour les projets et programmes met en place un cadre ministériel : les points de contrôle que chaque projet doit franchir, les éléments probants exigés à chacun, la façon de consigner les décisions et la façon de consulter les fonctions habilitantes internes." },
    who: { en: ["Senior designated official for projects and programmes", "Departmental project management office", "CFO, CIO, procurement, real property, HR"], fr: ["Cadre supérieur désigné pour les projets et programmes", "Bureau ministériel de gestion de projet", "DPF, DPI, approvisionnement, biens immobiliers, RH"] },
    tasks: { en: ["Define gating models scaled to complexity and risk.", "Set the evidence expected at each gate and templates for it.", "Define how gate decisions and conditions are recorded.", "Set up portfolio reporting to senior management.", "Address project management competencies across the department."], fr: ["Définir des modèles de points de contrôle adaptés à la complexité et aux risques.", "Établir les éléments probants attendus à chaque point de contrôle et les gabarits correspondants.", "Définir la façon de consigner les décisions et les conditions.", "Mettre en place des rapports sur le portefeuille pour la haute direction.", "Traiter des compétences en gestion de projet dans l'ensemble du ministère."] },
    outputs: { en: ["Departmental project management framework", "Gating standard and templates", "Portfolio reporting"], fr: ["Cadre ministériel de gestion de projet", "Norme et gabarits sur les points de contrôle", "Rapports sur le portefeuille"] },
    reqs: ["GOV-3", "GOV-4", "GOV-5", "GOV-6"],
    refs: refs(DMPP, PPMI),
    next: "dept-opmca" },
  { id: "dept-opmca", phase: "dept", kind: "step",
    title: { en: "Assess organizational project management capacity (OPMCA)", fr: "Évaluer la capacité organisationnelle de gestion de projets (ECOGP)" },
    summary: { en: "A department seeking authority above the $2.5M base limit assesses its capacity with the OPMCA tool, consulting TBS on the evidence first, and submits the deputy head-approved assessment for Treasury Board approval of a class. With class 1 or higher the minister may approve projects whose PCRA level does not exceed the class; without one (or with class 0), every project above $2.5M needs Treasury Board approval. The class is resubmitted at least every three years.", fr: "Un ministère qui souhaite un pouvoir supérieur à la limite de base de 2,5 M$ évalue sa capacité avec l'outil d'ECOGP, en consultant d'abord le SCT sur les éléments probants, et soumet l'évaluation approuvée par l'administrateur général pour que le Conseil du Trésor approuve une catégorie. Avec une catégorie 1 ou plus, le ministre peut approuver les projets dont le niveau d'ECRP ne dépasse pas la catégorie; sans catégorie (ou en catégorie 0), tout projet de plus de 2,5 M$ doit être approuvé par le Conseil du Trésor. La catégorie est soumise de nouveau au moins tous les trois ans." },
    who: { en: ["Senior designated official", "Project management office", "Treasury Board Secretariat (review)"], fr: ["Cadre supérieur désigné", "Bureau de gestion de projet", "Secrétariat du Conseil du Trésor (examen)"] },
    outputs: { en: ["Approved OPMCA class", "Project approval limit"], fr: ["Catégorie d'ECOGP approuvée", "Limite d'approbation des projets"] },
    pitfalls: { en: ["Letting the assessment lapse, which drops the department to the base limit."], fr: ["Laisser l'évaluation expirer, ce qui ramène le ministère à la limite de base."] },
    reqs: ["CAP-2"],
    refs: refs(DMPP),
    app: { href: "#/profile", label: { en: "Record your OPMCA class in the scope", fr: "Inscrire votre catégorie d'ECOGP dans la portée" } },
    next: "dept-done" },
  { id: "dept-done", phase: "dept", kind: "outcome",
    title: { en: "Framework in place", fr: "Cadre en place" },
    summary: { en: "Projects can now be scoped against the departmental framework and capacity class.", fr: "Les projets peuvent maintenant être définis en fonction du cadre ministériel et de la catégorie de capacité." },
    tasks: { en: ["Publish the framework to project teams.", "Register projects with the PMO from the idea stage."], fr: ["Diffuser le cadre aux équipes de projet.", "Inscrire les projets auprès du BGP dès l'étape de l'idée."] } },

  // ---------------------------------------------------------------- identification
  { id: "id-problem", phase: "identify", kind: "step",
    title: { en: "Define the problem and the outcomes", fr: "Définir le problème et les résultats" },
    summary: { en: "Describe the business problem or opportunity without naming a solution, who is affected, the outcomes sought and how they support the department's results and investment plan.", fr: "Décrivez le problème ou la possibilité opérationnelle sans nommer de solution, les personnes touchées, les résultats recherchés et leur lien avec les résultats et le plan d'investissement du ministère." },
    who: { en: ["Business owner", "Prospective sponsor", "Program and service delivery staff", "Users"], fr: ["Responsable opérationnel", "Promoteur pressenti", "Personnel du programme et de la prestation des services", "Utilisateurs"] },
    tasks: { en: ["Gather evidence of the problem (service data, complaints, audits).", "Write a one-page problem statement and outcomes.", "Identify stakeholders and a senior sponsor.", "Check the departmental investment plan."], fr: ["Recueillir des preuves du problème (données sur les services, plaintes, vérifications).", "Rédiger un énoncé du problème et des résultats d'une page.", "Déterminer les intervenants et un promoteur de niveau supérieur.", "Vérifier le plan d'investissement ministériel."] },
    outputs: { en: ["Concept note or problem statement", "Stakeholder map"], fr: ["Note conceptuelle ou énoncé du problème", "Carte des intervenants"] },
    pitfalls: { en: ["Starting from a product or vendor pitch."], fr: ["Partir d'un produit ou d'une offre de fournisseur."] },
    reqs: ["INV-1", "INV-2", "GOV-1"],
    refs: refs(GUIDE, PPMI),
    app: { href: "#/profile", label: { en: "Start the scope interview", fr: "Commencer l'entrevue de définition de la portée" } },
    next: "id-q-project" },
  { id: "id-q-project", phase: "identify", kind: "question",
    title: { en: "Is this a project, a programme, or ongoing operations?", fr: "S'agit-il d'un projet, d'un programme ou d'activités courantes?" },
    summary: { en: "A project is a temporary endeavour with a defined scope, schedule and budget that produces a change. A programme groups related projects managed together for shared outcomes. Recurring work is operations and is managed outside the gating framework.", fr: "Un projet est une entreprise temporaire dont la portée, le calendrier et le budget sont définis et qui produit un changement. Un programme regroupe des projets connexes gérés ensemble pour des résultats communs. Le travail récurrent relève des activités courantes et est géré hors du cadre des points de contrôle." },
    options: [
      { label: { en: "A single project", fr: "Un seul projet" }, help: { en: "Proceed to Gate 1.", fr: "Passez au point de contrôle 1." }, next: "id-gate1" },
      { label: { en: "Several related projects with shared outcomes", fr: "Plusieurs projets connexes aux résultats communs" }, help: { en: "Set up programme governance first.", fr: "Mettez d'abord en place la gouvernance du programme." }, next: "id-programme" },
      { label: { en: "Ongoing operations or a small change", fr: "Activités courantes ou petit changement" }, help: { en: "May not need project gating at all.", fr: "N'a peut-être pas besoin de points de contrôle." }, next: "id-ops" },
    ] },
  { id: "id-programme", phase: "identify", kind: "step",
    title: { en: "Set up programme governance", fr: "Mettre en place la gouvernance du programme" },
    summary: { en: "Define programme outcomes, the roadmap of component projects, their interdependencies and one programme board. Each component project still passes its own gates, scaled to its own complexity.", fr: "Définissez les résultats du programme, la feuille de route des projets qui le composent, leurs interdépendances et un seul conseil de programme. Chaque projet composant franchit tout de même ses propres points de contrôle, adaptés à sa propre complexité." },
    who: { en: ["Programme sponsor", "Programme board", "Component project managers"], fr: ["Promoteur du programme", "Conseil du programme", "Gestionnaires des projets composants"] },
    outputs: { en: ["Programme definition and roadmap", "Dependency register"], fr: ["Définition et feuille de route du programme", "Registre des dépendances"] },
    reqs: ["PGM-1", "GOV-2"],
    refs: refs(DMPP),
    next: "id-gate1" },
  { id: "id-ops", phase: "identify", kind: "outcome",
    title: { en: "Manage as operations", fr: "Gérer comme des activités courantes" },
    summary: { en: "Work that does not create a significant change with its own scope and budget is usually managed through operational planning. Check your departmental framework's definition of a project and its minimum thresholds.", fr: "Le travail qui ne crée pas de changement important doté de sa propre portée et de son propre budget est habituellement géré dans la planification opérationnelle. Vérifiez la définition d'un projet et les seuils minimaux de votre cadre ministériel." },
    reqs: ["GOV-3"] },
  { id: "id-gate1", phase: "identify", kind: "step",
    title: { en: "Gate 1: strategic assessment and concept", fr: "Point de contrôle 1 : évaluation stratégique et concept" },
    summary: { en: "Gatekeepers confirm that the need is real, aligned with priorities and worth exploring, and release resources to develop the approach.", fr: "Les responsables confirment que le besoin est réel, conforme aux priorités et mérite d'être exploré, et libèrent les ressources pour élaborer l'approche." },
    who: { en: ["Sponsor", "Departmental investment or project committee"], fr: ["Promoteur", "Comité ministériel des investissements ou des projets"] },
    evidence: { en: ["Problem statement and outcomes", "Named sponsor", "Link to the investment plan"], fr: ["Énoncé du problème et résultats", "Promoteur désigné", "Lien avec le plan d'investissement"] },
    reqs: ["INV-1", "INV-2", "GOV-1", "GOV-4"],
    refs: refs(GUIDE),
    app: { href: "#/assess/G1", label: { en: "Check Gate 1 readiness", fr: "Vérifier l'état de préparation au point de contrôle 1" } },
    next: "plan-options" },

  // ---------------------------------------------------------------- planning
  { id: "plan-options", phase: "plan", kind: "step",
    title: { en: "Analyze options and choose an approach", fr: "Analyser les options et choisir une approche" },
    summary: { en: "Compare realistic options, including the status quo and reuse of existing GC solutions, with procurement, finance, IT, security and privacy at the table. Decide the delivery approach and draft the governance and gating plan.", fr: "Comparez des options réalistes, y compris le statu quo et la réutilisation de solutions existantes du GC, avec l'approvisionnement, les finances, la TI, la sécurité et la protection de la vie privée à la table. Choisissez l'approche de réalisation et rédigez le plan de gouvernance et des points de contrôle." },
    who: { en: ["Sponsor", "Project lead", "Enabling functions"], fr: ["Promoteur", "Chef de projet", "Fonctions habilitantes"] },
    outputs: { en: ["Options analysis", "Governance structure", "Gating plan", "High-level scope"], fr: ["Analyse des options", "Structure de gouvernance", "Plan des points de contrôle", "Portée générale"] },
    reqs: ["INV-3", "GOV-2", "GOV-6", "GAT-1", "PLN-1"],
    refs: refs(GUIDE),
    next: "plan-pcra" },
  { id: "plan-pcra", phase: "plan", kind: "step",
    title: { en: "Assess complexity and risk (PCRA)", fr: "Évaluer la complexité et les risques (ECRP)" },
    summary: { en: "Above the threshold for your department's class ($2.5M with no class or class 0; $5M, $10M, $25M or $50M for classes 1 to 4), complete the Project Complexity and Risk Assessment with the TBS tool over the full scope and life cycle, and submit it to TBS for review before definition begins. TBS has 15 working days to raise questions. Its level (1 Sustaining to 4 Transformational) is compared with the capacity class to decide who approves the project.", fr: "Au-delà du seuil applicable à la catégorie de votre ministère (2,5 M$ sans catégorie ou en catégorie 0; 5 M$, 10 M$, 25 M$ ou 50 M$ pour les catégories 1 à 4), réalisez l'évaluation de la complexité et des risques du projet avec l'outil du SCT sur toute la portée et tout le cycle de vie, et soumettez-la au SCT pour examen avant le début de la définition. Le SCT dispose de 15 jours ouvrables pour poser des questions. Son niveau (1 Maintien à 4 Transformation) est comparé à la catégorie de capacité pour déterminer qui approuve le projet." },
    who: { en: ["Project lead", "Project management office (challenge)", "Sponsor (approval)"], fr: ["Chef de projet", "Bureau de gestion de projet (remise en question)", "Promoteur (approbation)"] },
    pitfalls: { en: ["Scoring optimistically to stay within departmental authority; Treasury Board can reassess."], fr: ["Coter de façon optimiste pour rester dans les limites du pouvoir ministériel; le Conseil du Trésor peut réévaluer."] },
    reqs: ["CAP-1"],
    refs: refs(PCRAG, DMPP),
    app: { href: "#/profile", label: { en: "Estimate the PCRA level", fr: "Estimer le niveau d'ECRP" } },
    next: "plan-q-authority" },
  { id: "plan-q-authority", phase: "plan", kind: "question",
    title: { en: "Is the project within your department's approval authority?", fr: "Le projet relève-t-il du pouvoir d'approbation de votre ministère?" },
    summary: { en: "Without an approved OPMCA class of 1 or higher, every project over $2.5M needs Treasury Board approval. With class 1 or higher, a project needs Treasury Board approval when its PCRA level exceeds the class, whatever its cost. Treasury Board may also call in any project, and new funding or authorities need a Treasury Board submission of their own.", fr: "Sans catégorie d'ECOGP approuvée de 1 ou plus, tout projet de plus de 2,5 M$ doit être approuvé par le Conseil du Trésor. Avec une catégorie 1 ou plus, un projet doit être approuvé par le Conseil du Trésor lorsque son niveau d'ECRP dépasse la catégorie, quel que soit son coût. Le Conseil du Trésor peut aussi exiger que tout projet lui soit soumis, et de nouveaux fonds ou de nouvelles autorisations exigent leur propre présentation." },
    options: [
      { label: { en: "Yes: within the base limit, or PCRA level within the class", fr: "Oui : sous la limite de base, ou niveau d'ECRP dans la catégorie" }, help: { en: "The department approves the project through its own gates.", fr: "Le ministère approuve le projet au moyen de ses propres points de contrôle." }, next: "plan-q-digital" },
      { label: { en: "No: over $2.5M without a class, or PCRA level above the class", fr: "Non : plus de 2,5 M$ sans catégorie, ou niveau d'ECRP supérieur à la catégorie" }, help: { en: "Plan a Treasury Board submission with TBS.", fr: "Planifiez une présentation au Conseil du Trésor avec le SCT." }, next: "plan-tb" },
      { label: { en: "Not sure", fr: "Je ne suis pas certain" }, help: { en: "Work it out from cost, PCRA and OPMCA.", fr: "Déterminez-le à partir du coût, de l'ECRP et de l'ECOGP." }, next: "plan-authority-check" },
    ] },
  { id: "plan-authority-check", phase: "plan", kind: "step",
    title: { en: "Determine approval authority", fr: "Déterminer le pouvoir d'approbation" },
    summary: { en: "Check the department's OPMCA class. With no class or class 0, compare the cost with the $2.5M base limit; with class 1 or higher, compare the PCRA level with the class. When in doubt, ask the PMO or CFO and contact the TBS program sector analyst early: discovering late that Treasury Board approval is needed costs months.", fr: "Vérifiez la catégorie d'ECOGP du ministère. Sans catégorie ou en catégorie 0, comparez le coût à la limite de base de 2,5 M$; avec une catégorie 1 ou plus, comparez le niveau d'ECRP à la catégorie. En cas de doute, renseignez-vous auprès du BGP ou du DPF et communiquez tôt avec l'analyste du secteur de programme du SCT : découvrir tard qu'une approbation du Conseil du Trésor est nécessaire coûte des mois." },
    reqs: ["CAP-3", "CAP-2", "APP-3"],
    refs: refs(DMPP),
    app: { href: "#/profile", label: { en: "See the authority determination in your scope", fr: "Voir la détermination du pouvoir dans votre portée" } },
    next: "plan-q-authority" },
  { id: "plan-tb", phase: "plan", kind: "step",
    title: { en: "Plan Treasury Board project approval", fr: "Planifier l'approbation du projet par le Conseil du Trésor" },
    summary: { en: "Plan two Treasury Board decisions: expenditure authority to begin definition (only pre-definition work such as options analysis and feasibility studies may proceed before it), then project approval and expenditure authority to begin implementation. Each submission appends a Project Brief; TBS may ask for the business case, project management plan, gating plan, procurement plan and charter. Engage the TBS program sector and, for digital projects, the Office of the Chief Information Officer early, and seek integrated project, procurement and real property authorities where possible.", fr: "Prévoyez deux décisions du Conseil du Trésor : le pouvoir de dépenser pour commencer la définition (seuls des travaux préalables comme l'analyse des options et les études de faisabilité peuvent avoir lieu avant), puis l'approbation du projet et le pouvoir de dépenser pour commencer la mise en œuvre. Chaque présentation comprend en annexe un sommaire de projet; le SCT peut demander l'analyse de rentabilisation, le plan de gestion du projet, le plan des points de contrôle, le plan d'approvisionnement et la charte. Communiquez tôt avec le secteur de programme du SCT et, pour les projets numériques, avec le Bureau du dirigeant principal de l'information, et demandez des pouvoirs intégrés pour le projet, l'approvisionnement et les biens immobiliers lorsque c'est possible." },
    who: { en: ["Sponsor", "CFO (attestation)", "TBS program sector analyst", "TBS Office of the Chief Information Officer"], fr: ["Promoteur", "DPF (attestation)", "Analyste du secteur de programme du SCT", "Bureau du dirigeant principal de l'information du SCT"] },
    pitfalls: { en: ["Engaging TBS only when the submission is drafted.", "Missing the Treasury Board meeting cycle."], fr: ["Ne communiquer avec le SCT qu'une fois la présentation rédigée.", "Manquer le cycle des réunions du Conseil du Trésor."] },
    reqs: ["APP-1", "APP-3", "INV-7", "GAT-2"],
    refs: refs(DMPP, IRH),
    next: "plan-q-digital" },
  { id: "plan-q-digital", phase: "plan", kind: "question",
    title: { en: "Is it a digital initiative above the GC EARB threshold, or does it use emerging technology?", fr: "S'agit-il d'une initiative numérique au-delà du seuil du CEAI du GC, ou utilise-t-elle une technologie émergente?" },
    summary: { en: "At or above the department's threshold ($2.5M with no class or class 1, $5M class 2, $10M class 3, $25M class 4, $15M for National Defence), a digital project needs a concept case reviewed by the GC CIO and a GC Enterprise Architecture Review Board review. Emerging technology, a policy exception, Protected B or lower hosting outside public cloud, or extended support for an unsupported technology also trigger the board, whatever the cost.", fr: "À partir du seuil du ministère (2,5 M$ sans catégorie ou en catégorie 1, 5 M$ en catégorie 2, 10 M$ en catégorie 3, 25 M$ en catégorie 4, 15 M$ pour la Défense nationale), un projet numérique exige un cas conceptuel examiné par le DPI du GC et un examen par le Conseil d'examen de l'architecture intégrée du GC. Une technologie émergente, une exception à la politique, un hébergement Protégé B ou moins ailleurs que dans le nuage public ou le prolongement du soutien d'une technologie non soutenue entraînent aussi l'examen par le Conseil, quel que soit le coût." },
    options: [
      { label: { en: "Yes", fr: "Oui" }, help: { en: "Plan departmental and GC architecture reviews.", fr: "Planifiez les examens de l'architecture ministériels et du GC." }, next: "plan-earb" },
      { label: { en: "Digital, but below the threshold", fr: "Numérique, mais sous le seuil" }, help: { en: "Departmental architecture review only.", fr: "Examen de l'architecture ministérielle seulement." }, next: "plan-business-case" },
      { label: { en: "Not a digital project", fr: "Pas un projet numérique" }, help: { en: "Continue to the business case.", fr: "Passez à l'analyse de rentabilisation." }, next: "plan-business-case" },
    ] },
  { id: "plan-earb", phase: "plan", kind: "step",
    title: { en: "Concept case, then architecture review", fr: "Cas conceptuel, puis examen de l'architecture" },
    summary: { en: "Have the business owner (ADM or above) approve a concept case, take it to the departmental investment oversight body, and submit it to TBS for GC CIO review. Then present the proposal to the departmental architecture review board and the GC EARB, after the concept case review and before the business case or Treasury Board submission is developed. Track the conditions raised as gate conditions.", fr: "Faites approuver un cas conceptuel par le responsable opérationnel (SMA ou plus), présentez-le à l'organe ministériel de surveillance des investissements et soumettez-le au SCT pour examen par le DPI du GC. Présentez ensuite la proposition au conseil ministériel d'examen de l'architecture et au CEAI du GC, après l'examen du cas conceptuel et avant l'élaboration de l'analyse de rentabilisation ou de la présentation au Conseil du Trésor. Suivez les conditions soulevées comme des conditions de point de contrôle." },
    reqs: ["APP-8", "APP-4", "APP-5", "DIG-6"],
    refs: refs(DSD, PPMI),
    next: "plan-business-case" },
  { id: "plan-business-case", phase: "plan", kind: "step",
    title: { en: "Gate 3: business case and general readiness", fr: "Point de contrôle 3 : analyse de rentabilisation et état de préparation général" },
    summary: { en: "Bring the business case to the gate: recommended option, life-cycle costs reviewed by the CFO, measurable benefits, risks, funding, procurement strategy and readiness. Where Treasury Board approval is needed, this gate prepares and supports the submission.", fr: "Présentez l'analyse de rentabilisation au point de contrôle : option recommandée, coûts sur le cycle de vie examinés par le DPF, avantages mesurables, risques, financement, stratégie d'approvisionnement et état de préparation. Lorsque l'approbation du Conseil du Trésor est nécessaire, ce point de contrôle prépare et appuie la présentation." },
    evidence: { en: ["Approved business case", "Updated PCRA", "Funding confirmation", "Benefits with baselines and targets", "Procurement strategy"], fr: ["Analyse de rentabilisation approuvée", "ECRP mise à jour", "Confirmation du financement", "Avantages avec points de départ et cibles", "Stratégie d'approvisionnement"] },
    reqs: ["INV-4", "INV-5", "INV-6", "BEN-1", "PRO-1", "RSK-1"],
    refs: refs(GUIDE, PPMI),
    app: { href: "#/report", label: { en: "Generate the gate readiness report", fr: "Produire le rapport sur l'état de préparation" } },
    next: "plan-q-gate" },
  { id: "plan-q-gate", phase: "plan", kind: "question",
    title: { en: "What did the gatekeepers decide?", fr: "Qu'ont décidé les responsables du point de contrôle?" },
    summary: { en: "A gate has four honest outcomes. Stopping a project at a gate is a success of governance, not a failure.", fr: "Un point de contrôle a quatre issues honnêtes. Arrêter un projet à un point de contrôle est un succès de la gouvernance, et non un échec." },
    options: [
      { label: { en: "Proceed", fr: "Poursuivre" }, help: { en: "Move on to definition.", fr: "Passez à la définition." }, next: "def-charter" },
      { label: { en: "Proceed with conditions", fr: "Poursuivre sous conditions" }, help: { en: "Track the conditions to closure.", fr: "Suivez les conditions jusqu'à leur levée." }, next: "chg-conditions" },
      { label: { en: "Hold: rework and return", fr: "Suspendre : retravailler et revenir" }, help: { en: "Fix the gaps and come back.", fr: "Comblez les lacunes et revenez." }, next: "chg-hold" },
      { label: { en: "Stop or redirect", fr: "Arrêter ou réorienter" }, help: { en: "Close the project in an orderly way.", fr: "Clore le projet de façon ordonnée." }, next: "chg-stop" },
    ] },

  // ---------------------------------------------------------------- definition
  { id: "def-charter", phase: "define", kind: "step",
    title: { en: "Gate 4: charter and project management plan", fr: "Point de contrôle 4 : charte et plan de gestion de projet" },
    summary: { en: "Set the project up to succeed: approved charter, project management plan, staffed team, change control, reporting, benefits realization plan and change management plan.", fr: "Structurez le projet pour qu'il réussisse : charte approuvée, plan de gestion de projet, équipe dotée, contrôle des changements, rapports, plan de réalisation des avantages et plan de gestion du changement." },
    reqs: ["PLN-2", "PLN-3", "PLN-7", "PLN-8", "GOV-5", "BEN-2", "OCM-1", "MON-1"],
    refs: refs(GUIDE),
    app: { href: "#/assess/G4", label: { en: "Check Gate 4 readiness", fr: "Vérifier l'état de préparation au point de contrôle 4" } },
    next: "def-q-agile" },
  { id: "def-q-agile", phase: "define", kind: "question",
    title: { en: "How will the solution be delivered?", fr: "Comment la solution sera-t-elle réalisée?" },
    summary: { en: "Gates apply to every delivery approach, but the evidence differs.", fr: "Les points de contrôle s'appliquent à toutes les approches de réalisation, mais les éléments probants diffèrent." },
    options: [
      { label: { en: "Sequentially: specify, then build", fr: "De façon séquentielle : spécifier, puis construire" }, help: { en: "Complete specifications and baseline before construction.", fr: "Achevez les spécifications et les données de référence avant la construction." }, next: "def-detail" },
      { label: { en: "Iteratively or agile", fr: "De façon itérative ou agile" }, help: { en: "Agree an evidence map with gatekeepers.", fr: "Convenez d'une carte des éléments probants avec les responsables." }, next: "def-agile" },
    ] },
  { id: "def-agile", phase: "define", kind: "step",
    title: { en: "Map agile delivery to the gates", fr: "Associer la réalisation agile aux points de contrôle" },
    summary: { en: "Agree with the PMO and gatekeepers what replaces up-front documents: product vision, a prioritized backlog for the first releases, a release roadmap with gates marked, a fixed cost and cadence, and demonstrations of working software. Treat each major release like a Gate 5 and Gate 6 pair.", fr: "Convenez avec le BGP et les responsables de ce qui remplace les documents préalables : vision du produit, carnet priorisé pour les premières versions, feuille de route des versions où figurent les points de contrôle, coût et cadence fixes, et démonstrations de logiciel fonctionnel. Traitez chaque version majeure comme une paire de points de contrôle 5 et 6." },
    reqs: ["PLN-9", "PLN-6", "PLN-4"],
    refs: refs(GUIDE),
    next: "def-detail" },
  { id: "def-detail", phase: "define", kind: "step",
    title: { en: "Gate 5: detailed plan and specifications", fr: "Point de contrôle 5 : plan détaillé et spécifications" },
    summary: { en: "The last gate before major spending. Requirements are agreed, schedule and cost are baselined with a substantive estimate and contingency, expenditure authority is confirmed, contracts are ready, and privacy, security and accessibility work is under way.", fr: "Le dernier point de contrôle avant les dépenses importantes. Les exigences sont convenues, le calendrier et les coûts sont établis en référence avec une estimation fondée et une provision pour éventualités, le pouvoir de dépenser est confirmé, les contrats sont prêts, et les travaux sur la vie privée, la sécurité et l'accessibilité sont en cours." },
    reqs: ["PLN-4", "PLN-5", "PLN-6", "APP-2", "PRO-3", "DIG-2", "DIG-4", "DIG-5"],
    refs: refs(GUIDE),
    app: { href: "#/assess/G5", label: { en: "Check Gate 5 readiness", fr: "Vérifier l'état de préparation au point de contrôle 5" } },
    next: "impl-build" },

  // ---------------------------------------------------------------- implementation
  { id: "impl-build", phase: "implement", kind: "step",
    title: { en: "Build, monitor and control", fr: "Construire, surveiller et contrôler" },
    summary: { en: "Deliver against the baseline, report honestly against tolerances, manage risks, issues, vendors and changes, and keep users engaged.", fr: "Réalisez le projet conformément aux données de référence, rendez compte honnêtement par rapport aux tolérances, gérez les risques, les problèmes, les fournisseurs et les changements, et maintenez la mobilisation des utilisateurs." },
    reqs: ["MON-1", "MON-2", "RSK-1", "RSK-2", "PRO-4", "PLN-7"],
    next: "impl-q-tolerance" },
  { id: "impl-q-tolerance", phase: "implement", kind: "question",
    title: { en: "Is the project within its tolerances?", fr: "Le projet respecte-t-il ses tolérances?" },
    summary: { en: "Tolerances for cost, schedule and scope are set in the charter. Exceeding them, or forecasting that you will, must go to the approving authority.", fr: "Les tolérances en matière de coûts, de calendrier et de portée sont fixées dans la charte. Leur dépassement, ou la prévision d'un dépassement, doit être soumis à l'autorité d'approbation." },
    options: [
      { label: { en: "Yes", fr: "Oui" }, help: { en: "Prepare for deployment.", fr: "Préparez le déploiement." }, next: "impl-ready" },
      { label: { en: "No, or forecast to exceed", fr: "Non, ou dépassement prévu" }, help: { en: "Escalate and consider rebaselining.", fr: "Faites remonter et envisagez de rétablir les données de référence." }, next: "chg-rebaseline" },
    ] },
  { id: "impl-ready", phase: "implement", kind: "step",
    title: { en: "Gate 6: construction complete and deployment readiness", fr: "Point de contrôle 6 : construction terminée et état de préparation au déploiement" },
    summary: { en: "Testing and acceptance complete, authority to operate in hand, business and users ready, a funded service owner, objective go-live criteria and a rehearsed fallback.", fr: "Essais et acceptation terminés, autorisation d'exploitation obtenue, secteurs d'activité et utilisateurs prêts, responsable du service financé, critères objectifs de mise en service et plan de repli répété." },
    reqs: ["OCM-5", "DIG-1", "OCM-2", "OCM-3", "OCM-4", "DIG-3"],
    refs: refs(GUIDE),
    app: { href: "#/assess/G6", label: { en: "Check Gate 6 readiness", fr: "Vérifier l'état de préparation au point de contrôle 6" } },
    next: "close-pir" },

  // ---------------------------------------------------------------- close-out
  { id: "close-pir", phase: "close", kind: "step",
    title: { en: "Gate 7: post-implementation review and close-out", fr: "Point de contrôle 7 : examen postérieur à la mise en œuvre et clôture" },
    summary: { en: "Measure benefits against targets when they can realistically appear, review operation, capture and share lessons, close contracts and finances, and hand benefits tracking to the business owner.", fr: "Mesurez les avantages par rapport aux cibles lorsqu'ils peuvent réalistement se manifester, examinez l'exploitation, consignez et partagez les leçons, fermez les contrats et les finances, et confiez le suivi des avantages au responsable opérationnel." },
    reqs: ["BEN-3", "MON-3", "MON-4", "MON-5"],
    refs: refs(GUIDE, IRH),
    next: "close-done" },
  { id: "close-done", phase: "close", kind: "outcome",
    title: { en: "Project closed", fr: "Projet clos" },
    summary: { en: "The project is closed and its benefits are tracked by the business owner. Lessons feed the department's next projects and its next capacity assessment.", fr: "Le projet est clos et ses avantages sont suivis par le responsable opérationnel. Les leçons alimentent les prochains projets du ministère et sa prochaine évaluation de la capacité." } },

  // ---------------------------------------------------------------- change
  { id: "chg-what", phase: "change", kind: "question",
    title: { en: "What has happened?", fr: "Que s'est-il passé?" },
    summary: { en: "Pick the closest description.", fr: "Choisissez la description la plus proche." },
    options: [
      { label: { en: "A gate was passed with conditions", fr: "Un point de contrôle a été franchi sous conditions" }, help: { en: "Track and close them.", fr: "Suivez-les et levez-les." }, next: "chg-conditions" },
      { label: { en: "A gate was not passed", fr: "Un point de contrôle n'a pas été franchi" }, help: { en: "Rework and return.", fr: "Retravaillez et revenez." }, next: "chg-hold" },
      { label: { en: "Cost, schedule or scope will exceed tolerance", fr: "Les coûts, le calendrier ou la portée dépasseront les tolérances" }, help: { en: "Escalate and rebaseline.", fr: "Faites remonter et rétablissez les données de référence." }, next: "chg-rebaseline" },
      { label: { en: "The project should no longer continue", fr: "Le projet ne devrait plus se poursuivre" }, help: { en: "Stop in an orderly way.", fr: "Arrêtez de façon ordonnée." }, next: "chg-stop" },
    ] },
  { id: "chg-conditions", phase: "change", kind: "step",
    title: { en: "Track gate conditions to closure", fr: "Suivre les conditions jusqu'à leur levée" },
    summary: { en: "Record each condition with an owner and date, report progress at every steering committee, and show the evidence of closure at the next gate.", fr: "Consignez chaque condition avec un responsable et une date, rendez compte des progrès à chaque comité directeur, et présentez les preuves de levée au prochain point de contrôle." },
    reqs: ["GAT-3", "GOV-4"],
    next: "chg-back" },
  { id: "chg-hold", phase: "change", kind: "step",
    title: { en: "Rework and return to the gate", fr: "Retravailler et revenir au point de contrôle" },
    summary: { en: "Get the gatekeepers' reasons in writing, plan the rework, and re-present only what changed. Consider an independent health check if the reasons point to deeper problems.", fr: "Obtenez par écrit les raisons des responsables, planifiez les travaux à refaire et ne présentez de nouveau que ce qui a changé. Envisagez un bilan de santé indépendant si les raisons indiquent des problèmes plus profonds." },
    reqs: ["GOV-4", "GAT-2", "GAT-3"],
    app: { href: "#/report", label: { en: "List the gaps in the readiness report", fr: "Énumérer les lacunes dans le rapport sur l'état de préparation" } },
    next: "chg-back" },
  { id: "chg-rebaseline", phase: "change", kind: "step",
    title: { en: "Escalate and rebaseline", fr: "Faire remonter et rétablir les données de référence" },
    summary: { en: "Tell the sponsor and governance as soon as a breach of tolerance is forecast. Analyze options (de-scope, phase, add funds, stop), update the PCRA and cost estimate, and return to the approving authority for a new baseline; if Treasury Board approved the project, that means returning to Treasury Board.", fr: "Informez le promoteur et la gouvernance dès qu'un dépassement des tolérances est prévu. Analysez les options (réduire la portée, échelonner, ajouter des fonds, arrêter), mettez à jour l'ECRP et l'estimation des coûts, et revenez devant l'autorité d'approbation pour obtenir de nouvelles données de référence; si le Conseil du Trésor a approuvé le projet, cela signifie revenir devant le Conseil du Trésor." },
    pitfalls: { en: ["Absorbing overruns quietly until the approval no longer covers the project."], fr: ["Absorber discrètement les dépassements jusqu'à ce que l'approbation ne couvre plus le projet."] },
    reqs: ["PLN-7", "CAP-1", "MON-1", "APP-1"],
    refs: refs(DMPP),
    next: "chg-back" },
  { id: "chg-stop", phase: "change", kind: "step",
    title: { en: "Stop or redirect the project", fr: "Arrêter ou réorienter le projet" },
    summary: { en: "Record the decision and its reasons, salvage reusable work, close contracts and finances, release people, tell stakeholders, and capture lessons. Stopping early is far cheaper than finishing a project that no longer makes sense.", fr: "Consignez la décision et ses raisons, récupérez les travaux réutilisables, fermez les contrats et les finances, libérez les personnes, informez les intervenants et consignez les leçons. Arrêter tôt coûte beaucoup moins cher que d'achever un projet qui n'a plus de sens." },
    reqs: ["MON-4", "MON-3", "GOV-4"],
    next: "close-done" },
  { id: "chg-back", phase: "change", kind: "outcome",
    title: { en: "Back on track", fr: "Retour sur la bonne voie" },
    summary: { en: "Return to the phase you were in. The next gate will check that conditions and changes were handled.", fr: "Revenez à la phase où vous étiez. Le prochain point de contrôle vérifiera que les conditions et les changements ont été traités." },
    tasks: { en: ["Update the risk register and status report.", "Re-run the readiness check for your next gate in this tool."], fr: ["Mettre à jour le registre des risques et le rapport d'étape.", "Refaire la vérification de l'état de préparation au prochain point de contrôle dans cet outil."] } },
];

export const PROCESS_MAP = Object.fromEntries(PROCESS_NODES.map((n) => [n.id, n]));
export const PHASE_MAP = Object.fromEntries(PHASES.map((p) => [p.id, p]));

// Targets of a node's outgoing edges.
export function nextIds(n) {
  if (n.kind === "question") return n.options.map((o) => o.next);
  return n.next ? [n.next] : [];
}
