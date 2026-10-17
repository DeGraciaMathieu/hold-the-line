---
name: weapons-combat
description: Use when working on weapons, firing, reloading, damage resolution, critical hits, armour, melee, turrets, or the shop (prices, purchases, ammo) in Dernier Rempart.
auto_invoke: true
---

# Armes, combat, tourelles et boutique

## Concepts → implémentation

| Concept | Où | Détail |
| --- | --- | --- |
| Fiche d'arme | `WEAP[id]` dans `src/config.js` | `dmg`, `rate`, `auto`, `mag`, `reload`, `spread`, `bloom`, `speed`, `range`, `knock`, `price`, `ammo {n,p}`, `snd`, `casing`, `rects`/`muzzle` (sprite), options `pellets`, `pierce`, `flame`, `grenade`+`radius`, `spin`, `charge`, `perShell`, `hitstop`, `statDmg` |
| Ordre et déverrouillage | `ORDER`, `WLVL`, `PIERCE_ARMOR` dans `config.js` | `isUnlocked(id, level, endless)` dans `src/rules/weapons.js` |
| Sprite d'arme | `gunSpr(rects, muzzle)` dans `src/render/sprites.js` | enrichit `WEAP[id].spr`, `.icon`, `.pellets` au chargement |
| Arme en main | `G.player.w`, `owned`, `mag[id]`, `res[id]` (`Infinity` = illimité) | changement par `switchWeapon` / `cycleWeapon` (`src/loop/weapons.js`) |
| Chargeur et rechargement | `magSize(id, perks)`, `reloadTime(w, perks)` ; adaptateurs `MAG`, `RLD` dans `src/state/game.js` | `startReload`, `finishReload` dans `loop/weapons.js` ; `perShell` recharge cartouche par cartouche |
| Tir | `fire()` dans `loop/weapons.js` | cadence `p.cd`, dispersion `bloom`, recul `kick`/`kx`, balles → `G.bullets`, flammes → `G.flames`, grenades → `G.grenades`, douilles `ejectCasing` |
| Railgun | `fireRail()` | hitscan après `charge`, traverse tout, traces au sol via `stamp` |
| Bouche du canon | `muzzlePos(p, w)` dans `rules/weapons.js` | `[fx, fy, hx, hy]` à partir de `w.muzzle`, `p.ang`, `p.face`, `p.kick` |
| Mêlée | `melee()` dans `loop/weapons.js` | `MELEE_DMG`, `MELEE_RANGE`, `MELEE_KNOCK`, source `'melee'` |
| Vol des balles et impacts | `updateBullets`, `bulletHitsProp` dans `src/loop/update.js` | `pierce` + atout `pierce`, `G.shots`/`G.hits` pour la précision |
| Résolution des dégâts | `resolveHit({dmg, src, target, perks}, rng)` dans `src/rules/combat.js` | `PERK_DMG_BONUS`, critique (`CRIT_BASE_CHANCE`, `PERK_CRIT_BONUS`, `CRIT_MULT`), armure (`target.armor`, ignorée par `PIERCE_ARMOR`, `boom`, `fire`, `gore`), minimum 1, Pyromane |
| Application au zombie | `hitZombie(z, dmg, dx, dy, knock, src)` dans `src/loop/damage.js` | applique `resolveHit`, recul `knock / mass`, flash, stun, sang, texte flottant, `hitstop`, puis `killZombie` |
| Mort du zombie | `killZombie(z, dx, dy, src)` | `coinDrop(reward, combo, huge)`, `leechHeal`, combo (`COMBO_TIME`), Carnage (`PERK_GORE_CHANCE` → `goreBurst`), explosion du bloater, `checkWaveEnd` |
| Sources de dégâts | `src` | clé d'arme, `'melee'`, `'turret'`, `'boom'` (explosion), `'fire'` (brûlure), `'gore'`, `'base'` |
| Explosions | `explode(x, y, R, dmg, kind)` dans `src/loop/spawn.js` | touche zombies, survivant, rempart, barils (`barrelBoom`) |
| Blessure du survivant | `playerTakesHit(p, n, src, over)` → `hurtPlayer(n, src)` | `PLAYER_INV_TIME`, `PLAYER_HURT_KNOCK`, `gameOver('player')` |
| Dégâts au rempart | `baseTakesHit(b, n, over)` → `damageBase(n, x, y)` | éclats, `G.fx.baseHit`, `gameOver('base')` |
| Tourelles | `turretCapacity(perks)`, `turretRate(perks)` dans `src/rules/turrets.js` ; `addTurret` dans `loop/damage.js` ; `updateTurrets` dans `loop/update.js` | positions `TURRET_POS`, portée `TURRET_RANGE`, source `'turret'` |
| Boutique | `purchasePrice(act, id, reinforce)`, `applyPurchase(act, id, {player, base, reinforce, perks})` dans `src/rules/shop.js` | actions `buy`, `ammo`, `repair`, `reinforce`, `heal`, `turret` ; prix `REPAIR_PRICE`, `HEAL_PRICE`, `TURRET_PRICE`, `reinforcePrice` |
| Écran de boutique | `renderShop`, `renderRoute`, `openShop` dans `src/render/screens.js` ; listener `#shop` dans `src/input/ui.js` | la vérification de l'argent et l'application du résultat sont dans le listener |
| Sons | `SND[name]` et `GAP` dans `src/render/audio.js`, `sfx(name, x, y, v)` | `w.snd`, `w.ejectSnd`, `'hit'`, `'crit'`, `'clang'`, `'kill'`, `'killBig'`, `'buy'`, `'deny'` |

Comportement conservé volontairement (voir `docs/decisions.md`) : `G.shots` compte les
plombs et `G.hits` les contacts, la précision du fusil à pompe est sous-évaluée.

## Ajouter une arme

1. `WEAP` dans `src/config.js` : fiche complète, `rects` et `muzzle` pour le sprite
   (le même format que les armes existantes, `SKIN` pour la main), `snd` existant ou nouveau.
2. `ORDER` (touche 1 à 0, dix emplacements) et `WLVL` (refuge d'arrivée) ; `PIERCE_ARMOR`
   si elle ignore l'armure.
3. Comportement particulier (`flame`, `grenade`, `charge`, `spin`, `perShell`) : branche
   dans `fire()` ou `fireRail()` (`src/loop/weapons.js`), puis `updateBullets` / `updateFlames`
   / `updateGrenades` (`src/loop/update.js`) pour le vol.
4. Nouveau son : `SND` et `GAP` dans `src/render/audio.js`.
5. Tests : `tests/weapons.test.js` (chargeur, déverrouillage) et `tests/shop.test.js` (prix,
   achat) lisent `WEAP` ; ajouter un cas si la fiche a une particularité.

## Modifier la formule de dégâts

1. `resolveHit` dans `src/rules/combat.js`, constantes dans `config.js` (sections « Coups
   critiques », « Atouts »).
2. Test macro dans `tests/combat.test.js` avec un `rng` stub (`() => 0` force le critique,
   `() => 0.999` l'empêche).
3. Ne rien recalculer dans `hitZombie` : il applique le résultat et gère les effets.

## Ajouter un article de boutique

1. `purchasePrice` et `applyPurchase` dans `src/rules/shop.js` + test dans `tests/shop.test.js`.
2. Carte dans `renderShop` (`src/render/screens.js`, tableau `U` pour les utilitaires).
3. Si l'effet n'est pas un fragment d'état (comme `addTurret`), le listener `#shop` dans
   `src/input/ui.js` l'exécute sur le drapeau retourné.
