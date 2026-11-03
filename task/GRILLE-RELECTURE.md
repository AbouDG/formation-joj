# Grille de relecture : avant de dire « je valide »

`/spec` et `/spec-plan` s'arrêtent et attendent ta validation. C'est le seul moment où tu décides ce que l'agent va construire : après, il code exactement ce qui est écrit. Ce que la spec oublie, aucun test ne le vérifiera.

Pourquoi cette grille : pour préparer la journée, la même demande a été donnée trois fois à l'agent avec ce harness. Les trois fois, le code était propre et `/converge` a répondu « Converged ». Mais deux fois, la spec validée sans relecture avait oublié deux cas (un identifiant inconnu, et une action sur une ressource déjà dans le bon état) : ils n'ont jamais été testés. Le relecteur l'a signalé, trop tard.

Relis avec ces questions. **Une seule réponse « non » suffit pour ne pas valider.**

## La spec (`spec.md`)

1. **Chaque règle de l'énoncé a son scénario**, et chaque refus dit son statut et son code d'erreur (`409`, `SLOT_FULL`).
2. **Chaque « Alors » se vérifie par un test** : une valeur, un statut, un code, ce qui reste en base. « Ça fonctionne » ou « l'utilisateur est informé » ne se testent pas.
3. **Les cas limites ont une réponse** :
   - la ressource n'existe pas (une discipline ou un créneau inconnus) ;
   - l'action est répétée (s'inscrire deux fois, archiver deux fois) ;
   - la valeur est juste à la limite (le dernier inscrit, une capacité de 1, une fin égale au début).
4. **Rien n'est inventé.** Chaque scénario vient de l'énoncé. Ce que l'agent a supposé est dans « Questions ouvertes » : tranche chaque hypothèse, ne la laisse pas passer.
5. **Le hors périmètre est écrit** : ce qu'on ne fait pas cette fois est listé, pour que personne ne le code.

## Le plan (`plan.md`)

6. **Chaque scénario a au moins un test prévu**, et chaque cas limite retenu aussi. Une « hypothèse » sans test est un trou.
7. **Les codes d'erreur et les statuts HTTP** sont exactement ceux de l'énoncé.
8. **Les fichiers suivent le module `disciplines`**, couche par couche, et aucun ne sort du périmètre de la spec.

## Si une réponse est « non »

Ne valide pas. Dis à Claude ce qui manque, en une phrase par point, puis relis à nouveau. Par exemple :

```
Il manque un scénario : inscrire un bénévole sur un créneau qui n'existe pas doit répondre 404 avec le code SLOT_NOT_FOUND. Ajoute-le, puis montre-moi la spec.
```

Quand toutes les réponses sont « oui », écris « je valide ».
