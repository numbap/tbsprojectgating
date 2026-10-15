// Requirement areas. Each groups requirements from the Directive on the
// Management of Projects and Programmes, the Policy on the Planning and
// Management of Investments and the related policy instruments a project meets
// on its way through the gates.

export const AREAS = [
  { id: "GOV", name: { en: "Governance and accountability", fr: "Gouvernance et responsabilisation" },
    intent: { en: "Someone senior is accountable, decisions are made by the right people at the right time, and the department's framework is applied.", fr: "Une personne de niveau supérieur est responsable, les décisions sont prises par les bonnes personnes au bon moment, et le cadre ministériel est appliqué." },
    tip: { en: "Sit in on a steering committee meeting. Who decides, and is it written down afterwards?", fr: "Assistez à une réunion du comité directeur. Qui décide, et la décision est-elle consignée par la suite?" } },
  { id: "INV", name: { en: "Investment case and funding", fr: "Analyse d'investissement et financement" },
    intent: { en: "The project solves a real problem, fits the department's plans, beats the alternatives and is funded for its whole life.", fr: "Le projet résout un vrai problème, s'inscrit dans les plans du ministère, surpasse les solutions de rechange et est financé pour tout son cycle de vie." },
    tip: { en: "Ask the CFO's costing team to explain the estimate in their own words, including what happens after go-live.", fr: "Demandez à l'équipe d'établissement des coûts du DPF d'expliquer l'estimation dans ses propres mots, y compris ce qui se passe après la mise en service." } },
  { id: "CAP", name: { en: "Complexity, risk and capacity", fr: "Complexité, risque et capacité" },
    intent: { en: "The project's complexity and risk are assessed honestly and compared with the department's demonstrated capacity, which sets the approval authority.", fr: "La complexité et les risques du projet sont évalués honnêtement et comparés à la capacité démontrée du ministère, ce qui détermine le pouvoir d'approbation." },
    tip: { en: "Ask who scored the PCRA and whether anyone outside the project team reviewed the scoring.", fr: "Demandez qui a coté l'ECRP et si une personne de l'extérieur de l'équipe de projet a examiné la cotation." } },
  { id: "APP", name: { en: "Approvals and oversight", fr: "Approbations et surveillance" },
    intent: { en: "Every approval the project needs (departmental, Treasury Board, architecture review, contracting) is identified early and obtained before the work it authorizes.", fr: "Chaque approbation requise (ministérielle, Conseil du Trésor, examen de l'architecture, passation de marchés) est déterminée tôt et obtenue avant les travaux qu'elle autorise." },
    tip: { en: "Draw the approvals calendar backwards from the date money must be spent or a contract signed.", fr: "Tracez le calendrier des approbations à rebours à partir de la date où l'argent doit être dépensé ou un contrat signé." } },
  { id: "GAT", name: { en: "Gating and independent review", fr: "Points de contrôle et examen indépendant" },
    intent: { en: "The project passes through defined gates with clear evidence, and high-risk projects get an independent view.", fr: "Le projet franchit des points de contrôle définis avec des éléments probants clairs, et les projets à risque élevé font l'objet d'un regard indépendant." },
    tip: { en: "Read the last gate's decision record. Were its conditions met, and who checked?", fr: "Lisez le compte rendu de la décision du dernier point de contrôle. Ses conditions ont-elles été remplies, et qui l'a vérifié?" } },
  { id: "PLN", name: { en: "Planning and baselines", fr: "Planification et données de référence" },
    intent: { en: "Scope, schedule and cost are planned in increasing detail, baselined before major spending and changed only through control.", fr: "La portée, le calendrier et les coûts sont planifiés de façon de plus en plus détaillée, établis en référence avant les dépenses importantes et modifiés seulement au moyen d'un contrôle." },
    tip: { en: "Ask a team lead what they are doing next week and find it in the schedule.", fr: "Demandez à un chef d'équipe ce qu'il fera la semaine prochaine et trouvez-le dans le calendrier." } },
  { id: "BEN", name: { en: "Benefits and outcomes", fr: "Avantages et résultats" },
    intent: { en: "Expected benefits are clearly defined, owned, measured and tracked until they are realized.", fr: "Les avantages attendus sont clairement définis, attribués à un responsable, mesurés et suivis jusqu'à leur réalisation." },
    tip: { en: "Pick one benefit and ask: what is the number today, what will it be, and who will measure it?", fr: "Choisissez un avantage et demandez : quel est le chiffre aujourd'hui, quel sera-t-il, et qui le mesurera?" } },
  { id: "RSK", name: { en: "Risks and issues", fr: "Risques et problèmes" },
    intent: { en: "Risks are identified, owned and actively managed, with contingency sized to them.", fr: "Les risques sont déterminés, attribués et gérés activement, avec une provision pour éventualités proportionnée." },
    tip: { en: "Find the top risk in the register and ask its owner what they did about it this month.", fr: "Trouvez le principal risque du registre et demandez à son responsable ce qu'il a fait à son sujet ce mois-ci." } },
  { id: "PRO", name: { en: "Procurement", fr: "Approvisionnement" },
    intent: { en: "The market is understood, the procurement strategy fits the project, and contracts are ready on time with the right terms.", fr: "Le marché est compris, la stratégie d'approvisionnement convient au projet, et les contrats sont prêts à temps avec les bonnes modalités." },
    tip: { en: "Ask the contracting authority when they first heard about the project.", fr: "Demandez à l'autorité contractante quand elle a entendu parler du projet pour la première fois." } },
  { id: "DIG", name: { en: "Digital, security, privacy and inclusion", fr: "Numérique, sécurité, vie privée et inclusion" },
    intent: { en: "The policy assessments a solution needs (architecture, security, privacy, automated decisions, accessibility, official languages, information management) are done in time to shape the design.", fr: "Les évaluations stratégiques dont une solution a besoin (architecture, sécurité, vie privée, décisions automatisées, accessibilité, langues officielles, gestion de l'information) sont faites à temps pour influencer la conception." },
    tip: { en: "Ask the privacy and security teams which design decisions they changed. If none, they were brought in too late.", fr: "Demandez aux équipes de la protection de la vie privée et de la sécurité quelles décisions de conception elles ont modifiées. Si aucune, elles ont été consultées trop tard." } },
  { id: "OCM", name: { en: "Readiness and transition", fr: "Préparation et transition" },
    intent: { en: "People, processes and the support organization are ready, and the solution is tested and handed over to a funded owner.", fr: "Les personnes, les processus et l'organisation de soutien sont prêts, et la solution est mise à l'essai et confiée à un responsable financé." },
    tip: { en: "Talk to a future user. Do they know what changes for them, and when?", fr: "Parlez à un futur utilisateur. Sait-il ce qui changera pour lui, et quand?" } },
  { id: "MON", name: { en: "Monitoring, reporting and close-out", fr: "Surveillance, rapports et clôture" },
    intent: { en: "Progress is reported honestly against tolerances, and the project closes formally with lessons learned shared.", fr: "Les progrès sont communiqués honnêtement par rapport aux tolérances, et le projet se clôt officiellement avec des leçons apprises partagées." },
    tip: { en: "Compare the last three status reports with what the team says in the hallway.", fr: "Comparez les trois derniers rapports d'étape avec ce que l'équipe dit dans les couloirs." } },
];

export const AREA_MAP = Object.fromEntries(AREAS.map((a) => [a.id, a]));

// Applicability of a requirement to this project.
export const APPLICABILITY = {
  required: { label: { en: "Required", fr: "Obligatoire" }, help: { en: "A policy obligation for this project. Evidence is expected at the gate.", fr: "Une obligation stratégique pour ce projet. Des éléments probants sont attendus au point de contrôle." } },
  recommended: { label: { en: "Recommended", fr: "Recommandé" }, help: { en: "Good practice from TBS gating guidance; gatekeepers will expect it for a project like this.", fr: "Une bonne pratique tirée de l'orientation du SCT sur les points de contrôle; les responsables s'y attendront pour un projet de ce genre." } },
  departmental: { label: { en: "Departmental", fr: "Ministériel" }, help: { en: "Provided by the department's framework or corporate functions. Reference it rather than redo it.", fr: "Fourni par le cadre ou les fonctions ministérielles. Faites-y référence plutôt que de le refaire." } },
  na: { label: { en: "Not applicable", fr: "Sans objet" }, help: { en: "Does not apply given the project's profile.", fr: "Ne s'applique pas compte tenu du profil du projet." } },
};
