# 001 — Bénévoles : ouvrir un créneau et s'y inscrire

**Statut** : Validée
**PRD** : specs/prd-benevoles.md, TR1

## Contexte

Les responsables de discipline tiennent les inscriptions des bénévoles d'accueil sur papier, et des créneaux débordent sans que personne puisse l'empêcher. Cette tranche pose la base : un créneau avec une capacité, et des inscriptions que l'application arrête à cette capacité.

## User stories

- En tant que responsable de discipline, je veux ouvrir un créneau d'accueil avec une capacité, afin de fixer combien de bénévoles j'attends.
- En tant que bénévole, je veux m'inscrire à un créneau avec mon nom et mon email, afin de réserver ma place.

## Scénarios d'acceptation

### AS1 — Ouvrir un créneau

- **Étant donné** la discipline « Lutte » · **Quand** le responsable ouvre un créneau le 2026-11-01 de 09:00 à 12:00 avec une capacité de 2 · **Alors** le créneau est enregistré avec ces valeurs, rattaché à « Lutte », avec 0 inscrit.

### AS2 — Discipline introuvable

- **Étant donné** une discipline qui n'existe pas · **Quand** le responsable y ouvre un créneau · **Alors** c'est refusé, l'application dit que la discipline est introuvable, et aucun créneau n'est créé.

### AS3 — Horaires incohérents

- **Étant donné** une heure de fin égale ou antérieure à l'heure de début, ou une date invalide · **Quand** le responsable ouvre le créneau · **Alors** c'est refusé avec un message qui dit pourquoi, et rien n'est enregistré.

### AS4 — Capacité invalide

- **Étant donné** une capacité de 0, négative ou non entière · **Quand** le responsable ouvre le créneau · **Alors** c'est refusé avec un message qui dit pourquoi, et rien n'est enregistré.

### AS5 — S'inscrire à un créneau

- **Étant donné** un créneau de capacité 2 sans inscrit · **Quand** Awa Ndiaye s'inscrit avec « awa@example.com » (espaces autour compris) · **Alors** l'inscription est enregistrée avec ce nom et cet email nettoyés, et le créneau compte 1 inscrit.

### AS6 — Nom ou email invalide

- **Étant donné** un nom vide ou fait d'espaces, ou un email mal formé · **Quand** le bénévole s'inscrit · **Alors** c'est refusé avec un message qui dit pourquoi, et le nombre d'inscrits ne change pas.

### AS7 — Créneau complet

- **Étant donné** un créneau de capacité 2 qui compte déjà 2 inscrits · **Quand** un troisième bénévole s'inscrit · **Alors** c'est refusé avec un message de conflit qui dit que le créneau est complet, et le créneau compte toujours 2 inscrits.

### AS8 — Créneau introuvable

- **Étant donné** un créneau qui n'existe pas · **Quand** un bénévole s'y inscrit · **Alors** l'application dit que le créneau est introuvable.

## Hors périmètre

- Consulter un créneau et la liste de ses inscrits, et refuser un email déjà inscrit (TR2).
- Se désinscrire, et l'écran du créneau (TR3).
- Modifier ou supprimer un créneau, les emails de confirmation, les comptes et les rôles.

## Questions ouvertes

- Inscriptions simultanées sur la dernière place : hypothèse, la capacité tient même si deux bénévoles s'inscrivent en même temps (c'est la promesse du PRD).
- Créneau dans le passé : hypothèse, accepté dans cette tranche (aucune règle du PRD ne l'interdit).
- Chevauchement de créneaux d'une même discipline : hypothèse, autorisé.
