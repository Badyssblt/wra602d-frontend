# wra602d-frontend — City Builder (Vue 3 + Three.js)

Frontend du jeu **WRA602 City Builder**. Construis ta ville sur une grille 12×12, gère ton budget, soumets ton score au classement public et partage-le.

📄 Pour la **note d'intention de game design**, voir [`INTENTION.md`](./INTENTION.md).

## Stack

- **Vue 3** (Composition API, `<script setup>`) + **TypeScript** strict
- **Three.js** (canvas WebGL plein écran, OrbitControls, lumière directionnelle + ombres)
- **Vite** (HMR, build)
- **Pinia** (auth store)
- **fetch API** (wrapper maison `src/api/client.ts`, pas d'axios)

## Prérequis

- Node 20.19+ ou 22.12+
- Backend `wra602d-backend` qui tourne sur `http://localhost:8000` (sinon il faut adapter `VITE_API_URL`)

## Installation et lancement

```bash
npm install
cp .env.example .env.development        # ou .env.local pour override perso
npm run dev                             # Vite sur http://localhost:5173
```

`.env.development` contient `VITE_API_URL=http://localhost:8000` par défaut.

## Build production

```bash
npm run build       # type-check + minified bundle dans dist/
npm run preview     # serveur statique pour vérifier le bundle
```

## Structure

```
src/
├── api/                Client HTTP + types API (auth, cities, scores)
│   ├── client.ts       Wrapper fetch + token storage + ApiError
│   ├── auth.ts         /api/users/register, /api/login_check, /api/users/me
│   ├── cities.ts       /api/cities, /api/cities/save
│   ├── scores.ts       /api/scores, /scores/leaderboard, /scores/{uid}/share
│   └── types.ts        AuthUser, ApiCity, ApiBuilding, ApiScore, ShareScoreResponse
├── components/
│   ├── AuthScreen.vue  Écran login/register (avant le jeu)
│   ├── LeaderboardPanel.vue   Panneau classement public coulissant
│   └── Toast.vue       Notifications transitoires
├── stores/
│   └── auth.ts         Pinia store (user, token, login/register/logout/bootstrap)
├── core/               (déjà présent) SceneManager, InputManager, MoneyManager
├── game/               (déjà présent + ajouts)
│   ├── Grid.ts         (étendu) place / clear / serialize
│   ├── BuildingConfig.ts
│   ├── BuildingPlacer.ts
│   ├── IncomeSystem.ts
│   └── CityState.ts    (nouveau) computeScore, computePopulation
├── objects/            (déjà présent) GridMesh, BuildingMesh
├── App.vue             Orchestration : auth gate, scène 3D, topbar, modales
├── main.ts             createApp + Pinia
└── types.ts
```

## Fonctionnalités

| Critère de notation | Implémentation |
|---|---|
| Mise en place environnement (caméra, lumière, environnement) | `SceneManager` Three.js |
| Géométrie native Three.js | `objects/GridMesh.ts`, `objects/BuildingMesh.ts` |
| Système de déplacement (axe X/Z, pivot) | OrbitControls dans `SceneManager` |
| Système de point (économie principale) | `MoneyManager` + HUD |
| Système de gestion de vie / économie secondaire | Population dérivée des bâtiments + score composite |
| Conditions de victoire / défaite | Score final soumis au leaderboard, défaite implicite (banqueroute) |
| Interface de jeu (score, vie, progression) | HUD top-right (€/hab/score), toolbar bas |
| Interface authentification | `AuthScreen.vue` (login + register) |
| Fonctionnalité principale | Pose / suppression de bâtiments, revenu passif tous les 5s |
| Gestion des scores (tableau, partage) | `LeaderboardPanel.vue` + bouton "Soumettre score" + lien partage copiable |
| Note d'intention | `INTENTION.md` |

## Flux de jeu

1. **Connexion / inscription** → écran d'auth avant tout. Token JWT stocké en `localStorage`.
2. **Construction** → toolbar du bas, clic sur la grille, l'argent décrémente, le bâtiment apparaît.
3. **Revenu** → toutes les 5 secondes, somme des `incomePerTick` des bâtiments est ajoutée à l'argent.
4. **Sauvegarde** → bouton "Sauvegarder" en haut. Upsert via `POST /api/cities/save` (par UID + user). Le nom de ville est éditable inline dans la topbar.
5. **Chargement** → bouton "Charger" → modale listant les villes du joueur → un clic restaure la scène.
6. **Score** → bouton "Soumettre score". Score = `money + somme(income × 10) + ticksPlayed`. La réponse contient un `shareUrl` public (copiable d'un clic).
7. **Classement** → bouton "Classement" ouvre un panneau latéral avec le top 50 (consultable même hors connexion).

## Variables d'environnement

| Var | Rôle | Exemple |
|---|---|---|
| `VITE_API_URL` | URL du backoffice Symfony | `http://localhost:8000` |

## Conventions

- TypeScript strict + `noUncheckedIndexedAccess` activé.
- Pas de magic numbers en HUD : prix lus depuis `BUILDING_CONFIG`.
- Pas d'auto-save : la sauvegarde est explicite pour respecter l'intention du joueur.
- Pas de Vue Router : deux états (auth / game), gérés par un `v-if` dans `App.vue`.

## Tests

> Non livrés dans cette version. Pistes d'évolution : Playwright sur les flux critiques (register → login → place 3 bâtiments → save → reload → load → submit score → ouvrir leaderboard).

## Voir aussi

- Backoffice Symfony : `../wra602d-backend/`
- Micro-service mailer : `../wra602d-microservice/`
- Note d'intention : [`INTENTION.md`](./INTENTION.md)

---

## Recommandations IDE (legacy)

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (désactiver Vetur). Pour le typage des `.vue` en TS, le projet utilise `vue-tsc` plutôt que `tsc` (cf. `npm run type-check`).
