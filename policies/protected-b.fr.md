# Traitement de l'information Protégé B

| Élément | Détail |
|---|---|
| Application | Navigateur des points de contrôle de projet, version 1.0.0 et suivantes |
| Dernier examen | 2026-10-15 |
| Statut | Énoncé de conception et autoévaluation. **Il ne s'agit pas d'une autorisation d'utiliser l'application avec de l'information Protégé B.** |

_La version anglaise de ce document fait foi. La présente traduction a été rédigée avec l'aide d'outils de traduction automatique et n'a pas encore été révisée par un traducteur agréé._

Cette page explique comment l'application est conçue pour protéger l'information Protégé B, comment cela correspond aux exigences de sécurité du gouvernement du Canada, et ce qui doit être vrai de votre environnement pour que ces protections tiennent. Les mises en garde de la section 5 font partie de l'énoncé; ce ne sont pas des notes de bas de page.

> La cote **Protégé B** s'applique à l'information dont la compromission risquerait vraisemblablement de causer un préjudice grave à une personne, à une organisation ou au gouvernement. Une évaluation de projet à un point de contrôle contient souvent de l'information de ce genre : demandes de financement non annoncées et présentations au Cabinet ou au Conseil du Trésor, estimations de coûts et provisions pour éventualités, stratégie d'approvisionnement avant la publication d'une demande de soumissions, et constats francs sur les risques et les faiblesses. L'application utilise donc **Protégé B** comme cote par défaut. Ne choisissez une cote inférieure que lorsque le contenu le justifie clairement.

## 1. Cadre des exigences

La conception répond aux instruments suivants :

- la **Politique sur la sécurité du gouvernement** et la **Directive sur la gestion de la sécurité** (Conseil du Trésor), qui exigent que les ministères protègent l'information selon sa catégorie de sécurité et gèrent les risques pour les systèmes d'information;
- l'**ITSG-33**, *La gestion des risques liés à la sécurité des TI : Une méthode axée sur le cycle de vie* (Centre canadien pour la cybersécurité), dont les mesures servent à la section 4 à décrire les mesures de protection de l'application elle-même;
- la **Politique sur la planification et la gestion des investissements** et la **Directive sur la gestion des projets et programmes**, objet des évaluations que produit cet outil (les documents confidentiels du Cabinet contenus dans des ébauches de présentations sont assujettis à leurs propres règles; ne collez pas de documents confidentiels du Cabinet dans l'outil);
- l'**ITSP.40.111**, *Algorithmes cryptographiques pour l'information NON CLASSIFIÉ, PROTÉGÉ A et PROTÉGÉ B* (CCC);
- l'**ITSP.40.006**, *Nettoyage des supports de TI* (CCC), pour l'élimination.

Les politiques et normes de sécurité ministérielles ont préséance. Votre agent de sécurité du ministère (ASM) et votre équipe de sécurité de la TI décident si l'application peut être utilisée avec de l'information Protégé B, et à quelles conditions.

## 2. Résumé

| Exigence | Comment l'application y répond | Dépend de (voir la section 5) |
|---|---|---|
| L'information reste sous contrôle ministériel | Fonctionne entièrement dans le navigateur. Aucune composante côté serveur; aucune connexion réseau (bloquée par la politique de sécurité du contenu) | Copie du code fiable et non modifiée (5.2) |
| Protection au repos | Chiffrement AES-256-GCM dans le stockage du navigateur par défaut. Le stockage non chiffré est refusé pour Protégé A et B | Appareil géré avec chiffrement intégral du disque (5.1); cryptographie du navigateur non validée par le PVMC (5.3) |
| Protection en transit | Rien n'est transmis. Fichiers d'exportation chiffrés pour déplacer le travail entre appareils | Voies approuvées pour les fichiers que vous transmettez (5.6) |
| Contrôle d'accès | Phrase de passe pour déverrouiller; verrouillage automatique après 15 minutes d'inactivité (réglable); verrouillage manuel | Robustesse de la phrase de passe; verrouillage de l'écran de l'appareil (5.1, 5.4) |
| Marquage | Bandeau de cote sur chaque écran; cote sur les rapports, chaque page imprimée, le nom et le contenu des fichiers exportés | Choix de la bonne cote par l'utilisateur (5.8) |
| Élimination | Effacement en une étape de toutes les données stockées; les données chiffrées deviennent irrécupérables lorsque la clé disparaît | Assainissement de l'appareil en fin de vie (5.5) |
| Responsabilisation | Non fournie : aucun journal d'accès (5.7) | Gestion ministérielle des documents |

## 3. Mesures de protection en détail

### 3.1 Aucune transmission d'information

- L'application est constituée de HTML, de CSS et de JavaScript statiques. Tout le traitement (y compris l'examen des documents de projet collés) se fait dans l'onglet du navigateur.
- Chaque page déclare une **politique de sécurité du contenu** : `default-src 'none'; connect-src 'none'; form-action 'none'; script-src 'self'; style-src 'self'; base-uri 'none'; object-src 'none'`. Le navigateur bloque donc les connexions réseau, les soumissions de formulaires, les scripts intégrés et distants et le contenu distant, même si un attaquant parvenait à injecter du balisage. `referrer` est défini à `no-referrer`.
- Aucune bibliothèque de tiers n'est utilisée à l'exécution; il n'y a ni outils d'analyse, ni polices ou images d'autres sites, ni témoins.
- Les essais automatisés font échouer la compilation si le code client utilise une interface réseau ou de témoins, ou si la politique de sécurité du contenu est affaiblie. Un essai dans le navigateur confirme que `fetch` est bloqué.

### 3.2 Chiffrement au repos

- **Algorithme :** AES-256 en mode GCM (chiffrement authentifié), avec un nouveau vecteur d'initialisation aléatoire de 96 bits à chaque enregistrement.
- **Dérivation de clé :** PBKDF2-HMAC-SHA-256, 600 000 itérations, sel aléatoire de 128 bits. Les enveloppes de moins de 100 000 itérations sont refusées.
- AES et SHA-256 figurent parmi les algorithmes approuvés par l'ITSP.40.111 pour l'information Protégé B. PBKDF2 est la fonction de dérivation de clé à partir d'un mot de passe décrite dans la publication NIST SP 800-132.
- Les clés sont créées comme clés Web Crypto **non extractibles** et n'existent qu'en mémoire pendant le déverrouillage. La phrase de passe n'est jamais stockée.
- La cote de sécurité et les paramètres de dérivation de clé sont liés au texte chiffré à titre de données authentifiées; ils ne peuvent donc pas être modifiés sans que ce soit détecté.
- **Application de la politique dans le code :** la couche de stockage refuse d'écrire une évaluation Protégé A ou Protégé B sans chiffrement dans le stockage du navigateur. Des essais unitaires le vérifient.
- Choisir **Non enregistré** garde l'évaluation uniquement dans la mémoire de l'onglet.

### 3.3 Accès à l'évaluation stockée

- Le déverrouillage exige la phrase de passe (au moins 15 caractères). Les gestionnaires de mots de passe et le collage sont pris en charge, comme l'exige le critère 3.3.8 des WCAG 2.2.
- **Verrouillage automatique** après 15 minutes d'inactivité par défaut, réglable de 15 minutes à 8 heures ou désactivé. Le bouton **Verrouiller** est toujours offert dans l'en-tête. Le verrouillage efface l'évaluation déchiffrée de la page.
- L'application refuse de fonctionner dans un cadre (iframe), ce qui empêche d'autres pages de l'intégrer pour lire le contenu déchiffré.

### 3.4 Marquage

- Un bandeau en haut de chaque écran indique la cote (par exemple **PROTÉGÉ B**), le mode de stockage et « Les données restent sur cet appareil ».
- Les rapports affichent la cote en haut et en bas. Les impressions la répètent en haut à droite et en bas de **chaque page**.
- Le nom des fichiers téléchargés comprend la cote (par exemple `…-PROTECTED-B-fr.md`). Les fichiers Markdown et CSV commencent par la cote, et les fichiers chiffrés la portent dans leur en-tête authentifié.

### 3.5 Exportation et déplacement de l'information

- L'**exportation chiffrée** utilise une phrase de passe distincte que vous choisissez, de sorte que le fichier peut être déplacé sans révéler la phrase de passe du navigateur. Transmettez la phrase de passe par une autre voie que le fichier.
- Les rapports Markdown ou CSV et les exportations JSON non chiffrées ne peuvent pas être chiffrés par l'application. Lorsque la cote est Protégé, l'application vous demande de confirmer avant le téléchargement et vous rappelle de ne stocker le fichier que sur des systèmes approuvés.

### 3.6 Élimination

- **Données et sécurité → Effacer toutes les données de ce navigateur** supprime tout ce que l'application stocke.
- Comme les évaluations stockées sont chiffrées, la suppression des données chiffrées et l'oubli de la clé rendent illisibles les résidus éventuels sur le disque (effacement cryptographique).

## 4. Correspondance avec les mesures de l'ITSG-33 (mesures de l'application elle-même)

| Mesure | Mise en œuvre dans l'application | État |
|---|---|---|
| AC-4 Application du contrôle du flux d'information | La politique de sécurité du contenu bloque toutes les connexions sortantes et les soumissions de formulaires | Mise en œuvre |
| AC-11 Verrouillage de session | Verrouillage automatique (réglable) et manuel; contenu déchiffré retiré de la page | Mise en œuvre |
| AC-12 Fin de session | Le verrouillage supprime la clé en mémoire; un rechargement exige la phrase de passe | Mise en œuvre |
| AU-2 / AU-12 Événements vérifiables | Aucune journalisation des accès à l'évaluation | **Non mise en œuvre** (5.7) |
| CM-7 Fonctionnalité minimale | Aucun serveur, réseau, témoin, code de tiers ni script intégré | Mise en œuvre |
| IA-5 Gestion des authentifiants | Longueur minimale de la phrase de passe; phrase jamais stockée; phrases distinctes pour les exportations | Partielle : aucune récupération, aucune vérification de complexité au-delà de la longueur (5.4) |
| IA-7 / SC-13 Protection cryptographique | Algorithmes approuvés par l'ITSP.40.111 au moyen de Web Crypto | Partielle : la validation du module dépend du navigateur et de la plateforme (5.3) |
| MP-6 Nettoyage des supports | Fonction d'effacement et effacement cryptographique | Partielle : l'assainissement des appareils relève du ministère (5.5) |
| SC-8 Confidentialité des transmissions | Aucune transmission; fichiers d'exportation chiffrés | Mise en œuvre; les voies de transmission des fichiers relèvent du ministère (5.6) |
| SC-12 Gestion des clés | Sels et vecteurs aléatoires; clés non extractibles; clé conservée seulement en mémoire | Mise en œuvre |
| SC-18 Code mobile | Seuls les scripts de la même origine peuvent s'exécuter (`script-src 'self'`) | Mise en œuvre |
| SC-28 Protection au repos | AES-256-GCM; stockage non chiffré refusé pour l'information protégée | Mise en œuvre, comme défense en profondeur (5.1) |
| SI-10 Validation des entrées | Tout contenu saisi est échappé avant l'affichage; les fichiers importés sont validés | Mise en œuvre |
| SI-12 Conservation de l'information | Les données restent jusqu'à ce que vous les effaciez; rien n'est conservé ailleurs | Mise en œuvre; le calendrier de conservation relève du ministère |

## 5. Mises en garde et dépendances

Ces conditions sont **nécessaires** pour que les mesures ci-dessus aient un sens. Plusieurs dépendent de la façon et de l'endroit où l'application est déployée, ou d'autorisations que l'application ne peut contrôler.

### 5.1 L'appareil

N'utilisez l'application que sur un **appareil géré par le gouvernement du Canada et autorisé pour l'information Protégé B**, doté du chiffrement intégral du disque, de correctifs à jour, d'une protection des terminaux et d'un verrouillage d'écran imposé. N'utilisez pas d'appareils personnels ou partagés. Le stockage du navigateur réside sur le disque, dans le profil du navigateur de l'utilisateur. Le chiffrement de l'application est une défense en profondeur et **ne remplace pas le chiffrement de l'appareil**.

Les **extensions de navigateur** peuvent lire le contenu de n'importe quelle page, y compris les évaluations déchiffrées. Les ministères devraient restreindre les extensions sur les appareils utilisés pour l'information Protégé B.

### 5.2 Provenance du code (hébergement et origine)

- **GitHub Pages n'est pas un service ministériel.** Il ne sert que le code de l'application et ne reçoit jamais le contenu des évaluations. Toutefois, quiconque contrôle le dépôt contrôle le code qu'exécute votre navigateur. Une modification compromise ou malveillante pourrait supprimer ces protections. Utilisez une version examinée.
- Sur `github.io`, **tous les sites GitHub Pages d'un même compte partagent une même origine** (par exemple `https://numbap.github.io`) et donc le même stockage de navigateur. Les autres sites de ce compte pourraient lire les données chiffrées (sans pouvoir les déchiffrer), les supprimer ou les remplacer. L'authentification GCM détecte le remplacement.
- GitHub Pages ne peut pas envoyer d'en-têtes de sécurité HTTP personnalisés (comme `frame-ancestors`, `X-Content-Type-Options` ou une politique de sécurité du contenu transmise par en-tête). L'application compense par une politique `<meta>` et une vérification de cadre dans le code, qui offrent une protection moindre.
- **Recommandation pour l'utilisation avec de l'information Protégé B :** le ministère devrait héberger une copie examinée et figée à une version donnée sur sa propre infrastructure ou un hébergement approuvé, sur une **origine dédiée** (son propre nom d'hôte), avec des en-têtes de sécurité définis par le serveur. La commande `npm start` sert l'application localement.

### 5.3 Validation du module cryptographique

L'application utilise l'implémentation Web Crypto intégrée au navigateur. La question de savoir s'il s'agit d'un **module validé par le PVMC (FIPS 140-2/140-3)** dépend du navigateur, du système d'exploitation et de la configuration, et **ne peut généralement pas être garantie**. Si les normes ministérielles exigent une cryptographie validée pour l'information Protégé B au repos (ITSG-33 IA-7 et SC-13), fiez-vous au chiffrement intégral et validé du disque de l'appareil comme mesure principale.

### 5.4 Phrases de passe

- La protection n'est pas plus forte que la phrase de passe. La longueur minimale est imposée; la robustesse au-delà n'est pas mesurée.
- Il n'y a **aucune récupération de la phrase de passe**. Une phrase oubliée signifie que l'évaluation stockée est perdue; conservez des exportations chiffrées comme copies de sauvegarde.
- Il n'y a pas de blocage après des tentatives infructueuses. Une personne disposant d'une copie du profil du navigateur peut essayer des phrases de passe hors ligne; la dérivation de clé à 600 000 itérations la ralentit sans pouvoir l'empêcher.

### 5.5 Mémoire et résidus

JavaScript ne peut pas effacer la mémoire de façon fiable. Pendant qu'une évaluation est déverrouillée, et un certain temps après, du contenu déchiffré peut subsister en mémoire, dans le fichier d'échange, les fichiers de mise en veille prolongée ou les vidages sur incident. Le chiffrement intégral du disque et les procédures ministérielles d'assainissement (ITSP.40.006) visent ces copies. Les sauvegardes du navigateur, les profils itinérants ou les dossiers synchronisés peuvent copier les données chiffrées; vérifiez la configuration ministérielle.

### 5.6 Fichiers que vous créez

Les rapports Markdown et CSV, les exportations JSON non chiffrées, les impressions et les PDF produits par le navigateur ne sont **pas chiffrés**. Stockez-les uniquement dans des dépôts approuvés pour l'information Protégé B, marquez-les et transmettez-les uniquement par des voies approuvées (par exemple des systèmes de collaboration ministériels approuvés pour Protégé B ou un courriel chiffré). Vérifiez que le dossier de téléchargement du navigateur n'est pas synchronisé avec un service infonuagique non approuvé. Le contenu copié dans le presse-papiers peut être visible par d'autres applications ou l'historique du presse-papiers.

### 5.7 Aucune piste de vérification

L'application ne consigne pas qui a ouvert ou modifié une évaluation; elle ne satisfait donc pas aux exigences de vérification de l'ITSG-33 (famille AU) applicables aux systèmes de documents officiels. Utilisez-la comme outil de travail et conservez les documents officiels dans les systèmes ministériels.

### 5.8 Responsabilités des utilisateurs

La cote reflète ce que l'utilisateur choisit. Le choix d'une cote ne rend pas à lui seul le traitement conforme. Les utilisateurs doivent respecter les règles ministérielles sur le besoin de savoir, le stockage, la transmission et l'élimination. **L'information Protégé C et classifiée n'est pas prise en charge.**

### 5.9 Statut du présent énoncé

Cet énoncé a été préparé en même temps que le code de l'application par un assistant d'IA (Claude, Anthropic). Il s'agit d'un énoncé de conception appuyé par des essais automatisés, et **non** d'une évaluation par une autorité ministérielle de sécurité. L'application n'a pas fait l'objet d'une évaluation de la sécurité et d'une autorisation (EAS). Avant de l'utiliser avec de l'information Protégé B, obtenez une approbation au moyen du processus de sécurité de votre ministère. Ce processus peut traiter l'application comme un outil utilisé sur un terminal déjà autorisé.

## 6. Éléments probants

| Élément probant | Emplacement |
|---|---|
| Essais unitaires sur le chiffrement, la politique de stockage et l'absence de réseau | `tests/storage.test.mjs` |
| Vérifications de sécurité dans le navigateur (la politique bloque le réseau; seul du texte chiffré est stocké; le verrouillage efface la page; l'intégration dans un cadre est refusée; le stockage non chiffré d'information protégée est refusé; cote sur les rapports et le nom des fichiers) | `tests/security/run.mjs` |
| Implémentation du chiffrement | `js/vault.js` |
| Application de la politique de stockage | `js/storage.js` |
| Politique de sécurité du contenu | `index.html` et chaque page de documentation |

Tous ces éléments s'exécutent à chaque validation dans le flux d'intégration continue du projet.
