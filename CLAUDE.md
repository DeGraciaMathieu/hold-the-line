# Dernier Rempart

Jeu de défense de refuge en vue de dessus, en JavaScript vanilla : quatre refuges, cinq
vagues chacun, un boss par refuge, puis un mode infini. Tout (sprites, sol, sons) est généré
en code, sans asset ni dépendance.

## Stack

- JavaScript ESM natif, aucun framework, aucun bundler, aucune dépendance npm.
- Node 22 ou plus récent (`engines` dans `package.json`), navigateur pour jouer.
- `npm run dev` : sert le dossier (`npx serve .`). **Le double-clic sur `index.html` ne
  fonctionne pas**, les modules ESM ne se chargent pas en `file://`.
- `npm test` : `node --test` avec `node:assert/strict`, tests dans `tests/*.test.js`.
- `npm run test:watch` : même suite en mode watch.
- Pas de lint, pas de formateur, pas de build, pas de CI.
- Langue du code, des commentaires, des tests et de la documentation : **français**. Les
  identifiants restent en anglais court (`waveSize`, `hitZombie`), comme dans le code existant.

## Architecture

Dépendances strictement descendantes, `main.js` câble le tout :

```
config.js ← rules/ ← state/ ← render/ ← loop/ ← input/ ← main.js
```

| Dossier | Rôle |
| --- | --- |
| `src/config.js` | toutes les valeurs nommées : tables (`WEAP`, `ZT`, `BOSSES`, `LEVELS`, `PERKS`…) et constantes de règles |
| `src/rules/` | décisions pures : prennent l'état, retournent une décision ou un fragment d'état |
| `src/state/` | `G` (l'état du jeu) et ses setters, caméra, souris, clavier, RNG à graine, accesseurs |
| `src/render/` | tout ce qui écrit à l'écran ou dans les enceintes : canvas, sprites, sol, particules, HUD, écrans, audio |
| `src/input/` | listeners DOM, qui appellent directement les fonctions de `loop/` |
| `src/loop/` | orchestration : boucle, `update`, déroulé des vagues, tir, dégâts, apparitions |

Voir le skill `architecture` pour la carte module par module et « où va le nouveau code ».

## Conventions de code

Règles non négociables, déduites du code :

- **Aucune valeur magique hors de `src/config.js`.** Une vitesse, un prix, un seuil, une
  durée, un pourcentage d'atout : constante nommée dans `config.js`, importée là où elle
  sert. Exception : les constantes algorithmiques (epsilon `1e-4`, coefficients du LCG) et
  les nombres purement cosmétiques du rendu (tailles de particules, durées de flash).
- **`src/rules/` est pur** : pas de `document`, `window`, canvas, pas de `Math.random()`,
  `Date.now()` ni `performance.now()`, pas de mutation des arguments, pas d'import depuis
  `render/`, `input/` ou `loop/`. Une règle reçoit l'état et retourne un résultat ; le site
  d'appel dans `loop/` applique le résultat et garde les effets (sons, sang, textes flottants).
- **L'aléatoire est injecté.** Une règle qui tire au sort reçoit `rng` (fonction `() => [0,1[`)
  en paramètre. Dans `loop/`, utiliser `rng`, `rand`, `ri`, `pick`, `shuffle` de
  `src/state/random.js`, jamais `Math.random()`. `Math.random()` n'est toléré que dans
  `render/` pour du cosmétique (scintillement, tremblement caméra, audio).
- **Le temps est injecté.** Seule `loop/frame.js` lit l'horloge ; tout le reste reçoit `dt`.
- **`G` est muté en place par `loop/`**, jamais remplacé ailleurs que par `setGame()`. Les
  variables partagées réassignées passent par leurs setters : `setGame`, `setPaused`,
  `setCamera` (`state/game.js`), `seedGame` (`state/random.js`), `prepareGround`
  (`render/ground.js`), `resetHud` (`render/hud.js`).
- **Les entités sont des objets plats dans des tableaux** (`G.zombies`, `G.bullets`,
  `G.coins`…), jamais des classes. Un zombie porte `t` (sa fiche `ZT`/`BOSSES`), `S` (son
  sprite) et `cfg` (sa palette).
- **Les accesseurs dérivés de `G`** (`PK`, `MAG`, `RLD`, `unlocked`, `levelOf`, `turretCap`,
  `statsLine`) vivent dans `state/game.js` et sont de fins adaptateurs vers les règles.
- **Le rendu n'écrit pas dans `G`** en dehors des champs visuels qui lui appartiennent
  (`trauma` via `shake`, `parts`, `lights`, `floats`). Le HUD passe par `hud.js` et son cache
  `hc` ; les écrans par `screens.js`.
- **Les listeners vivent dans `input/`** et appellent les fonctions de `loop/` ; pas de
  logique de jeu dans un listener au-delà du filtrage d'état (`G.state`, `paused`, `G.over`).
- Style : code dense sur une ligne par instruction simple, pas de point-virgule omis,
  `const` par défaut, fonctions déclarées (`function f(){}`) pour tout ce qui est exporté
  entre modules cycliques.

## Conventions de domaine

- Vocabulaire : refuge (`level`), vague locale `lw` (1 à 5) et vague globale `wave`, rempart
  (`base`), survivant (`player`), atout (`perk`), prime (`bonus`), combo, mode infini
  (`endless`). Les types de zombie sont `walker`, `runner`, `brute`, `bloater`, `spitter`,
  `armored` ; les boss `butcher`, `matriarch`, `scrapper`, `titan`.
- Coordonnées : monde 768×480 (`WW`, `WH`), canvas 384×216 (`W`, `H`), caméra `CX`/`CY`
  soustraite au dessin, hauteur de main `GH` = 8 px.
- Les textes affichés au joueur sont en français, avec les apostrophes typographiques déjà
  utilisées dans `config.js`.

## Comportement attendu

- Ne jamais déclarer une tâche terminée sans avoir lancé `npm test` et vu la suite verte.
- Si une approche échoue deux fois, revenir au plan avec l'utilisateur au lieu d'essayer une
  troisième variante.
- Avant d'implémenter une fonctionnalité, invoquer le skill `architecture` et vérifier dans
  `docs/decisions.md` que le point n'est pas déjà tranché ou listé comme question ouverte.
- Toute nouvelle règle de jeu : une fonction pure dans `src/rules/`, un test macro dans
  `tests/`, ses constantes dans `config.js`, puis seulement le branchement dans `loop/`.
- Ne pas « corriger » un comportement listé dans `docs/decisions.md`, section « Deliberately
  left alone », sans décision explicite de l'utilisateur.
- Si le périmètre d'une modification touche un texte visible (écran titre, légende des
  touches, aide des écrans, `README.md`), mettre ce texte à jour dans la même tâche.

## Skills disponibles

| Skill | Périmètre |
| --- | --- |
| `architecture` | carte des modules, dépendances, où va le nouveau code selon le type de changement |
| `testing` | commande, philosophie macro, fichier de test → périmètre, où écrire un nouveau test |
| `waves-progression` | refuges, vagues, boss, primes, atouts, déroulé entre deux vagues |
| `weapons-combat` | armes, tir, rechargement, dégâts, mêlée, tourelles, boutique |
| `entities-update` | joueur, zombies, IA des boss, projectiles, pièces, collisions, boucle `update` |
| `rendering-effects` | canvas, sprites générés, sol, particules, lumière, HUD, écrans, audio |
| `feature` (invocable) | workflow complet : comprendre, implémenter, tester, documenter, résumer |
| `prd` | rédiger une spécification (PRD) sans rien implémenter |

Commandes : `/review`, `/check-conventions`, `/check-tests`.
