# 001 — Bénévoles : ouvrir un créneau et s'y inscrire : plan

**Statut** : Validé

## 1. Résumé

On construit le module `volunteers` de l'API : un responsable de discipline ouvre un créneau d'accueil avec une date, des heures de début et de fin et une capacité, puis un bénévole s'y inscrit avec son nom et son email. À la fin des tâches, l'API refuse toute inscription au-delà de la capacité, même quand deux bénévoles visent la dernière place en même temps, et répond par un conflit `SLOT_FULL`. Le travail tient en cinq tâches, dans l'ordre des couches : le créneau dans le domaine, l'inscription dans le domaine, les cas d'usage, la persistance, puis les routes HTTP. La consultation d'un créneau, le refus d'un email en double, la désinscription et tout écran sont laissés aux tranches TR2 et TR3.

Les mots de la spec et leur nom dans le code :

| Dans la spec      | Dans le code                   | Ce que c'est                                                                             |
| ----------------- | ------------------------------ | ---------------------------------------------------------------------------------------- |
| créneau           | `Slot`                         | Une plage d'accueil d'une discipline : date, heure de début, heure de fin, capacité.     |
| capacité          | `capacity`                     | Le nombre maximum de bénévoles inscrits, entier supérieur ou égal à 1.                   |
| inscrits          | `registeredCount`              | Le nombre d'inscriptions déjà enregistrées sur le créneau.                               |
| inscription       | `Registration`                 | Un bénévole inscrit à un créneau, identifié par son nom et son email.                    |
| ouvrir un créneau | `OpenSlot`                     | Le cas d'usage qui crée un créneau dans une discipline existante.                        |
| s'inscrire        | `RegisterVolunteer`            | Le cas d'usage qui ajoute une inscription à un créneau qui n'est pas complet.            |
| discipline        | `Discipline` (module existant) | La discipline à laquelle le créneau est rattaché ; on réutilise le module `disciplines`. |

## 2. Fichiers par couche

On crée le module `volunteers` dans `apps/api/src/modules/volunteers/`, organisé comme le module Disciplines : un dossier par couche (`domain`, `application`, `infra`, `http`). Le front ne change pas, car la spec ne contient aucun écran.

- **shared** :
  - `packages/shared/src/volunteers.ts` contient les schémas Zod : `openSlotSchema` (corps de l'ouverture d'un créneau : `disciplineId` UUID, `date` au format `AAAA-MM-JJ`, `startTime` et `endTime` au format `HH:MM` avec la fin strictement après le début, `capacity` entier supérieur ou égal à 1), `registerVolunteerSchema` (corps de l'inscription : `name` nettoyé et non vide de 100 caractères au plus, `email` nettoyé et bien formé), `slotIdParamsSchema`, `slotSchema` et `registrationSchema` (les réponses).
  - `packages/shared/src/volunteers.spec.ts` vérifie ces schémas.
  - `packages/shared/src/index.ts` exporte le nouveau fichier.
- **domain** :
  - `domain/slot.ts` contient l'entité `Slot` : `create()` vérifie la date réelle, l'ordre des heures et la capacité ; `restore()` relit la base ; `register({ id, name, email, now })` refuse si `registeredCount` atteint `capacity`, sinon incrémente le compte et renvoie une `Registration`.
  - `domain/registration.ts` contient l'entité `Registration` : `create()` nettoie le nom et l'email et les vérifie.
  - `domain/volunteers.errors.ts` déclare `VolunteerError`, ses codes et les fabriques `slotNotFound(id)` et `slotFull(id, capacity)`.
  - `domain/slot.spec.ts` et `domain/registration.spec.ts` sont les tests unitaires de ces entités.
- **application** :
  - `application/slot.repository.ts` est le port `SlotRepository` : `findById(id)` (avec le nombre d'inscrits), `insert(slot)`, `addRegistration(registration)` qui lève `SLOT_FULL` si la capacité est déjà atteinte au moment de l'écriture.
  - `application/testing/in-memory-slot.repository.ts` est le faux repository fidèle à ce contrat, pour les tests.
  - `application/use-cases/open-slot.ts` : `OpenSlot` vérifie que la discipline existe grâce au cas d'usage `GetDiscipline` du module Disciplines, crée le `Slot` et l'enregistre.
  - `application/use-cases/register-volunteer.ts` : `RegisterVolunteer` charge le créneau (sinon `SLOT_NOT_FOUND`), appelle `slot.register()` pour un message clair, puis `addRegistration()` qui garantit la capacité.
  - `application/volunteers.application.spec.ts` teste ces deux cas d'usage avec les repositories en mémoire.
  - `apps/api/src/modules/disciplines/disciplines.module.ts` est modifié pour exporter `GetDiscipline`, que le module `volunteers` importe.
- **infra** :
  - `infra/volunteers.schema.ts` déclare les tables `slots` et `registrations` (voir la section 3).
  - `infra/slot.mapper.ts` et `infra/registration.mapper.ts` contiennent `toDomain()` et `toRow()`.
  - `infra/drizzle-slot.repository.ts` implémente le port. `addRegistration()` ouvre une transaction, verrouille la ligne du créneau (`SELECT … FOR UPDATE`), compte les inscriptions, lève `SLOT_FULL` si le créneau est complet, sinon insère : deux inscriptions simultanées passent l'une après l'autre.
  - `infra/drizzle-slot.repository.int.spec.ts` est le test d'intégration sur PGlite en mémoire.
- **http** :
  - `http/slots.controller.ts` est le controller fin, avec deux routes :
    - `POST /api/slots` ouvre un créneau ; il renvoie `201` et le créneau (`id`, `disciplineId`, `date`, `startTime`, `endTime`, `capacity`, `registeredCount`, `createdAt`).
    - `POST /api/slots/:id/registrations` inscrit un bénévole ; il renvoie `201` et l'inscription (`id`, `slotId`, `name`, `email`, `registeredAt`).
  - `volunteers.module.ts` relie `SlotRepository` à `DrizzleSlotRepository` et déclare les cas d'usage ; il est ajouté aux `imports` de `apps/api/src/app.module.ts`.
  - `apps/api/test/slots.e2e.spec.ts` est le test e2e des deux routes.
- **web** : rien. L'écran du créneau et sa fausse API arrivent avec TR3.

## 3. Données

On stocke les créneaux et les inscriptions dans deux tables. Migration : `pnpm db:generate --name=volunteers`.

- `slots` : `id` (uuid, clé primaire), `discipline_id` (uuid, non nul), `date` (date), `start_time` et `end_time` (time), `capacity` (integer), `created_at` (timestamp avec fuseau, précision 3).
  - Clé étrangère `discipline_id` vers `disciplines.id`, avec `ON DELETE CASCADE` : un créneau appartient toujours à une discipline existante (AS2), et supprimer une discipline continue de fonctionner.
  - Contrainte `CHECK (capacity >= 1)` : la capacité est valide même si le domaine est contourné (AS4).
  - Contrainte `CHECK (end_time > start_time)` : les horaires sont cohérents (AS3).
- `registrations` : `id` (uuid, clé primaire), `slot_id` (uuid, non nul), `name` (varchar 100), `email` (varchar 254), `registered_at` (timestamp avec fuseau, précision 3).
  - Clé étrangère `slot_id` vers `slots.id`, avec `ON DELETE CASCADE` : une inscription vise toujours un créneau existant (AS8).
  - Index sur `slot_id` : le comptage des inscrits d'un créneau reste rapide.
  - Le plafond de capacité ne s'exprime pas en contrainte SQL : il est garanti par le verrou de ligne pris dans `addRegistration()` (AS7).

`registeredCount` n'est pas une colonne : le repository le calcule en comptant les lignes de `registrations`.

## 4. Erreurs

Chaque refus de la spec devient une erreur métier (`AppError`), avec un code stable et un statut HTTP. Les erreurs de format détectées par les schémas Zod de `packages/shared` sortent avant le domaine, avec le code générique `VALIDATION_FAILED` (400) et le champ en cause, comme dans le module Disciplines ; les codes de domaine ci-dessous protègent les mêmes règles quand le domaine est appelé sans passer par HTTP.

| Code AppError                | Catégorie  | HTTP | Quand                                                      | Scénario |
| ---------------------------- | ---------- | ---- | ---------------------------------------------------------- | -------- |
| `DISCIPLINE_NOT_FOUND`       | NOT_FOUND  | 404  | La discipline du créneau n'existe pas (code existant).     | AS2      |
| `SLOT_DATE_INVALID`          | VALIDATION | 400  | La date n'est pas une date du calendrier.                  | AS3      |
| `SLOT_TIME_RANGE_INVALID`    | VALIDATION | 400  | L'heure de fin est égale ou antérieure à l'heure de début. | AS3      |
| `SLOT_CAPACITY_INVALID`      | VALIDATION | 400  | La capacité vaut 0, est négative ou n'est pas entière.     | AS4      |
| `REGISTRATION_NAME_REQUIRED` | VALIDATION | 400  | Le nom est vide ou fait seulement d'espaces.               | AS6      |
| `REGISTRATION_EMAIL_INVALID` | VALIDATION | 400  | L'email est mal formé.                                     | AS6      |
| `SLOT_FULL`                  | CONFLICT   | 409  | Le créneau compte déjà autant d'inscrits que sa capacité.  | AS7      |
| `SLOT_NOT_FOUND`             | NOT_FOUND  | 404  | Aucun créneau n'a cet identifiant.                         | AS8      |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit ; l'e2e vérifie en plus le statut HTTP et le code renvoyés.

| Scénario | Fichier de test                              | Niveau      | Ce que le test vérifie                                                                                                                    |
| -------- | -------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| AS1      | `apps/api/test/slots.e2e.spec.ts`            | e2e         | Un créneau du 2026-11-01, 09:00–12:00, capacité 2, sur « Lutte » renvoie 201 avec ces valeurs et 0 inscrit.                               |
| AS2      | `application/volunteers.application.spec.ts` | application | Une discipline inconnue lève `DISCIPLINE_NOT_FOUND` et le repository ne contient aucun créneau.                                           |
| AS3      | `domain/slot.spec.ts`                        | unitaire    | Une fin égale ou antérieure au début, ou le 2026-02-30, lèvent les codes de la section 4.                                                 |
| AS4      | `domain/slot.spec.ts`                        | unitaire    | Une capacité de 0, de -1 ou de 1,5 lève `SLOT_CAPACITY_INVALID`.                                                                          |
| AS5      | `application/volunteers.application.spec.ts` | application | « Awa Ndiaye » et « awa@example.com » sont enregistrés nettoyés, et le créneau relu compte 1 inscrit.                                     |
| AS6      | `domain/registration.spec.ts`                | unitaire    | Un nom vide ou fait d'espaces, ou un email mal formé, lèvent les codes de la section 4.                                                   |
| AS7      | `infra/drizzle-slot.repository.int.spec.ts`  | intégration | Sur un créneau de capacité 2 avec 1 inscrit, deux inscriptions simultanées : une passe, l'autre lève `SLOT_FULL`, et il reste 2 inscrits. |
| AS8      | `apps/api/test/slots.e2e.spec.ts`            | e2e         | Une inscription sur un identifiant inconnu renvoie 404 avec le code `SLOT_NOT_FOUND`.                                                     |

## 6. Tâches

Cinq tâches, dans l'ordre des couches ; chacune tient dans un commit.

- [x] T01 [001-AS1, AS3, AS4] Écrire d'abord `domain/slot.spec.ts` (« 001-AS3: rejects an end time not after the start time ») et `packages/shared/src/volunteers.spec.ts`, puis les schémas partagés, l'entité `Slot` (sans `register()`) et `volunteers.errors.ts`
- [x] T02 [001-AS5, AS6, AS7] Écrire d'abord `domain/registration.spec.ts` (« 001-AS6: rejects a blank name ») et les cas `register()` de `domain/slot.spec.ts` (« 001-AS7: refuses a registration on a full slot »), puis l'entité `Registration` et `Slot.register()`
- [x] T03 [001-AS1, AS2, AS5, AS7, AS8] Écrire d'abord `application/volunteers.application.spec.ts` (« 001-AS2: refuses a slot for an unknown discipline »), puis le port `SlotRepository`, le repository en mémoire, `OpenSlot`, `RegisterVolunteer` et l'export de `GetDiscipline`
- [ ] T04 [001-AS1, AS7] Écrire d'abord `infra/drizzle-slot.repository.int.spec.ts` (« 001-AS7: keeps the capacity under concurrent registrations »), puis les tables, la migration générée, les mappers et `DrizzleSlotRepository`
- [ ] T05 [001-AS1, AS2, AS3, AS4, AS5, AS6, AS7, AS8] Écrire d'abord `apps/api/test/slots.e2e.spec.ts` (« 001-AS7: rejects a third volunteer on a slot of capacity 2 (409) »), puis le controller, `volunteers.module.ts` et son ajout à `app.module.ts`
