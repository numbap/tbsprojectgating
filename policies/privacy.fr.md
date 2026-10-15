# Politique de confidentialité

| Élément | Détail |
|---|---|
| Application | Navigateur des points de contrôle de projet, version 1.0.0 et suivantes |
| Date d'entrée en vigueur | 2026-10-15 |
| Code source | [github.com/numbap/tbsprojectgating](https://github.com/numbap/tbsprojectgating), licence MIT |

_La version anglaise de cette politique fait foi. La présente traduction a été rédigée avec l'aide d'outils de traduction automatique et n'a pas encore été révisée par un traducteur agréé._

## Résumé

- Le Navigateur des points de contrôle de projet est une application à **code source ouvert** qui fonctionne **entièrement dans votre navigateur Web** (côté client).
- **Elle n'envoie rien de ce que vous saisissez à un serveur** : ni au projet, ni à GitHub, ni à un tiers. Il n'y a ni comptes, ni outils d'analyse, ni publicité, ni pixels de suivi, ni scripts ou polices de tiers.
- **Ce que vous enregistrez reste dans le stockage local de votre navigateur, sur votre appareil**, chiffré à moins que vous ne choisissiez autrement pour du travail non classifié. **L'application ne crée ni ne lit de témoins (cookies).**
- Vous pouvez effacer en tout temps tout ce que l'application a stocké.

## Comment nous nous assurons que rien n'est transmis

- L'application est constituée de fichiers statiques (HTML, CSS et JavaScript). Une fois que votre navigateur les a téléchargés, tout le traitement (portée, estimation de la complexité, analyse des documents, notation, production des rapports et chiffrement) se fait sur votre appareil.
- Chaque page déclare une **politique de sécurité du contenu** avec `connect-src 'none'` et `form-action 'none'`. Votre navigateur bloque ainsi toute connexion réseau et toute soumission de formulaire, même si le code était modifié pour tenter de le faire. Les pages définissent aussi `referrer` à `no-referrer`.
- Les essais automatisés du projet font échouer la compilation si le code de l'application contient une interface réseau ou de témoins (`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `document.cookie` et autres), ou si la politique de sécurité du contenu est affaiblie.

## Ce qui est stocké sur votre appareil

Tout est stocké au moyen du `localStorage` du navigateur pour l'adresse d'où l'application est servie. Rien n'est stocké dans des témoins, le `sessionStorage` ou IndexedDB.

| Clé de stockage | Contenu | Moment de l'écriture |
|---|---|---|
| `gating-navigator-settings` | Vos choix : cote de sécurité, mode de stockage, délai de verrouillage. Aucun contenu d'évaluation. | À la configuration ou lors d'un changement de paramètres |
| `gating-navigator-vault` | Votre évaluation, **chiffrée** (AES-256-GCM) avec une clé dérivée de votre phrase de passe. Illisible sans la phrase de passe. | Mode chiffré (par défaut) |
| `gating-navigator-state` | Votre évaluation, **non chiffrée**. | Seulement si vous choisissez le stockage non chiffré, permis uniquement pour les évaluations non classifiées |
| `gating-theme` | Préférence de thème clair ou sombre | Lorsque vous utilisez le bouton de thème |
| `gating-lang` | Langue de l'interface (français ou anglais) | Lorsque vous utilisez le bouton de langue |

Si vous choisissez **Non enregistré**, l'application n'écrit que vos paramètres; l'évaluation n'existe que dans l'onglet ouvert.

L'évaluation peut contenir des détails sur le projet (coûts, financement, approche d'approvisionnement, risques), vos réponses au questionnaire, vos notes, vos plans d'action et tout texte de document collé pour examen. Votre phrase de passe n'est jamais stockée. La clé de chiffrement n'est conservée qu'en mémoire pendant que l'évaluation est déverrouillée.

## Fichiers téléchargés

Les rapports (Markdown, CSV, impressions) et les fichiers d'évaluation exportés sont créés sur votre appareil et enregistrés à l'endroit où votre navigateur enregistre les téléchargements. Vous contrôlez ces fichiers. Les exportations chiffrées ne peuvent être ouvertes qu'avec la phrase de passe que vous choisissez pour elles.

## L'hébergeur

Lorsque l'application est utilisée à partir de GitHub Pages, votre navigateur télécharge les fichiers de l'application à partir de GitHub. Comme tout serveur Web, GitHub reçoit les renseignements habituels d'une requête (votre adresse IP, l'agent utilisateur du navigateur, les fichiers demandés et l'heure) et peut les consigner conformément à la [déclaration générale de confidentialité de GitHub](https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement). GitHub ne reçoit **rien** de ce que vous tapez, collez, téléversez ou enregistrez dans l'application.

Les organisations qui ne veulent aucune requête externe peuvent héberger leur propre copie de l'application (voir le fichier README); l'application ne fait alors aucune requête à l'extérieur de cet hôte.

## Liens vers d'autres sites

Le pied de page renvoie au système de suivi des problèmes du projet sur GitHub pour signaler les problèmes d'accessibilité. Ce lien vous amène sur GitHub, dont la propre déclaration de confidentialité s'applique. Les signalements peuvent être publics : **n'y incluez aucun contenu d'évaluation ni aucune information protégée ou sensible.**

## Effacer vos données

- Dans l'application : **Données et sécurité → Effacer toutes les données de ce navigateur** supprime toutes les clés énumérées ci-dessus.
- Dans votre navigateur : effacer les données du site pour l'adresse de l'application les supprime aussi.
- Les fichiers téléchargés doivent être supprimés séparément.

Pour l'information protégée, suivez aussi les procédures de votre ministère relatives à l'élimination de l'information et à l'assainissement des appareils.

## Renseignements personnels

L'application ne recueille pas de renseignements personnels. Tout renseignement personnel que vous saisissez dans une évaluation (par exemple le nom des responsables) reste sur votre appareil, sous votre contrôle. Si un ministère déploie ou modifie l'application, il lui incombe d'évaluer ses propres obligations en matière de protection de la vie privée, par exemple en vertu de la *Loi sur la protection des renseignements personnels*.

## Modifications de la présente politique

Les modifications sont apportées dans le dépôt public du code source; l'historique de la politique peut donc y être consulté. La date d'entrée en vigueur ci-dessus est mise à jour lorsque la politique change.

## Coordonnées

Les questions sur la présente politique peuvent être soumises au moyen du [système de suivi des problèmes](https://github.com/numbap/tbsprojectgating/issues) du projet. N'y incluez aucune information sensible.
