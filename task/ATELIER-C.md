# Atelier C : construire ton application

**Horaire** : 13:15–16:30. **Objectif** : partir d'un problème réel des Jeux, imaginer ta solution, la défendre dans un PRD, puis la construire seul avec la méthode du matin. À 16:15, ton application démarre, et la première tranche de ton PRD est couverte par des tests verts.

Personne ne te dit quoi construire. Ta table reçoit un problème et des données ; la solution est la tienne. Ce qui est exigé, c'est qu'elle réponde au problème, que tu saches dire pourquoi, et qu'elle soit livrée avec la méthode.

Tu repars du dépôt du matin, sur ta branche de la journée, avec ton `CLAUDE.md`. Chacun a son propre dépôt ; les participants d'une même table ont le même problème et peuvent s'entraider (challenger un PRD, relire une spec, débloquer un test), mais chacun construit sa propre application.

## Le déroulé

| Horaire     | Ce que tu fais                                                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 13:15–13:25 | Consignes. Ton coach présente le problème de ta table.                                                                                   |
| 13:25–13:50 | `/clear`, puis `/prd` : ta vision, challengée par Claude. Le problème, pour qui, ta solution, et son découpage en tranches.              |
| 13:50–14:05 | **Challenge** : un voisin relit ton PRD avec la [grille](GRILLE-RELECTURE.md), puis ton coach valide ta tranche 1. Tu valides après lui. |
| 14:05–14:20 | `/spec TR1` : la spec de ta première tranche. Ton coach la relit vite : le PRD a déjà été challengé.                                     |
| 14:20–14:40 | `/spec-plan`, validation, puis `/tdd-task T01` : la première tâche seulement.                                                            |
| 14:40       | **Point coach** : si ta première tâche n'est pas au vert, ton coach réduit la tranche avec toi.                                          |
| 14:40–16:15 | `/tdd-task` pour les tâches suivantes, puis `/converge`. La tranche 2 si tu as fini (`/spec TR2`).                                       |
| 16:15–16:30 | **Gel** : dernier commit, et trois lignes en tête de `README.md` (le problème et pour qui, comment lancer l'application, ce qui manque). |

## Ton PRD

Le PRD est ta vision produit, sur une page. C'est toi qui l'écris : Claude le met en forme, te pose des questions et te dit où il est faible, mais il ne choisit pas à ta place. Pour l'écrire, pars du problème, pas de la solution :

- **Qui** souffre du problème, précisément ? Un journaliste qui écrit à 18 h, un supporter qui arrive de Thiès, un conducteur qui part de Pikine.
- **Comment fait-il aujourd'hui**, et qu'est-ce qui ne va pas ?
- **Qu'est-ce que tu proposes**, et pourquoi ça plutôt qu'autre chose ?
- **Comment saura-t-on que ça marche**, pendant ta démo ?
- **Par quoi commences-tu ?** La tranche 1 est la plus petite chose qui ait de la valeur seule, et elle tient en 2 heures de code.

Ton texte pour `/prd` dit tout ça avec tes mots, en quelques phrases. Il n'a pas besoin d'être complet : ce qui manque, Claude te le demandera. Pour la forme, regarde le texte de l'atelier B.

**Le challenge.** Un PRD validé par son seul auteur ne vaut rien. À 13:50, tu échanges ton PRD avec un voisin de table : chacun relit celui de l'autre avec les cinq questions PRD de la [grille de relecture](GRILLE-RELECTURE.md), et le défend face à ses « non ». Ton coach tranche ensuite deux points : ta vision répond-elle au problème de la table, et ta tranche 1 tient-elle en 2 heures ? Tu peux changer d'avis sur ta solution à ce moment-là : c'est fait pour.

## Les règles

- **Une page de PRD et une page de spec au plus** (`pnpm spec:check` le vérifie). La tranche 1 a **une ou deux règles métier**. Une tranche trop ambitieuse ne tient pas en 2 heures de code : c'est l'erreur la plus fréquente.
- **La spec suit le PRD.** Elle réalise une tranche, et rien d'autre. Une nouvelle idée en cours de route va d'abord dans le PRD.
- **Tu pars du dépôt du matin** et tu suis le module `disciplines` comme modèle. Pas de nouvelle dépendance sans l'accord de ton coach, sauf le SDK Claude (voir plus bas).
- **Une API d'abord.** Un écran seulement quand l'API de ta tranche est verte, et s'il reste du temps.
- **Les données fournies** sont dans `task/donnees/<thème>/`. Tu n'es pas obligé de tout utiliser, et tu peux créer tes propres tables. Pour charger un fichier : quand ta table existe, copie-le dans `apps/api/data/` en le nommant comme ta table (`02-resultats.json` → table `resultats`), adapte les noms de colonnes si besoin, puis `pnpm db:seed` (après avoir arrêté `pnpm dev`). Les données sont fictives.
- **À court d'idées après 10 minutes** : ouvre les [pistes](PISTES-ATELIER-C.md), ou demande-les à ton coach. Ce sont des points de départ, pas des consignes.
- **Bloqué plus de 10 minutes** : appelle ton coach. Un problème technique (licence, crédits API, réseau, installation) part chez le référent technique.

## Si ta solution utilise Claude

Tu as des crédits pour l'API Claude : ton application peut appeler Claude, par exemple pour résumer, répondre à une question en langage courant ou lire un message libre. C'est un choix de solution comme un autre : ton PRD dit pourquoi l'IA aide ton utilisateur, et le challenge le vérifiera. La réponse de Claude change d'un appel à l'autre ; tes règles non.

- **Ta tranche garde une règle métier que l'application applique elle-même**, autour de la réponse de Claude (par exemple : on ne propose que des lieux qui existent). La spec teste ces règles, pas ce que Claude doit « bien » répondre.
- **La clé reste dans `apps/api/.env`** : `ANTHROPIC_API_KEY=sk-ant-…`, que tu colles toi-même. Ce fichier est ignoré par git, et le hook refuse d'écrire une clé ailleurs. Ne la colle jamais dans la conversation avec Claude Code. L'API charge ce fichier au démarrage, et le SDK y lit la clé.
- **Le SDK officiel** est la seule dépendance ajoutée : `pnpm --filter @joj/api add @anthropic-ai/sdk`. Modèle : `claude-opus-5-5`.
- **Les tests n'appellent jamais Claude.** L'appel est derrière un port dans `application/`, comme `DisciplineRepository` : une classe abstraite (par exemple `AssistantTouristique`), un faux dans `application/testing/` qui renvoie une réponse fixée par le test, et l'implémentation avec le SDK dans `infra/`. Les tests restent rapides, gratuits et reproductibles ; `pnpm check` tourne sans clé ni réseau.
- **Demande une réponse structurée** (du JSON validé par un schéma Zod) plutôt que du texte à découper : ton cas d'usage contrôle ensuite chaque champ comme une donnée venue de l'extérieur.
- **Ménage tes crédits.** Tu essaies l'appel réel à la main, dans Swagger, quelques fois : pas en boucle, pas dans les tests.

## Comment les projets sont choisis

À 16:15, les coachs choisissent trois projets, un par thème, présentés devant l'auditoire de 16:30 à 17:00 (5 minutes de démo, 2 minutes de questions). Quatre critères :

1. **Vision produit** : le problème est précis, la solution y répond, et la démo commence par lui.
2. **Respect du PRD et de la spec** : ce qui est livré correspond à la tranche validée et à ses scénarios.
3. **Tests** : chaque scénario a son test (`pnpm spec:check specs/NNN-nom --trace`), et `pnpm check` est vert.
4. **Démo qui fonctionne** : elle démarre avec `pnpm dev` et se montre en moins de 5 minutes.

## Thème 1 : Résultats et médailles

**Le problème.** Pendant les Jeux, les épreuves s'enchaînent sur plusieurs sites. Le public veut savoir qui a gagné aujourd'hui et où en est son pays ; les journalistes doivent publier vite, et vérifient les résultats à la main d'une source à l'autre. Une erreur de podium, une fois publiée, se corrige mal.

**Les données** (`task/donnees/medailles/`) : `01-pays.json` (code à trois lettres et nom de 12 pays) et `02-resultats.json` (12 épreuves avec la date et les pays médaillés d'or, d'argent et de bronze).

## Thème 2 : Guide touristique de Dakar

**Le problème.** Des milliers de visiteurs et de supporters sont à Dakar pour les Jeux, souvent pour la première fois. Entre deux épreuves, ils ont quelques heures devant eux et ne savent pas quoi faire, ni où : les animations sont annoncées un peu partout, et rien ne dit ce qui est proche, ce qui se passe maintenant, ou ce qui vaut le détour.

**Les données** (`task/donnees/guide-touristique/`) : `01-lieux.json` (12 lieux avec leur quartier et leur type : site olympique, culture, marché, nature…) et `02-animations.json` (24 animations avec leur lieu, leur début et leur fin, pendant les Jeux).

## Thème 3 : Mobilité et covoiturage

**Le problème.** Pendant le pic de l'événement, l'accès aux sites olympiques (Dakar, Diamniadio, Saly) est saturé : les navettes sont pleines, les taxis rares et chers. Pourtant, beaucoup de voitures partent vers les mêmes sites avec des places vides, et les supporters ne savent pas qui part, d'où, ni quand.

**Les données** (`task/donnees/mobilite/`) : `01-sites.json` (4 sites olympiques et leur ville) et `02-trajets.json` (20 trajets proposés, avec le conducteur, le quartier de départ, le site d'arrivée, l'heure de départ et le nombre de places).

## Écrire ta spec

Une fois ton PRD validé, ton texte pour `/spec` cite la tranche, puis précise ses règles avec la réponse attendue de l'API (statut et code d'erreur en majuscules) et ce qui est hors périmètre. Par exemple, pour une tranche de réservation :

```
/spec TR1 Réserver une place sur un trajet existant (nom et téléphone du passager), et voir les places restantes d'un trajet. On ne peut pas réserver sur un trajet complet : refus 409 avec le code TRIP_FULL. Un même téléphone ne réserve pas deux fois le même trajet : refus 409 avec le code PASSENGER_ALREADY_BOOKED. Pas d'écran : seulement l'API.
```

Pour une tranche qui utilise Claude, dis ce que fait l'assistant et les règles qui l'encadrent :

```
/spec TR1 Poser une question en langage courant et recevoir jusqu'à trois animations du jour qui y répondent, avec une phrase d'explication pour chacune. Les explications sont rédigées par un assistant IA. Une question vide est refusée : refus 400 avec le code QUESTION_EMPTY. Seules des animations du jour qui existent sont proposées : une proposition inconnue est écartée. Pas d'écran : seulement l'API.
```

## À 16:30

- `git log --oneline` : le PRD et la spec validés, puis un commit par tâche.
- `pnpm check` est vert, et `pnpm dev` démarre l'application.
- Les trois lignes en tête de `README.md` sont écrites.
- Tu repars avec ton dépôt : ton `CLAUDE.md`, ton PRD, tes specs, tes tests et ton application.
