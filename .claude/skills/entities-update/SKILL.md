---
name: entities-update
description: Use when working on the player, zombies, boss AI, projectiles, flames, grenades, acid globs, coins, props, collisions, or the per-frame update loop of Dernier Rempart.
auto_invoke: true
---

# Entités et boucle de mise à jour

## La boucle

`frame(now)` (`src/loop/frame.js`) mesure `dt` (clampé à `DT_MAX`), puis appelle
`update(dt)` si `G.state` est `play` ou `over` et non pausé, `render(dt)` et `hudUpdate(dt)`.

`update(dtR)` (`src/loop/update.js`) applique le ralenti : `dt = dtR × G.ts` (`G.ts` lerpé
vers 0,22 tant que `G.slowT > 0`), gèle tout tant que `G.freeze > 0`, avance `G.time`,
puis enchaîne : timers `G.timers`, apparitions (file `G.queue`, essaims, boss), `updatePlayer`,
`updateZombies`, `updateBullets`, `updateFlames`, `updateGrenades`, `updateGlobs`,
`updateTurrets`, `updateBase`, `updateParts`, `updateCoins`, textes flottants, lumières,
combo, caméra (`cam` lerpée vers le survivant).

## Concepts → implémentation

| Concept | Où | Détail |
| --- | --- | --- |
| Survivant | `G.player` créé par `newGame()` (`src/state/game.js`) | `x, y, vx, vy, kx, ky` (recul), `r`, `hp/maxHp`, `ang`, `face`, `w`, `owned/mag/res`, `reload`, `spin`, `charging`, `cd`, `kick`, `bloom`, `inv`, `melee`, `anim`, `dead` |
| Mouvement | `movePlayer(p, {ix,iy}, dt, {weapon,perks,base,props})` dans `src/rules/player.js` | `PLAYER_SPEED`, `PLAYER_ACCEL`, `PLAYER_KNOCK_DECAY`, bornes `WORLD_MARGIN_*` ; la lecture de `K` est dans `updatePlayer` |
| Visée et tir continu | `updatePlayer` | `p.ang` vers `mouse` + `CX/CY`, `mouse.down` → `fire()`, rechargement, minigun `spin`, railgun `charging`, battement de cœur sous `PLAYER_LOW_HP` |
| Fiche de zombie | `ZT[type]` dans `src/config.js` | `hp`, `speed`, `r`, `dmg`, `baseDmg`, `atk`, `reward`, `aggro`, `mass`, `armor`, `ranged {range,dmg,baseDmg}` |
| Instance de zombie | `spawnZombieAt` (`src/loop/spawn.js`) | `type`, `t` (fiche), `hp/max`, `flash`, `squash`, `stun`, `atk`, `kx/ky`, `burn`, `S` (sprite), `cfg` (palette), `speed` ± 15 %, `dead` |
| Comportement des zombies | `updateZombies(dt)` | cible survivant si `aggro` le permet sinon rempart, séparation entre zombies, `pushProps`, contact rempart (`pushRect` → `touching`), attaques `z.atk`, brûlure (`z.burn`, propagation), cracheur à distance (`spit`) |
| IA des boss | `bossAI(z, dt, dp, dpx, dpy, pAlive)` | états `walk`, `tele`, `charge`, `stomp` ; cooldowns `z.cd.{charge,stomp,summon,spit}` ; `shockwave` (`SHOCKWAVE_*`), `summon`, `bossHitWall` ; seuils `BOSS_AGGRO_MIXED`, `BOSS_AGGRO_BASE` |
| Collisions | `pushOutOfRect`, `pushOutOfProps` dans `src/rules/collision.js` ; adaptateurs `pushRect(e, r)`, `pushProps(e, r)` dans `src/loop/damage.js` | les adaptateurs mutent `e.x/e.y` ; `pushRect` retourne `true` au contact |
| Balles | `G.bullets`, `updateBullets` | `pierce`, portée, `bulletHitsProp`, source `bl.src`, tourelles (`'turret'`) |
| Flammes | `G.flames`, `updateFlames` | brûlure `z.burn`, traces au sol |
| Grenades et globs d'acide | `G.grenades`, `updateGrenades` ; `G.globs`, `updateGlobs` | arc balistique `z`/`vz`, `explode` à l'impact, flaque d'acide |
| Tourelles | `G.turrets`, `updateTurrets` | cible la plus proche sous `TURRET_RANGE`, cadence `turretRate` |
| Rempart | `G.base`, `updateBase` | `x0, x1, y0, y1` (rectangle de collision), `hp/maxHp`, `flash`, `shake`, `alert`, `alarm` |
| Accessoires | `G.props` générés par `genProps` (`src/render/ground.js`) | `kind` (`tree`, `rock`, `bale`, `car`, `bin`, `lamp`, `crate`, `barrel`), `cols` (cercles de collision), `hit` (matière), barils `hp` + `barrelBoom` |
| Pièces | `G.coins`, `updateCoins` | `pickupRadius`, `coinValue` (`src/rules/coins.js`), `c.mag` quand attirée, `G.collectAll` en fin de vague |
| Particules et lumières | `G.parts` (via `P`), `G.lights` (via `addLight`), `updateParts` | gravité, rebond des douilles, limites de pool dans `effects.js` |
| Timers en jeu | `G.timers.push({t, fn})` | décomptés dans `update` avec le `dt` ralenti, donc gelés par `freeze` |
| Caméra | `cam` (cible lerpée), `CX/CY` (entiers avec tremblement `trauma`) dans `state/game.js` | `shake(v)` (`src/render/effects.js`) alimente `G.trauma` |

## Ajouter un type de zombie

1. `ZT` dans `src/config.js` : fiche complète ; `armor` et `ranged` sont optionnels.
2. `ZCFG` dans `src/render/sprites.js` : palette et gabarit ; `SPR[type]` est généré au
   chargement (une variante par `shirts`).
3. `mix` des `LEVELS` concernés dans `config.js`.
4. Comportement spécifique : `updateZombies` (`src/loop/update.js`), à côté des cas
   `bloater` (explose au rempart) et `spitter` (`ranged`).
5. Une décision nouvelle (formule, seuil) va dans `src/rules/` avec son test ; le nombre va
   dans `config.js`.

## Ajouter un projectile ou une entité

1. Tableau dans `newGame()` (`src/state/game.js`) et remise à vide dans `buildLevel` et
   `startWave` (`src/loop/flow.js`).
2. `update<X>(dt)` dans `src/loop/update.js`, appelé depuis `update` dans l'ordre voulu.
3. Création depuis `fire()` (`src/loop/weapons.js`) ou `spawn.js`.
4. Dessin : `draw<X>` dans `src/render/draw.js` et insertion dans l'ordre de `render()`
   (liste triée par `y` pour les objets au sol, `drawEmissive` pour ce qui brille).
5. Collisions avec zombies via `hitZombie`, avec le survivant via `hurtPlayer`, avec le
   rempart via `damageBase` (`src/loop/damage.js`).
