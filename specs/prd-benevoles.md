# PRD — Bénévoles

**Statut** : Validé

## Problème

Chaque discipline des JOJ Dakar 2026 a besoin de bénévoles pour accueillir le public. Aujourd'hui, les responsables de discipline tiennent les inscriptions sur papier, et des créneaux débordent : plus de bénévoles que prévu à un moment, personne à un autre. Pendant les Jeux, un créneau débordé ou vide se voit directement par le public.

## Utilisateurs

- Responsable de discipline : ouvrir des créneaux d'accueil et savoir qui y vient.
- Bénévole : s'inscrire à un créneau, ou s'en retirer s'il ne peut plus venir.

## Proposition

Le responsable ouvre un créneau en fixant sa capacité ; les bénévoles s'y inscrivent eux-mêmes, et l'application refuse toute inscription au-delà de la capacité. Une liste partagée qui applique la limite remplace la feuille papier, que personne ne peut faire respecter quand plusieurs bénévoles s'inscrivent en même temps.

## Mesure du succès

Pendant la démo, un créneau de capacité 2 accepte deux bénévoles et refuse le troisième, avec un message qui dit que le créneau est complet.

## Tranches

### TR1 — Ouvrir un créneau et s'y inscrire

Le responsable ouvre un créneau avec une capacité ; un bénévole s'y inscrit. Règle : jamais plus d'inscrits que la capacité.

### TR2 — Consulter un créneau et ses inscrits

Le responsable consulte un créneau, ses inscrits et les places restantes. Règle : un même email ne s'inscrit pas deux fois au même créneau.

### TR3 — Se désinscrire, et l'écran du créneau

Un bénévole se désinscrit, ce qui libère sa place. Un écran permet de voir un créneau, de s'y inscrire et de s'en désinscrire.

## Hors périmètre

- Modifier ou supprimer un créneau.
- Envoyer des emails de confirmation.
- Des comptes pour les bénévoles : ils s'identifient par leur nom et leur email.

## Hypothèses et risques

- Hypothèse : un créneau appartient à une discipline existante et se définit par une date, des heures de début et de fin ; si le responsable a besoin d'un lieu ou d'un rôle, la tranche 1 grossit.
- Hypothèse : un bénévole donne son nom et son email ; sans compte, rien n'empêche quelqu'un d'inscrire ou de désinscrire un autre.
- Hypothèse : n'importe qui peut ouvrir un créneau tant que les rôles ne sont pas gérés.
- Risque : sans la règle de TR2, un même bénévole peut occuper toutes les places d'un créneau jusqu'à la fin de TR1.
