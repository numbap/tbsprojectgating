// Requirements: planning and baselines, benefits, risks and procurement.
// Paraphrased guidance, not official text.

const DMPP = { en: "Directive on the Management of Projects and Programmes", fr: "Directive sur la gestion des projets et programmes" };
const GUIDE = { en: "A Guide to Project Gating for IT-Enabled Projects (TBS)", fr: "Guide sur le contrôle des projets de TI par points de contrôle (SCT)" };
const src = (...parts) => ({ en: parts.map((p) => p.en).join("; "), fr: parts.map((p) => p.fr).join("; ") });

export const DELIVERY = [
  // ---------------------------------------------------------------- PLN
  {
    id: "PLN-1", gate: "G2", sev: "medium", base: "required",
    source: GUIDE,
    title: { en: "High-level scope and requirements", fr: "Portée générale et exigences de haut niveau" },
    summary: { en: "What is in and out of scope is stated, with high-level business requirements and the main constraints and assumptions.", fr: "Ce qui est inclus dans la portée et ce qui en est exclu est énoncé, avec les exigences opérationnelles de haut niveau ainsi que les principales contraintes et hypothèses." },
    look: {
      en: ["An in-scope / out-of-scope list.", "High-level requirements traced to the outcomes.", "Assumptions and constraints, with owners."],
      fr: ["Une liste de ce qui est inclus et exclu.", "Des exigences de haut niveau rattachées aux résultats.", "Les hypothèses et les contraintes, avec leurs responsables."],
    },
    rightsize: {
      en: ["Express scope as user outcomes and a first release, not a full feature list, if delivering iteratively."],
      fr: ["Exprimer la portée sous forme de résultats pour les utilisateurs et d'une première version, plutôt que d'une liste complète de fonctions, en cas de réalisation itérative."],
    },
    consequences: {
      en: ["Scope creep with no baseline to measure it against.", "Cost estimates that cannot be checked."],
      fr: ["Une dérive de la portée sans référence pour la mesurer.", "Des estimations de coûts impossibles à vérifier."],
    },
    mitigations: {
      en: ["Run a scoping workshop with the sponsor and business owners; record exclusions explicitly."],
      fr: ["Tenir un atelier de définition de la portée avec le promoteur et les responsables opérationnels; consigner explicitement les exclusions."],
    },
    describe: { en: "The scope of {project} is defined, including explicit exclusions, high-level requirements traced to outcomes, and the main assumptions and constraints.", fr: "La portée de {project} est définie, y compris les exclusions explicites, les exigences de haut niveau rattachées aux résultats ainsi que les principales hypothèses et contraintes." },
    questions: {
      en: ["Are scope inclusions and exclusions written down?", "Are high-level requirements traced to the outcomes?"],
      fr: ["Les inclusions et exclusions de la portée sont-elles consignées?", "Les exigences de haut niveau sont-elles rattachées aux résultats?"],
    },
    keywords: { en: ["scope", "out of scope", "in scope", "requirements", "assumptions", "constraints"], fr: ["portée", "hors de la portée", "exigences", "hypothèses", "contraintes"] },
  },
  {
    id: "PLN-2", gate: "G4", sev: "high", base: "required",
    source: GUIDE,
    title: { en: "Project charter approved", fr: "Charte de projet approuvée" },
    summary: { en: "A charter approved by the sponsor sets out the project's objectives, scope, deliverables, governance, roles, tolerances, budget and key milestones.", fr: "Une charte approuvée par le promoteur énonce les objectifs, la portée, les livrables, la gouvernance, les rôles, les tolérances, le budget et les principaux jalons du projet." },
    look: {
      en: ["The signed charter.", "Consistency between the charter and the approved business case."],
      fr: ["La charte signée.", "La cohérence entre la charte et l'analyse de rentabilisation approuvée."],
    },
    rightsize: {
      en: ["A two-page charter is fine for a light-gated project."],
      fr: ["Une charte de deux pages convient à un projet à points de contrôle allégés."],
    },
    consequences: {
      en: ["Team members and stakeholders work from different understandings of the project."],
      fr: ["Les membres de l'équipe et les intervenants travaillent selon des compréhensions différentes du projet."],
    },
    mitigations: {
      en: ["Draft the charter from the business case and have it signed at the next steering committee."],
      fr: ["Rédiger la charte à partir de l'analyse de rentabilisation et la faire signer au prochain comité directeur."],
    },
    describe: { en: "The charter for {project}, approved by {sponsor}, sets out objectives, scope, deliverables, governance, roles, tolerances, budget and key milestones, consistent with the approved business case.", fr: "La charte de {project}, approuvée par {sponsor}, énonce les objectifs, la portée, les livrables, la gouvernance, les rôles, les tolérances, le budget et les principaux jalons, conformément à l'analyse de rentabilisation approuvée." },
    questions: {
      en: ["Is there a charter signed by the sponsor?", "Is it consistent with the approved business case?"],
      fr: ["Existe-t-il une charte signée par le promoteur?", "Est-elle conforme à l'analyse de rentabilisation approuvée?"],
    },
    keywords: { en: ["charter", "project charter"], fr: ["charte", "charte de projet"] },
  },
  {
    id: "PLN-3", gate: "G4", sev: "medium", base: "required",
    source: GUIDE,
    title: { en: "Project management plan", fr: "Plan de gestion de projet" },
    summary: { en: "A project management plan describes how scope, schedule, cost, quality, communications, risk, change and reporting will be managed, proportionate to the project's complexity.", fr: "Un plan de gestion de projet décrit comment la portée, le calendrier, les coûts, la qualité, les communications, les risques, les changements et les rapports seront gérés, en proportion de la complexité du projet." },
    look: {
      en: ["The project management plan and its approval.", "Whether the team actually follows it (spot-check one process, such as change requests)."],
      fr: ["Le plan de gestion de projet et son approbation.", "Si l'équipe le suit réellement (vérifier ponctuellement un processus, comme les demandes de changement)."],
    },
    rightsize: {
      en: ["Reference departmental standard processes instead of rewriting them."],
      fr: ["Faire référence aux processus normalisés du ministère plutôt que de les récrire."],
    },
    consequences: {
      en: ["Inconsistent practices across the team; gatekeepers cannot see how the project is controlled."],
      fr: ["Des pratiques incohérentes au sein de l'équipe; les responsables ne voient pas comment le projet est contrôlé."],
    },
    mitigations: {
      en: ["Start from the PMO template and tailor only what is different."],
      fr: ["Partir du gabarit du BGP et n'adapter que ce qui diffère."],
    },
    describe: { en: "The project management plan for {project} sets out how scope, schedule, cost, quality, communications, risk, change and reporting are managed, using {dept} standard processes where they exist.", fr: "Le plan de gestion de {project} précise comment la portée, le calendrier, les coûts, la qualité, les communications, les risques, les changements et les rapports sont gérés, au moyen des processus normalisés de {dept} lorsqu'ils existent." },
    questions: {
      en: ["Is there an approved project management plan?", "Does the team follow the processes it describes?"],
      fr: ["Existe-t-il un plan de gestion de projet approuvé?", "L'équipe suit-elle les processus qu'il décrit?"],
    },
    keywords: { en: ["project management plan", "PMP", "communications plan", "quality plan"], fr: ["plan de gestion de projet", "PGP", "plan de communication", "plan de qualité"] },
  },
  {
    id: "PLN-4", gate: "G5", sev: "high", base: "required",
    source: GUIDE,
    title: { en: "Integrated schedule baselined", fr: "Calendrier intégré établi en référence" },
    summary: { en: "An integrated schedule built from a work breakdown structure, with dependencies, critical path and approvals, is baselined before implementation.", fr: "Un calendrier intégré fondé sur une structure de répartition du travail, avec les dépendances, le chemin critique et les approbations, est établi en référence avant la mise en œuvre." },
    look: {
      en: ["The baselined schedule and the work breakdown structure.", "The critical path and the approval milestones on it.", "Schedule contingency and how it was sized."],
      fr: ["Le calendrier de référence et la structure de répartition du travail.", "Le chemin critique et les jalons d'approbation qui s'y trouvent.", "La marge du calendrier et la façon dont elle a été établie."],
    },
    rightsize: {
      en: ["For agile delivery, baseline a release roadmap and a fixed cadence instead of a detailed task plan."],
      fr: ["Pour une réalisation agile, établir en référence une feuille de route des versions et une cadence fixe plutôt qu'un plan détaillé des tâches."],
    },
    consequences: {
      en: ["Slippage cannot be detected until a milestone is missed.", "Approvals and procurement end up on the critical path unnoticed."],
      fr: ["Les glissements ne peuvent être détectés avant qu'un jalon soit manqué.", "Les approbations et l'approvisionnement se retrouvent sur le chemin critique sans qu'on s'en aperçoive."],
    },
    mitigations: {
      en: ["Build the schedule bottom-up with team leads and have it independently reviewed."],
      fr: ["Bâtir le calendrier de façon ascendante avec les chefs d'équipe et le faire examiner de façon indépendante."],
    },
    describe: { en: "{project} has an integrated schedule, built from a work breakdown structure and baselined at Gate 5, including dependencies, approvals and schedule contingency.", fr: "{project} dispose d'un calendrier intégré, fondé sur une structure de répartition du travail et établi en référence au point de contrôle 5, comprenant les dépendances, les approbations et une marge de calendrier." },
    questions: {
      en: ["Is there an integrated schedule with dependencies and a critical path?", "Has it been baselined and approved?", "Does it include approval and procurement milestones?"],
      fr: ["Existe-t-il un calendrier intégré avec les dépendances et un chemin critique?", "A-t-il été établi en référence et approuvé?", "Comprend-il les jalons d'approbation et d'approvisionnement?"],
    },
    keywords: { en: ["schedule", "baseline", "work breakdown structure", "WBS", "critical path", "milestone*"], fr: ["calendrier", "référence", "structure de répartition du travail", "SRT", "chemin critique", "jalon*"] },
  },
  {
    id: "PLN-5", gate: "G5", sev: "high", base: "required",
    source: src({ en: "Guide to Cost Estimating (TBS)", fr: "Guide de l'estimation des coûts (SCT)" }, DMPP),
    title: { en: "Substantive cost estimate and contingency", fr: "Estimation fondée des coûts et provision pour éventualités" },
    summary: { en: "By the time implementation is approved, the indicative estimate has matured into a substantive estimate with contingency sized to the identified risks.", fr: "Au moment de l'approbation de la mise en œuvre, l'estimation indicative est devenue une estimation fondée avec une provision pour éventualités proportionnée aux risques déterminés." },
    look: {
      en: ["The substantive estimate and its basis (quotes, bids, comparable projects).", "How contingency was calculated and who controls it."],
      fr: ["L'estimation fondée et son fondement (soumissions, propositions, projets comparables).", "La façon dont la provision pour éventualités a été calculée et qui la contrôle."],
    },
    rightsize: {
      en: ["Use actual bid prices where procurement is complete rather than re-estimating."],
      fr: ["Utiliser les prix des soumissions lorsque l'approvisionnement est terminé plutôt que de refaire l'estimation."],
    },
    consequences: {
      en: ["Overruns that require returning to the approving authority.", "Contingency spent on scope rather than risk."],
      fr: ["Des dépassements qui obligent à revenir devant l'autorité d'approbation.", "Une provision pour éventualités dépensée pour la portée plutôt que pour les risques."],
    },
    mitigations: {
      en: ["Have the CFO's costing team or an independent estimator review the estimate before the gate."],
      fr: ["Faire examiner l'estimation par l'équipe d'établissement des coûts du DPF ou par un estimateur indépendant avant le point de contrôle."],
    },
    describe: { en: "The cost of {project} is supported by a substantive estimate based on bids and comparable projects, with contingency sized to the risk register and controlled by the sponsor.", fr: "Le coût de {project} est appuyé par une estimation fondée sur les soumissions et des projets comparables, avec une provision pour éventualités proportionnée au registre des risques et contrôlée par le promoteur." },
    questions: {
      en: ["Is the estimate substantive (not indicative) at this point?", "Is contingency sized to the identified risks?", "Is it clear who can release contingency?"],
      fr: ["L'estimation est-elle fondée (et non indicative) à ce stade?", "La provision pour éventualités est-elle proportionnée aux risques déterminés?", "Sait-on clairement qui peut débloquer la provision?"],
    },
    keywords: { en: ["substantive estimate", "contingency", "management reserve", "cost baseline"], fr: ["estimation fondée", "provision pour éventualités", "réserve de gestion", "coûts de référence"] },
  },
  {
    id: "PLN-6", gate: "G5", sev: "high", base: "required",
    source: GUIDE,
    title: { en: "Detailed requirements and specifications agreed", fr: "Exigences détaillées et spécifications convenues" },
    summary: { en: "Functional and non-functional requirements (including security, privacy, accessibility, performance and official languages) are detailed enough to build or contract, and agreed by the business owner.", fr: "Les exigences fonctionnelles et non fonctionnelles (y compris la sécurité, la vie privée, l'accessibilité, le rendement et les langues officielles) sont assez détaillées pour construire ou passer un marché, et sont acceptées par le responsable opérationnel." },
    look: {
      en: ["The requirements set and the business owner's sign-off.", "Non-functional requirements, not just features.", "Traceability from requirements to outcomes and tests."],
      fr: ["L'ensemble des exigences et l'approbation du responsable opérationnel.", "Les exigences non fonctionnelles, et non seulement les fonctions.", "La traçabilité des exigences vers les résultats et les essais."],
    },
    rightsize: {
      en: ["For agile delivery, agree the product vision, a prioritized backlog for the first releases and the definition of done instead of full specifications."],
      fr: ["Pour une réalisation agile, convenir de la vision du produit, d'un carnet de produit priorisé pour les premières versions et de la définition de « terminé » plutôt que de spécifications complètes."],
    },
    consequences: {
      en: ["Rework and change requests during construction; contract disputes over what was promised."],
      fr: ["Des reprises et des demandes de changement pendant la construction; des différends contractuels sur ce qui a été promis."],
    },
    mitigations: {
      en: ["Prototype the riskiest requirements with users before the gate."],
      fr: ["Prototyper les exigences les plus risquées avec les utilisateurs avant le point de contrôle."],
    },
    describe: { en: "Requirements for {project}, including non-functional requirements for security, privacy, accessibility, performance and official languages, are documented, traced to outcomes and agreed by the business owner.", fr: "Les exigences de {project}, y compris les exigences non fonctionnelles en matière de sécurité, de vie privée, d'accessibilité, de rendement et de langues officielles, sont documentées, rattachées aux résultats et acceptées par le responsable opérationnel." },
    questions: {
      en: ["Are requirements detailed enough to build or contract?", "Are non-functional requirements included?", "Has the business owner agreed to them?"],
      fr: ["Les exigences sont-elles assez détaillées pour construire ou passer un marché?", "Les exigences non fonctionnelles sont-elles incluses?", "Le responsable opérationnel les a-t-il acceptées?"],
    },
    keywords: { en: ["functional requirements", "non-functional", "specifications", "backlog", "user stories"], fr: ["exigences fonctionnelles", "non fonctionnelles", "spécifications", "carnet de produit", "récits utilisateurs"] },
  },
  {
    id: "PLN-7", gate: "G4", sev: "medium", base: "required",
    source: src(DMPP, GUIDE),
    title: { en: "Change control and rebaselining rules", fr: "Contrôle des changements et règles de rétablissement des données de référence" },
    summary: { en: "Changes to scope, schedule and cost go through a controlled process, and changes beyond tolerance are returned to the approving authority (including Treasury Board where it approved the project).", fr: "Les changements à la portée, au calendrier et aux coûts passent par un processus contrôlé, et ceux qui dépassent les tolérances sont renvoyés à l'autorité d'approbation (y compris le Conseil du Trésor lorsqu'il a approuvé le projet)." },
    look: {
      en: ["The change log and recent change decisions.", "The thresholds that trigger a return to the approving authority."],
      fr: ["Le registre des changements et les décisions récentes.", "Les seuils qui déclenchent un renvoi à l'autorité d'approbation."],
    },
    rightsize: {
      en: ["Let the product owner reprioritize the backlog freely within fixed cost and time; control only changes to outcomes, budget and dates."],
      fr: ["Laisser le responsable du produit reprioriser librement le carnet dans les limites des coûts et des délais; ne contrôler que les changements aux résultats, au budget et aux dates."],
    },
    consequences: {
      en: ["The project drifts outside its approval without anyone deciding it should."],
      fr: ["Le projet dérive au-delà de son approbation sans que personne l'ait décidé."],
    },
    mitigations: {
      en: ["Reconstruct the baseline and present the variance to the steering committee."],
      fr: ["Reconstituer les données de référence et présenter l'écart au comité directeur."],
    },
    describe: { en: "Changes to the scope, schedule and cost of {project} are assessed and decided through a change control process. Changes beyond tolerance are returned to the approving authority.", fr: "Les changements à la portée, au calendrier et aux coûts de {project} sont évalués et tranchés au moyen d'un processus de contrôle des changements. Les changements qui dépassent les tolérances sont renvoyés à l'autorité d'approbation." },
    questions: {
      en: ["Is there a change control process in use?", "Are thresholds for returning to the approving authority defined?"],
      fr: ["Un processus de contrôle des changements est-il utilisé?", "Les seuils de renvoi à l'autorité d'approbation sont-ils définis?"],
    },
    keywords: { en: ["change control", "change request*", "rebaselin*", "variance"], fr: ["contrôle des changements", "demande* de changement", "écart", "rétablissement des données de référence"] },
  },
  {
    id: "PLN-8", gate: "G4", sev: "medium", base: "required",
    source: GUIDE,
    title: { en: "Resource plan", fr: "Plan des ressources" },
    summary: { en: "The people, skills and contractor support the project needs are planned over time, with business subject-matter experts released from their regular duties.", fr: "Les personnes, les compétences et le soutien contractuel dont le projet a besoin sont planifiés dans le temps, et les experts en la matière des secteurs d'activité sont libérés de leurs tâches habituelles." },
    look: {
      en: ["The resource plan by role and quarter.", "Agreements with business managers for subject-matter expert time."],
      fr: ["Le plan des ressources par rôle et par trimestre.", "Les ententes avec les gestionnaires opérationnels sur le temps des experts en la matière."],
    },
    rightsize: {
      en: ["Rely on an existing product team where one owns the service."],
      fr: ["S'appuyer sur une équipe de produit existante lorsqu'elle est responsable du service."],
    },
    consequences: {
      en: ["Business experts never have time; requirements and testing slip."],
      fr: ["Les experts opérationnels n'ont jamais le temps; les exigences et les essais glissent."],
    },
    mitigations: {
      en: ["Have the sponsor confirm subject-matter expert release in writing."],
      fr: ["Faire confirmer par écrit par le promoteur la libération des experts en la matière."],
    },
    describe: { en: "A resource plan for {project} sets out the roles, skills and contractor support needed by quarter. Business subject-matter experts are released for agreed periods.", fr: "Un plan des ressources de {project} précise par trimestre les rôles, les compétences et le soutien contractuel nécessaires. Les experts en la matière des secteurs d'activité sont libérés pour des périodes convenues." },
    questions: {
      en: ["Is there a resource plan covering the project's duration?", "Is business subject-matter expert time secured?"],
      fr: ["Existe-t-il un plan des ressources couvrant la durée du projet?", "Le temps des experts en la matière est-il assuré?"],
    },
    keywords: { en: ["resource plan", "subject matter expert*", "SME", "staffing"], fr: ["plan des ressources", "expert* en la matière", "dotation"] },
  },
  {
    id: "PLN-9", gate: "G4", sev: "medium", base: "required",
    source: { en: "TBS guidance on agile and iterative delivery within gating", fr: "Orientation du SCT sur la réalisation agile et itérative dans le cadre des points de contrôle" },
    title: { en: "Iterative delivery mapped to gates", fr: "Réalisation itérative associée aux points de contrôle" },
    summary: { en: "For agile or hybrid delivery, the project shows how increments map to gates: a minimum viable product, a release roadmap, and the evidence (working software, user outcomes) gatekeepers will see at each gate.", fr: "Pour une réalisation agile ou hybride, le projet montre comment les incréments s'associent aux points de contrôle : un produit minimal viable, une feuille de route des versions et les éléments probants (logiciel fonctionnel, résultats pour les utilisateurs) que les responsables verront à chaque point de contrôle." },
    look: {
      en: ["The release roadmap with gates marked on it.", "Demonstrations of working software at recent reviews.", "Agreement from gatekeepers on what evidence replaces up-front documents."],
      fr: ["La feuille de route des versions où figurent les points de contrôle.", "Des démonstrations de logiciel fonctionnel lors des derniers examens.", "L'accord des responsables sur les éléments probants qui remplacent les documents préalables."],
    },
    rightsize: {
      en: ["Treat each major release as a mini Gate 5/6 pair rather than gating every sprint."],
      fr: ["Traiter chaque version majeure comme une paire de mini-points de contrôle 5/6 plutôt que de contrôler chaque sprint."],
    },
    consequences: {
      en: ["Gatekeepers ask for documents an agile team does not produce, and the project stalls.", "Agile becomes a reason for no plan at all."],
      fr: ["Les responsables demandent des documents qu'une équipe agile ne produit pas, et le projet stagne.", "L'agilité devient une raison de n'avoir aucun plan."],
    },
    mitigations: {
      en: ["Agree an evidence map with the PMO and gatekeepers before the next gate."],
      fr: ["Convenir d'une carte des éléments probants avec le BGP et les responsables avant le prochain point de contrôle."],
    },
    describe: { en: "{project} is delivered iteratively. Its release roadmap shows how increments map to gates, and gatekeepers have agreed the evidence (working software and measured user outcomes) presented at each gate.", fr: "{project} est réalisé de façon itérative. Sa feuille de route des versions montre comment les incréments s'associent aux points de contrôle, et les responsables ont convenu des éléments probants (logiciel fonctionnel et résultats mesurés pour les utilisateurs) présentés à chacun." },
    questions: {
      en: ["Is there a release roadmap showing how increments map to gates?", "Have gatekeepers agreed what evidence they will see at each gate?"],
      fr: ["Existe-t-il une feuille de route des versions montrant comment les incréments s'associent aux points de contrôle?", "Les responsables ont-ils convenu des éléments probants qu'ils verront à chacun?"],
    },
    keywords: { en: ["agile", "iterative", "sprint*", "minimum viable product", "MVP", "release roadmap"], fr: ["agile", "itérati*", "sprint*", "produit minimal viable", "PMV", "feuille de route des versions"] },
    scope: [
      { when: { delivery: "waterfall" }, status: "na", reason: { en: "Sequential delivery.", fr: "Réalisation séquentielle." } },
    ],
  },

  // ---------------------------------------------------------------- BEN
  {
    id: "BEN-1", gate: "G3", sev: "high", base: "required",
    source: src(DMPP, { en: "project sponsor: expected benefits clearly defined", fr: "promoteur de projet : avantages attendus clairement définis" }),
    title: { en: "Measurable benefits defined", fr: "Avantages mesurables définis" },
    summary: { en: "Expected benefits are clearly defined with a baseline, a target, a measure and a date, so they can be tracked and their realization demonstrated.", fr: "Les avantages attendus sont clairement définis avec un point de départ, une cible, une mesure et une date, afin de pouvoir les suivre et démontrer leur réalisation." },
    look: {
      en: ["A benefits table with baseline, target, measure and date for each benefit.", "Benefits that are outcomes for people, not outputs like \"system delivered\"."],
      fr: ["Un tableau des avantages avec le point de départ, la cible, la mesure et la date pour chacun.", "Des avantages qui sont des résultats pour les gens, et non des extrants comme « système livré »."],
    },
    rightsize: {
      en: ["Three well-measured benefits beat fifteen vague ones."],
      fr: ["Trois avantages bien mesurés valent mieux que quinze avantages vagues."],
    },
    consequences: {
      en: ["Nobody can say whether the investment worked.", "Scope decisions cannot be prioritized by value."],
      fr: ["Personne ne peut dire si l'investissement a fonctionné.", "Les décisions relatives à la portée ne peuvent être priorisées selon la valeur."],
    },
    mitigations: {
      en: ["Measure the current baseline now, before anything changes."],
      fr: ["Mesurer le point de départ dès maintenant, avant que quoi que ce soit change."],
    },
    describe: { en: "The benefits of {project} are defined with a baseline, target, measure and date for each, and are linked to the outcomes in the business case.", fr: "Les avantages de {project} sont définis avec un point de départ, une cible, une mesure et une date pour chacun, et sont liés aux résultats de l'analyse de rentabilisation." },
    questions: {
      en: ["Does each expected benefit have a baseline, a target and a measure?", "Are the benefits outcomes rather than outputs?"],
      fr: ["Chaque avantage attendu a-t-il un point de départ, une cible et une mesure?", "Les avantages sont-ils des résultats plutôt que des extrants?"],
    },
    keywords: { en: ["benefit*", "baseline", "target", "measure*", "KPI", "performance indicator*"], fr: ["avantage*", "point de départ", "cible", "mesure*", "indicateur* de rendement"] },
  },
  {
    id: "BEN-2", gate: "G4", sev: "medium", base: "required",
    source: src(DMPP, GUIDE),
    title: { en: "Benefits realization plan with owners", fr: "Plan de réalisation des avantages avec responsables" },
    summary: { en: "A benefits realization plan assigns each benefit to a business owner who will still be there after the project ends, and says how and when it will be measured.", fr: "Un plan de réalisation des avantages attribue chaque avantage à un responsable opérationnel qui sera toujours là après la fin du projet, et précise comment et quand il sera mesuré." },
    look: {
      en: ["The benefits realization plan.", "Business owners' acceptance of their benefits."],
      fr: ["Le plan de réalisation des avantages.", "L'acceptation de leurs avantages par les responsables opérationnels."],
    },
    rightsize: {
      en: ["Use the program's existing performance measurement framework where it already measures the outcome."],
      fr: ["Utiliser le cadre de mesure du rendement existant du programme lorsqu'il mesure déjà le résultat."],
    },
    consequences: {
      en: ["Benefits tracking ends with the project team."],
      fr: ["Le suivi des avantages prend fin avec l'équipe de projet."],
    },
    mitigations: {
      en: ["Assign owners at the next steering committee and add benefits to the program's performance reporting."],
      fr: ["Désigner les responsables au prochain comité directeur et ajouter les avantages aux rapports sur le rendement du programme."],
    },
    describe: { en: "A benefits realization plan for {project} assigns each benefit to a business owner and sets how and when it is measured, including after the project closes.", fr: "Un plan de réalisation des avantages de {project} attribue chaque avantage à un responsable opérationnel et précise comment et quand il est mesuré, y compris après la clôture du projet." },
    questions: {
      en: ["Does each benefit have a business owner?", "Does the plan say how benefits are measured after the project closes?"],
      fr: ["Chaque avantage a-t-il un responsable opérationnel?", "Le plan précise-t-il comment les avantages sont mesurés après la clôture du projet?"],
    },
    keywords: { en: ["benefits realization", "benefit owner*", "benefits plan"], fr: ["réalisation des avantages", "responsable* des avantages", "plan des avantages"] },
  },
  {
    id: "BEN-3", gate: "G7", sev: "high", base: "required",
    source: src(DMPP, GUIDE),
    title: { en: "Benefits measured after implementation", fr: "Avantages mesurés après la mise en œuvre" },
    summary: { en: "After go-live, benefits are measured against their baselines and targets and reported to the sponsor, with actions where they fall short.", fr: "Après la mise en service, les avantages sont mesurés par rapport à leurs points de départ et cibles et communiqués au promoteur, avec des mesures lorsqu'ils sont insuffisants." },
    look: {
      en: ["A benefits report comparing actuals with targets.", "Actions agreed for benefits not yet realized."],
      fr: ["Un rapport sur les avantages comparant les résultats réels aux cibles.", "Les mesures convenues pour les avantages non encore réalisés."],
    },
    rightsize: {
      en: ["Schedule the measurement when benefits can realistically appear (often 6 to 18 months after go-live)."],
      fr: ["Prévoir la mesure lorsque les avantages peuvent réalistement se manifester (souvent de 6 à 18 mois après la mise en service)."],
    },
    consequences: {
      en: ["The department cannot show value for money; future business cases lose credibility."],
      fr: ["Le ministère ne peut démontrer l'optimisation des ressources; les futures analyses de rentabilisation perdent en crédibilité."],
    },
    mitigations: {
      en: ["Report on what can be measured now and set dates for the rest."],
      fr: ["Rendre compte de ce qui peut être mesuré maintenant et fixer des dates pour le reste."],
    },
    describe: { en: "Benefits of {project} were measured against their baselines and targets after implementation and reported to {sponsor}. Actions are in place for benefits not yet realized.", fr: "Les avantages de {project} ont été mesurés par rapport à leurs points de départ et cibles après la mise en œuvre et communiqués à {sponsor}. Des mesures sont en place pour les avantages non encore réalisés." },
    questions: {
      en: ["Have benefits been measured against their targets?", "Are actions in place for benefits that fall short?"],
      fr: ["Les avantages ont-ils été mesurés par rapport à leurs cibles?", "Des mesures sont-elles en place pour les avantages insuffisants?"],
    },
    keywords: { en: ["benefits realized", "actual benefits", "benefits report", "outcomes achieved"], fr: ["avantages réalisés", "avantages réels", "rapport sur les avantages", "résultats atteints"] },
  },

  // ---------------------------------------------------------------- RSK
  {
    id: "RSK-1", gate: "G2", revisit: ["G3", "G5", "G6"], sev: "high", base: "required",
    source: src(DMPP, { en: "project sponsor: active leadership in managing risk", fr: "promoteur de projet : leadership actif dans la gestion des risques" }),
    title: { en: "Risk register actively managed", fr: "Registre des risques géré activement" },
    summary: { en: "Risks are identified, assessed, owned and treated, reviewed regularly by governance, with the sponsor providing active leadership on the most serious ones.", fr: "Les risques sont déterminés, évalués, attribués et traités, et examinés régulièrement par la gouvernance, le promoteur exerçant un leadership actif sur les plus graves." },
    look: {
      en: ["The risk register with owners, responses and dates of last review.", "Evidence that the steering committee discussed the top risks recently."],
      fr: ["Le registre des risques avec les responsables, les réponses et la date du dernier examen.", "La preuve que le comité directeur a récemment discuté des principaux risques."],
    },
    rightsize: {
      en: ["Keep the register to the risks that would change a decision; ten live risks beat a hundred stale ones."],
      fr: ["Limiter le registre aux risques qui changeraient une décision; dix risques actifs valent mieux que cent risques périmés."],
    },
    consequences: {
      en: ["Risks become issues with no response ready.", "Gatekeepers cannot judge whether the project is still viable."],
      fr: ["Les risques deviennent des problèmes sans réponse prête.", "Les responsables ne peuvent juger si le projet est toujours viable."],
    },
    mitigations: {
      en: ["Run a risk workshop with the team and the sponsor before the gate."],
      fr: ["Tenir un atelier sur les risques avec l'équipe et le promoteur avant le point de contrôle."],
    },
    describe: { en: "Risks to {project} are recorded in a register with owners and responses, reviewed monthly by the project team and at each steering committee meeting.", fr: "Les risques de {project} sont consignés dans un registre avec leurs responsables et leurs réponses, examinés chaque mois par l'équipe de projet et à chaque réunion du comité directeur." },
    questions: {
      en: ["Is there a risk register with owners and responses?", "Is it reviewed regularly by governance?", "Does the sponsor act on the top risks?"],
      fr: ["Existe-t-il un registre des risques avec responsables et réponses?", "Est-il examiné régulièrement par la gouvernance?", "Le promoteur agit-il sur les principaux risques?"],
    },
    keywords: { en: ["risk register", "risk*", "mitigation", "risk owner"], fr: ["registre des risques", "risque*", "atténuation", "responsable du risque"] },
  },
  {
    id: "RSK-2", gate: "G4", sev: "low", base: "recommended",
    source: GUIDE,
    title: { en: "Issues and decisions logged", fr: "Problèmes et décisions consignés" },
    summary: { en: "Issues are logged, owned and resolved, and significant decisions are recorded with their rationale.", fr: "Les problèmes sont consignés, attribués et réglés, et les décisions importantes sont consignées avec leur justification." },
    look: {
      en: ["The issue log and decision log.", "The age of open issues."],
      fr: ["Le registre des problèmes et le registre des décisions.", "L'ancienneté des problèmes non réglés."],
    },
    rightsize: {
      en: ["A shared list in the team's collaboration tool is enough."],
      fr: ["Une liste partagée dans l'outil de collaboration de l'équipe suffit."],
    },
    consequences: {
      en: ["The same issues are rediscussed; decisions are relitigated."],
      fr: ["Les mêmes problèmes sont rediscutés; les décisions sont remises en cause."],
    },
    mitigations: {
      en: ["Start the logs now and backfill the major decisions."],
      fr: ["Commencer les registres dès maintenant et y consigner rétroactivement les décisions importantes."],
    },
    describe: { en: "Issues and decisions for {project} are logged with owners and rationale and reviewed at each team meeting.", fr: "Les problèmes et les décisions de {project} sont consignés avec leurs responsables et leur justification, et examinés à chaque réunion d'équipe." },
    questions: {
      en: ["Are issues logged with owners and target dates?", "Are significant decisions recorded with their rationale?"],
      fr: ["Les problèmes sont-ils consignés avec responsables et dates cibles?", "Les décisions importantes sont-elles consignées avec leur justification?"],
    },
    keywords: { en: ["issue log", "decision log", "issues"], fr: ["registre des problèmes", "registre des décisions", "problèmes"] },
  },

  // ---------------------------------------------------------------- PRO
  {
    id: "PRO-1", gate: "G3", sev: "high", base: "required",
    source: src(DMPP, { en: "requests for approval include market analysis and procurement strategy", fr: "les demandes d'approbation comprennent l'analyse du marché et la stratégie d'approvisionnement" }),
    title: { en: "Market analysis and procurement strategy", fr: "Analyse du marché et stratégie d'approvisionnement" },
    summary: { en: "Requests for project approval include an analysis of the market and a procurement strategy suited to the project: contracting approach, vehicles, timelines, evaluation and risk sharing.", fr: "Les demandes d'approbation de projet comprennent une analyse du marché et une stratégie d'approvisionnement adaptée au projet : approche contractuelle, instruments, échéanciers, évaluation et partage des risques." },
    look: {
      en: ["Market research or requests for information.", "The procurement strategy approved by the contracting authority.", "Procurement milestones in the schedule."],
      fr: ["Une étude de marché ou des demandes de renseignements.", "La stratégie d'approvisionnement approuvée par l'autorité contractante.", "Les jalons d'approvisionnement dans le calendrier."],
    },
    rightsize: {
      en: ["Use existing GC vehicles (for example cloud or agile services supply arrangements) to shorten timelines."],
      fr: ["Utiliser les instruments existants du GC (p. ex. les arrangements en matière d'approvisionnement pour les services infonuagiques ou agiles) pour raccourcir les délais."],
    },
    consequences: {
      en: ["Procurement becomes the critical path and delays everything.", "The approach does not suit what the market can deliver."],
      fr: ["L'approvisionnement devient le chemin critique et retarde tout.", "L'approche ne convient pas à ce que le marché peut offrir."],
    },
    mitigations: {
      en: ["Issue a request for information now to test the market."],
      fr: ["Publier dès maintenant une demande de renseignements pour sonder le marché."],
    },
    describe: { en: "The procurement strategy for {project} is informed by market analysis and agreed with the contracting authority. Procurement milestones are part of the integrated schedule.", fr: "La stratégie d'approvisionnement de {project} s'appuie sur une analyse du marché et a été convenue avec l'autorité contractante. Les jalons d'approvisionnement font partie du calendrier intégré." },
    questions: {
      en: ["Has the market been analyzed (research, RFI, industry engagement)?", "Is there a procurement strategy agreed with the contracting authority?"],
      fr: ["Le marché a-t-il été analysé (recherche, DR, consultation de l'industrie)?", "Existe-t-il une stratégie d'approvisionnement convenue avec l'autorité contractante?"],
    },
    keywords: { en: ["market analysis", "market research", "procurement strategy", "request for information", "RFI", "industry engagement"], fr: ["analyse du marché", "étude de marché", "stratégie d'approvisionnement", "demande de renseignements", "DR", "consultation de l'industrie"] },
    scope: [
      { when: { procurement: "none" }, status: "na", reason: { en: "No procurement is planned.", fr: "Aucun approvisionnement n'est prévu." } },
    ],
  },
  {
    id: "PRO-2", gate: "G3", sev: "medium", base: "recommended",
    source: { en: "Directive on the Management of Procurement", fr: "Directive sur la gestion de l'approvisionnement" },
    title: { en: "Contracting authority and partners engaged early", fr: "Autorité contractante et partenaires consultés tôt" },
    summary: { en: "The contracting authority (departmental or Public Services and Procurement Canada) and, for infrastructure, Shared Services Canada are engaged early enough to plan lead times.", fr: "L'autorité contractante (ministérielle ou Services publics et Approvisionnement Canada) et, pour l'infrastructure, Services partagés Canada sont consultés assez tôt pour planifier les délais." },
    look: {
      en: ["Named contacts at the contracting authority and SSC.", "Agreed lead times reflected in the schedule."],
      fr: ["Des personnes-ressources désignées à l'autorité contractante et à SPC.", "Des délais convenus intégrés au calendrier."],
    },
    rightsize: {
      en: ["Confirm early whether SSC services are needed at all; SaaS may not need them."],
      fr: ["Confirmer tôt si des services de SPC sont nécessaires; un logiciel-service n'en a pas toujours besoin."],
    },
    consequences: {
      en: ["Long lead times discovered after the schedule is baselined."],
      fr: ["De longs délais découverts après l'établissement du calendrier de référence."],
    },
    mitigations: {
      en: ["Book planning sessions with PSPC and SSC this quarter."],
      fr: ["Prévoir des séances de planification avec SPAC et SPC ce trimestre."],
    },
    describe: { en: "The contracting authority and, where needed, Shared Services Canada were engaged during business case development for {project}; their lead times are in the schedule.", fr: "L'autorité contractante et, au besoin, Services partagés Canada ont été consultés lors de l'élaboration de l'analyse de rentabilisation de {project}; leurs délais figurent au calendrier." },
    questions: {
      en: ["Has the contracting authority been engaged?", "Are partner lead times (PSPC, SSC) reflected in the schedule?"],
      fr: ["L'autorité contractante a-t-elle été consultée?", "Les délais des partenaires (SPAC, SPC) sont-ils intégrés au calendrier?"],
    },
    keywords: { en: ["PSPC", "Shared Services Canada", "SSC", "contracting authority", "lead time*"], fr: ["SPAC", "Services partagés Canada", "SPC", "autorité contractante", "délai*"] },
    scope: [
      { when: { procurement: "none" }, status: "na", reason: { en: "No procurement is planned.", fr: "Aucun approvisionnement n'est prévu." } },
      { when: { procurement: "complex" }, status: "required", reason: { en: "A major or complex procurement needs the contracting authority from the start.", fr: "Un approvisionnement majeur ou complexe nécessite l'autorité contractante dès le départ." } },
    ],
  },
  {
    id: "PRO-3", gate: "G5", sev: "medium", base: "required",
    source: { en: "Directive on the Management of Procurement; Contract Security Program", fr: "Directive sur la gestion de l'approvisionnement; Programme de sécurité des contrats" },
    title: { en: "Contract award readiness", fr: "Préparation à l'attribution du contrat" },
    summary: { en: "Before award, the statement of work, evaluation plan, security requirements, intellectual property terms and acceptance criteria are complete and match the baselined scope.", fr: "Avant l'attribution, l'énoncé des travaux, le plan d'évaluation, les exigences de sécurité, les modalités de propriété intellectuelle et les critères d'acceptation sont complets et correspondent à la portée de référence." },
    look: {
      en: ["The statement of work and evaluation plan.", "The security requirements checklist for the contract.", "Acceptance criteria tied to deliverables and payments."],
      fr: ["L'énoncé des travaux et le plan d'évaluation.", "La liste de vérification des exigences relatives à la sécurité du contrat.", "Les critères d'acceptation liés aux livrables et aux paiements."],
    },
    rightsize: {
      en: ["Use outcome-based statements of work and standard GC clauses."],
      fr: ["Utiliser des énoncés des travaux axés sur les résultats et les clauses types du GC."],
    },
    consequences: {
      en: ["Disputes, change orders and delays during delivery; vendors without the right security clearance."],
      fr: ["Des différends, des modifications et des retards pendant la réalisation; des fournisseurs sans la cote de sécurité requise."],
    },
    mitigations: {
      en: ["Have the contracting authority and legal services review the package before release."],
      fr: ["Faire examiner le dossier par l'autorité contractante et les services juridiques avant sa publication."],
    },
    describe: { en: "The contract package for {project} includes a statement of work matching the baselined scope, an evaluation plan, security requirements and acceptance criteria tied to payment.", fr: "Le dossier contractuel de {project} comprend un énoncé des travaux correspondant à la portée de référence, un plan d'évaluation, des exigences de sécurité et des critères d'acceptation liés aux paiements." },
    questions: {
      en: ["Are the statement of work and evaluation plan complete?", "Are security requirements and acceptance criteria defined?"],
      fr: ["L'énoncé des travaux et le plan d'évaluation sont-ils complets?", "Les exigences de sécurité et les critères d'acceptation sont-ils définis?"],
    },
    keywords: { en: ["statement of work", "evaluation plan", "SRCL", "security requirements", "acceptance criteria", "contract award"], fr: ["énoncé des travaux", "plan d'évaluation", "LVERS", "exigences de sécurité", "critères d'acceptation", "attribution du contrat"] },
    scope: [
      { when: { procurement: ["none", "existing"] }, status: "na", reason: { en: "No new contract is to be awarded.", fr: "Aucun nouveau contrat ne doit être attribué." } },
    ],
  },
  {
    id: "PRO-4", gate: "G6", sev: "low", base: "recommended",
    source: { en: "Directive on the Management of Procurement (vendor performance)", fr: "Directive sur la gestion de l'approvisionnement (rendement des fournisseurs)" },
    title: { en: "Vendor performance managed", fr: "Rendement des fournisseurs géré" },
    summary: { en: "Vendor deliverables are accepted against criteria, performance is tracked, and problems are documented and escalated under the contract.", fr: "Les livrables des fournisseurs sont acceptés selon des critères, le rendement est suivi, et les problèmes sont documentés et signalés conformément au contrat." },
    look: {
      en: ["Acceptance records for deliverables.", "Performance discussions with the vendor and their records."],
      fr: ["Les comptes rendus d'acceptation des livrables.", "Les discussions sur le rendement avec le fournisseur et leurs comptes rendus."],
    },
    rightsize: {
      en: ["Tie acceptance to demonstrated working increments rather than documents."],
      fr: ["Lier l'acceptation à des incréments fonctionnels démontrés plutôt qu'à des documents."],
    },
    consequences: {
      en: ["Payment for deliverables that do not work; weak position in disputes."],
      fr: ["Paiement de livrables qui ne fonctionnent pas; position faible en cas de différend."],
    },
    mitigations: {
      en: ["Start a vendor performance log and review it with the contracting authority."],
      fr: ["Commencer un registre du rendement des fournisseurs et l'examiner avec l'autorité contractante."],
    },
    describe: { en: "Vendor deliverables for {project} are accepted against agreed criteria, and vendor performance is reviewed regularly with the contracting authority.", fr: "Les livrables des fournisseurs de {project} sont acceptés selon des critères convenus, et le rendement des fournisseurs est examiné régulièrement avec l'autorité contractante." },
    questions: {
      en: ["Are deliverables accepted against agreed criteria?", "Is vendor performance reviewed and documented?"],
      fr: ["Les livrables sont-ils acceptés selon des critères convenus?", "Le rendement des fournisseurs est-il examiné et documenté?"],
    },
    keywords: { en: ["vendor performance", "acceptance", "deliverables", "supplier"], fr: ["rendement des fournisseurs", "acceptation", "livrables", "fournisseur"] },
    scope: [
      { when: { procurement: "none" }, status: "na", reason: { en: "No procurement is planned.", fr: "Aucun approvisionnement n'est prévu." } },
    ],
  },
];
