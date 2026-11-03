# Atelier B : de la spécification au code

**Horaire** : 11:15–12:15 (1 h). **Objectif** : appliquer une fois le cycle complet sur une petite fonctionnalité de l'API. La spec décide quoi, les tests prouvent que c'est fait. C'est Claude qui écrit le code ; ton travail consiste à décrire le besoin, à relire et valider la spec puis le plan, et à vérifier le résultat.

C'est la répétition de l'atelier C de l'après-midi : même cycle, mêmes commandes, sur un sujet imposé et plus petit.

| Horaire     | Qui                 | Quoi                                                                                    |
| ----------- | ------------------- | --------------------------------------------------------------------------------------- |
| 11:15–11:35 | le formateur        | démonstration du cycle `/spec` → `/spec-plan` → `/tdd-task` → `/converge` sur Bénévoles |
| 11:35–12:05 | toi                 | le même cycle sur Bénévoles, version réduite (ci-dessous)                               |
| 12:05–12:15 | toi et le relecteur | `/converge` : chaque scénario a un test, tout est vert, le relecteur donne son verdict  |

## Le cycle

Les quatre commandes s'enchaînent toujours dans cet ordre. Chacune s'arrête et attend ta réponse avant l'étape suivante.

| Étape | Tu tapes                  | Claude fait                                                                                                              | Toi, tu…                                                                                                                                    |
| ----- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `/spec <texte du besoin>` | écrit `specs/NNN-nom/spec.md` : user stories, scénarios `AS1`, `AS2`… au format Étant donné / Quand / Alors              | relis chaque scénario. Chaque règle de l'énoncé a-t-elle son scénario ? Le « Alors » est-il vérifiable ? Corrige, puis écris « je valide ». |
| 2     | `/spec-plan`              | écrit `plan.md` : résumé, fichiers par couche, tables, erreurs, un test par scénario, six tâches au plus                 | vérifie les codes d'erreur et les statuts HTTP de l'énoncé, et que chaque scénario a un test prévu. Puis « je valide ».                     |
| 3     | `/tdd-task`               | pour chaque tâche : écrit le test, prouve qu'il échoue (`pnpm tdd:red`), écrit le code, vérifie (`pnpm verify`), commite | regarde passer les tâches. Tu peux interrompre (`Échap`) et lancer `/tdd-task T02` pour une seule tâche.                                    |
| 4     | `/converge`               | lance `pnpm spec:check --trace` et `pnpm check`, puis fait relire par le sous-agent `relecteur` dans un contexte vierge  | lis le verdict. Si des tâches de correction sont ajoutées, relance `/tdd-task`, puis `/converge`.                                           |

La fonctionnalité est terminée quand `/converge` répond **Converged** : la spec passe alors au statut `Implémentée`.

## Avant de commencer (2 min)

1. `git status` : l'arbre doit être propre, sur la branche de la journée, avec ton `CLAUDE.md` de l'atelier A commité.
2. `/clear` dans Claude, pour repartir d'une conversation vide.

## Relire avant « je valide »

Les deux « je valide » de l'atelier sont ton vrai travail : ce que la spec oublie, aucun test ne le vérifiera. Avant chacun, prends 3 minutes avec la [grille de relecture](GRILLE-RELECTURE.md) : cinq questions pour la spec, trois pour le plan. Une seule réponse « non » suffit pour ne pas valider.

Sur Bénévoles, une spec qui passe la grille dit au moins ce qui se passe quand :

- on inscrit quelqu'un sur un créneau qui n'existe pas ;
- on inscrit la dernière personne d'un créneau (la place restante passe à 0, sans refus) ;
- la capacité vaut 0, ou la fin n'est pas après le début.

## Bénévoles, version réduite (spec `001`)

**Pourquoi.** Chaque discipline a besoin de bénévoles pour accueillir le public et aider à l'organisation. Les responsables ouvrent des créneaux, et les bénévoles s'y inscrivent. Aujourd'hui tout se fait sur papier, et des créneaux débordent.

**Ce que l'on doit pouvoir faire.**

- Ouvrir un créneau pour une discipline existante : une heure de début, une heure de fin (après le début) et une capacité, c'est-à-dire un nombre maximal de bénévoles (au moins 1).
- Inscrire un bénévole sur ce créneau, avec son nom et son email.

**La règle métier**, prouvée par un test :

| Règle                                         | Réponse de l'API                       |
| --------------------------------------------- | -------------------------------------- |
| On n'inscrit personne sur un créneau complet. | refus `409`, code d'erreur `SLOT_FULL` |

**Un exemple pour relire les scénarios.** Un créneau de Lutte, le 2 novembre 2026 de 9 h à 12 h, avec une capacité de 2.

1. Awa s'inscrit : c'est accepté, il reste 1 place.
2. Moussa s'inscrit : c'est accepté, il ne reste aucune place.
3. Fatou essaie de s'inscrire : c'est refusé, avec `SLOT_FULL`.

**Hors périmètre** : l'écran, la consultation d'un créneau et de ses inscrits, les doublons d'email, la désinscription, la modification ou la suppression d'un créneau, l'envoi d'un email de confirmation, les comptes des bénévoles.

**Le texte à donner à `/spec`** (copie-le tel quel) :

```
/spec Bénévoles : ouvrir un créneau (début, fin, capacité maximale d'au moins 1) pour une discipline existante, et inscrire un bénévole (nom, email) sur ce créneau. On ne peut pas inscrire quelqu'un sur un créneau complet : refus 409 avec le code SLOT_FULL. Pas d'écran : seulement l'API.
```

**Réussi si** la spec a un scénario pour le cas nominal et un pour le créneau complet, elle passe la [grille de relecture](GRILLE-RELECTURE.md), le plan prévoit `SLOT_FULL` en `409`, et `/converge` répond « Converged ».

### Si tu as fini avant 12:05

Ajoute la seconde règle et la consultation, avec le même cycle (spec `002`, après `/clear`) :

```
/spec Bénévoles, suite : consulter un créneau avec ses horaires, sa capacité, ses places restantes et ses inscrits dans l'ordre d'inscription. On ne peut pas inscrire deux fois le même email sur un créneau, sans tenir compte des majuscules (awa@joj.sn et Awa@JOJ.sn sont le même email) : refus 409 avec le code VOLUNTEER_ALREADY_REGISTERED. Pas d'écran : seulement l'API.
```

## 12:05 : l'heure de la relecture

- **Toutes les tâches sont cochées** : lance `/converge`.
- **Il reste des tâches** : ne force pas. Demande à Claude « relis cette branche avec le relecteur » : le sous-agent relit ce qui est fait et dit ce qui manque. Tu finiras pendant la pause déjeuner, ou tu compareras avec le corrigé.

## Le corrigé

La branche `corrige/atelier-b` contient la fonctionnalité Bénévoles complète (créneau, inscription, consultation, les deux règles), produite avec ce cycle : spec et plan validés, un commit par tâche, deux passages de `/converge`. Elle est publiée à 12:05 : il faut d'abord la récupérer depuis le dépôt de la formation (`upstream`), avec `git fetch upstream`. Pour la comparer à ton travail sans quitter ta branche :

```bash
git fetch upstream
git log --oneline upstream/corrige/atelier-b
git diff HEAD upstream/corrige/atelier-b -- specs/
```

Les numéros de scénario ne correspondent pas forcément aux tiens. Le corrigé couvre la version complète, où `AS3` est le créneau complet et `AS4` l'email déjà inscrit ; dans ta version réduite, le créneau complet est sans doute `AS2`. Compare les scénarios par leur titre, pas par leur numéro.

## En fin d'atelier

- `git log --oneline` : un commit par tâche, chacun avec un message qui cite sa tâche et son scénario (par exemple `feat(volunteers): T03 refuse a full slot (001-AS2)`).
- `pnpm spec:check specs/001-<nom> --trace` : chaque scénario pointe vers au moins un test.
- `git push` : ton travail est sauvegardé sur ton dépôt GitHub avant la pause.

## Si ça bloque

- **`/tdd-task` s'arrête après deux échecs sur une tâche** : lis son explication. Le plus souvent, la tâche est trop grosse ou le plan est ambigu. Corrige le plan à la main, puis relance `/tdd-task Tnn`.
- **`/converge` en est à son deuxième passage sans converger** : il s'arrête et te demande de trancher. Tu peux accepter l'écart, changer la spec, ou appeler ton coach.
- **Un commit est refusé** : lis le message du hook. Il dit ce qui ne va pas (format, lint, test, message de commit). N'utilise jamais `--no-verify`.
- **Claude demande une permission inattendue** (supprimer des fichiers, `pnpm install`) : refuse, et demande-lui pourquoi il en a besoin.
- **Bloqué plus de 10 minutes** : appelle ton coach.

Pour le détail des commandes, voir la section « Méthode » du [README](../README.md#méthode).
