// Requirements: governance, investment case, complexity and capacity,
// approvals and gating. Paraphrased from the Directive on the Management of
// Projects and Programmes, the Policy on the Planning and Management of
// Investments, the Directive on Service and Digital and TBS gating guidance.
// Not official text: check the current instruments on canada.ca.
//
// Fields: see js/data/README in the project README ("Adding or editing a requirement").

const DMPP = { en: "Directive on the Management of Projects and Programmes", fr: "Directive sur la gestion des projets et programmes" };
const PPMI = { en: "Policy on the Planning and Management of Investments", fr: "Politique sur la planification et la gestion des investissements" };
const GUIDE = { en: "A Guide to Project Gating for IT-Enabled Projects (TBS)", fr: "Guide sur le contrôle des projets de TI par points de contrôle (SCT)" };
const src = (...parts) => ({ en: parts.map((p) => p.en).join("; "), fr: parts.map((p) => p.fr).join("; ") });

export const GOVERNANCE = [
  // ---------------------------------------------------------------- GOV
  {
    id: "GOV-1", gate: "G1", revisit: ["G3", "G5", "G6"], sev: "high", base: "required",
    source: src(DMPP, { en: "project sponsor responsibilities", fr: "responsabilités du promoteur de projet" }),
    title: { en: "Accountable project sponsor named", fr: "Promoteur de projet responsable désigné" },
    summary: { en: "A senior executive is designated as project sponsor and is accountable for the project from planning to close-out, including managing risk, defining expected benefits and seeking the approvals the project needs.", fr: "Un cadre supérieur est désigné promoteur du projet et en est responsable de la planification à la clôture, y compris la gestion des risques, la définition des avantages attendus et l'obtention des approbations nécessaires." },
    look: {
      en: ["The designation of the sponsor in writing (charter, committee record or deputy head decision).", "Sponsor's attendance at governance meetings over the last quarter.", "Decisions the sponsor has personally taken or escalated."],
      fr: ["La désignation écrite du promoteur (charte, compte rendu de comité ou décision de l'administrateur général).", "La présence du promoteur aux réunions de gouvernance au cours du dernier trimestre.", "Les décisions que le promoteur a prises personnellement ou fait remonter."],
    },
    rightsize: {
      en: ["For small projects the sponsor can be a director general; what matters is authority over the budget and the business change.", "One sponsor can cover several related projects if they are run as a programme."],
      fr: ["Pour les petits projets, le promoteur peut être un directeur général; l'important est l'autorité sur le budget et le changement opérationnel.", "Un même promoteur peut couvrir plusieurs projets connexes s'ils sont gérés comme un programme."],
    },
    consequences: {
      en: ["Decisions stall or are taken by the project manager without authority.", "Nobody can stop the project when it should be stopped.", "Gatekeepers return the submission: there is no one to hold to account."],
      fr: ["Les décisions stagnent ou sont prises par le gestionnaire de projet sans en avoir le pouvoir.", "Personne ne peut arrêter le projet lorsqu'il le faudrait.", "Les responsables des points de contrôle renvoient la présentation : il n'y a personne à tenir responsable."],
    },
    mitigations: {
      en: ["Escalate to the senior designated official to have a sponsor designated before the gate.", "Record an interim sponsor with explicit, time-limited authority."],
      fr: ["Faire remonter la question au cadre supérieur désigné pour qu'un promoteur soit désigné avant le point de contrôle.", "Consigner un promoteur intérimaire disposant d'un pouvoir explicite et limité dans le temps."],
    },
    describe: { en: "{sponsor} is the designated sponsor of {project} and is accountable for it from planning to close-out. The sponsor chairs the steering committee, owns the business case and benefits, and approves submissions at each gate.", fr: "{sponsor} est le promoteur désigné de {project} et en est responsable de la planification à la clôture. Le promoteur préside le comité directeur, est responsable de l'analyse de rentabilisation et des avantages, et approuve les présentations à chaque point de contrôle." },
    questions: {
      en: ["Is a senior executive formally designated as sponsor?", "Does the sponsor control the budget and the business areas that must change?", "Does the sponsor actively take part in governance and decisions?"],
      fr: ["Un cadre supérieur est-il officiellement désigné comme promoteur?", "Le promoteur contrôle-t-il le budget et les secteurs d'activité qui doivent changer?", "Le promoteur participe-t-il activement à la gouvernance et aux décisions?"],
    },
    keywords: { en: ["sponsor", "accountable executive", "business owner", "ADM"], fr: ["promoteur", "parrain", "cadre responsable", "SMA"] },
  },
  {
    id: "GOV-2", gate: "G2", revisit: ["G4"], sev: "medium", base: "required",
    source: src(DMPP, PPMI),
    title: { en: "Governance structure with clear decision rights", fr: "Structure de gouvernance et pouvoirs décisionnels clairs" },
    summary: { en: "The project has a governance structure (for example a steering committee) with terms of reference that say who decides what, escalation paths and tolerances, proportionate to its complexity and risk.", fr: "Le projet dispose d'une structure de gouvernance (p. ex. un comité directeur) avec un mandat qui précise qui décide de quoi, les voies de remontée et les tolérances, proportionnée à sa complexité et à ses risques." },
    look: {
      en: ["Terms of reference for the steering committee or project board.", "Records of decisions from recent meetings.", "Tolerances for cost, schedule and scope, and what happens when they are exceeded."],
      fr: ["Le mandat du comité directeur ou du conseil de projet.", "Les comptes rendus de décisions des dernières réunions.", "Les tolérances en matière de coûts, de calendrier et de portée, et ce qui se passe lorsqu'elles sont dépassées."],
    },
    rightsize: {
      en: ["Use an existing directors' or DG committee rather than creating a new one for a small project.", "Combine governance with a programme board when several projects share stakeholders."],
      fr: ["Utiliser un comité existant de directeurs ou de DG plutôt que d'en créer un pour un petit projet.", "Combiner la gouvernance avec un conseil de programme lorsque plusieurs projets ont les mêmes intervenants."],
    },
    consequences: {
      en: ["Unclear authority leads to scope creep and decisions revisited at every meeting.", "Issues reach senior management too late to fix cheaply."],
      fr: ["Un pouvoir mal défini entraîne une dérive de la portée et des décisions remises en question à chaque réunion.", "Les problèmes parviennent à la haute direction trop tard pour être réglés à peu de frais."],
    },
    mitigations: {
      en: ["Adopt the department's standard terms of reference and set tolerances at the next meeting.", "Keep a decision log and circulate it within two days of each meeting."],
      fr: ["Adopter le mandat type du ministère et fixer les tolérances à la prochaine réunion.", "Tenir un registre des décisions et le diffuser dans les deux jours suivant chaque réunion."],
    },
    describe: { en: "{project} is governed by a steering committee chaired by {sponsor}, under terms of reference that set decision rights, escalation paths and tolerances for cost, schedule and scope. Decisions are recorded and tracked.", fr: "{project} est régi par un comité directeur présidé par {sponsor}, selon un mandat qui établit les pouvoirs décisionnels, les voies de remontée et les tolérances en matière de coûts, de calendrier et de portée. Les décisions sont consignées et suivies." },
    questions: {
      en: ["Is there a governance body with approved terms of reference?", "Are tolerances and escalation paths defined?", "Are decisions recorded and followed up?"],
      fr: ["Existe-t-il un organe de gouvernance dont le mandat est approuvé?", "Les tolérances et les voies de remontée sont-elles définies?", "Les décisions sont-elles consignées et suivies?"],
    },
    keywords: { en: ["steering committee", "governance", "terms of reference", "project board", "tolerance*"], fr: ["comité directeur", "gouvernance", "mandat", "conseil de projet", "tolérance*"] },
  },
  {
    id: "GOV-3", gate: "G1", sev: "medium", base: "departmental",
    source: src(DMPP, { en: "senior designated official responsibilities", fr: "responsabilités du cadre supérieur désigné" }),
    title: { en: "Departmental project management framework applied", fr: "Cadre ministériel de gestion de projet appliqué" },
    summary: { en: "The senior designated official maintains a department-wide framework for managing projects and programmes: the gates each project passes, the evidence each gate requires and how gate decisions are documented. The project follows it.", fr: "Le cadre supérieur désigné tient à jour un cadre ministériel de gestion des projets et programmes : les points de contrôle que chaque projet franchit, les éléments probants exigés à chacun et la façon de consigner les décisions. Le projet s'y conforme." },
    look: {
      en: ["The departmental framework and its gating standard.", "The project's registration with the departmental project management office.", "Any approved tailoring of the framework for this project."],
      fr: ["Le cadre ministériel et sa norme sur les points de contrôle.", "L'inscription du projet auprès du bureau ministériel de gestion de projet.", "Toute adaptation approuvée du cadre pour ce projet."],
    },
    rightsize: {
      en: ["Reference the framework instead of rewriting it in project documents.", "Ask the PMO for the lightest track the framework allows for the project's PCRA level."],
      fr: ["Faire référence au cadre plutôt que de le récrire dans les documents du projet.", "Demander au BGP la voie la plus légère que permet le cadre pour le niveau d'ECRP du projet."],
    },
    consequences: {
      en: ["The project is surprised by gate requirements late in its life.", "Portfolio reporting to senior management misses the project."],
      fr: ["Le projet découvre tard les exigences des points de contrôle.", "Les rapports sur le portefeuille présentés à la haute direction omettent le projet."],
    },
    mitigations: {
      en: ["Register the project with the PMO now and map completed work to the framework's gates."],
      fr: ["Inscrire le projet auprès du BGP dès maintenant et associer les travaux réalisés aux points de contrôle du cadre."],
    },
    describe: { en: "{project} is registered with the {dept} project management office and follows the departmental project management framework, including its gating standard, evidence requirements and decision records.", fr: "{project} est inscrit auprès du bureau de gestion de projet de {dept} et suit le cadre ministériel de gestion de projet, y compris sa norme sur les points de contrôle, ses exigences en matière d'éléments probants et ses comptes rendus de décision." },
    questions: {
      en: ["Is the project registered with the departmental project management office?", "Does the project follow the departmental gating standard?"],
      fr: ["Le projet est-il inscrit auprès du bureau ministériel de gestion de projet?", "Le projet suit-il la norme ministérielle sur les points de contrôle?"],
    },
    keywords: { en: ["project management framework", "PMO", "project management office", "gating standard"], fr: ["cadre de gestion de projet", "BGP", "bureau de gestion de projet", "norme sur les points de contrôle"] },
  },
  {
    id: "GOV-4", gate: "G1", revisit: ["G2", "G3", "G4", "G5", "G6", "G7"], sev: "medium", base: "required",
    source: src(DMPP, { en: "documenting gate decisions", fr: "consignation des décisions aux points de contrôle" }),
    title: { en: "Gate decisions documented", fr: "Décisions aux points de contrôle consignées" },
    summary: { en: "Each gate decision is recorded with the evidence considered, the decision taken, any conditions and who made it, as the departmental framework requires.", fr: "Chaque décision à un point de contrôle est consignée avec les éléments probants examinés, la décision prise, les conditions éventuelles et son auteur, comme l'exige le cadre ministériel." },
    look: {
      en: ["Signed gate decision records for each gate passed.", "The list of conditions attached to past decisions and their status."],
      fr: ["Les comptes rendus signés des décisions pour chaque point de contrôle franchi.", "La liste des conditions associées aux décisions antérieures et leur état."],
    },
    rightsize: {
      en: ["A one-page decision record is enough; this tool's report includes a draft.", "Record the decision in the governance committee's minutes if the framework allows."],
      fr: ["Un compte rendu de décision d'une page suffit; le rapport de cet outil en comprend une ébauche.", "Consigner la décision dans le procès-verbal du comité de gouvernance si le cadre le permet."],
    },
    consequences: {
      en: ["Auditors and Treasury Board cannot see that gates were actually passed.", "Conditions are forgotten and resurface as problems later."],
      fr: ["Les vérificateurs et le Conseil du Trésor ne peuvent pas constater que les points de contrôle ont réellement été franchis.", "Les conditions sont oubliées et refont surface plus tard sous forme de problèmes."],
    },
    mitigations: {
      en: ["Reconstruct records of past gates from minutes and have the sponsor confirm them."],
      fr: ["Reconstituer les comptes rendus des points de contrôle antérieurs à partir des procès-verbaux et les faire confirmer par le promoteur."],
    },
    describe: { en: "Gate decisions for {project} are recorded in a decision record that lists the evidence reviewed, the decision, the conditions and the approver. Conditions are tracked to closure by the project management office.", fr: "Les décisions aux points de contrôle de {project} sont consignées dans un compte rendu qui énumère les éléments probants examinés, la décision, les conditions et l'approbateur. Le bureau de gestion de projet assure le suivi des conditions jusqu'à leur levée." },
    questions: {
      en: ["Is every gate passed so far supported by a documented decision?", "Are conditions from earlier gates tracked to closure?"],
      fr: ["Chaque point de contrôle franchi jusqu'ici est-il appuyé par une décision consignée?", "Les conditions des points de contrôle antérieurs sont-elles suivies jusqu'à leur levée?"],
    },
    keywords: { en: ["gate decision", "decision record", "record of decision", "conditions"], fr: ["décision au point de contrôle", "compte rendu de décision", "conditions"] },
  },
  {
    id: "GOV-5", gate: "G4", sev: "medium", base: "required",
    source: src(DMPP, { en: "project management competencies", fr: "compétences en gestion de projet" }),
    title: { en: "Qualified project manager and core team", fr: "Gestionnaire de projet et équipe de base qualifiés" },
    summary: { en: "The project manager and key team members have the competencies the project's complexity calls for, consistent with the department's approach to project management capacity.", fr: "Le gestionnaire de projet et les principaux membres de l'équipe possèdent les compétences qu'exige la complexité du projet, conformément à l'approche du ministère en matière de capacité de gestion de projet." },
    look: {
      en: ["The project manager's experience with projects of this size and type.", "The org chart, with names, not vacancies, for key roles.", "Training or certification plans for gaps."],
      fr: ["L'expérience du gestionnaire de projet avec des projets de cette taille et de ce type.", "L'organigramme, avec des noms et non des postes vacants, pour les rôles clés.", "Les plans de formation ou de certification pour combler les lacunes."],
    },
    rightsize: {
      en: ["Pair a less experienced PM with a mentor from the PMO rather than delaying the project."],
      fr: ["Jumeler un GP moins expérimenté avec un mentor du BGP plutôt que de retarder le projet."],
    },
    consequences: {
      en: ["A PM out of their depth misses early warning signs.", "Key roles left vacant become schedule risks."],
      fr: ["Un GP dépassé ne voit pas les signes avant-coureurs.", "Les rôles clés laissés vacants deviennent des risques pour le calendrier."],
    },
    mitigations: {
      en: ["Add an experienced deputy PM or project control officer.", "Record the gap in the risk register with a staffing plan."],
      fr: ["Ajouter un GP adjoint expérimenté ou un agent de contrôle de projet.", "Consigner la lacune dans le registre des risques avec un plan de dotation."],
    },
    describe: { en: "{project} is managed by a project manager with experience in projects of comparable complexity. Key roles are staffed, and remaining skill gaps are addressed by a staffing and training plan tracked by the steering committee.", fr: "{project} est géré par un gestionnaire de projet ayant de l'expérience dans des projets de complexité comparable. Les rôles clés sont pourvus, et les lacunes restantes en matière de compétences sont comblées par un plan de dotation et de formation suivi par le comité directeur." },
    questions: {
      en: ["Does the project manager have experience with a project of comparable complexity?", "Are key roles filled by named people?"],
      fr: ["Le gestionnaire de projet a-t-il de l'expérience avec un projet de complexité comparable?", "Les rôles clés sont-ils occupés par des personnes nommément désignées?"],
    },
    keywords: { en: ["project manager", "team", "staffing", "resourcing", "competenc*"], fr: ["gestionnaire de projet", "équipe", "dotation", "ressources", "compétence*"] },
  },
  {
    id: "GOV-6", gate: "G2", sev: "medium", base: "required",
    source: src(DMPP, { en: "consulting internal enabling functions", fr: "consultation des fonctions habilitantes internes" }),
    title: { en: "Enabling functions engaged early", fr: "Fonctions habilitantes consultées tôt" },
    summary: { en: "Procurement, finance, IT, security, privacy, real property, human resources and communications are consulted early enough to shape the approach, not just to approve it.", fr: "L'approvisionnement, les finances, la TI, la sécurité, la protection de la vie privée, les biens immobiliers, les ressources humaines et les communications sont consultés assez tôt pour influencer l'approche, et non seulement pour l'approuver." },
    look: {
      en: ["A list of enabling functions consulted, with dates and what changed as a result.", "Named contacts in each function."],
      fr: ["Une liste des fonctions habilitantes consultées, avec les dates et ce qui a changé en conséquence.", "Des personnes-ressources désignées dans chaque fonction."],
    },
    rightsize: {
      en: ["Use one integrated review session with all functions instead of separate meetings."],
      fr: ["Tenir une séance d'examen intégrée avec toutes les fonctions plutôt que des réunions distinctes."],
    },
    consequences: {
      en: ["Late objections from security, privacy or procurement force redesign.", "Approvals are sequenced badly and the schedule slips."],
      fr: ["Des objections tardives de la sécurité, de la protection de la vie privée ou de l'approvisionnement forcent une nouvelle conception.", "Les approbations sont mal ordonnancées et le calendrier glisse."],
    },
    mitigations: {
      en: ["Hold an integrated review before the next gate and record the issues raised."],
      fr: ["Tenir un examen intégré avant le prochain point de contrôle et consigner les questions soulevées."],
    },
    describe: { en: "Enabling functions (procurement, finance, IT, security, privacy and human resources) were engaged during approach development for {project}. Their advice is recorded and reflected in the approach.", fr: "Les fonctions habilitantes (approvisionnement, finances, TI, sécurité, protection de la vie privée et ressources humaines) ont été consultées lors de l'élaboration de l'approche de {project}. Leurs conseils sont consignés et intégrés à l'approche." },
    questions: {
      en: ["Have procurement, finance, IT, security and privacy been consulted?", "Did their advice change the approach where needed?"],
      fr: ["L'approvisionnement, les finances, la TI, la sécurité et la protection de la vie privée ont-ils été consultés?", "Leurs conseils ont-ils modifié l'approche au besoin?"],
    },
    keywords: { en: ["consulted", "consultation", "enabling functions", "internal services"], fr: ["consulté*", "consultation", "fonctions habilitantes", "services internes"] },
  },

  // ---------------------------------------------------------------- INV
  {
    id: "INV-1", gate: "G1", revisit: ["G3"], sev: "high", base: "required",
    source: src(PPMI, GUIDE),
    title: { en: "Problem and outcomes defined", fr: "Problème et résultats définis" },
    summary: { en: "The business problem or opportunity is stated independently of any solution, along with the outcomes sought and how they contribute to the department's results.", fr: "Le problème ou la possibilité opérationnelle est énoncé indépendamment de toute solution, avec les résultats recherchés et leur contribution aux résultats du ministère." },
    look: {
      en: ["A problem statement that does not name a solution.", "The link to the Departmental Results Framework or program outcomes.", "Evidence of the problem: data, complaints, audit findings, service performance."],
      fr: ["Un énoncé du problème qui ne nomme pas de solution.", "Le lien avec le Cadre ministériel des résultats ou les résultats du programme.", "Des preuves du problème : données, plaintes, constatations de vérification, rendement des services."],
    },
    rightsize: {
      en: ["A one-page concept note is enough at Gate 1; detail comes in the business case."],
      fr: ["Une note conceptuelle d'une page suffit au point de contrôle 1; les détails viennent dans l'analyse de rentabilisation."],
    },
    consequences: {
      en: ["The project delivers a solution nobody needed, or solves the wrong problem.", "Benefits cannot be measured because the starting point was never defined."],
      fr: ["Le projet livre une solution dont personne n'avait besoin, ou résout le mauvais problème.", "Les avantages ne peuvent être mesurés parce que le point de départ n'a jamais été défini."],
    },
    mitigations: {
      en: ["Run a short discovery with users to rewrite the problem statement before the next gate."],
      fr: ["Mener une courte exploration avec les utilisateurs pour récrire l'énoncé du problème avant le prochain point de contrôle."],
    },
    describe: { en: "{project} addresses the following problem: {description} The expected outcomes contribute to {dept}'s departmental results.", fr: "{project} répond au problème suivant : {description} Les résultats attendus contribuent aux résultats ministériels de {dept}." },
    questions: {
      en: ["Is the problem or opportunity described without presupposing a solution?", "Are the outcomes linked to departmental results?", "Is there evidence that the problem is real and significant?"],
      fr: ["Le problème ou la possibilité est-il décrit sans présupposer de solution?", "Les résultats sont-ils liés aux résultats ministériels?", "Existe-t-il des preuves que le problème est réel et important?"],
    },
    keywords: { en: ["problem statement", "opportunity", "outcome*", "departmental results", "concept"], fr: ["énoncé du problème", "possibilité", "résultat*", "résultats ministériels", "concept"] },
  },
  {
    id: "INV-2", gate: "G1", sev: "medium", base: "required",
    source: src(PPMI, { en: "departmental investment plan", fr: "plan d'investissement ministériel" }),
    title: { en: "Aligned with the departmental investment plan", fr: "Harmonisé avec le plan d'investissement ministériel" },
    summary: { en: "The project is identified in, or consistent with, the department's investment plan and priorities, so it competes for resources openly.", fr: "Le projet figure dans le plan d'investissement du ministère ou y est conforme, ainsi que dans ses priorités, de sorte qu'il est en concurrence ouverte pour les ressources." },
    look: {
      en: ["The entry for the project in the departmental investment plan.", "The investment committee's ranking or prioritization."],
      fr: ["L'inscription du projet dans le plan d'investissement ministériel.", "Le classement ou l'établissement des priorités par le comité des investissements."],
    },
    rightsize: {
      en: ["Small projects can be covered by a program-level line in the investment plan."],
      fr: ["Les petits projets peuvent être couverts par une ligne de programme dans le plan d'investissement."],
    },
    consequences: {
      en: ["Funding is pulled mid-project for planned priorities.", "The investment committee refuses the business case at Gate 3."],
      fr: ["Le financement est retiré en cours de projet au profit des priorités planifiées.", "Le comité des investissements refuse l'analyse de rentabilisation au point de contrôle 3."],
    },
    mitigations: {
      en: ["Bring the project to the next investment plan update."],
      fr: ["Présenter le projet lors de la prochaine mise à jour du plan d'investissement."],
    },
    describe: { en: "{project} is included in the {dept} investment plan and has been prioritized by the departmental investment committee.", fr: "{project} figure dans le plan d'investissement de {dept} et a été priorisé par le comité ministériel des investissements." },
    questions: {
      en: ["Is the project in the departmental investment plan?", "Has the investment committee prioritized it?"],
      fr: ["Le projet figure-t-il dans le plan d'investissement ministériel?", "Le comité des investissements l'a-t-il priorisé?"],
    },
    keywords: { en: ["investment plan", "investment committee", "priorit*", "portfolio"], fr: ["plan d'investissement", "comité des investissements", "priorit*", "portefeuille"] },
  },
  {
    id: "INV-3", gate: "G2", sev: "high", base: "required",
    source: src(GUIDE, { en: "Treasury Board submission guidance", fr: "orientation sur les présentations au Conseil du Trésor" }),
    title: { en: "Options analysis", fr: "Analyse des options" },
    summary: { en: "Realistic options, including the status quo or a do-minimum option, are compared on cost, benefits, risk and fit, and the preferred approach is justified.", fr: "Des options réalistes, y compris le statu quo ou une option minimale, sont comparées sur les plans du coût, des avantages, du risque et de l'adéquation, et l'approche privilégiée est justifiée." },
    look: {
      en: ["An options analysis with at least three genuine options.", "The criteria and weights used, agreed before scoring.", "Evidence that reuse of existing GC solutions was considered."],
      fr: ["Une analyse d'au moins trois options véritables.", "Les critères et les pondérations utilisés, convenus avant la cotation.", "La preuve que la réutilisation de solutions existantes du GC a été envisagée."],
    },
    rightsize: {
      en: ["For a light-gated project, a one-page comparison table is enough.", "Reusing an existing enterprise solution can make most options moot; document why."],
      fr: ["Pour un projet à points de contrôle allégés, un tableau comparatif d'une page suffit.", "La réutilisation d'une solution ministérielle existante peut rendre la plupart des options sans objet; documentez pourquoi."],
    },
    consequences: {
      en: ["Treasury Board and central agencies challenge the submission as solution-driven.", "A cheaper or lower-risk option is missed."],
      fr: ["Le Conseil du Trésor et les organismes centraux contestent la présentation comme étant axée sur une solution.", "Une option moins chère ou moins risquée est négligée."],
    },
    mitigations: {
      en: ["Have someone outside the team build the strongest case for the second-best option."],
      fr: ["Demander à une personne de l'extérieur de l'équipe de défendre le mieux possible la deuxième meilleure option."],
    },
    describe: { en: "Options for {project}, including the status quo, were compared against criteria agreed in advance (cost, benefits, risk and fit). The preferred option is justified in the options analysis.", fr: "Les options pour {project}, y compris le statu quo, ont été comparées selon des critères convenus à l'avance (coût, avantages, risque et adéquation). L'option privilégiée est justifiée dans l'analyse des options." },
    questions: {
      en: ["Were at least three realistic options compared, including the status quo?", "Were criteria agreed before options were scored?", "Was reuse of existing GC solutions considered?"],
      fr: ["Au moins trois options réalistes, y compris le statu quo, ont-elles été comparées?", "Les critères ont-ils été convenus avant la cotation des options?", "La réutilisation de solutions existantes du GC a-t-elle été envisagée?"],
    },
    keywords: { en: ["options analysis", "option*", "status quo", "alternatives", "do nothing"], fr: ["analyse des options", "option*", "statu quo", "solutions de rechange"] },
  },
  {
    id: "INV-4", gate: "G3", sev: "high", base: "required",
    source: src(PPMI, GUIDE),
    title: { en: "Business case approved", fr: "Analyse de rentabilisation approuvée" },
    summary: { en: "A business case sets out the recommended option, its costs, benefits, risks, schedule, funding and the organization's readiness, and is approved by the sponsor and the departmental investment authority.", fr: "Une analyse de rentabilisation présente l'option recommandée, ses coûts, ses avantages, ses risques, son calendrier, son financement et l'état de préparation de l'organisation, et est approuvée par le promoteur et l'instance ministérielle des investissements." },
    look: {
      en: ["The approved business case and the approval record.", "Consistency between the business case, the PCRA and the cost estimate."],
      fr: ["L'analyse de rentabilisation approuvée et le compte rendu d'approbation.", "La cohérence entre l'analyse de rentabilisation, l'ECRP et l'estimation des coûts."],
    },
    rightsize: {
      en: ["Use the department's short-form business case template for low-risk projects."],
      fr: ["Utiliser le gabarit abrégé d'analyse de rentabilisation du ministère pour les projets à faible risque."],
    },
    consequences: {
      en: ["Gate 3 cannot be passed; Treasury Board will not consider a submission without it.", "The project proceeds without an agreed definition of success."],
      fr: ["Le point de contrôle 3 ne peut être franchi; le Conseil du Trésor n'examinera pas une présentation sans elle.", "Le projet avance sans définition convenue du succès."],
    },
    mitigations: {
      en: ["Seek approval for a funded business-case development phase only, not the whole project."],
      fr: ["Demander l'approbation pour une phase financée d'élaboration de l'analyse de rentabilisation seulement, et non pour tout le projet."],
    },
    describe: { en: "The business case for {project} was approved by {sponsor} and the departmental investment committee. It sets out the recommended option, life-cycle costs, benefits, risks, schedule and funding.", fr: "L'analyse de rentabilisation de {project} a été approuvée par {sponsor} et le comité ministériel des investissements. Elle présente l'option recommandée, les coûts sur le cycle de vie, les avantages, les risques, le calendrier et le financement." },
    questions: {
      en: ["Is there a business case covering options, costs, benefits, risks and funding?", "Has it been approved by the sponsor and the departmental investment authority?"],
      fr: ["Existe-t-il une analyse de rentabilisation portant sur les options, les coûts, les avantages, les risques et le financement?", "A-t-elle été approuvée par le promoteur et l'instance ministérielle des investissements?"],
    },
    keywords: { en: ["business case", "investment proposal", "recommended option", "value for money"], fr: ["analyse de rentabilisation", "proposition d'investissement", "option recommandée", "optimisation des ressources"] },
  },
  {
    id: "INV-5", gate: "G3", sev: "high", base: "required",
    source: src(PPMI, { en: "CFO attestation for Treasury Board submissions", fr: "attestation du DPF pour les présentations au Conseil du Trésor" }),
    title: { en: "Funding source confirmed", fr: "Source de financement confirmée" },
    summary: { en: "The funding source for the whole project is identified and confirmed by the chief financial officer: existing reference levels, internal reallocation or new funding through the Budget and a Treasury Board submission.", fr: "La source de financement de l'ensemble du projet est déterminée et confirmée par le dirigeant principal des finances : niveaux de référence existants, réaffectation interne ou nouveaux fonds par le budget et une présentation au Conseil du Trésor." },
    look: {
      en: ["A funding letter or CFO confirmation.", "The funding profile by fiscal year, compared with the spending plan."],
      fr: ["Une lettre de financement ou une confirmation du DPF.", "Le profil de financement par exercice, comparé au plan de dépenses."],
    },
    rightsize: {
      en: ["Phase funding to gates: confirm funding to the next gate, with a plan for the rest."],
      fr: ["Échelonner le financement selon les points de contrôle : confirmer le financement jusqu'au prochain point de contrôle, avec un plan pour le reste."],
    },
    consequences: {
      en: ["Work stops mid-year when money runs out.", "Contracts cannot be awarded without funds certified under section 32 of the Financial Administration Act."],
      fr: ["Les travaux s'arrêtent en cours d'exercice lorsque l'argent manque.", "Les contrats ne peuvent être attribués sans fonds certifiés en vertu de l'article 32 de la Loi sur la gestion des finances publiques."],
    },
    mitigations: {
      en: ["Re-scope to what funding allows and defer the rest to a later release."],
      fr: ["Redéfinir la portée selon le financement disponible et reporter le reste à une version ultérieure."],
    },
    describe: { en: "Funding for {project} is confirmed by the chief financial officer of {dept}, with a profile by fiscal year that matches the spending plan.", fr: "Le financement de {project} est confirmé par le dirigeant principal des finances de {dept}, avec un profil par exercice qui correspond au plan de dépenses." },
    questions: {
      en: ["Is the source of funding identified for the whole project?", "Has the CFO confirmed the funding?", "Does the funding profile by year match the spending plan?"],
      fr: ["La source de financement est-elle déterminée pour l'ensemble du projet?", "Le DPF a-t-il confirmé le financement?", "Le profil de financement annuel correspond-il au plan de dépenses?"],
    },
    keywords: { en: ["funding", "reference levels", "reallocation", "Budget", "CFO", "chief financial officer"], fr: ["financement", "niveaux de référence", "réaffectation", "budget", "DPF", "dirigeant principal des finances"] },
  },
  {
    id: "INV-6", gate: "G3", revisit: ["G5"], sev: "high", base: "required",
    source: src({ en: "Guide to Cost Estimating; Guide to Costing (TBS)", fr: "Guide de l'estimation des coûts; Guide d'établissement des coûts (SCT)" }, PPMI),
    title: { en: "Full life-cycle cost estimate", fr: "Estimation des coûts sur tout le cycle de vie" },
    summary: { en: "Costs are estimated over the asset's whole life, including ongoing operations, support, licences, refresh and decommissioning, with the estimate's class and assumptions stated and reviewed by the CFO.", fr: "Les coûts sont estimés sur toute la durée de vie de l'actif, y compris l'exploitation, le soutien, les licences, le renouvellement et la mise hors service, avec la catégorie et les hypothèses de l'estimation énoncées et examinées par le DPF." },
    look: {
      en: ["The costing model, including ongoing (post-project) costs.", "The estimate class (indicative or substantive) and its accuracy range.", "Evidence of CFO review."],
      fr: ["Le modèle d'établissement des coûts, y compris les coûts continus (après le projet).", "La catégorie de l'estimation (indicative ou fondée) et sa fourchette d'exactitude.", "La preuve de l'examen par le DPF."],
    },
    rightsize: {
      en: ["SaaS options shift capital to operating costs; make sure ongoing funding exists rather than hiding it."],
      fr: ["Les options de logiciel-service transfèrent les coûts en capital vers les coûts de fonctionnement; assurez-vous que le financement continu existe plutôt que de le dissimuler."],
    },
    consequences: {
      en: ["The system goes live with no money to run it.", "Treasury Board analysts reject the costing."],
      fr: ["Le système est mis en service sans argent pour l'exploiter.", "Les analystes du Conseil du Trésor rejettent l'établissement des coûts."],
    },
    mitigations: {
      en: ["Ask the CFO's costing centre of expertise for a challenge review before the gate."],
      fr: ["Demander au centre d'expertise en établissement des coûts du DPF un examen critique avant le point de contrôle."],
    },
    describe: { en: "The cost estimate for {project} covers the full life cycle, including ongoing operations and support. Its class, accuracy range and assumptions are documented, and it was reviewed by the office of the chief financial officer.", fr: "L'estimation des coûts de {project} couvre tout le cycle de vie, y compris l'exploitation et le soutien continus. Sa catégorie, sa fourchette d'exactitude et ses hypothèses sont documentées, et elle a été examinée par le bureau du dirigeant principal des finances." },
    questions: {
      en: ["Does the estimate include ongoing costs after the project ends?", "Are the estimate class and accuracy range stated?", "Has the CFO's office reviewed the estimate?"],
      fr: ["L'estimation comprend-elle les coûts continus après la fin du projet?", "La catégorie et la fourchette d'exactitude de l'estimation sont-elles indiquées?", "Le bureau du DPF a-t-il examiné l'estimation?"],
    },
    keywords: { en: ["cost estimate", "life-cycle cost*", "total cost of ownership", "ongoing costs", "indicative estimate", "substantive estimate"], fr: ["estimation des coûts", "coûts sur le cycle de vie", "coût total de possession", "coûts continus", "estimation indicative", "estimation fondée"] },
  },
  {
    id: "INV-7", gate: "G3", sev: "medium", base: "required",
    source: { en: "Gender-based Analysis Plus (GBA Plus) for Memoranda to Cabinet and Treasury Board submissions", fr: "Analyse comparative entre les sexes plus (ACS Plus) pour les mémoires au Cabinet et les présentations au Conseil du Trésor" },
    title: { en: "GBA Plus completed", fr: "ACS Plus réalisée" },
    summary: { en: "Gender-based Analysis Plus considers how different groups of people are affected by the project and its service, and is required for Cabinet and Treasury Board documents.", fr: "L'analyse comparative entre les sexes plus examine comment différents groupes de personnes sont touchés par le projet et son service, et est exigée pour les documents destinés au Cabinet et au Conseil du Trésor." },
    look: {
      en: ["The GBA Plus analysis and the departmental GBA Plus centre's review.", "Design changes that came out of it."],
      fr: ["L'analyse ACS Plus et l'examen du centre ministériel de responsabilité de l'ACS Plus.", "Les changements de conception qui en ont découlé."],
    },
    rightsize: {
      en: ["Reuse the program's existing GBA Plus and focus on what the project changes."],
      fr: ["Réutiliser l'ACS Plus existante du programme et se concentrer sur ce que le projet change."],
    },
    consequences: {
      en: ["The submission is returned by central agencies.", "The service excludes or disadvantages groups of users."],
      fr: ["La présentation est renvoyée par les organismes centraux.", "Le service exclut ou désavantage des groupes d'utilisateurs."],
    },
    mitigations: {
      en: ["Engage the departmental GBA Plus centre now; include user research with diverse users."],
      fr: ["Consulter dès maintenant le centre ministériel de l'ACS Plus; inclure des recherches auprès d'utilisateurs diversifiés."],
    },
    describe: { en: "A GBA Plus analysis of {project} was completed and reviewed by the {dept} GBA Plus centre. Its findings are reflected in the design and in the benefits measures.", fr: "Une ACS Plus de {project} a été réalisée et examinée par le centre de l'ACS Plus de {dept}. Ses constatations sont intégrées à la conception et aux mesures des avantages." },
    questions: {
      en: ["Has a GBA Plus analysis been completed?", "Have its findings been reflected in the design?"],
      fr: ["Une ACS Plus a-t-elle été réalisée?", "Ses constatations ont-elles été intégrées à la conception?"],
    },
    keywords: { en: ["GBA Plus", "GBA+", "gender-based analysis", "diverse groups"], fr: ["ACS Plus", "ACS+", "analyse comparative entre les sexes", "groupes diversifiés"] },
    scope: [
      { when: { tb: "no", newFunding: "no" }, status: "recommended", reason: { en: "No Treasury Board submission or Memorandum to Cabinet is expected, so GBA Plus is good practice rather than a submission requirement.", fr: "Aucune présentation au Conseil du Trésor ni aucun mémoire au Cabinet n'est prévu; l'ACS Plus est donc une bonne pratique plutôt qu'une exigence de présentation." } },
    ],
  },

  // ---------------------------------------------------------------- CAP
  {
    id: "CAP-1", gate: "G2", revisit: ["G3", "G5"], sev: "high", base: "required",
    source: src(DMPP, { en: "mandatory procedures for project complexity and risk assessment", fr: "procédures obligatoires pour l'évaluation de la complexité et des risques des projets" }),
    title: { en: "Project Complexity and Risk Assessment (PCRA) completed", fr: "Évaluation de la complexité et des risques du projet (ECRP) réalisée" },
    summary: { en: "The PCRA is completed with the official TBS tool, approved within the department and updated when the project changes materially. Its level (1 Sustaining to 4 Transformational) drives approval authority and the level of oversight.", fr: "L'ECRP est réalisée avec l'outil officiel du SCT, approuvée au sein du ministère et mise à jour lorsque le projet change de façon importante. Son niveau (1 Maintien à 4 Transformation) détermine le pouvoir d'approbation et le niveau de surveillance." },
    look: {
      en: ["The completed PCRA workbook and its approval.", "Who scored it, and whether the PMO challenged the scoring.", "The date of the last update compared with major project changes."],
      fr: ["Le classeur de l'ECRP rempli et son approbation.", "Qui l'a coté, et si le BGP a remis en question la cotation.", "La date de la dernière mise à jour comparée aux changements importants du projet."],
    },
    rightsize: {
      en: ["Reducing real complexity (smaller releases, fewer integrations, proven technology) lowers the PCRA honestly; scoring it lower does not."],
      fr: ["Réduire la complexité réelle (versions plus petites, moins d'intégrations, technologie éprouvée) abaisse honnêtement l'ECRP; la coter plus bas ne le fait pas."],
    },
    consequences: {
      en: ["The project may be approved by the wrong authority, exposing the department to audit findings.", "Treasury Board may reassess the project and require approval late in the process."],
      fr: ["Le projet peut être approuvé par la mauvaise autorité, ce qui expose le ministère à des constatations de vérification.", "Le Conseil du Trésor peut réévaluer le projet et exiger son approbation tard dans le processus."],
    },
    mitigations: {
      en: ["Complete the PCRA with the PMO before the next gate; use this tool's indicative estimate in the meantime."],
      fr: ["Réaliser l'ECRP avec le BGP avant le prochain point de contrôle; utiliser l'estimation indicative de cet outil entre-temps."],
    },
    describe: { en: "A Project Complexity and Risk Assessment of {project} was completed with the TBS tool and approved by the department. The project is assessed at level {pcra}. The assessment is updated at each major gate and whenever scope, cost or approach changes materially.", fr: "Une évaluation de la complexité et des risques de {project} a été réalisée avec l'outil du SCT et approuvée par le ministère. Le projet est évalué au niveau {pcra}. L'évaluation est mise à jour à chaque point de contrôle important et chaque fois que la portée, le coût ou l'approche change de façon importante." },
    questions: {
      en: ["Has the PCRA been completed with the official TBS tool?", "Has it been reviewed and approved within the department?", "Has it been updated since the last major change to the project?"],
      fr: ["L'ECRP a-t-elle été réalisée avec l'outil officiel du SCT?", "A-t-elle été examinée et approuvée au sein du ministère?", "A-t-elle été mise à jour depuis le dernier changement important au projet?"],
    },
    keywords: { en: ["PCRA", "complexity and risk", "sustaining", "tactical", "evolutionary", "transformational"], fr: ["ECRP", "complexité et des risques", "maintien", "tactique", "évolution", "transformation*"] },
  },
  {
    id: "CAP-2", gate: "G2", sev: "medium", base: "departmental",
    source: src(DMPP, { en: "mandatory procedures for organizational project management capacity assessments", fr: "procédures obligatoires pour l'évaluation de la capacité organisationnelle de gestion de projets" }),
    title: { en: "Current departmental capacity class (OPMCA)", fr: "Catégorie de capacité ministérielle (ECOGP) à jour" },
    summary: { en: "The department has an Organizational Project Management Capacity Assessment approved within the last three years. Its class sets how complex a project the department may approve on its own.", fr: "Le ministère dispose d'une évaluation de la capacité organisationnelle de gestion de projets approuvée au cours des trois dernières années. Sa catégorie détermine le degré de complexité des projets que le ministère peut approuver lui-même." },
    look: {
      en: ["The department's approved OPMCA class and its date.", "The project approval limit that applies to the department."],
      fr: ["La catégorie d'ECOGP approuvée du ministère et sa date.", "La limite d'approbation des projets qui s'applique au ministère."],
    },
    rightsize: {
      en: ["Nothing to produce at project level: cite the departmental assessment."],
      fr: ["Rien à produire à l'échelle du projet : citer l'évaluation ministérielle."],
    },
    consequences: {
      en: ["Without an approved class, every project over $2.5M needs Treasury Board approval."],
      fr: ["Sans catégorie approuvée, tout projet de plus de 2,5 M$ doit être approuvé par le Conseil du Trésor."],
    },
    mitigations: {
      en: ["Ask the senior designated official when the OPMCA will be refreshed; plan for Treasury Board approval until then."],
      fr: ["Demander au cadre supérieur désigné quand l'ECOGP sera mise à jour; prévoir l'approbation du Conseil du Trésor d'ici là."],
    },
    describe: { en: "{dept} holds an approved Organizational Project Management Capacity Assessment, which sets the department's project approval authority applied to {project}.", fr: "{dept} dispose d'une évaluation approuvée de la capacité organisationnelle de gestion de projets, qui établit le pouvoir d'approbation des projets du ministère appliqué à {project}." },
    questions: {
      en: ["Does the department have an OPMCA class approved within the last three years?", "Is the project approval limit that applies to the department known?"],
      fr: ["Le ministère a-t-il une catégorie d'ECOGP approuvée au cours des trois dernières années?", "La limite d'approbation des projets qui s'applique au ministère est-elle connue?"],
    },
    keywords: { en: ["OPMCA", "capacity assessment", "capacity class", "approval limit"], fr: ["ECOGP", "évaluation de la capacité", "catégorie de capacité", "limite d'approbation"] },
  },
  {
    id: "CAP-3", gate: "G2", revisit: ["G3"], sev: "high", base: "required",
    source: src(DMPP, { en: "project approval limits", fr: "limites d'approbation des projets" }),
    title: { en: "Approval authority determined", fr: "Pouvoir d'approbation déterminé" },
    summary: { en: "The project's cost and PCRA level are compared with the department's project approval limit and capacity class to decide whether the department can approve it or Treasury Board approval is required.", fr: "Le coût et le niveau d'ECRP du projet sont comparés à la limite d'approbation et à la catégorie de capacité du ministère pour déterminer si le ministère peut l'approuver ou si l'approbation du Conseil du Trésor est requise." },
    look: {
      en: ["A written authority determination, confirmed by the PMO or CFO.", "Early contact with the Treasury Board Secretariat program sector if approval is needed."],
      fr: ["Une détermination écrite du pouvoir, confirmée par le BGP ou le DPF.", "Une prise de contact précoce avec le secteur de programme du Secrétariat du Conseil du Trésor si une approbation est nécessaire."],
    },
    rightsize: {
      en: ["Splitting a project to stay under the limit is not allowed; delivering in genuinely independent phases with their own outcomes may be."],
      fr: ["Il n'est pas permis de fractionner un projet pour rester sous la limite; une réalisation en phases réellement indépendantes ayant leurs propres résultats peut l'être."],
    },
    consequences: {
      en: ["Spending without the proper authority, which can lead to audit findings and loss of delegated authority.", "Months lost when Treasury Board approval is discovered to be needed late."],
      fr: ["Des dépenses sans le pouvoir approprié, ce qui peut entraîner des constatations de vérification et la perte de pouvoirs délégués.", "Des mois perdus lorsqu'on découvre tard qu'une approbation du Conseil du Trésor est nécessaire."],
    },
    mitigations: {
      en: ["Confirm the determination with the PMO and CFO, and contact the TBS analyst early if approval is needed."],
      fr: ["Confirmer la détermination avec le BGP et le DPF, et communiquer tôt avec l'analyste du SCT si une approbation est nécessaire."],
    },
    describe: { en: "The approval authority for {project} was determined by comparing its estimated cost and PCRA level with the {dept} project approval limit and capacity class. {authority}", fr: "Le pouvoir d'approbation de {project} a été déterminé en comparant son coût estimatif et son niveau d'ECRP à la limite d'approbation des projets et à la catégorie de capacité de {dept}. {authority}" },
    questions: {
      en: ["Has the approval authority been determined in writing?", "Has the PMO or CFO confirmed the determination?"],
      fr: ["Le pouvoir d'approbation a-t-il été déterminé par écrit?", "Le BGP ou le DPF a-t-il confirmé la détermination?"],
    },
    keywords: { en: ["approval authority", "project approval", "approval limit", "delegated authority"], fr: ["pouvoir d'approbation", "approbation du projet", "limite d'approbation", "pouvoir délégué"] },
  },

  // ---------------------------------------------------------------- APP
  {
    id: "APP-1", gate: "G3", sev: "high", base: "required",
    source: src(DMPP, { en: "Treasury Board project approval", fr: "approbation des projets par le Conseil du Trésor" }),
    title: { en: "Treasury Board project approval sought", fr: "Approbation du projet demandée au Conseil du Trésor" },
    summary: { en: "When the project exceeds the department's authority, a Treasury Board submission seeks project approval, supported by the PCRA, the business case, costing, the procurement strategy and the CFO attestation. Historically this was done in two stages: preliminary project approval and effective project approval.", fr: "Lorsque le projet dépasse le pouvoir du ministère, une présentation au Conseil du Trésor demande l'approbation du projet, appuyée par l'ECRP, l'analyse de rentabilisation, l'établissement des coûts, la stratégie d'approvisionnement et l'attestation du DPF. Historiquement, cela se faisait en deux étapes : l'approbation préliminaire et l'approbation définitive du projet." },
    look: {
      en: ["The submission timeline agreed with the TBS program sector analyst.", "Draft submission, with the CFO attestation.", "TBS feedback on drafts."],
      fr: ["L'échéancier de la présentation convenu avec l'analyste du secteur de programme du SCT.", "L'ébauche de présentation, avec l'attestation du DPF.", "La rétroaction du SCT sur les ébauches."],
    },
    rightsize: {
      en: ["Combine project, procurement and real property authorities in one submission where possible."],
      fr: ["Regrouper les pouvoirs relatifs au projet, à l'approvisionnement et aux biens immobiliers dans une même présentation lorsque c'est possible."],
    },
    consequences: {
      en: ["The project cannot proceed past planning.", "Starting implementation without approval is a breach of the directive."],
      fr: ["Le projet ne peut aller au-delà de la planification.", "Commencer la mise en œuvre sans approbation constitue un manquement à la directive."],
    },
    mitigations: {
      en: ["Engage TBS at least six months before the planned Treasury Board meeting.", "Seek approval for a funded definition phase if the business case is not ready."],
      fr: ["Communiquer avec le SCT au moins six mois avant la réunion prévue du Conseil du Trésor.", "Demander l'approbation d'une phase de définition financée si l'analyse de rentabilisation n'est pas prête."],
    },
    describe: { en: "{project} exceeds the project approval authority of {dept}. Treasury Board approval is sought through a submission supported by the PCRA, business case, costing, procurement strategy and CFO attestation, prepared with the Treasury Board Secretariat.", fr: "{project} dépasse le pouvoir d'approbation des projets de {dept}. L'approbation du Conseil du Trésor est demandée au moyen d'une présentation appuyée par l'ECRP, l'analyse de rentabilisation, l'établissement des coûts, la stratégie d'approvisionnement et l'attestation du DPF, préparée avec le Secrétariat du Conseil du Trésor." },
    questions: {
      en: ["Is the Treasury Board submission planned with TBS, with dates?", "Are the supporting documents (PCRA, business case, costing, procurement strategy) ready?", "Has the CFO attestation been planned?"],
      fr: ["La présentation au Conseil du Trésor est-elle planifiée avec le SCT, avec des dates?", "Les documents à l'appui (ECRP, analyse de rentabilisation, coûts, stratégie d'approvisionnement) sont-ils prêts?", "L'attestation du DPF a-t-elle été planifiée?"],
    },
    keywords: { en: ["Treasury Board submission", "TB submission", "project approval", "preliminary project approval", "effective project approval", "expenditure authority"], fr: ["présentation au Conseil du Trésor", "présentation au CT", "approbation du projet", "approbation préliminaire", "approbation définitive", "pouvoir de dépenser"] },
    scope: [
      { when: { tb: "no" }, status: "na", reason: { en: "The project is within the department's project approval authority.", fr: "Le projet relève du pouvoir d'approbation des projets du ministère." } },
    ],
  },
  {
    id: "APP-2", gate: "G5", sev: "high", base: "required",
    source: src({ en: "Financial Administration Act, sections 32 and 34", fr: "Loi sur la gestion des finances publiques, articles 32 et 34" }, DMPP),
    title: { en: "Authority to spend on implementation", fr: "Pouvoir de dépenser pour la mise en œuvre" },
    summary: { en: "Before major implementation spending or contract award, the project confirms the expenditure authority for the baselined cost (departmental or Treasury Board) and that funds are available.", fr: "Avant d'engager des dépenses de mise en œuvre importantes ou d'attribuer un contrat, le projet confirme le pouvoir de dépenser pour le coût de référence (ministériel ou du Conseil du Trésor) et la disponibilité des fonds." },
    look: {
      en: ["The approval record covering the baselined cost.", "Financial coding and commitments in the financial system."],
      fr: ["Le compte rendu d'approbation couvrant le coût de référence.", "Le codage financier et les engagements dans le système financier."],
    },
    rightsize: {
      en: ["For agile delivery, release funding in tranches tied to demonstrated results."],
      fr: ["Pour une réalisation agile, débloquer le financement par tranches liées à des résultats démontrés."],
    },
    consequences: {
      en: ["Commitments made without authority.", "Contract award delayed while authority is sought."],
      fr: ["Des engagements pris sans pouvoir.", "L'attribution du contrat retardée le temps d'obtenir le pouvoir."],
    },
    mitigations: {
      en: ["Sequence contract award after the gate decision and confirm with the CFO."],
      fr: ["Planifier l'attribution du contrat après la décision au point de contrôle et confirmer avec le DPF."],
    },
    describe: { en: "Expenditure authority for the baselined cost of {project} was confirmed before implementation spending and contract award.", fr: "Le pouvoir de dépenser pour le coût de référence de {project} a été confirmé avant les dépenses de mise en œuvre et l'attribution du contrat." },
    questions: {
      en: ["Is expenditure authority confirmed for the baselined cost?", "Are funds available for this fiscal year's spending?"],
      fr: ["Le pouvoir de dépenser est-il confirmé pour le coût de référence?", "Les fonds sont-ils disponibles pour les dépenses de cet exercice?"],
    },
    keywords: { en: ["expenditure authority", "section 32", "funds available", "commitment"], fr: ["pouvoir de dépenser", "article 32", "fonds disponibles", "engagement"] },
  },
  {
    id: "APP-3", gate: "G2", sev: "medium", base: "recommended",
    source: { en: "Treasury Board Secretariat guidance on preparing submissions", fr: "Orientation du Secrétariat du Conseil du Trésor sur la préparation des présentations" },
    title: { en: "Early engagement with the Treasury Board Secretariat", fr: "Engagement précoce auprès du Secrétariat du Conseil du Trésor" },
    summary: { en: "For projects that need Treasury Board approval or are under central oversight, the TBS program sector analyst and the Office of the Chief Information Officer are engaged early, well before a submission is drafted.", fr: "Pour les projets qui nécessitent l'approbation du Conseil du Trésor ou font l'objet d'une surveillance centrale, l'analyste du secteur de programme du SCT et le Bureau du dirigeant principal de l'information sont consultés tôt, bien avant la rédaction d'une présentation." },
    look: {
      en: ["Meeting notes with TBS analysts.", "TBS expectations recorded in the project plan."],
      fr: ["Les notes de réunion avec les analystes du SCT.", "Les attentes du SCT consignées dans le plan du projet."],
    },
    rightsize: {
      en: ["A single briefing at the approach stage often prevents months of back-and-forth later."],
      fr: ["Une seule séance d'information à l'étape de l'approche évite souvent des mois d'allers-retours plus tard."],
    },
    consequences: {
      en: ["Submission returned for rework; a Treasury Board meeting date missed."],
      fr: ["Présentation renvoyée pour être retravaillée; une date de réunion du Conseil du Trésor manquée."],
    },
    mitigations: {
      en: ["Request a briefing with the program sector this month."],
      fr: ["Demander une séance d'information avec le secteur de programme ce mois-ci."],
    },
    describe: { en: "{project} has engaged the Treasury Board Secretariat program sector and the Office of the Chief Information Officer since the approach stage; their expectations are reflected in the plan.", fr: "{project} collabore avec le secteur de programme du Secrétariat du Conseil du Trésor et le Bureau du dirigeant principal de l'information depuis l'étape de l'approche; leurs attentes sont intégrées au plan." },
    questions: {
      en: ["Has the TBS program sector analyst been briefed?", "Are TBS expectations reflected in the plan and schedule?"],
      fr: ["L'analyste du secteur de programme du SCT a-t-il été informé?", "Les attentes du SCT sont-elles intégrées au plan et au calendrier?"],
    },
    keywords: { en: ["TBS", "Treasury Board Secretariat", "program sector", "OCIO", "central agenc*"], fr: ["SCT", "Secrétariat du Conseil du Trésor", "secteur de programme", "BDPI", "organisme* centra*"] },
    scope: [
      { when: { tb: "yes" }, status: "required", reason: { en: "Treasury Board approval is needed, so early engagement with TBS is effectively mandatory.", fr: "L'approbation du Conseil du Trésor est nécessaire; l'engagement précoce auprès du SCT est donc pratiquement obligatoire." } },
      { when: { highRisk: "no" }, status: "na", reason: { en: "Within departmental authority and not high risk.", fr: "Relève du pouvoir ministériel et ne présente pas de risque élevé." } },
    ],
  },
  {
    id: "APP-4", gate: "G2", revisit: ["G4"], sev: "high", base: "required",
    source: { en: "Directive on Service and Digital (GC Enterprise Architecture Review Board)", fr: "Directive sur les services et le numérique (Conseil d'examen de l'architecture intégrée du GC)" },
    title: { en: "GC Enterprise Architecture Review Board (GC EARB)", fr: "Conseil d'examen de l'architecture intégrée du GC (CEAI du GC)" },
    summary: { en: "Digital initiatives above the department's threshold (from $2.5M with no or a class 1 OPMCA, rising with capacity class), or that use emerging technology or need a policy exception, are presented to the GC EARB, normally at concept and again before detailed design is final.", fr: "Les initiatives numériques au-delà du seuil du ministère (dès 2,5 M$ sans ECOGP ou avec une catégorie 1, en hausse selon la catégorie de capacité), ou qui utilisent une technologie émergente ou nécessitent une exception à la politique, sont présentées au CEAI du GC, normalement à l'étape du concept puis avant que la conception détaillée soit finalisée." },
    look: {
      en: ["The GC EARB presentation and its outcome or conditions.", "The departmental architecture review board's prior endorsement.", "Alignment with the GC Enterprise Architecture Framework."],
      fr: ["La présentation au CEAI du GC et son résultat ou ses conditions.", "L'approbation préalable du conseil ministériel d'examen de l'architecture.", "L'harmonisation avec le Cadre d'architecture intégrée du GC."],
    },
    rightsize: {
      en: ["Reusing GC enterprise solutions and cloud services simplifies the review."],
      fr: ["La réutilisation de solutions ministérielles du GC et de services infonuagiques simplifie l'examen."],
    },
    consequences: {
      en: ["Architecture decisions are challenged after money is committed.", "Non-compliance with the Directive on Service and Digital."],
      fr: ["Les décisions d'architecture sont contestées après l'engagement des fonds.", "Non-conformité à la Directive sur les services et le numérique."],
    },
    mitigations: {
      en: ["Book the departmental architecture review board and the GC EARB secretariat now; plan their dates into the gate schedule."],
      fr: ["Réserver dès maintenant le conseil ministériel d'examen de l'architecture et le secrétariat du CEAI du GC; intégrer leurs dates au calendrier des points de contrôle."],
    },
    describe: { en: "{project} was presented to the departmental architecture review board and then to the GC Enterprise Architecture Review Board. Conditions raised are tracked by the project and reported at the next gate.", fr: "{project} a été présenté au conseil ministériel d'examen de l'architecture puis au Conseil d'examen de l'architecture intégrée du GC. Les conditions soulevées sont suivies par le projet et communiquées au prochain point de contrôle." },
    questions: {
      en: ["Has the initiative been presented to the GC EARB (or is a date booked)?", "Have the GC EARB's conditions been addressed?"],
      fr: ["L'initiative a-t-elle été présentée au CEAI du GC (ou une date est-elle réservée)?", "Les conditions du CEAI du GC ont-elles été traitées?"],
    },
    keywords: { en: ["GC EARB", "architecture review board", "enterprise architecture", "EARB"], fr: ["CEAI", "conseil d'examen de l'architecture", "architecture intégrée"] },
    scope: [
      { when: { earb: "no" }, status: "na", reason: { en: "Not a digital initiative above the GC EARB threshold, and no emerging technology or policy exception.", fr: "Il ne s'agit pas d'une initiative numérique au-delà du seuil du CEAI du GC, et il n'y a ni technologie émergente ni exception à la politique." } },
    ],
  },
  {
    id: "APP-5", gate: "G2", sev: "medium", base: "required",
    source: { en: "Directive on Service and Digital (departmental CIO responsibilities)", fr: "Directive sur les services et le numérique (responsabilités du DPI ministériel)" },
    title: { en: "Departmental architecture review and CIO endorsement", fr: "Examen de l'architecture ministérielle et appui du DPI" },
    summary: { en: "The departmental CIO and architecture review board review the proposed solution for alignment with departmental and GC architecture, security and reuse expectations.", fr: "Le DPI ministériel et le conseil d'examen de l'architecture examinent la solution proposée pour vérifier son harmonisation avec l'architecture ministérielle et du GC ainsi qu'avec les attentes en matière de sécurité et de réutilisation." },
    look: {
      en: ["The departmental architecture review record.", "The CIO's endorsement of the approach."],
      fr: ["Le compte rendu de l'examen de l'architecture ministérielle.", "L'appui du DPI à l'approche."],
    },
    rightsize: {
      en: ["Use the departmental board's lightweight track for configurations of existing platforms."],
      fr: ["Utiliser la voie allégée du conseil ministériel pour les configurations de plateformes existantes."],
    },
    consequences: {
      en: ["Solutions that duplicate existing ones or cannot be supported by IT operations."],
      fr: ["Des solutions qui font double emploi avec celles qui existent ou que l'exploitation de la TI ne peut soutenir."],
    },
    mitigations: {
      en: ["Book the next architecture review board slot."],
      fr: ["Réserver la prochaine plage du conseil d'examen de l'architecture."],
    },
    describe: { en: "The {dept} architecture review board reviewed {project} and the chief information officer endorsed the approach.", fr: "Le conseil d'examen de l'architecture de {dept} a examiné {project} et le dirigeant principal de l'information a appuyé l'approche." },
    questions: {
      en: ["Has the departmental architecture review board reviewed the solution?", "Has the CIO endorsed the approach?"],
      fr: ["Le conseil ministériel d'examen de l'architecture a-t-il examiné la solution?", "Le DPI a-t-il appuyé l'approche?"],
    },
    keywords: { en: ["architecture review", "CIO", "chief information officer", "solution architecture"], fr: ["examen de l'architecture", "DPI", "dirigeant principal de l'information", "architecture de solution"] },
    scope: [
      { when: { digital: "no" }, status: "na", reason: { en: "Not a digital or IT-enabled project.", fr: "Il ne s'agit pas d'un projet numérique ou habilité par la TI." } },
    ],
  },
  {
    id: "APP-6", gate: "G5", sev: "medium", base: "required",
    source: { en: "Directive on the Management of Procurement (contracting limits)", fr: "Directive sur la gestion de l'approvisionnement (limites contractuelles)" },
    title: { en: "Contracting authority and approvals", fr: "Autorité contractante et approbations" },
    summary: { en: "Contracts are within the department's contracting limits or Public Services and Procurement Canada's, or Treasury Board contract approval is planned, before award.", fr: "Les contrats respectent les limites contractuelles du ministère ou de Services publics et Approvisionnement Canada, ou l'approbation du contrat par le Conseil du Trésor est prévue, avant l'attribution." },
    look: {
      en: ["The contracting authority named for each contract.", "Contract values compared with applicable contracting limits."],
      fr: ["L'autorité contractante désignée pour chaque contrat.", "La valeur des contrats comparée aux limites contractuelles applicables."],
    },
    rightsize: {
      en: ["Existing standing offers and supply arrangements carry their own authorities."],
      fr: ["Les offres à commandes et les arrangements en matière d'approvisionnement existants comportent leurs propres pouvoirs."],
    },
    consequences: {
      en: ["Contract award delayed; contract entered into without authority."],
      fr: ["Attribution du contrat retardée; contrat conclu sans pouvoir."],
    },
    mitigations: {
      en: ["Confirm the contracting route with PSPC or the departmental contracting authority now."],
      fr: ["Confirmer dès maintenant la voie contractuelle avec SPAC ou l'autorité contractante ministérielle."],
    },
    describe: { en: "Contracts for {project} are placed by the appropriate contracting authority within applicable contracting limits; required contract approvals are scheduled before award.", fr: "Les contrats de {project} sont passés par l'autorité contractante appropriée dans les limites contractuelles applicables; les approbations de contrat requises sont prévues avant l'attribution." },
    questions: {
      en: ["Is the contracting authority identified for each planned contract?", "Are the required contract approvals planned before award?"],
      fr: ["L'autorité contractante est-elle déterminée pour chaque contrat prévu?", "Les approbations de contrat requises sont-elles prévues avant l'attribution?"],
    },
    keywords: { en: ["contracting authority", "PSPC", "contracting limits", "contract approval"], fr: ["autorité contractante", "SPAC", "limites contractuelles", "approbation du contrat"] },
    scope: [
      { when: { procurement: "none" }, status: "na", reason: { en: "No procurement is planned.", fr: "Aucun approvisionnement n'est prévu." } },
    ],
  },
  {
    id: "APP-7", gate: "G3", sev: "medium", base: "required",
    source: { en: "Directive on the Management of Real Property", fr: "Directive sur la gestion des biens immobiliers" },
    title: { en: "Real property authorities", fr: "Pouvoirs relatifs aux biens immobiliers" },
    summary: { en: "Acquisitions, leases or construction are within the department's real property authorities, or the required approvals are sought alongside project approval.", fr: "Les acquisitions, les baux ou la construction relèvent des pouvoirs du ministère en matière de biens immobiliers, ou les approbations requises sont demandées en même temps que l'approbation du projet." },
    look: {
      en: ["The real property strategy and the authorities that apply.", "Engagement with the custodian department (often PSPC)."],
      fr: ["La stratégie relative aux biens immobiliers et les pouvoirs applicables.", "La collaboration avec le ministère gardien (souvent SPAC)."],
    },
    rightsize: {
      en: ["Combine real property and project authorities in one submission."],
      fr: ["Regrouper les pouvoirs relatifs aux biens immobiliers et au projet dans une même présentation."],
    },
    consequences: {
      en: ["Construction or lease cannot start; schedule slips."],
      fr: ["La construction ou le bail ne peut commencer; le calendrier glisse."],
    },
    mitigations: {
      en: ["Engage the departmental real property function and the custodian now."],
      fr: ["Communiquer dès maintenant avec la fonction ministérielle des biens immobiliers et le gardien."],
    },
    describe: { en: "Real property aspects of {project} are within {dept}'s real property authorities, or the required approvals are being sought with project approval.", fr: "Les aspects immobiliers de {project} relèvent des pouvoirs de {dept} en matière de biens immobiliers, ou les approbations requises sont demandées avec l'approbation du projet." },
    questions: {
      en: ["Are the real property authorities that apply identified?", "Is the custodian engaged?"],
      fr: ["Les pouvoirs applicables en matière de biens immobiliers sont-ils déterminés?", "Le gardien a-t-il été consulté?"],
    },
    keywords: { en: ["real property", "lease", "construction", "custodian", "accommodation"], fr: ["biens immobiliers", "bail", "construction", "gardien", "locaux"] },
    scope: [
      { when: { projectType: ["digital", "business"] }, status: "na", reason: { en: "No real property component.", fr: "Aucune composante immobilière." } },
    ],
  },

  // ---------------------------------------------------------------- GAT
  {
    id: "GAT-1", gate: "G2", sev: "medium", base: "required",
    source: src(DMPP, GUIDE),
    title: { en: "Gating plan defined", fr: "Plan des points de contrôle défini" },
    summary: { en: "The project knows which gates it will pass, using which model, who the gatekeepers are, the evidence expected at each, and roughly when each gate will occur.", fr: "Le projet sait quels points de contrôle il franchira, selon quel modèle, qui en sont les responsables, quels éléments probants sont attendus à chacun et approximativement quand chacun aura lieu." },
    look: {
      en: ["A gating plan in the project management plan or charter.", "Gate dates in the integrated schedule."],
      fr: ["Un plan des points de contrôle dans le plan de gestion du projet ou la charte.", "Les dates des points de contrôle dans le calendrier intégré."],
    },
    rightsize: {
      en: ["Choose the lightest model your department permits for the PCRA level; this tool recommends one."],
      fr: ["Choisir le modèle le plus léger que votre ministère permet pour le niveau d'ECRP; cet outil en recommande un."],
    },
    consequences: {
      en: ["Gates become surprises that stall the project for weeks.", "Gatekeepers are not available when needed."],
      fr: ["Les points de contrôle deviennent des surprises qui bloquent le projet pendant des semaines.", "Les responsables ne sont pas disponibles au moment voulu."],
    },
    mitigations: {
      en: ["Draft the gating plan with the PMO and book the gate dates now."],
      fr: ["Rédiger le plan des points de contrôle avec le BGP et réserver dès maintenant les dates."],
    },
    describe: { en: "{project} follows the {model} model. The gating plan names the gatekeepers and evidence expected at each gate, and gate dates are part of the integrated schedule.", fr: "{project} suit le modèle {model}. Le plan des points de contrôle désigne les responsables et les éléments probants attendus à chacun, et les dates font partie du calendrier intégré." },
    questions: {
      en: ["Is there a gating plan naming the gates, gatekeepers and evidence?", "Are gate dates in the schedule?"],
      fr: ["Existe-t-il un plan des points de contrôle qui en précise les responsables et les éléments probants?", "Les dates des points de contrôle figurent-elles au calendrier?"],
    },
    keywords: { en: ["gating plan", "gate", "gates", "gatekeeper*"], fr: ["plan des points de contrôle", "point de contrôle", "points de contrôle"] },
  },
  {
    id: "GAT-2", gate: "G3", revisit: ["G5"], sev: "medium", base: "recommended",
    source: { en: "The Independent Reviewer's Handbook (TBS); Policy on the Planning and Management of Investments (independent reviews)", fr: "Guide de l'examinateur indépendant (SCT); Politique sur la planification et la gestion des investissements (examens indépendants)" },
    title: { en: "Independent review at key gates", fr: "Examen indépendant aux points de contrôle clés" },
    summary: { en: "High-risk or Treasury Board-approved projects get an independent third-party review at key gates, typically before the business case and before implementation, so that gatekeepers have a view not owned by the project team.", fr: "Les projets à risque élevé ou approuvés par le Conseil du Trésor font l'objet d'un examen indépendant par un tiers aux points de contrôle clés, généralement avant l'analyse de rentabilisation et avant la mise en œuvre, afin que les responsables disposent d'un point de vue qui n'appartient pas à l'équipe de projet." },
    look: {
      en: ["The independent review terms of reference and reviewer independence.", "The review report and the project's management response."],
      fr: ["Le mandat de l'examen indépendant et l'indépendance de l'examinateur.", "Le rapport d'examen et la réponse de la direction du projet."],
    },
    rightsize: {
      en: ["Internal audit or another department's PMO can provide independence for medium-risk projects."],
      fr: ["La vérification interne ou le BGP d'un autre ministère peuvent assurer l'indépendance pour les projets à risque moyen."],
    },
    consequences: {
      en: ["Optimism bias goes unchallenged until it shows up as overruns."],
      fr: ["Le biais d'optimisme n'est pas remis en question jusqu'à ce qu'il se traduise par des dépassements."],
    },
    mitigations: {
      en: ["Commission a short health check before the next gate."],
      fr: ["Commander un bref bilan de santé avant le prochain point de contrôle."],
    },
    describe: { en: "An independent review of {project} is planned at key gates. Reviewers are independent of the project team, and the management response to their recommendations is presented to the gatekeepers.", fr: "Un examen indépendant de {project} est prévu aux points de contrôle clés. Les examinateurs sont indépendants de l'équipe de projet, et la réponse de la direction à leurs recommandations est présentée aux responsables des points de contrôle." },
    questions: {
      en: ["Is an independent review planned for key gates?", "Are recommendations from past reviews addressed?"],
      fr: ["Un examen indépendant est-il prévu aux points de contrôle clés?", "Les recommandations des examens antérieurs sont-elles traitées?"],
    },
    keywords: { en: ["independent review", "third-party review", "health check", "quality assurance"], fr: ["examen indépendant", "examen par un tiers", "bilan de santé", "assurance de la qualité"] },
    scope: [
      { when: { highRisk: "yes" }, status: "required", reason: { en: "The project is high risk or needs Treasury Board approval; gatekeepers will expect independent review.", fr: "Le projet est à risque élevé ou nécessite l'approbation du Conseil du Trésor; les responsables des points de contrôle s'attendront à un examen indépendant." } },
    ],
  },
  {
    id: "GAT-3", gate: "G3", revisit: ["G4", "G5", "G6", "G7"], sev: "medium", base: "required",
    source: GUIDE,
    title: { en: "Conditions from earlier gates resolved", fr: "Conditions des points de contrôle antérieurs levées" },
    summary: { en: "Conditions and recommendations from previous gates and reviews are resolved, or explicitly carried forward with the gatekeepers' agreement.", fr: "Les conditions et recommandations des points de contrôle et examens antérieurs sont levées, ou explicitement reportées avec l'accord des responsables." },
    look: {
      en: ["The condition tracker with evidence of closure.", "Any conditions carried forward, and who agreed."],
      fr: ["Le registre de suivi des conditions avec les preuves de levée.", "Les conditions reportées, et qui y a consenti."],
    },
    rightsize: {
      en: ["Track conditions in the same log as actions to avoid a separate document."],
      fr: ["Suivre les conditions dans le même registre que les mesures pour éviter un document distinct."],
    },
    consequences: {
      en: ["Gatekeepers lose confidence; the gate is failed on the conditions alone."],
      fr: ["Les responsables perdent confiance; le point de contrôle échoue en raison des seules conditions."],
    },
    mitigations: {
      en: ["Close what can be closed and ask the gatekeepers to formally carry the rest forward."],
      fr: ["Lever ce qui peut l'être et demander aux responsables de reporter officiellement le reste."],
    },
    describe: { en: "All conditions from previous gates for {project} are resolved or have been formally carried forward with the gatekeepers' agreement.", fr: "Toutes les conditions des points de contrôle antérieurs de {project} sont levées ou ont été officiellement reportées avec l'accord des responsables." },
    questions: {
      en: ["Are conditions from earlier gates and reviews resolved?", "Are any carried-forward conditions agreed by the gatekeepers?"],
      fr: ["Les conditions des points de contrôle et examens antérieurs sont-elles levées?", "Les conditions reportées ont-elles été acceptées par les responsables?"],
    },
    keywords: { en: ["conditions", "recommendations", "follow-up", "action items"], fr: ["conditions", "recommandations", "suivi", "mesures de suivi"] },
  },
  {
    id: "PGM-1", area: "GOV", gate: "G1", revisit: ["G3"], sev: "medium", base: "required",
    source: src(DMPP, { en: "programme management", fr: "gestion des programmes" }),
    title: { en: "Programme alignment and interdependencies", fr: "Harmonisation avec le programme et interdépendances" },
    summary: { en: "When the project is part of a programme, its contribution to programme outcomes, its dependencies on other projects and the programme's governance are defined.", fr: "Lorsque le projet fait partie d'un programme, sa contribution aux résultats du programme, ses dépendances envers d'autres projets et la gouvernance du programme sont définies." },
    look: {
      en: ["The programme roadmap showing this project.", "A dependency register shared with sibling projects."],
      fr: ["La feuille de route du programme montrant ce projet.", "Un registre des dépendances partagé avec les projets connexes."],
    },
    rightsize: {
      en: ["Let the programme board act as the project's steering committee."],
      fr: ["Laisser le conseil du programme jouer le rôle de comité directeur du projet."],
    },
    consequences: {
      en: ["Projects deliver pieces that do not fit together; benefits depend on work nobody owns."],
      fr: ["Les projets livrent des éléments qui ne s'emboîtent pas; les avantages dépendent de travaux dont personne n'est responsable."],
    },
    mitigations: {
      en: ["Map dependencies with sibling project managers and escalate gaps to the programme board."],
      fr: ["Cartographier les dépendances avec les gestionnaires des projets connexes et faire remonter les lacunes au conseil du programme."],
    },
    describe: { en: "{project} is part of a programme. Its contribution to programme outcomes and its dependencies on other projects are defined, and it reports to the programme board.", fr: "{project} fait partie d'un programme. Sa contribution aux résultats du programme et ses dépendances envers d'autres projets sont définies, et il rend compte au conseil du programme." },
    questions: {
      en: ["Is the project's contribution to programme outcomes defined?", "Are dependencies with other projects tracked jointly?"],
      fr: ["La contribution du projet aux résultats du programme est-elle définie?", "Les dépendances avec les autres projets sont-elles suivies conjointement?"],
    },
    keywords: { en: ["programme", "program board", "interdependenc*", "dependenc*", "roadmap"], fr: ["programme", "conseil du programme", "interdépendance*", "dépendance*", "feuille de route"] },
    scope: [
      { when: { programme: "no" }, status: "na", reason: { en: "The project is not part of a programme.", fr: "Le projet ne fait pas partie d'un programme." } },
    ],
  },
];
