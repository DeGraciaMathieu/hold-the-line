# Refactor decisions

Written by `/refactor-game`. Records what the code cannot express: why this layout, why
this toolchain, what was deliberately not touched, what is still undecided.

Read by `/scaffold-claude` so it does not have to re-deduce any of it.

Jeu : **Dernier Rempart** (hold-the-line). Prototype d'origine : un seul `index.html` de
2178 lignes (HTML + CSS + JS inline), commit `6589f7b`. Langue du code, des commentaires et
des textes in-game : français.

## Archetype

Selected: `real-time canvas`
Why: boucle `requestAnimationFrame` avec `dt` clampé, entités en tableaux d'objets plats
(`zombies`, `bullets`, `grenades`, `flames`, `globs`, `coins`, `turrets`, `parts`),
collisions cercle/rectangle et cercle/cercle, rendu par frame sur un canvas 384×216.
Does not fit:
- une machine à états discrète (`title / play / shop / perk / over / win`) pilotée par des
  écrans DOM (boutique, choix d'atout, pause) ; les achats et le choix d'atout sont des
  règles déclenchées par des clics, pas par la boucle ;
- le sol est un canvas mutable (`ground`, tâché par `stamp()`), avec une copie propre
  `groundClean` recopiée à 32 % d'opacité à chaque vague : de l'état visuel qui vit dans un
  canvas et reste dans `render/ground.js` ;
- la génération procédurale des sprites et du terrain utilise un PRNG déterministe à graine
  fixe (`mulberry32`) : ce n'est pas une règle de jeu, elle reste côté rendu ;
- un moteur audio WebAudio entièrement synthétisé (`render/audio.js`) ;
- deux mécanismes temporels non-RAF : `G.timers[]` (timers en jeu scalés par le ralenti
  `G.ts`) et deux `setTimeout` cosmétiques (bannière 2300 ms, transition atout → boutique
  520 ms).

## Toolchain

Branch: `zero-build`
Triggering signal: aucun signal de la branche Vite n'est présent (pas d'import npm, pas de
TypeScript, aucun asset externe, tout est synthétisé en code). Le seul signal limite est la
densité du fichier : environ 1800 lignes de JS pour 150 Ko, sous le seuil des 2000 lignes.
Tranché par l'utilisateur à la porte 1 : zero-build.
Node: 22
Test runner: `node:test` + `node:assert/strict`

Conséquence : `index.html` ne s'ouvre plus par double-clic (ESM natif non servi en
`file://`). Lancer `npm run dev` (`npx serve .`).

## Layout

| Module | Responsibility | Came from |
| --- | --- | --- |
| `src/config.js` | toutes les valeurs nommées : géométrie, PV, vitesses, timings, prix, formules, tables `WEAP`, `ZT`, `BOSSES`, `LEVELS`, `PERKS`, `ORDER`, `WLVL`, `PIERCE_ARMOR`, `BARRELS`, `TURRET_POS` | lignes 384, 563–598, 611, 651–693, 867–878 et les nombres magiques dispersés dans les règles |
| `src/util.js` | `clamp`, `lerp` | 406–407 |
| `src/rules/rng.js` | `createRng(seed)`, LCG 32 bits | nouveau |
| `src/rules/progression.js` | taille et rythme des vagues, scaling PV, prime, vague à atout, prix du renforcement | 1009, 1015, 1026, 1036–1037, 1054, 1065, 2043 |
| `src/rules/weapons.js` | chargeur et rechargement selon atouts, déverrouillage, bouche du canon | 920–922, 1077–1079 |
| `src/rules/turrets.js` | nombre et cadence des tourelles | 1272, 1583 |
| `src/rules/collision.js` | repousser hors du rempart et hors des accessoires | 1277–1289 |
| `src/rules/wave.js` | fin de vague, composition de la file, point d'apparition | 1007–1013, 1021–1022, 1228 |
| `src/rules/player.js` | mouvement du survivant | 1332–1342 |
| `src/rules/combat.js` | résolution des dégâts, pièces lâchées, Vampire, blessure du survivant, dégâts au rempart | 1179–1247 |
| `src/rules/coins.js` | rayon de ramassage et valeur des pièces | 1649, 1658 |
| `src/rules/shop.js` | prix et effet des achats | 2085–2096 |
| `src/state/game.js` | `G` et ses setters, `paused`, caméra `CX/CY`, `cam`, `mouse`, `K`, accesseurs `PK/MAG/RLD/unlocked/levelOf/turretCap/statsLine`, `newGame()` | 838–859 |
| `src/state/random.js` | RNG du jeu (`seedGame`, `rng`) et helpers `rand/ri/pick/shuffle` | 390–392, 412 |
| `src/render/dom.js` | `$`, `stage`, `shell`, `cv`, `ctx`, `reduced`, dimensionnement du canvas | 385–388 |
| `src/render/pixel.js` | outils pixel : `mk`, `mulberry32`, `outline`, `tint`, `shade`, `hash`, `vnoise`, `BAYER` | 393–411 |
| `src/render/sprites.js` | sprites générés (humanoïdes, décor, armes, rempart), police bitmap, `drawText` | 414–649 |
| `src/render/ground.js` | canvases du sol et de la lumière, génération du terrain et des accessoires, `stamp`, `prepareGround` | 696–760, 880–913 |
| `src/render/audio.js` | contexte WebAudio, synthèse des sons, `sfx`, `setMute` | 761–863 |
| `src/render/effects.js` | particules, sang, poussière, éclats, lumières, textes flottants, `shake`, `pulse`, palettes `BLOOD`/`ACID` | 875–876, 952–985 |
| `src/render/draw.js` | tout le dessin canvas : `render()`, entités, passe de lumière, émissifs, réticule, vignette | 1685–1877, 1887–1938 |
| `src/render/hud.js` | HUD DOM, pip-bar, bannière, overlays, `resetHud` | 1946–2016 |
| `src/render/screens.js` | boutique (`renderShop`, `renderRoute`, `openShop`), écrans de fin et de victoire | 2041–2077, 2097–2115 |
| `src/loop/flow.js` | déroulé : `buildLevel`, `startWave`, `waveCleared`, `afterWave`, `travel`, `gameOver`, `openPerk`, `choosePerk`, `nextFromShop`, `setPause`, `newRun` | 937–944, 1033–1075, 1248–1267, 2018–2039, 2097–2125 |
| `src/loop/spawn.js` | explosions, carnage, apparition des zombies et des boss | 986–1030 |
| `src/loop/weapons.js` | tir, rechargement, changement d'arme, railgun, mêlée, douilles | 1080–1175 |
| `src/loop/damage.js` | `hitZombie`, `killZombie`, `hurtPlayer`, `damageBase`, `checkWaveEnd`, `addTurret`, adaptateurs de collision | 1179–1289 |
| `src/loop/update.js` | `update(dt)` et toutes les mises à jour d'entités, IA des zombies et des boss | 1294–1683 |
| `src/loop/frame.js` | `requestAnimationFrame`, mesure et clamp de `dt` | 1879–1886 |
| `src/input/keyboard.js` | `keydown` / `keyup` | 2145–2161 |
| `src/input/pointer.js` | souris, molette, menu contextuel, `blur` | 2162–2167 |
| `src/input/ui.js` | boutons des écrans, boutique, atouts, son, plein écran, `layout`, `resize` | 2040, 2085, 2127–2140, 2170–2173 |
| `src/main.js` | graine du RNG, état initial, mise en page, démarrage de la boucle | 915, 2174–2175 |

Les numéros de lignes renvoient au prototype d'origine (`git show 6589f7b:index.html`).

Décisions de découpage qui s'écartent du tableau du skill `rules-extraction` :
- `src/rules/*` importent d'autres règles (`wave` → `progression`, `player` → `collision`,
  `shop` → `progression` et `weapons`). Le contrat de pureté est respecté ; l'interdiction
  a été lue comme visant les couches supérieures.
- `src/state/game.js` importe des règles pures pour ses accesseurs (`MAG`, `RLD`,
  `unlocked`, `turretCap`). Pas de cycle, les règles sont en dessous de l'état.
- `src/input/*` appellent directement les fonctions de `loop/` (`startReload`, `melee`,
  `switchWeapon`, `setPause`, `newRun`…) : c'est la forme du prototype, aucune couche
  d'intentions n'a été introduite.
- `openPerk` (dans `loop/flow.js`) écrit lui-même la liste des atouts dans le DOM : il
  partage le verrou `perkLock` avec `choosePerk`, les deux ont été gardés ensemble.
- Les modules `loop/*` et `render/*` forment des cycles d'import (`damage` ↔ `flow`,
  `effects` → `audio` → `state`, `ground` → `sprites`). Ils ne contiennent que des
  déclarations de fonctions, à l'exception des modules feuilles (`dom`, `pixel`, `sprites`,
  `ground`, `audio`, `hud`) dont le code de premier niveau ne dépend que de `config`,
  `util`, `pixel` et `dom`.
- Variables réassignées entre modules remplacées par des setters avec liaisons vivantes
  ESM : `setGame`, `setPaused`, `setCamera` (`state/game.js`), `seedGame`
  (`state/random.js`), `prepareGround` (`render/ground.js`), `resetHud` (`render/hud.js`).

## Rules extracted

| Rule | Module | Test | Notes |
| --- | --- | --- | --- |
| vague de boss (5e vague locale, toutes les 5 en infini) | `progression.js` `isBossWave` | `progression.test.js` | |
| taille de vague 6 + 3,2 × vague, × 0,6 boss, × 1,1 infini | `progression.js` `waveSize` | `progression.test.js` | |
| intervalle de spawn 1,3 − 0,05 × vague, min 0,28 s | `progression.js` `spawnGap` | `progression.test.js` | |
| PV zombie +7 % par vague ; PV boss +6 % par vague au-delà de 20 en infini | `progression.js` `zombieHp`, `bossHp` | `progression.test.js` | |
| prime de fin de vague 40 + 15 × vague, +50 rempart intact (> 90 %), +200 boss | `progression.js` `waveBonus`, `isBaseIntact` | `progression.test.js` | |
| atout aux vagues 2 et 4, après un boss, toutes les 3 vagues en infini | `progression.js` `isPerkWave` | `progression.test.js` | |
| prix du renforcement 180 + 60 × renforcements | `progression.js` `reinforcePrice` | `progression.test.js` | |
| chargeur +30 % par Chargeurs étendus, rechargement × 0,75 par Mains rapides | `weapons.js` `magSize`, `reloadTime` | `weapons.test.js` | |
| déverrouillage par refuge, tout ouvert en infini | `weapons.js` `isUnlocked` | `weapons.test.js` | |
| position de la bouche du canon | `weapons.js` `muzzlePos` | `weapons.test.js` | lit `w.muzzle` (config) au lieu de `w.spr.muzzle` (même tableau) |
| 2 tourelles + 1 par Armurier, 4 max ; cadence × 0,6 par niveau | `turrets.js` | `turrets.test.js` | |
| repousser un corps hors du rempart / des accessoires | `collision.js` | `collision.test.js` | retournent la position, les adaptateurs `pushRect`/`pushProps` l'appliquent |
| vague repoussée : file vide, aucun boss attendu, aucun zombie debout | `wave.js` `isWaveCleared` | `wave.test.js` | |
| composition de la file selon le mix du refuge (4e mix en infini) | `wave.js` `buildWaveQueue` | `wave.test.js` | RNG injecté |
| point d'apparition hors du monde sur un bord | `wave.js` `edgePoint` | `wave.test.js` | RNG injecté |
| mouvement du survivant (72 px/s, × 0,85 en rechargeant, × (1 − 0,45 × spin) minigun, +15 %/niveau) | `player.js` `movePlayer` | `player.test.js` | la lecture des touches reste dans `loop/update.js` |
| dégâts : +20 %/niveau Gâchette lourde, critique ×2 (10 % + 10 %/niveau), armure −N sauf perforant/feu, min 1, Pyromane 15 %/niveau | `combat.js` `resolveHit` | `combat.test.js` | RNG injecté |
| pièces lâchées : récompense × (1 + 0,1 × combo plafonné à 10), 1 à 7 pièces (30 pour un boss) | `combat.js` `coinDrop` | `combat.test.js` | |
| Vampire : +2 PV par niveau par kill, survivant vivant et blessé | `combat.js` `leechHeal` | `combat.test.js` | |
| blessure du survivant : invincibilité 0,55 s, recul 140, chute à 0 | `combat.js` `playerTakesHit` | `combat.test.js` | |
| dégâts au rempart, chute à 0 | `combat.js` `baseTakesHit` | `combat.test.js` | |
| rayon de ramassage 58 px × (1 + 0,8/niveau Aimant), pièces +20 %/niveau | `coins.js` | `coins.test.js` | |
| prix et effet de chaque achat | `shop.js` `purchasePrice`, `applyPurchase` | `shop.test.js` | la vérification de l'argent reste dans le listener |

Restées en orchestration (`loop/`), car elles créent des particules, jouent des sons ou
tamponnent le sol au milieu de la logique : `fire`, `fireRail`, `melee`, `explode`,
`goreBurst`, `spawnZombieAt`, `spawnBoss`, `killZombie` (hors récompense), `updateZombies`,
`bossAI`, `updateBullets`, `updateFlames`, `updateGrenades`, `updateGlobs`, `updateTurrets`.

## Randomness and time

| Call site | Classification | Handling |
| --- | --- | --- |
| helpers `rand`, `ri`, `pick`, `shuffle` | rule-bearing | basés sur `rng` de `state/random.js`, graine posée par `main.js` |
| `buildWave` tirage du type (orig. 1011) | rule-bearing | `rng` injecté dans `buildWaveQueue` |
| `spawnZombieAt` phase d'animation (orig. 1018) | cosmétique mais dans une fonction de jeu | `rng()` pour garder la fonction déterministe |
| `hitZombie` critique, Pyromane (orig. 1184, 1194) | rule-bearing | `rng` injecté dans `resolveHit` |
| `hitZombie` texte flottant du lance-flammes (orig. 1192) | cosmétique | `rng()` au site d'appel |
| `killZombie` tâches de sang, graine des pièces, Carnage (orig. 1204, 1213, 1217) | Carnage rule-bearing, reste cosmétique | `rng()` |
| `update` essaim de 2 à 4 zombies (orig. 1305) | rule-bearing | `rng()` |
| `updateZombies` propagation du feu (orig. 1488) | rule-bearing | `rng()` |
| `fireRail` traces au sol (orig. 1159), `bossAI` poussière, flammes/grenades/globs fumée et traces | cosmétique dans des fonctions de jeu | `rng()` |
| audio `initAudio`, `nz`, `voice`, `SND.baseHit` (orig. 769, 777, 805, 829) | cosmétique | `Math.random()` conservé |
| flocons de neige `buildLevel` (orig. 945) | cosmétique | `Math.random()` conservé |
| `blood`, `chips`, `boomFX` taille des particules (orig. 961, 968, 982) | cosmétique | `Math.random()` conservé |
| `drawGun` scintillement railgun, `lightPass` fenêtres et lampadaires, `drawEmissive`, `render` tremblement caméra (orig. 1803, 1807, 1833, 1894) | cosmétique | `Math.random()` conservé |
| `performance.now()` (orig. 1879) et `now` du callback RAF | temps | reste dans `loop/frame.js`, `dt` passé partout |
| `Date.now()` | — | n'apparaît que dans `main.js` pour la graine |

Seed: `Date.now()>>>0` choisi dans `main.js` au chargement (comportement joueur identique à
`Math.random()`). Les tests passent une graine fixe à `createRng`.

L'ordre de consommation du RNG dans `hitZombie` a changé (tirages critique et Pyromane
avant les tirages cosmétiques) : sans effet observable, la graine étant aléatoire.

## Deliberately left alone

Behaviour that looks wrong but was preserved, because the refactor must not change the
game. Each entry: what it is, where, and why it was not fixed.

- **Précision sous-évaluée pour le fusil à pompe** : `G.shots` compte les plombs tirés
  (`+= w.pellets`) alors que `G.hits` compte un contact par balle (`loop/weapons.js`,
  `loop/update.js`, `state/game.js` `statsLine`). Interprétation intentionnelle incertaine.
- **`G.reinforce` jamais remis à zéro entre refuges** : le prix du renforcement s'accumule
  sur toute la campagne (`loop/flow.js` `buildLevel`, `rules/progression.js`
  `reinforcePrice`). Intentionnel ou oubli, non tranché.
- **Bloater à `dmg: 0`** : il ne blesse qu'en explosant au contact du rempart
  (`loop/update.js`, `config.js` `ZT.bloater`). Lisible dans le code, conservé.
- **Mode infini : `G.lw` forcé à 0 au passage** (`input/ui.js` bouton `#btnEndless`), donc
  premier boss infini à la 5e vague après la campagne.
- **Pool d'atouts mélangé avec le RNG du jeu** alors que terrain et sprites sont
  déterministes (`loop/flow.js` `openPerk`). Les atouts proposés varient à chaque run.
- **HUD non rendu pendant `travel()`** : `hudUpdate` court-circuite tant que
  `G.state==='title'` (`render/hud.js`). Probablement intentionnel, non documenté.
- **`G.time`** n'est lu que par le rendu ; sa valeur absolue n'a pas de sens hors session.
- **`npx serve .`** comme script `dev` télécharge `serve` à la première exécution (pas de
  dépendance déclarée, conformément à la branche zero-build).

## Open questions

Decisions the code does not settle and that were not made. Never resolved by guessing.

- La précision affichée doit-elle compter les plombs ou les tirs ? (voir ci-dessus)
- Le prix du renforcement doit-il repartir de 180 $ à chaque refuge ?
- Le tirage des atouts doit-il être déterministe par graine comme le terrain ?
- Les fonctions d'orchestration restées dans `loop/` (`fire`, `bossAI`, `updateZombies`…)
  mêlent décisions et effets ; une décomposition plus fine (IA des boss, portée du spitter,
  cadence du lance-flammes) n'a pas été tentée pour ne pas réécrire.
- `openPerk` écrit le DOM depuis `loop/flow.js` ; séparer le rendu de la liste d'atouts
  dans `render/screens.js` demanderait d'exposer `perkLock`.
