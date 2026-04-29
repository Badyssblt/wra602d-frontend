# Note d'intention — WRA602 City Builder

## But du jeu

Construire la ville la plus rentable possible sur une grille 12×12 en gérant un budget. Chaque bâtiment placé coûte de l'argent à la pose et certains rapportent un revenu passif. Le score final est calculé à partir de l'argent en banque, des bâtiments construits et du temps joué — il est ensuite soumis à un classement public partageable.

Le jeu est volontairement court et "snackable" : une partie type tient en 3 à 8 minutes, mais on peut sauvegarder sa ville pour la reprendre plus tard.

## Choix de game design

### 1. Grille 12×12 : assez petite pour des décisions tendues

Avec 144 cases et des bâtiments à 20–300 €, le joueur doit choisir : maximiser le revenu (bureaux à 300 €) ou la densité (maisons à 120 € qui rapportent moins mais coûtent moins cher). Une grille plus grande diluerait la pression budgétaire, plus petite ne laisserait pas la place au plaisir de "construire".

### 2. Quatre types de bâtiments seulement

`house`, `office`, `park`, `road`. C'est le minimum pour offrir un vrai arbitrage :
- **maison** (120 €, 10 €/tick) — build de base, ratio rendement honnête, +4 habitants
- **bureau** (300 €, 20 €/tick) — meilleur rendement absolu mais plus lent à amortir, +10 habitants
- **parc** (50 €, pas de revenu) — bâtiment de "remplissage" pas cher mais improductif
- **route** (20 €, pas de revenu) — utilitaire, prépare des évolutions futures (logique de connexion)

Plus de variété diluerait l'apprentissage des trade-offs ; moins rendrait toutes les parties identiques.

### 3. Économie principale : l'argent

L'argent est l'unique ressource. C'est ce que le joueur regarde en haut à droite, ce qu'il doit gérer, et c'est aussi le composant principal du score. Démarrage à **100 000 €** : suffisamment pour faire ~830 maisons en théorie, mais en pratique on plafonne vite. Le tick d'income (5 secondes) crée un rythme : les bons placements paient en quelques secondes.

### 4. Économie secondaire : la population

Calculée mécaniquement à partir des maisons (4 hab.) et bureaux (10 emplois). Affichée en HUD comme info diagnostique mais pas comme ressource à dépenser. C'est un proxy "qualité de la ville" : une ville qui n'a que des routes et parcs aura un haut score d'argent mais une population nulle, ce qui se voit dans le leaderboard. Cette dualité crée une seconde dimension stratégique sans alourdir l'UI.

### 5. Score et classement

`score = money + sum(building.income × 10) + ticks_played` — formule simple qui favorise les villes équilibrées (argent disponible + valeur productive accumulée + survie dans le temps). Le classement est public, n'importe qui peut consulter le top 50 sans être connecté. Quand un joueur soumet un score, il reçoit automatiquement un lien partageable (`/api/scores/share/<token>`) accessible aussi en anonyme — copie-collable dans Discord/réseaux sociaux.

### 6. Sauvegarde / chargement

Une partie peut être sauvegardée à tout moment : nom + argent + bâtiments + grille. Plusieurs villes coexistent par compte. Le bouton "Charger" liste les villes du joueur, "Nouvelle" repart à zéro après confirmation. La sauvegarde est explicite (pas d'auto-save) pour respecter l'intention du joueur — il choisit ses checkpoints.

### 7. Authentification

JWT côté serveur, pseudo + email + mot de passe (≥ 8 car., 1 majuscule, 1 chiffre). Le token est stocké en localStorage et survit aux reloads. Pas de SSO dans cette version (mentionné comme évolution dans la spec).

### 8. Condition de défaite implicite

Le jeu n'a pas de "Game Over" formel — c'est un sandbox. Mais quand l'argent tombe à zéro, le joueur ne peut plus rien construire, et son revenu passif lui permet (ou pas) de remonter. La "défaite" est donc auto-imposée : se planter dans la stratégie de placement = vivre une partie ennuyeuse, ce qui pousse à recommencer. Une condition de victoire est implicitement le placement du leaderboard final.

### 9. UI minimaliste, pas de menus imbriqués

Tout l'écran de jeu en un coup d'œil :
- en haut : nom de la ville (éditable inline) + boutons d'action
- centre : la scène 3D plein écran (Three.js + OrbitControls)
- bas : 4 boutons de bâtiment avec leur prix
- côté droit : argent / population / score

Aucun menu de pause, aucun écran intermédiaire. Le seul "écran à part" est le panneau classement qui glisse depuis la droite. C'est délibérément cohérent avec le style "casual / dépose-pose" du city-builder.

## Architecture technique côté front

- **Vue 3 + TypeScript** (strict, `noUncheckedIndexedAccess`) pour la robustesse
- **Three.js** pour le rendu 3D (caméra ortho-perspective, OrbitControls, lumière directionnelle + ombres)
- **Pinia** pour l'état d'auth (un seul store, pas de boilerplate Vuex)
- **fetch API** wrappée maison (pas d'axios) — c'est un projet jouet, pas la peine d'embarquer une dépendance pour 200 lignes de wrapper
- **Pas de Vue Router** — l'app a deux états (auth-screen / game) gérés par un `v-if` dans App.vue. Sur-ingénier serait du bruit.

## Ce qui n'a pas été fait (et pourquoi)

- **Sound design** : pas implémenté, hors scope pour la deadline. Si ajouté, ce serait via Howler.js + un click-sound + jingle income/tick.
- **Système de niveaux** : le sandbox actuel ne propose pas de progression structurée. Une évolution naturelle serait d'introduire des "objectifs" : atteindre N habitants, X € de revenu/tick, etc., qui débloqueraient de nouveaux types de bâtiments.
- **Vies / pertes ponctuelles** : initialement prévu, mais on a préféré garder l'expérience pure "construction" plutôt que d'introduire des aléas (incendies, catastrophes) qui frustrent dans un jeu court.
- **Tests E2E** : non livrés faute de temps. Cypress ou Playwright pourraient être ajoutés sur les flux critiques (login, save, soumission de score).
