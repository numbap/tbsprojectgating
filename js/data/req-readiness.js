// Requirements: digital, security, privacy and inclusion; readiness and
// transition; monitoring, reporting and close-out. Paraphrased, with section
// references checked against the Directive on the Management of Projects and
// Programmes (DMPP) and the 2010 gating guide. Not official text.

const DMPP = { en: "Directive on the Management of Projects and Programmes", fr: "Directive sur la gestion des projets et programmes" };
const GUIDE = { en: "A Guide to Project Gating for IT-Enabled Projects (TBS)", fr: "Guide sur le contrôle des projets de TI par points de contrôle (SCT)" };
const cite = (en, fr) => ({ en, fr });
const src = (...parts) => ({ en: parts.map((p) => p.en).join("; "), fr: parts.map((p) => p.fr).join("; ") });
const NOT_DIGITAL = { when: { digital: "no" }, status: "na", reason: { en: "Not a digital or IT-enabled project.", fr: "Il ne s'agit pas d'un projet numérique ou habilité par la TI." } };

export const READINESS = [
  // ---------------------------------------------------------------- DIG
  {
    id: "DIG-1", gate: "G6", revisit: ["G3", "G5"], sev: "high", base: "required",
    source: { en: "Policy on Government Security; Directive on Security Management (security assessment and authorization)", fr: "Politique sur la sécurité du gouvernement; Directive sur la gestion de la sécurité (évaluation de la sécurité et autorisation)" },
    title: { en: "Security assessment and authorization", fr: "Évaluation de la sécurité et autorisation" },
    summary: { en: "Security requirements are set from the information's sensitivity early, designed in, assessed, and the solution is authorized to operate before it goes into production.", fr: "Les exigences de sécurité sont établies tôt en fonction de la sensibilité de l'information, intégrées à la conception, évaluées, et la solution est autorisée à être exploitée avant sa mise en production." },
    look: {
      en: ["The security categorization and the security assessment plan (by Gate 3 or 5).", "The authority to operate, or interim authority with conditions, before go-live.", "Residual risks accepted by the authorizer."],
      fr: ["La catégorisation de sécurité et le plan d'évaluation de la sécurité (au plus tard aux points de contrôle 3 ou 5).", "L'autorisation d'exploitation, ou une autorisation provisoire assortie de conditions, avant la mise en service.", "Les risques résiduels acceptés par l'autorité d'autorisation."],
    },
    rightsize: {
      en: ["Build on GC-assessed cloud services and enterprise platforms to inherit most controls."],
      fr: ["S'appuyer sur des services infonuagiques et des plateformes ministérielles évalués par le GC pour hériter de la plupart des mesures de sécurité."],
    },
    consequences: {
      en: ["Go-live blocked by the security authorizer, or a system operating with unknown risk."],
      fr: ["Mise en service bloquée par l'autorité d'autorisation de sécurité, ou système exploité avec un risque inconnu."],
    },
    mitigations: {
      en: ["Engage the departmental IT security team now and plan the assessment into the schedule.", "Seek an interim authority with a remediation plan if needed."],
      fr: ["Consulter dès maintenant l'équipe ministérielle de sécurité de la TI et intégrer l'évaluation au calendrier.", "Demander une autorisation provisoire avec un plan de correction au besoin."],
    },
    describe: { en: "Security requirements for {project} were derived from its categorization and built into the design. The solution was assessed and authorized to operate by the departmental authorizer before production use.", fr: "Les exigences de sécurité de {project} ont été établies à partir de sa catégorisation et intégrées à la conception. La solution a été évaluée et autorisée à être exploitée par l'autorité ministérielle d'autorisation avant son utilisation en production." },
    questions: {
      en: ["Is the security categorization done and a security assessment planned?", "Will the solution have an authority to operate before go-live?"],
      fr: ["La catégorisation de sécurité est-elle faite et une évaluation de la sécurité est-elle prévue?", "La solution aura-t-elle une autorisation d'exploitation avant la mise en service?"],
    },
    keywords: { en: ["security assessment", "authority to operate", "ATO", "SA&A", "ITSG-33", "security categorization"], fr: ["évaluation de la sécurité", "autorisation d'exploitation", "EAS", "ITSG-33", "catégorisation de sécurité"] },
    scope: [NOT_DIGITAL],
  },
  {
    id: "DIG-2", gate: "G5", revisit: ["G3", "G6"], sev: "high", base: "required",
    source: { en: "Policy on Privacy Protection; Directive on Privacy Impact Assessment", fr: "Politique sur la protection de la vie privée; Directive sur l'évaluation des facteurs relatifs à la vie privée" },
    title: { en: "Privacy impact assessment", fr: "Évaluation des facteurs relatifs à la vie privée" },
    summary: { en: "When personal information is used in a new or substantially modified program or activity, a privacy impact assessment is completed, approved and provided to the Office of the Privacy Commissioner and TBS, early enough to shape the design.", fr: "Lorsque des renseignements personnels sont utilisés dans un programme ou une activité nouveau ou considérablement modifié, une évaluation des facteurs relatifs à la vie privée est réalisée, approuvée et transmise au Commissariat à la protection de la vie privée et au SCT, assez tôt pour influencer la conception." },
    look: {
      en: ["The PIA (or privacy checklist) and its approval.", "Design changes made in response to privacy recommendations.", "The personal information bank description."],
      fr: ["L'EFVP (ou la liste de contrôle sur la vie privée) et son approbation.", "Les changements de conception apportés en réponse aux recommandations sur la vie privée.", "La description du fichier de renseignements personnels."],
    },
    rightsize: {
      en: ["Collect less personal information; what you do not collect needs no protection."],
      fr: ["Recueillir moins de renseignements personnels; ce que vous ne recueillez pas n'a pas besoin d'être protégé."],
    },
    consequences: {
      en: ["Non-compliance with the Privacy Act and policy; late redesign; loss of public trust."],
      fr: ["Non-conformité à la Loi sur la protection des renseignements personnels et à la politique; reconception tardive; perte de confiance du public."],
    },
    mitigations: {
      en: ["Engage the ATIP office now and start the PIA in parallel with design."],
      fr: ["Consulter dès maintenant le bureau de l'AIPRP et commencer l'EFVP en parallèle de la conception."],
    },
    describe: { en: "A privacy impact assessment for {project} was completed with the {dept} ATIP office, approved, and its recommendations were built into the design before implementation.", fr: "Une évaluation des facteurs relatifs à la vie privée de {project} a été réalisée avec le bureau de l'AIPRP de {dept}, approuvée, et ses recommandations ont été intégrées à la conception avant la mise en œuvre." },
    questions: {
      en: ["Has a privacy impact assessment been started with the ATIP office?", "Will it be approved before personal information is collected?"],
      fr: ["Une évaluation des facteurs relatifs à la vie privée a-t-elle été amorcée avec le bureau de l'AIPRP?", "Sera-t-elle approuvée avant la collecte de renseignements personnels?"],
    },
    keywords: { en: ["privacy impact assessment", "PIA", "personal information", "ATIP", "privacy"], fr: ["évaluation des facteurs relatifs à la vie privée", "EFVP", "renseignements personnels", "AIPRP", "vie privée"] },
    scope: [
      { when: { personalInfo: "no" }, status: "na", reason: { en: "The project does not create or substantially change a program or activity using personal information.", fr: "Le projet ne crée ni ne modifie considérablement de programme ou d'activité qui utilise des renseignements personnels." } },
    ],
  },
  {
    id: "DIG-3", gate: "G5", revisit: ["G6"], sev: "high", base: "required",
    source: { en: "Directive on Automated Decision-Making (Algorithmic Impact Assessment)", fr: "Directive sur la prise de décisions automatisée (évaluation de l'incidence algorithmique)" },
    title: { en: "Algorithmic Impact Assessment", fr: "Évaluation de l'incidence algorithmique" },
    summary: { en: "An automated decision system has an Algorithmic Impact Assessment completed and published before production, and meets the requirements for its impact level (notice, explanation, human involvement, peer review, testing).", fr: "Un système décisionnel automatisé fait l'objet d'une évaluation de l'incidence algorithmique réalisée et publiée avant sa mise en production, et satisfait aux exigences de son niveau d'incidence (avis, explication, intervention humaine, examen par les pairs, essais)." },
    look: {
      en: ["The AIA and its impact level.", "How each requirement for that level is met."],
      fr: ["L'EIA et son niveau d'incidence.", "La façon dont chaque exigence de ce niveau est satisfaite."],
    },
    rightsize: {
      en: ["Keep a human decision-maker for high-impact decisions and use automation for support."],
      fr: ["Conserver un décideur humain pour les décisions à forte incidence et utiliser l'automatisation comme soutien."],
    },
    consequences: {
      en: ["Unfair or unexplainable decisions; legal challenge; non-compliance."],
      fr: ["Des décisions injustes ou inexplicables; contestation judiciaire; non-conformité."],
    },
    mitigations: {
      en: ["Complete the AIA during design and plan the peer review."],
      fr: ["Réaliser l'EIA pendant la conception et planifier l'examen par les pairs."],
    },
    describe: { en: "An Algorithmic Impact Assessment of {project} was completed and published. The requirements for its impact level are built into the design and verified before production.", fr: "Une évaluation de l'incidence algorithmique de {project} a été réalisée et publiée. Les exigences de son niveau d'incidence sont intégrées à la conception et vérifiées avant la mise en production." },
    questions: {
      en: ["Has an Algorithmic Impact Assessment been completed?", "Are the requirements for its impact level planned or met?"],
      fr: ["Une évaluation de l'incidence algorithmique a-t-elle été réalisée?", "Les exigences de son niveau d'incidence sont-elles prévues ou satisfaites?"],
    },
    keywords: { en: ["algorithmic impact assessment", "AIA", "automated decision", "machine learning", "artificial intelligence"], fr: ["évaluation de l'incidence algorithmique", "EIA", "décision automatisée", "apprentissage automatique", "intelligence artificielle"] },
    scope: [
      { when: { automatedDecision: "no" }, status: "na", reason: { en: "No automated administrative decisions.", fr: "Aucune décision administrative automatisée." } },
    ],
  },
  {
    id: "DIG-4", gate: "G5", revisit: ["G6"], sev: "medium", base: "required",
    source: { en: "Accessible Canada Act; Directive on Service and Digital; CAN/ASC-EN 301 549", fr: "Loi canadienne sur l'accessibilité; Directive sur les services et le numérique; CAN/ASC-EN 301 549" },
    title: { en: "Accessibility built in", fr: "Accessibilité intégrée" },
    summary: { en: "Accessibility requirements (EN 301 549 / WCAG) are part of the specifications and contracts, and the solution is tested with assistive technologies and people with disabilities before go-live.", fr: "Les exigences en matière d'accessibilité (EN 301 549 / WCAG) font partie des spécifications et des contrats, et la solution est mise à l'essai avec des technologies d'assistance et des personnes en situation de handicap avant la mise en service." },
    look: {
      en: ["Accessibility requirements in the specifications and statement of work.", "Accessibility test results or a conformance report."],
      fr: ["Les exigences en matière d'accessibilité dans les spécifications et l'énoncé des travaux.", "Les résultats des essais d'accessibilité ou un rapport de conformité."],
    },
    rightsize: {
      en: ["Use the Canada.ca design system and accessible GC platforms rather than custom interfaces."],
      fr: ["Utiliser le système de conception Canada.ca et des plateformes accessibles du GC plutôt que des interfaces sur mesure."],
    },
    consequences: {
      en: ["Users with disabilities excluded; costly retrofits; complaints."],
      fr: ["Des utilisateurs en situation de handicap exclus; des modifications coûteuses après coup; des plaintes."],
    },
    mitigations: {
      en: ["Add accessibility acceptance criteria now and book testing with the departmental accessibility team."],
      fr: ["Ajouter dès maintenant des critères d'acceptation en matière d'accessibilité et prévoir des essais avec l'équipe ministérielle de l'accessibilité."],
    },
    describe: { en: "Accessibility requirements based on EN 301 549 are part of the specifications and contracts for {project}, and the solution is tested with assistive technologies and users with disabilities before go-live.", fr: "Les exigences d'accessibilité fondées sur la norme EN 301 549 font partie des spécifications et des contrats de {project}, et la solution est mise à l'essai avec des technologies d'assistance et des utilisateurs en situation de handicap avant la mise en service." },
    questions: {
      en: ["Are accessibility requirements in the specifications and contracts?", "Is accessibility testing with assistive technologies planned?"],
      fr: ["Les exigences en matière d'accessibilité figurent-elles dans les spécifications et les contrats?", "Des essais d'accessibilité avec des technologies d'assistance sont-ils prévus?"],
    },
    keywords: { en: ["accessibility", "accessible", "WCAG", "EN 301 549", "assistive technolog*"], fr: ["accessibilité", "accessible", "WCAG", "EN 301 549", "technologie* d'assistance"] },
    scope: [NOT_DIGITAL],
  },
  {
    id: "DIG-5", gate: "G5", revisit: ["G6"], sev: "medium", base: "required",
    source: { en: "Official Languages Act; Policy on Official Languages", fr: "Loi sur les langues officielles; Politique sur les langues officielles" },
    title: { en: "Official languages", fr: "Langues officielles" },
    summary: { en: "Services to the public, and systems used by employees in bilingual regions, work equally well in English and French, including content, notices and support.", fr: "Les services au public, ainsi que les systèmes utilisés par les employés dans les régions bilingues, fonctionnent aussi bien en français qu'en anglais, y compris le contenu, les avis et le soutien." },
    look: {
      en: ["Official languages requirements in the specifications.", "Translation and revision in the schedule and budget.", "Testing in both languages."],
      fr: ["Les exigences en matière de langues officielles dans les spécifications.", "La traduction et la révision au calendrier et au budget.", "Des essais dans les deux langues."],
    },
    rightsize: {
      en: ["Plan translation as part of every release rather than at the end."],
      fr: ["Prévoir la traduction dans chaque version plutôt qu'à la fin."],
    },
    consequences: {
      en: ["Go-live delayed for translation; complaints to the Commissioner of Official Languages."],
      fr: ["Mise en service retardée pour la traduction; plaintes au commissaire aux langues officielles."],
    },
    mitigations: {
      en: ["Add translation to the definition of done and budget it now."],
      fr: ["Ajouter la traduction à la définition de « terminé » et la budgétiser dès maintenant."],
    },
    describe: { en: "{project} meets official languages obligations: content, notices and support are available in English and French of equal quality, and both are tested before release.", fr: "{project} respecte les obligations en matière de langues officielles : le contenu, les avis et le soutien sont offerts en français et en anglais de qualité égale, et les deux versions sont mises à l'essai avant la publication." },
    questions: {
      en: ["Are official languages requirements in the specifications?", "Are translation and testing in both languages planned and funded?"],
      fr: ["Les exigences en matière de langues officielles figurent-elles dans les spécifications?", "La traduction et les essais dans les deux langues sont-ils prévus et financés?"],
    },
    keywords: { en: ["official languages", "bilingual", "French", "translation"], fr: ["langues officielles", "bilingue", "anglais", "traduction"] },
    scope: [
      { when: { publicFacing: "no", digital: "no" }, status: "na", reason: { en: "No service to the public and no system for employees.", fr: "Aucun service au public et aucun système pour les employés." } },
    ],
  },
  {
    id: "DIG-6", gate: "G4", sev: "medium", base: "required",
    source: { en: "Directive on Service and Digital; GC Enterprise Architecture Framework", fr: "Directive sur les services et le numérique; Cadre d'architecture intégrée du GC" },
    title: { en: "Architecture aligned with GC standards", fr: "Architecture harmonisée avec les normes du GC" },
    summary: { en: "The solution architecture follows GC enterprise architecture expectations: reuse of enterprise solutions, cloud-first, open standards, interoperability and data residency for protected information.", fr: "L'architecture de la solution respecte les attentes du GC en matière d'architecture intégrée : réutilisation des solutions ministérielles, priorité au nuage, normes ouvertes, interopérabilité et résidence des données pour l'information protégée." },
    look: {
      en: ["The solution architecture document.", "Reuse and cloud decisions and their justification."],
      fr: ["Le document d'architecture de la solution.", "Les décisions de réutilisation et d'infonuagique et leur justification."],
    },
    rightsize: {
      en: ["Configure an existing GC platform rather than building custom."],
      fr: ["Configurer une plateforme existante du GC plutôt que de développer sur mesure."],
    },
    consequences: {
      en: ["A one-off system that cannot share data and is expensive to maintain."],
      fr: ["Un système unique qui ne peut partager de données et qui coûte cher à entretenir."],
    },
    mitigations: {
      en: ["Ask enterprise architecture for a design review before the specifications are final."],
      fr: ["Demander à l'architecture intégrée un examen de la conception avant que les spécifications soient finalisées."],
    },
    describe: { en: "The architecture of {project} follows GC enterprise architecture expectations, reusing enterprise solutions and cloud services where possible and keeping protected data in Canada.", fr: "L'architecture de {project} respecte les attentes du GC en matière d'architecture intégrée, en réutilisant les solutions ministérielles et les services infonuagiques lorsque c'est possible et en gardant les données protégées au Canada." },
    questions: {
      en: ["Is there a solution architecture reviewed by enterprise architecture?", "Were reuse and cloud options assessed first?"],
      fr: ["Existe-t-il une architecture de solution examinée par l'architecture intégrée?", "Les options de réutilisation et d'infonuagique ont-elles été évaluées en premier?"],
    },
    keywords: { en: ["solution architecture", "cloud", "reuse", "interoperab*", "data residency", "open standards"], fr: ["architecture de solution", "nuage", "infonuagique", "réutilisation", "interopérabilité", "résidence des données", "normes ouvertes"] },
    scope: [NOT_DIGITAL],
  },
  {
    id: "DIG-7", gate: "G5", sev: "low", base: "required",
    source: { en: "Policy on Service and Digital (information and data management)", fr: "Politique sur les services et le numérique (gestion de l'information et des données)" },
    title: { en: "Information and data management", fr: "Gestion de l'information et des données" },
    summary: { en: "Information of business value created by the solution is identified, with retention and disposition, metadata and data sharing planned.", fr: "L'information à valeur opérationnelle créée par la solution est déterminée, et la conservation, la disposition, les métadonnées et le partage des données sont planifiés." },
    look: {
      en: ["Retention rules for the solution's records.", "Data ownership and data sharing agreements."],
      fr: ["Les règles de conservation des documents de la solution.", "La propriété des données et les ententes de partage de données."],
    },
    rightsize: {
      en: ["Apply existing program retention schedules rather than creating new ones."],
      fr: ["Appliquer les calendriers de conservation existants du programme plutôt que d'en créer de nouveaux."],
    },
    consequences: {
      en: ["Records kept forever or destroyed too soon; access to information requests that cannot be answered."],
      fr: ["Des documents conservés indéfiniment ou détruits trop tôt; des demandes d'accès à l'information auxquelles on ne peut répondre."],
    },
    mitigations: {
      en: ["Engage the information management team before the data model is final."],
      fr: ["Consulter l'équipe de gestion de l'information avant que le modèle de données soit finalisé."],
    },
    describe: { en: "Information of business value created by {project} is identified, with retention, disposition and data ownership defined with the {dept} information management team.", fr: "L'information à valeur opérationnelle créée par {project} est déterminée, et la conservation, la disposition et la propriété des données sont définies avec l'équipe de gestion de l'information de {dept}." },
    questions: {
      en: ["Are retention and disposition rules defined for the solution's information?", "Is data ownership and sharing defined?"],
      fr: ["Des règles de conservation et de disposition sont-elles définies pour l'information de la solution?", "La propriété et le partage des données sont-ils définis?"],
    },
    keywords: { en: ["information management", "retention", "records", "data governance", "metadata"], fr: ["gestion de l'information", "conservation", "documents", "gouvernance des données", "métadonnées"] },
    scope: [NOT_DIGITAL],
  },

  // ---------------------------------------------------------------- OCM
  {
    id: "OCM-1", gate: "G4", sev: "medium", base: "required",
    source: src(cite("DMPP 4.2.6", "DGPP 4.2.6"), GUIDE),
    title: { en: "Organizational change and stakeholder engagement plan", fr: "Plan de gestion du changement et de mobilisation des intervenants" },
    summary: { en: "The people affected by the change are identified, and a plan engages them, prepares them and addresses resistance from early on, not just at deployment.", fr: "Les personnes touchées par le changement sont déterminées, et un plan les mobilise, les prépare et traite la résistance dès le début, et pas seulement au déploiement." },
    look: {
      en: ["A change impact assessment by user group.", "The engagement plan and evidence it is being followed."],
      fr: ["Une évaluation des répercussions du changement par groupe d'utilisateurs.", "Le plan de mobilisation et la preuve qu'il est suivi."],
    },
    rightsize: {
      en: ["Use the department's change network and communications channels rather than building new ones."],
      fr: ["Utiliser le réseau de gestion du changement et les canaux de communication du ministère plutôt que d'en créer de nouveaux."],
    },
    consequences: {
      en: ["A working system that people do not use; benefits not realized."],
      fr: ["Un système fonctionnel que les gens n'utilisent pas; des avantages non réalisés."],
    },
    mitigations: {
      en: ["Run change impact sessions with each affected group before the next gate."],
      fr: ["Tenir des séances sur les répercussions du changement avec chaque groupe touché avant le prochain point de contrôle."],
    },
    describe: { en: "A change management plan for {project} identifies affected groups, the impact on each, and how they are engaged and prepared from planning through deployment.", fr: "Un plan de gestion du changement de {project} détermine les groupes touchés, les répercussions sur chacun et la façon dont ils sont mobilisés et préparés de la planification au déploiement." },
    questions: {
      en: ["Have affected groups and change impacts been identified?", "Is an engagement and change plan in use?"],
      fr: ["Les groupes touchés et les répercussions du changement ont-ils été déterminés?", "Un plan de mobilisation et de changement est-il utilisé?"],
    },
    keywords: { en: ["change management", "stakeholder engagement", "change impact", "communications"], fr: ["gestion du changement", "mobilisation des intervenants", "répercussions du changement", "communications"] },
  },
  {
    id: "OCM-2", gate: "G6", sev: "high", base: "required",
    source: src(cite("DMPP 4.2.20", "DGPP 4.2.20"), GUIDE),
    title: { en: "Business readiness and training", fr: "Préparation des secteurs d'activité et formation" },
    summary: { en: "Business processes, procedures, staffing and training are ready for go-live, confirmed by the business owner. For operational readiness and deployment decisions, input from the stakeholders affected is sought and documented.", fr: "Les processus opérationnels, les procédures, la dotation et la formation sont prêts pour la mise en service, ce que confirme le responsable opérationnel. Pour les décisions sur l'état de préparation opérationnelle et le déploiement, l'apport des intervenants touchés est sollicité et consigné." },
    look: {
      en: ["The business readiness checklist signed by the business owner.", "Training completion rates for users."],
      fr: ["La liste de vérification de l'état de préparation signée par le responsable opérationnel.", "Les taux d'achèvement de la formation des utilisateurs."],
    },
    rightsize: {
      en: ["Train just in time and in the tool itself; short guides beat long courses."],
      fr: ["Former juste à temps et dans l'outil même; de courts guides valent mieux que de longs cours."],
    },
    consequences: {
      en: ["Service disruption at go-live; backlogs; workarounds."],
      fr: ["Perturbation du service à la mise en service; arriérés; solutions de contournement."],
    },
    mitigations: {
      en: ["Phase the rollout to a pilot group first."],
      fr: ["Échelonner le déploiement en commençant par un groupe pilote."],
    },
    describe: { en: "Business readiness for {project} was confirmed by the business owner: processes and procedures are updated, staffing is in place, and users are trained.", fr: "L'état de préparation des secteurs d'activité pour {project} a été confirmé par le responsable opérationnel : les processus et les procédures sont à jour, la dotation est en place et les utilisateurs sont formés." },
    questions: {
      en: ["Has the business owner confirmed readiness?", "Are users trained close to go-live?"],
      fr: ["Le responsable opérationnel a-t-il confirmé l'état de préparation?", "Les utilisateurs sont-ils formés peu avant la mise en service?"],
    },
    keywords: { en: ["business readiness", "training", "procedures", "go-live readiness"], fr: ["préparation des secteurs d'activité", "formation", "procédures", "préparation à la mise en service"] },
  },
  {
    id: "OCM-3", gate: "G5", revisit: ["G6"], sev: "high", base: "required",
    source: src(cite("DMPP 4.2.30", "DGPP 4.2.30"), GUIDE),
    title: { en: "Transition to operations with a funded owner", fr: "Transition vers l'exploitation avec un responsable financé" },
    summary: { en: "A transition plan is developed before implementation begins and updated throughout the project, so that by go-live a service owner, support model, service levels and ongoing funding are in place to run and improve the solution after the project ends.", fr: "Un plan de transition est élaboré avant le début de la mise en œuvre et mis à jour tout au long du projet, de sorte qu'à la mise en service, un responsable du service, un modèle de soutien, des niveaux de service et un financement continu soient en place pour exploiter et améliorer la solution après la fin du projet." },
    look: {
      en: ["The transition plan and the receiving organization's acceptance.", "Ongoing funding confirmed in reference levels.", "Support processes (service desk, incident, change)."],
      fr: ["Le plan de transition et l'acceptation par l'organisation qui reçoit la solution.", "Le financement continu confirmé dans les niveaux de référence.", "Les processus de soutien (centre de services, incidents, changements)."],
    },
    rightsize: {
      en: ["Keep a small product team in place after the project instead of a hand-off."],
      fr: ["Maintenir une petite équipe de produit après le projet plutôt que de procéder à une passation."],
    },
    consequences: {
      en: ["An orphaned system that degrades and becomes the next legacy problem."],
      fr: ["Un système orphelin qui se dégrade et devient le prochain problème patrimonial."],
    },
    mitigations: {
      en: ["Have the sponsor name the service owner and confirm ongoing funding before go-live."],
      fr: ["Demander au promoteur de nommer le responsable du service et de confirmer le financement continu avant la mise en service."],
    },
    describe: { en: "{project} transitions to a named service owner with a support model, service levels and ongoing funding confirmed before go-live.", fr: "{project} passe à un responsable du service désigné, avec un modèle de soutien, des niveaux de service et un financement continu confirmés avant la mise en service." },
    questions: {
      en: ["Is there a named service owner who accepts the solution?", "Is ongoing funding for operations confirmed?", "Are support processes ready?"],
      fr: ["Existe-t-il un responsable du service désigné qui accepte la solution?", "Le financement continu de l'exploitation est-il confirmé?", "Les processus de soutien sont-ils prêts?"],
    },
    keywords: { en: ["transition", "service owner", "support model", "operations", "service level*", "ongoing funding"], fr: ["transition", "responsable du service", "modèle de soutien", "exploitation", "niveau* de service", "financement continu"] },
  },
  {
    id: "OCM-4", gate: "G6", sev: "high", base: "required",
    source: GUIDE,
    title: { en: "Go-live criteria and fallback plan", fr: "Critères de mise en service et plan de repli" },
    summary: { en: "Objective go-live criteria are agreed in advance, and there is a tested plan to roll back or operate in contingency mode if the deployment fails.", fr: "Des critères objectifs de mise en service sont convenus à l'avance, et il existe un plan éprouvé pour revenir en arrière ou fonctionner en mode de contingence si le déploiement échoue." },
    look: {
      en: ["The go/no-go criteria and who decides.", "The rollback or contingency plan and evidence it was rehearsed."],
      fr: ["Les critères de décision de mise en service et qui décide.", "Le plan de retour arrière ou de contingence et la preuve qu'il a été répété."],
    },
    rightsize: {
      en: ["Release small and often so each rollback is small."],
      fr: ["Publier de petites versions fréquentes pour que chaque retour arrière soit petit."],
    },
    consequences: {
      en: ["A failed deployment with no way back disrupts services to Canadians."],
      fr: ["Un déploiement raté sans retour possible perturbe les services aux Canadiens."],
    },
    mitigations: {
      en: ["Rehearse the cutover and rollback before the gate."],
      fr: ["Répéter la bascule et le retour arrière avant le point de contrôle."],
    },
    describe: { en: "Go-live of {project} is decided against criteria agreed in advance. A rollback and contingency plan was rehearsed before deployment.", fr: "La mise en service de {project} est décidée selon des critères convenus à l'avance. Un plan de retour arrière et de contingence a été répété avant le déploiement." },
    questions: {
      en: ["Are go-live criteria agreed in advance?", "Is there a rehearsed rollback or contingency plan?"],
      fr: ["Les critères de mise en service sont-ils convenus à l'avance?", "Existe-t-il un plan de retour arrière ou de contingence répété?"],
    },
    keywords: { en: ["go-live", "go/no-go", "rollback", "cutover", "contingency plan", "fallback"], fr: ["mise en service", "décision de mise en service", "retour arrière", "bascule", "plan de contingence", "plan de repli"] },
  },
  {
    id: "OCM-5", gate: "G6", sev: "high", base: "required",
    source: GUIDE,
    title: { en: "Testing and acceptance complete", fr: "Essais et acceptation terminés" },
    summary: { en: "Functional, integration, performance, security and user acceptance testing are complete, with no unresolved defects that block the business, and the business owner accepts the solution.", fr: "Les essais fonctionnels, d'intégration, de rendement, de sécurité et d'acceptation par les utilisateurs sont terminés, sans défaut non résolu qui bloque les activités, et le responsable opérationnel accepte la solution." },
    look: {
      en: ["Test summary reports and the open defect list by severity.", "The business owner's acceptance."],
      fr: ["Les rapports sommaires d'essais et la liste des défauts ouverts par gravité.", "L'acceptation par le responsable opérationnel."],
    },
    rightsize: {
      en: ["Automate regression testing so each release does not repeat manual effort."],
      fr: ["Automatiser les essais de régression pour que chaque version ne répète pas l'effort manuel."],
    },
    consequences: {
      en: ["Defects found by the public; data corruption; emergency fixes."],
      fr: ["Des défauts découverts par le public; corruption de données; correctifs d'urgence."],
    },
    mitigations: {
      en: ["Agree the defect threshold for go-live and fix blockers before the gate."],
      fr: ["Convenir du seuil de défauts pour la mise en service et corriger les défauts bloquants avant le point de contrôle."],
    },
    describe: { en: "Testing of {project} (functional, integration, performance, security and user acceptance) is complete. No business-blocking defects remain, and the business owner has accepted the solution.", fr: "Les essais de {project} (fonctionnels, d'intégration, de rendement, de sécurité et d'acceptation par les utilisateurs) sont terminés. Il ne reste aucun défaut bloquant pour les activités, et le responsable opérationnel a accepté la solution." },
    questions: {
      en: ["Are all planned test phases complete?", "Are there no open defects that block the business?", "Has the business owner accepted the solution?"],
      fr: ["Toutes les phases d'essai prévues sont-elles terminées?", "N'y a-t-il aucun défaut ouvert qui bloque les activités?", "Le responsable opérationnel a-t-il accepté la solution?"],
    },
    keywords: { en: ["user acceptance", "UAT", "testing", "defects", "test results"], fr: ["acceptation par les utilisateurs", "EAU", "essais", "défauts", "résultats des essais"] },
  },

  // ---------------------------------------------------------------- MON
  {
    id: "MON-1", gate: "G4", revisit: ["G5", "G6"], sev: "medium", base: "required",
    source: src(cite("DMPP 4.1.5, 4.2.10", "DGPP 4.1.5, 4.2.10")),
    title: { en: "Regular status reporting against tolerances", fr: "Rapports d'étape réguliers par rapport aux tolérances" },
    summary: { en: "Progress on scope, schedule, cost, risks and benefits is reported regularly to governance against the baseline and tolerances, with honest status.", fr: "Les progrès en matière de portée, de calendrier, de coûts, de risques et d'avantages sont communiqués régulièrement à la gouvernance par rapport aux données de référence et aux tolérances, avec un état honnête." },
    look: {
      en: ["Recent status reports and dashboards.", "Whether a status ever turned amber or red before an issue became public."],
      fr: ["Les rapports d'étape et tableaux de bord récents.", "Si un état est déjà passé au jaune ou au rouge avant qu'un problème devienne public."],
    },
    rightsize: {
      en: ["Report from the team's working tools; a one-page dashboard is enough."],
      fr: ["Produire les rapports à partir des outils de travail de l'équipe; un tableau de bord d'une page suffit."],
    },
    consequences: {
      en: ["\"Watermelon\" reporting (green outside, red inside) hides trouble until it is expensive."],
      fr: ["Des rapports « melon d'eau » (verts à l'extérieur, rouges à l'intérieur) dissimulent les difficultés jusqu'à ce qu'elles coûtent cher."],
    },
    mitigations: {
      en: ["Base status on measures (variance, burn-up, milestones) rather than opinion."],
      fr: ["Fonder l'état sur des mesures (écarts, graphique d'avancement, jalons) plutôt que sur des opinions."],
    },
    describe: { en: "{project} reports monthly to its steering committee on scope, schedule, cost, risks and benefits against the baseline and tolerances, using measures rather than opinion.", fr: "{project} rend compte chaque mois à son comité directeur de la portée, du calendrier, des coûts, des risques et des avantages par rapport aux données de référence et aux tolérances, en s'appuyant sur des mesures plutôt que sur des opinions." },
    questions: {
      en: ["Is status reported regularly against the baseline and tolerances?", "Is the status based on measures?"],
      fr: ["L'état est-il communiqué régulièrement par rapport aux données de référence et aux tolérances?", "L'état est-il fondé sur des mesures?"],
    },
    keywords: { en: ["status report*", "dashboard", "variance", "earned value", "reporting"], fr: ["rapport* d'étape", "tableau de bord", "écart", "valeur acquise", "rapports"] },
  },
  {
    id: "MON-2", gate: "G4", sev: "medium", base: "recommended",
    source: src(cite("DMPP 4.5.1 (digital investment oversight by the Chief Information Officer of Canada)", "DGPP 4.5.1 (surveillance des investissements numériques par le dirigeant principal de l'information du Canada)")),
    title: { en: "Portfolio and central reporting", fr: "Rapports sur le portefeuille et rapports centraux" },
    summary: { en: "The project reports to the departmental portfolio, and projects approved by Treasury Board or under central oversight report to TBS (including the Office of the Chief Information Officer for digital projects) as required.", fr: "Le projet rend compte au portefeuille ministériel, et les projets approuvés par le Conseil du Trésor ou faisant l'objet d'une surveillance centrale rendent compte au SCT (y compris au Bureau du dirigeant principal de l'information pour les projets numériques) au besoin." },
    look: {
      en: ["The project's entry in departmental portfolio reports.", "Reports provided to TBS and their dates."],
      fr: ["L'inscription du projet dans les rapports sur le portefeuille ministériel.", "Les rapports fournis au SCT et leurs dates."],
    },
    rightsize: {
      en: ["Reuse the same dashboard for steering committee, PMO and TBS."],
      fr: ["Réutiliser le même tableau de bord pour le comité directeur, le BGP et le SCT."],
    },
    consequences: {
      en: ["Central agencies lose confidence and increase oversight."],
      fr: ["Les organismes centraux perdent confiance et accroissent la surveillance."],
    },
    mitigations: {
      en: ["Agree the reporting calendar with the PMO and TBS."],
      fr: ["Convenir du calendrier des rapports avec le BGP et le SCT."],
    },
    describe: { en: "{project} reports to the {dept} project portfolio and provides the reports required by the Treasury Board Secretariat for projects under central oversight.", fr: "{project} rend compte au portefeuille de projets de {dept} et fournit les rapports exigés par le Secrétariat du Conseil du Trésor pour les projets sous surveillance centrale." },
    questions: {
      en: ["Does the project report to the departmental portfolio?", "Are any required reports to TBS being provided?"],
      fr: ["Le projet rend-il compte au portefeuille ministériel?", "Les rapports requis au SCT sont-ils fournis?"],
    },
    keywords: { en: ["portfolio report*", "oversight", "OCIO", "TBS reporting", "project dashboard"], fr: ["rapport* sur le portefeuille", "surveillance", "BDPI", "rapports au SCT", "tableau de bord du projet"] },
    scope: [
      { when: { highRisk: "yes" }, status: "required", reason: { en: "High-risk or Treasury Board-approved projects are under central oversight.", fr: "Les projets à risque élevé ou approuvés par le Conseil du Trésor font l'objet d'une surveillance centrale." } },
    ],
  },
  {
    id: "MON-3", gate: "G1", revisit: ["G3", "G5", "G6", "G7"], sev: "medium", base: "required",
    source: src(cite("DMPP 4.2.32, 4.2.33, 4.1.9", "DGPP 4.2.32, 4.2.33, 4.1.9")),
    title: { en: "Lessons learned captured and shared", fr: "Leçons apprises consignées et partagées" },
    summary: { en: "Lessons learned from similar projects are reviewed when the project starts, and the project's own lessons are documented at the end of each phase and shared with key stakeholders and the senior designated official.", fr: "Les leçons apprises de projets semblables sont examinées au démarrage du projet, et les leçons du projet sont consignées à la fin de chaque phase et communiquées aux principaux intervenants et au cadre supérieur désigné." },
    look: {
      en: ["The lessons learned log.", "Evidence that the PMO has received and used them."],
      fr: ["Le registre des leçons apprises.", "La preuve que le BGP les a reçues et utilisées."],
    },
    rightsize: {
      en: ["Hold a short retrospective at each gate rather than one long session at the end."],
      fr: ["Tenir une courte rétrospective à chaque point de contrôle plutôt qu'une longue séance à la fin."],
    },
    consequences: {
      en: ["The same mistakes repeat on the next project."],
      fr: ["Les mêmes erreurs se répètent au prochain projet."],
    },
    mitigations: {
      en: ["Run a retrospective now with the core team and submit it to the PMO."],
      fr: ["Tenir dès maintenant une rétrospective avec l'équipe de base et la transmettre au BGP."],
    },
    describe: { en: "Lessons learned from {project} were captured at each gate and at close-out, and shared with the {dept} project management office.", fr: "Les leçons apprises de {project} ont été consignées à chaque point de contrôle et à la clôture, et partagées avec le bureau de gestion de projet de {dept}." },
    questions: {
      en: ["Were lessons from similar projects reviewed at the start?", "Are lessons documented at the end of each phase?", "Are they shared with the senior designated official?"],
      fr: ["Les leçons de projets semblables ont-elles été examinées au démarrage?", "Les leçons sont-elles consignées à la fin de chaque phase?", "Sont-elles communiquées au cadre supérieur désigné?"],
    },
    keywords: { en: ["lessons learned", "retrospective"], fr: ["leçons apprises", "rétrospective"] },
  },
  {
    id: "MON-4", gate: "G7", sev: "high", base: "required",
    source: src(cite("DMPP 4.2.34", "DGPP 4.2.34"), GUIDE),
    title: { en: "Formal close-out", fr: "Clôture officielle" },
    summary: { en: "The project is formally closed: deliverables are accepted, contracts and finances are closed, documentation is archived and resources released. The close-out report is shared with the departmental committee that approved the project and with the senior designated official.", fr: "Le projet est officiellement clos : les livrables sont acceptés, les contrats et les finances sont fermés, la documentation est archivée et les ressources sont libérées. Le rapport de clôture est communiqué au comité ministériel qui a approuvé le projet et au cadre supérieur désigné." },
    look: {
      en: ["The close-out report and the sponsor's approval.", "Final financial position compared with the approved budget.", "Contract close-out records."],
      fr: ["Le rapport de clôture et l'approbation du promoteur.", "La situation financière finale comparée au budget approuvé.", "Les comptes rendus de clôture des contrats."],
    },
    rightsize: {
      en: ["Use the PMO's close-out checklist; combine with the post-implementation review for small projects."],
      fr: ["Utiliser la liste de vérification de clôture du BGP; la combiner avec l'examen postérieur à la mise en œuvre pour les petits projets."],
    },
    consequences: {
      en: ["Projects that never end keep spending; open commitments; lost records."],
      fr: ["Des projets qui ne se terminent jamais continuent de dépenser; des engagements ouverts; des documents perdus."],
    },
    mitigations: {
      en: ["Set a close-out date and checklist at the next steering committee."],
      fr: ["Fixer une date et une liste de vérification de clôture au prochain comité directeur."],
    },
    describe: { en: "{project} was formally closed: deliverables accepted, contracts and finances closed, documentation archived and a close-out report approved by {sponsor}.", fr: "{project} a été officiellement clos : livrables acceptés, contrats et finances fermés, documentation archivée et rapport de clôture approuvé par {sponsor}." },
    questions: {
      en: ["Are contracts and finances closed?", "Is there a close-out report approved by the sponsor?"],
      fr: ["Les contrats et les finances sont-ils fermés?", "Existe-t-il un rapport de clôture approuvé par le promoteur?"],
    },
    keywords: { en: ["close-out", "closeout", "closure report", "project closure"], fr: ["clôture", "rapport de clôture", "clôture du projet"] },
  },
  {
    id: "MON-5", gate: "G7", sev: "medium", base: "recommended",
    source: src(GUIDE, { en: "The Independent Reviewer's Handbook (TBS)", fr: "Guide de l'examinateur indépendant (SCT)" }),
    title: { en: "Post-implementation review", fr: "Examen postérieur à la mise en œuvre" },
    summary: { en: "About six months after completion, a review confirms whether the project delivered as planned, whether business outcomes are being realized, how well the transition to an ongoing service went, and what the department should learn from it.", fr: "Environ six mois après l'achèvement, un examen confirme si le projet a été réalisé comme prévu, si les résultats opérationnels sont obtenus, si la transition vers un service continu s'est bien déroulée et ce que le ministère devrait en retenir." },
    look: {
      en: ["The post-implementation review report and the management response."],
      fr: ["Le rapport d'examen postérieur à la mise en œuvre et la réponse de la direction."],
    },
    rightsize: {
      en: ["Combine with the benefits measurement for small projects."],
      fr: ["Combiner avec la mesure des avantages pour les petits projets."],
    },
    consequences: {
      en: ["Problems in operation persist; the department learns nothing about its investments."],
      fr: ["Les problèmes d'exploitation persistent; le ministère n'apprend rien sur ses investissements."],
    },
    mitigations: {
      en: ["Schedule the review now for a date when results can be observed."],
      fr: ["Planifier l'examen dès maintenant à une date où les résultats pourront être observés."],
    },
    describe: { en: "A post-implementation review of {project} assessed operation, outcomes and lessons, and the management response is tracked by the business owner.", fr: "Un examen postérieur à la mise en œuvre de {project} a évalué l'exploitation, les résultats et les leçons, et la réponse de la direction est suivie par le responsable opérationnel." },
    questions: {
      en: ["Is a post-implementation review scheduled or done?", "Is there a management response to its findings?"],
      fr: ["Un examen postérieur à la mise en œuvre est-il prévu ou réalisé?", "Existe-t-il une réponse de la direction à ses constatations?"],
    },
    keywords: { en: ["post-implementation review", "PIR"], fr: ["examen postérieur à la mise en œuvre", "EPMO"] },
    scope: [
      { when: { highRisk: "yes" }, status: "required", reason: { en: "High-risk projects are expected to have a formal post-implementation review.", fr: "Les projets à risque élevé doivent faire l'objet d'un examen officiel postérieur à la mise en œuvre." } },
    ],
  },
  {
    id: "MON-6", gate: "G3", revisit: ["G5", "G7"], sev: "medium", base: "required",
    source: src(cite("DMPP 4.1.6", "DGPP 4.1.6")),
    title: { en: "Baseline information to the Office of the Comptroller General", fr: "Données de référence au Bureau du contrôleur général" },
    summary: { en: "For every project with a total cost of $25 million or more, the senior designated official submits baseline project information on scope, schedule, costs and risks to the Office of the Comptroller General after project approval, expenditure authority, any amended approval or authority, and project close-out.", fr: "Pour tout projet dont le coût total est de 25 M$ ou plus, le cadre supérieur désigné soumet au Bureau du contrôleur général des données de référence sur la portée, le calendrier, les coûts et les risques après l'approbation du projet, le pouvoir de dépenser, toute approbation ou tout pouvoir modifié, et la clôture du projet." },
    look: {
      en: ["Confirmation from the senior designated official's office that each baseline was submitted.", "The baseline figures, consistent with the approved scope, schedule and cost."],
      fr: ["La confirmation du bureau du cadre supérieur désigné que chaque donnée de référence a été soumise.", "Les données de référence, conformes à la portée, au calendrier et aux coûts approuvés."],
    },
    rightsize: {
      en: ["Reuse the baseline already prepared for the approval; no separate analysis is needed."],
      fr: ["Réutiliser les données de référence préparées pour l'approbation; aucune analyse distincte n'est nécessaire."],
    },
    consequences: {
      en: ["Non-compliance with the directive; the Comptroller General cannot track the project against its baseline."],
      fr: ["Non-conformité à la directive; le contrôleur général ne peut suivre le projet par rapport à ses données de référence."],
    },
    mitigations: {
      en: ["Send the current baseline to the senior designated official's office after the next approval."],
      fr: ["Transmettre les données de référence actuelles au bureau du cadre supérieur désigné après la prochaine approbation."],
    },
    describe: { en: "Baseline information on the scope, schedule, costs and risks of {project} is submitted to the Office of the Comptroller General after each approval and at close-out.", fr: "Des données de référence sur la portée, le calendrier, les coûts et les risques de {project} sont soumises au Bureau du contrôleur général après chaque approbation et à la clôture." },
    questions: {
      en: ["Has baseline information been submitted to the Office of the Comptroller General after each approval so far?", "Is submission planned after future approvals and at close-out?"],
      fr: ["Des données de référence ont-elles été soumises au Bureau du contrôleur général après chaque approbation jusqu'ici?", "La soumission est-elle prévue après les approbations futures et à la clôture?"],
    },
    keywords: { en: ["Comptroller General", "OCG", "baseline information"], fr: ["contrôleur général", "BCG", "données de référence"] },
    scope: [
      { when: { ocg: "no" }, status: "na", reason: { en: "The total cost is under $25 million.", fr: "Le coût total est inférieur à 25 M$." } },
    ],
  },
];
