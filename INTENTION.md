# Note d'intention — WRA602 City Builder

## Le jeu

Un city builder minimaliste sur une grille 12×12 : on démarre avec un budget, on place des bâtiments, et on essaie de faire fructifier sa ville le plus possible. Une partie dure entre 3 et 8 minutes. On peut sauvegarder pour reprendre plus tard.

Le score tient compte de l'argent en banque, des revenus générés et du temps joué. Il est soumis à un classement public, avec un lien partageable pour montrer sa ville.

## Pourquoi ces choix

**Quatre bâtiments pour commencer** (maison, bureau, parc, route) : assez pour qu'il y ait de vraies décisions à prendre sans que ce soit complexe à apprendre. L'idée derrière c'est que progresser en compte aurait débloqué de nouveaux types de bâtiments — cette mécanique n'a pas été livrée mais elle a guidé le design de base.

**Pas de game over** : quand l'argent tombe à zéro, on ne peut plus construire — mais les revenus passifs continuent de tourner. C'est au joueur de juger si la partie est perdue. Ça pousse à recommencer sans frustration brutale.

**Une seule ressource (l'argent)** : la population est affichée mais ne se dépense pas. C'est un indicateur de la qualité de la ville, pas une contrainte supplémentaire. Ça garde l'interface lisible.

**Sauvegarde manuelle** : pas d'auto-save, le joueur choisit quand il sauvegarde. C'est plus honnête avec ses intentions.

## Ce qui n'a pas été fait

- Pas de son (hors scope pour la deadline)
- La progression par niveaux de compte (déblocage de nouveaux bâtiments au fil des parties) n'a pas été implémentée faute de temps — c'est une évolution naturelle du concept
