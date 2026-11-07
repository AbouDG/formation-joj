# CLAUDE.md

Application d'organisation des JOJ Dakar 2026 : une API NestJS (`apps/api`), un front React (`apps/web`) et des schémas partagés (`packages/shared`), dans un monorepo pnpm. Commandes et structure détaillée : `README.md`.

## Méthodologie

- Toute fonctionnalité suit le cycle `/prd` → `/spec` → `/spec-plan` → `/tdd-task` → `/converge`, avec une validation humaine après le PRD, la spec et le plan. Règles communes : `specs/constitution.md`.
- Test d'abord : aucun code de production sans un test vu en échec pour la bonne raison (`pnpm tdd:red <fichier>`), puis le code minimal.
- Ordre des couches pour une fonctionnalité : schéma partagé → entité → cas d'usage → table et migration → repository Drizzle → controller et e2e → fausse API (MSW) → écran (détail dans `README.md`, « Ajouter une fonctionnalité »).
- Une tâche = un commit Conventional Commits ; `pnpm verify` avant de commiter, `pnpm check` avant de conclure. Jamais de `--no-verify`.
- Celui qui produit ne valide pas : avant de conclure, faire relire par le sous-agent `relecteur` (base git + dossier de la spec, sans mon avis).

## Architecture

- Un module par domaine dans `apps/api/src/modules/<domaine>/`, découpé en `domain/`, `application/`, `infra/`, `http/`, sur le modèle de `disciplines`.
- `domain/` est du TypeScript pur : ni NestJS, ni Drizzle, ni `pg`/PGlite (vérifié par oxlint). Pas d'horloge ni de hasard dans une entité : `id` et `now` lui sont passés.
- `application/` : un port (classe abstraite `<Entité>Repository`), un cas d'usage par classe, un repository en mémoire dans `application/testing/`.
- `infra/` : table Drizzle `<nom>.schema.ts`, mapper `toDomain()`/`toRow()`, `drizzle-<entité>.repository.ts`. Migrations générées par `pnpm db:generate`, jamais éditées à la main.
- `http/` : controller fin qui valide (DTO `createZodDto`), appelle un cas d'usage et sérialise. Aucune règle métier, aucun accès au repository.
- Les schémas Zod d'entrée et de réponse vivent dans `packages/shared/src/<nom>.ts`, exportés par `index.ts`, et servent à l'API comme au front.
- Front : `src/routes/` (TanStack Router, un fichier = une route), `src/features/<nom>/api/` (appels HTTP + hooks TanStack Query) et `components/`, `src/components/ui/` (shadcn). La fausse API `src/mocks/` suit le même contrat que `apps/api`.

## Concepts appréciés

- Typage strict (`strict`, `noUncheckedIndexedAccess`) : pas de `any`, types dérivés des schémas (`z.infer`) ou des constantes (`as const`).
- Une classe par cas d'usage avec une seule méthode `execute()`, injectée dans le controller.
- Entités à constructeur privé : `create()` applique les règles, `restore()` relit la base sans les rejouer ; les modifications passent par des méthodes métier (`rename()`).
- Listes fermées en constante partagée (`DISCIPLINE_CATEGORIES`) plutôt qu'en chaînes libres.
- Des commentaires courts qui disent le pourquoi, en français.

## Bonnes pratiques

- Toute erreur métier est une sous-classe d'`AppError` (code stable + catégorie VALIDATION, NOT_FOUND, CONFLICT ou BUSINESS_RULE). Seul `ProblemDetailsFilter` choisit le statut HTTP (RFC 9457). Pas de `throw new Error()` hors `infra/`, pas d'`HttpException`.
- Une entrée est validée par un schéma Zod de `packages/shared` ; le domaine revérifie ses règles sans faire confiance à HTTP.
- Unicité : vérifiée dans le cas d'usage pour un message clair, garantie par une contrainte en base.
- Chaque scénario `ASn` de la spec a un test dont le titre commence par son identifiant (`pnpm spec:check <spec> --trace`).
- Tests API : `*.spec.ts` (domaine, application avec le repository en mémoire), `*.int.spec.ts` (Drizzle sur PGlite en mémoire), `*.e2e.spec.ts` dans `apps/api/test/`. Front : `*.test.tsx` à côté du fichier testé, via MSW, et un audit `*.a11y.test.tsx` par état d'écran.
- Aucun secret dans le code : les valeurs sensibles vont dans `apps/api/.env` (ignoré par git).

## Nommage

- Fichiers en kebab-case, suffixés par leur rôle : `create-discipline.ts`, `discipline.mapper.ts`, `drizzle-discipline.repository.ts`, `disciplines.errors.ts`, `disciplines.queries.ts`.
- Classes en PascalCase ; cas d'usage nommés par un verbe : `CreateDiscipline`, `ListDisciplines`. Erreurs : `DisciplineError`, fabriquées par `disciplineNotFound(id)`.
- Codes d'erreur en majuscules, préfixés par le domaine : `DISCIPLINE_NAME_TAKEN`.
- Schémas Zod en camelCase suffixés `Schema` (`createDisciplineSchema`), types associés en PascalCase (`CreateDisciplineInput`, `DisciplineResponse`).
- Tests en anglais, préfixés par le numéro de spec et le scénario : `it('001-AS2: rejects a full slot', …)`.
- Commits : `type(portée): T03 description (001-AS2)`, par exemple `feat(benevoles): T03 refuse a full slot (001-AS2)`.
- Specs : `specs/prd-<nom>.md`, `specs/NNN-<nom>/spec.md` et `plan.md`.
