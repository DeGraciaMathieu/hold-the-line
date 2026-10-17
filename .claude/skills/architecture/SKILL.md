---
name: architecture
description: Use when you need to know where a piece of code lives in Dernier Rempart, which module depends on which, or where to put new code for a given type of change (rule, constant, entity, effect, screen, input).
auto_invoke: true
---

# Architecture de Dernier Rempart

Dépendances strictement descendantes. Une flèche remonte = violation.

```
config.js ← rules/ ← state/ ← render/ ← loop/ ← input/ ← main.js
```

## Carte des modules

| Module | Rôle | Dépendances clés |
| --- | --- | --- |
| `src/config.js` | toutes les valeurs nommées : géométrie (`W`, `H`, `WW`, `WH`, `GH`, `BX`, `BY`), PV, vitesses, timings, prix, formules, tables `WEAP`, `ORDER`, `WLVL`, `PIERCE_ARMOR`, `LEVELS`, `BOSSES`, `BOSS_ORDER`, `PERKS`, `ZT`, `BARRELS`, `TURRET_POS` | aucune |
| `src/util.js` | `clamp`, `lerp` | aucune |
| `src/rules/rng.js` | `createRng(seed)` : LCG 32 bits, `() => [0,1[` | aucune |
| `src/rules/progression.js` | `isBossWave`, `waveSize`, `spawnGap`, `zombieHp`, `bossHp`, `isBaseIntact`, `waveBonus`, `isPerkWave`, `reinforcePrice` | `config` |
| `src/rules/weapons.js` | `magSize`, `reloadTime`, `isUnlocked`, `muzzlePos` | `config` |
| `src/rules/turrets.js` | `turretCapacity`, `turretRate` | `config` |
| `src/rules/collision.js` | `pushOutOfRect`, `pushOutOfProps` (retournent `{x,y}`) | `config` |
| `src/rules/wave.js` | `isWaveCleared`, `buildWaveQueue(level, state, rng)`, `edgePoint(side, rng)` | `config`, `progression` |
| `src/rules/player.js` | `movePlayer(p, {ix,iy}, dt, {weapon,perks,base,props})` | `config`, `collision` |
| `src/rules/combat.js` | `resolveHit(…, rng)`, `coinDrop`, `leechHeal`, `playerTakesHit`, `baseTakesHit` | `config` |
| `src/rules/coins.js` | `pickupRadius`, `coinValue` | `config` |
| `src/rules/shop.js` | `purchasePrice`, `applyPurchase` | `config`, `progression`, `weapons` |
| `src/state/game.js` | `G` + `setGame`, `paused` + `setPaused`, `CX`/`CY` + `setCamera`, `cam`, `mouse`, `K`, accesseurs `PK`, `MAG`, `RLD`, `unlocked`, `levelOf`, `turretCap`, `statsLine`, `newGame()` | `config`, règles pures |
| `src/state/random.js` | `rng` + `seedGame`, `rand`, `ri`, `pick`, `shuffle` | `rules/rng` |
| `src/render/dom.js` | `$`, `stage`, `shell`, `cv`, `ctx`, `reduced` ; dimensionne le canvas | `config` |
| `src/render/pixel.js` | `mk`, `mulberry32`, `outline`, `tint`, `shade`, `hexRGB`, `hash`, `vnoise`, `BAYER` | `util` |
| `src/render/sprites.js` | sprites générés au chargement : `humanoid`, `ZCFG`/`BCFG`, `SPR`/`SPRB`/`PSPR`, décor (`PINES`, `CARS`…), `gunSpr` (enrichit `WEAP[id].spr`), `BASE`, `FONT`, `drawText` | `config`, `pixel`, `dom` |
| `src/render/ground.js` | canvases `ground`/`groundClean`/`light`, `roadY`, `zoneAt`, `genGround`, `genProps`, `stamp`, `prepareGround` | `pixel`, `sprites`, `random` |
| `src/render/audio.js` | `AU`, `initAudio`, `SND`, `sfx(name, x, y, v)`, `setMute` | `state/game` (pan), `random` |
| `src/render/effects.js` | `shake`, `P` (particule), `addLight`, `floatTxt`, `pulse`, `blood`, `dust`, `sparks`, `chips`, `boomFX`, palettes `BLOOD`/`ACID` | `audio`, `ground`, `state` |
| `src/render/draw.js` | `render(dt)`, `drawZombie`, `drawPlayer`, `drawGun`, `drawBase`, `drawProp`, `drawCoin`, `drawParts`, `lightPass`, `drawEmissive`, `drawCross`, `drawAlert`, `shadow` | `dom`, `ground`, `sprites`, `state` |
| `src/render/hud.js` | `hud` (refs DOM), cache `hc`, `hudUpdate`, `banner`, `hideOverlays`, `showOverlay`, `resetHud` | `dom`, `effects`, `state` |
| `src/render/screens.js` | `openShop`, `renderShop`, `renderRoute`, `showOver`, `showWin` | `hud`, `audio`, `state` |
| `src/loop/frame.js` | `frame(now)` : mesure et clamp de `dt` (`DT_MAX`), appelle `update`, `render`, `hudUpdate` | `update`, `draw`, `hud` |
| `src/loop/update.js` | `update(dt)` et `updatePlayer`, `updateZombies`, `bossAI`, `spit`, `shockwave`, `summon`, `updateBullets`, `updateFlames`, `updateGrenades`, `updateGlobs`, `updateTurrets`, `updateBase`, `updateParts`, `updateCoins` | `damage`, `spawn`, `weapons`, `render/*`, `state` |
| `src/loop/flow.js` | `buildLevel`, `startWave`, `waveCleared`, `afterWave`, `travel`, `gameOver`, `openPerk`, `choosePerk`, `nextFromShop`, `setPause`, `newRun` | `damage`, `render/*`, `state` |
| `src/loop/spawn.js` | `explode`, `barrelBoom`, `goreBurst`, `spawnZombieAt`, `spawnZombie`, `spawnBoss` | `damage`, `render/*`, `state` |
| `src/loop/weapons.js` | `fire`, `fireRail`, `melee`, `startReload`, `finishReload`, `switchWeapon`, `cycleWeapon`, `ejectCasing` | `damage`, `spawn`, `render/*`, `state` |
| `src/loop/damage.js` | `hitZombie`, `killZombie`, `hurtPlayer`, `damageBase`, `checkWaveEnd`, `addTurret`, adaptateurs `pushRect`/`pushProps` | `flow`, `spawn`, `render/*`, `state` |
| `src/input/keyboard.js` | `keydown`/`keyup` : déplacement (`K`), R, F, 1 à 0, Échap/P, M, choix d'atout, Espace/Entrée en boutique | `loop/flow`, `loop/weapons`, `audio`, `state` |
| `src/input/pointer.js` | souris (viser, tirer), molette, menu contextuel, `blur` | `loop/weapons`, `dom`, `state` |
| `src/input/ui.js` | boutons des écrans, listener boutique, listener atouts, son, plein écran, `layout`, `resize` | `loop/*`, `render/*`, `rules/shop`, `state` |
| `src/main.js` | `seedGame(Date.now()>>>0)`, `setGame(newGame())`, `buildLevel()`, `layout()`, `requestAnimationFrame(frame)` | tout |

`loop/` et `render/` forment des cycles d'import (`damage` ↔ `flow`, `effects` → `audio`
→ `state`). C'est accepté : ces modules n'ont que des déclarations de fonctions au premier
niveau. Les modules avec du code exécuté à l'import (`dom`, `pixel`, `sprites`, `ground`,
`audio`, `hud`) ne dépendent que de `config`, `util`, `pixel` et `dom`.

## État

`G` est créé par `newGame()` (`state/game.js`) et muté en place par `loop/`. Champs
principaux : `state` (`title | play | shop | perk | over | win`), `level`, `lw`, `wave`,
`endless`, `money`, `perks`, `queue`, `player`, `base`, tableaux d'entités (`zombies`,
`bullets`, `grenades`, `flames`, `globs`, `parts`, `coins`, `floats`, `lights`, `turrets`,
`timers`, `props`), effets caméra (`trauma`, `freeze`, `ts`, `slowT`) et drapeaux HUD `fx`.

## Où va le nouveau code

| Type de changement | Fichiers à toucher, dans l'ordre |
| --- | --- |
| nouvelle constante ou réglage | `src/config.js` (section adaptée), puis import là où elle sert |
| nouvelle règle de jeu (décision, formule) | `src/rules/<module>.js` (fonction pure), `tests/<module>.test.js`, puis appel depuis `loop/` |
| nouvelle arme | `WEAP` + `ORDER` + `WLVL` dans `config.js` (le sprite est généré par `gunSpr` depuis `rects`/`muzzle`), cas particuliers dans `loop/weapons.js` `fire`, son dans `render/audio.js` `SND` |
| nouveau type de zombie | `ZT` dans `config.js`, palette `ZCFG` dans `render/sprites.js`, mix des `LEVELS`, comportement dans `loop/update.js` `updateZombies` |
| nouveau boss | `BOSSES` + `BOSS_ORDER` dans `config.js`, `BCFG` dans `sprites.js`, capacité dans `loop/update.js` `bossAI` |
| nouvel atout | `PERKS` dans `config.js`, constante d'effet, lecture via `PK('id')` ou `perks.id` dans la règle concernée, effet immédiat dans `loop/flow.js` `choosePerk` |
| nouveau refuge | `LEVELS` dans `config.js` (`ground`, `decor`, `mix`, `boss`), décor dans `render/ground.js` `genProps` |
| nouvel article de boutique | `rules/shop.js` (`purchasePrice`, `applyPurchase`), carte dans `render/screens.js` `renderShop`, effet dans `input/ui.js` si non couvert |
| nouvelle entité en jeu (projectile, objet) | tableau dans `newGame()` et `buildLevel()`, `update<X>` dans `loop/update.js`, `draw<X>` dans `render/draw.js` et ajout à l'ordre de dessin de `render()` |
| nouvel effet visuel ou son | `render/effects.js` (particule via `P`), `render/audio.js` (`SND` + `GAP`) |
| nouvelle touche ou action | `input/keyboard.js` ou `input/pointer.js`, qui appelle une fonction de `loop/` ; légende de l'écran titre dans `index.html` et `README.md` |
| nouvel écran ou overlay | HTML dans `index.html`, `OVERLAYS` dans `render/hud.js`, fonctions dans `render/screens.js`, boutons dans `input/ui.js` |
