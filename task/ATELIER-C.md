# Atelier C : construire ton application

**Horaire** : 13:15–16:30. **Objectif** : construire seul une application de bout en bout, sur le thème de ta table, avec la méthode du matin. À 16:15, elle démarre et au moins une fonctionnalité est couverte par des tests verts.

Tu repars du dépôt du matin, sur ta branche de la journée, avec ton `CLAUDE.md`. Chacun a son propre dépôt ; les participants d'une même table ont le même thème et peuvent s'entraider (relire une spec, débloquer un test), mais chacun construit sa propre application.

## Le déroulé

| Horaire     | Ce que tu fais                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 13:15–13:20 | Consignes. Ton coach annonce le thème de ta table.                                                                                |
| 13:20–13:50 | `/clear`, puis `/spec` : la spec de ton application, sur ton thème. **Une page au plus.**                                         |
| 13:50–14:10 | Ton coach relit et valide ta spec : périmètre faisable en 2 heures, chaque scénario testable. Tu ne valides qu'après lui.         |
| 14:10–14:30 | `/spec-plan`, validation, puis `/tdd-task T01` : la première tâche seulement.                                                     |
| 14:30       | **Point coach** : si ta première tâche n'est pas au vert, ton coach réduit le périmètre avec toi.                                 |
| 14:30–16:15 | `/tdd-task` pour les tâches suivantes, puis `/converge`. Une deuxième spec si tu as fini.                                         |
| 16:15–16:30 | **Gel** : dernier commit, et trois lignes en tête de `README.md` (ce que fait ton application, comment la lancer, ce qui manque). |

## Les règles

- **Une page de spec au plus** (`pnpm spec:check` le vérifie) et **une ou deux règles métier**. Une spec trop ambitieuse ne tient pas en 2 heures de code : c'est l'erreur la plus fréquente.
- **Tu pars du dépôt du matin** et tu suis le module `disciplines` comme modèle. Pas de nouvelle dépendance sans l'accord de ton coach.
- **Une API d'abord.** Un écran seulement quand l'API de ta fonctionnalité est verte, et s'il reste du temps.
- **Les données fournies** sont dans `task/donnees/<thème>/`. Pour les charger : quand ta table existe, copie le fichier dans `apps/api/data/` en le nommant comme ta table (`02-resultats.json` → table `resultats`), adapte les noms de colonnes si besoin, puis `pnpm db:seed` (après avoir arrêté `pnpm dev`). Les données sont fictives.
- **Une spec relue avant d'être validée.** À 13:50, échange ta spec avec un voisin de table : chacun relit celle de l'autre avec la [grille de relecture](GRILLE-RELECTURE.md) et note ses « non ». Ton coach tranche ensuite les points restants.
- **Bloqué plus de 10 minutes** : appelle ton coach. Un problème technique (licence, réseau, installation) part chez le référent technique.

## Comment les projets sont choisis

À 16:15, les coachs choisissent trois projets, un par thème, présentés devant l'auditoire de 16:30 à 17:00 (5 minutes de démo, 2 minutes de questions). Quatre critères :

1. **Respect de la spec** : ce qui est livré correspond aux scénarios validés.
2. **Tests** : chaque scénario a son test (`pnpm spec:check specs/NNN-nom --trace`), et `pnpm check` est vert.
3. **Utilité** : l'application répond au besoin du thème.
4. **Démo qui fonctionne** : elle démarre avec `pnpm dev` et se montre en moins de 5 minutes.

## Thème 1 : Résultats et médailles

**Le besoin.** Pendant les Jeux, le public et les journalistes veulent suivre les résultats du jour et le tableau des médailles par pays, à jour après chaque épreuve.

**Les données** (`task/donnees/medailles/`) : `01-pays.json` (code à trois lettres et nom de 12 pays) et `02-resultats.json` (12 épreuves avec la date et les pays médaillés d'or, d'argent et de bronze).

**Des idées de fonctionnalités** (choisis-en une, deux si tu avances vite) :

- Enregistrer le podium d'une épreuve. Règles possibles : une épreuve n'a qu'un seul podium (`409`) ; les trois médaillés sont trois pays différents et connus (`422`).
- Afficher le tableau des médailles : pour chaque pays, le nombre de médailles d'or, d'argent et de bronze, trié par or, puis argent, puis bronze.
- Afficher les résultats d'une journée, triés par discipline.

## Thème 2 : Guide touristique de Dakar

**Le besoin.** Les visiteurs et les supporters déjà sur place veulent savoir quoi faire aujourd'hui : les animations du jour, ce qui se passe maintenant, et les lieux à voir près d'un site olympique.

**Les données** (`task/donnees/guide-touristique/`) : `01-lieux.json` (12 lieux avec leur quartier et leur type : site olympique, culture, marché, nature…) et `02-animations.json` (24 animations avec leur lieu, leur début et leur fin, pendant les Jeux).

**Des idées de fonctionnalités** :

- Afficher l'agenda d'une journée : les animations du jour, triées par heure de début, avec leur lieu.
- Afficher ce qui est en cours à une heure donnée : une animation est en cours si l'heure est entre son début (inclus) et sa fin (exclue).
- Proposer une animation. Règles possibles : la fin est après le début (`400`) ; elle a lieu pendant les Jeux, du 31 octobre au 13 novembre 2026 (`422`).

## Thème 3 : Mobilité et covoiturage

**Le besoin.** Pendant le pic de l'événement, l'accès aux sites olympiques (Dakar, Diamniadio, Saly) est saturé. Des conducteurs proposent des places dans leur voiture, et des supporters les réservent.

**Les données** (`task/donnees/mobilite/`) : `01-sites.json` (4 sites olympiques et leur ville) et `02-trajets.json` (20 trajets proposés, avec le conducteur, le quartier de départ, le site d'arrivée, l'heure de départ et le nombre de places).

**Des idées de fonctionnalités** :

- Réserver une place sur un trajet. Règles possibles : plus de place disponible (`409`, par exemple `TRIP_FULL`) ; un même passager ne réserve pas deux fois le même trajet (`409`).
- Chercher les trajets vers un site pour une journée, triés par heure de départ, avec les places restantes.
- Proposer un trajet. Règle possible : le nombre de places est entre 1 et 4 (`400`).

## Écrire ta spec

Ton texte pour `/spec` dit, en quelques phrases : ce que l'utilisateur peut faire, chaque règle avec la réponse attendue de l'API (statut et code d'erreur en majuscules), et ce qui est hors périmètre. Inspire-toi du texte donné à l'atelier B. Par exemple :

```
/spec Réservation de covoiturage : réserver une place sur un trajet existant (nom et téléphone du passager), et voir les places restantes d'un trajet. On ne peut pas réserver sur un trajet complet : refus 409 avec le code TRIP_FULL. Un même téléphone ne réserve pas deux fois le même trajet : refus 409 avec le code PASSENGER_ALREADY_BOOKED. Pas d'écran : seulement l'API.
```

## À 16:30

- `git log --oneline` : un commit par tâche.
- `pnpm check` est vert, et `pnpm dev` démarre l'application.
- Les trois lignes en tête de `README.md` sont écrites.
- Tu repars avec ton dépôt : ton `CLAUDE.md`, tes specs, tes tests et ton application.
