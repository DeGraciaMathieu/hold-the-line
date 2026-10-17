---
name: waves-progression
description: Use when working on refuges, waves, bosses, end-of-wave bonuses, perks, endless mode, or the flow between two waves (shop, perk screen, travel) in Dernier Rempart.
auto_invoke: true
---

# Vagues, refuges, boss et atouts

## Concepts → implémentation

| Concept | Où | Détail |
| --- | --- | --- |
| Refuge | `LEVELS` dans `src/config.js` | `id`, `name`, `sub`, `intro`, `dark`, `seed`, `ground`, `decor`, `boss`, `mix[5]` (un mix par vague locale, le 4e sert au mode infini) |
| Refuge courant | `levelOf()` dans `src/state/game.js` | `LEVELS[min(G.level, 3)]` |
| Vague locale / globale | `G.lw` (1 à 5, remis à 0 par `travel`), `G.wave` (jamais remis à 0) | `startWave` dans `src/loop/flow.js` incrémente les deux |
| Vague de boss | `isBossWave(lw, endless)` dans `src/rules/progression.js` | `lw === WAVES_PER_LEVEL`, ou `lw % 5 === 0` en infini |
| Taille de vague | `waveSize(wave, bossWave, endless)` | `WAVE_BASE_SIZE + wave × WAVE_SIZE_PER_WAVE`, × `BOSS_WAVE_SIZE_FACTOR`, × `ENDLESS_WAVE_SIZE_FACTOR` |
| Composition de la file | `buildWaveQueue(level, {lw,wave,bossWave,endless}, rng)` dans `src/rules/wave.js` | tirage pondéré dans `level.mix` → `G.queue` (clés de `ZT`) |
| Rythme d'apparition | `spawnGap(wave)` ; `FIRST_SPAWN_DELAY`, `SPAWN_GAP_MIN` | `G.spawnT`, `G.spawnGap`, essaims de 2 à 4 dans `update` (`src/loop/update.js`) |
| Point d'apparition | `edgePoint(side, rng)` dans `src/rules/wave.js` | bord 0 nord, 1 est, 2 sud, 3 ouest ; `SPAWN_EDGE_MARGIN`, `SPAWN_CORNER_BUFFER` |
| Apparition | `spawnZombie`, `spawnZombieAt`, `spawnBoss` dans `src/loop/spawn.js` | PV via `zombieHp` / `bossHp`, sprite `SPR[type][variant]`, bannière du boss |
| Boss | `BOSSES` + `BOSS_ORDER` dans `config.js` | `abil` parmi `charge`, `stomp`, `summon`, `spit` ; `target` `player | base | mixed` ; `aggro` |
| Boss en attente | `G.bossPending`, `G.bossT = BOSS_DELAY` | déclenché dans `update` quand `bossT` expire et que la file est vide |
| Fin de vague | `isWaveCleared(G)` dans `src/rules/wave.js`, appelé par `checkWaveEnd` (`src/loop/damage.js`) | puis `waveCleared` (`flow.js`) : ralenti `WAVE_CLEAR_*`, prime, timer `WAVE_CLEAR_DELAY` → `afterWave` |
| Prime | `waveBonus(wave, bossWave, intact)`, `isBaseIntact(hp, maxHp)` | `WAVE_BONUS_*`, `INTACT_BASE_RATIO` |
| Après la vague | `afterWave` dans `flow.js` | victoire si boss du dernier refuge, sinon `isPerkWave` → `openPerk` ou `openShop` |
| Atouts | `PERKS` dans `config.js` (`id`, `name`, `desc`, `glyph`, `max`) | niveau courant `PK('id')` ; proposés par `openPerk` (3 tirés via `shuffle`), appliqués par `choosePerk` |
| Effets des atouts | constantes `PERK_*` dans `config.js` | lus dans les règles : `magSize`, `reloadTime`, `resolveHit`, `movePlayer`, `leechHeal`, `pickupRadius`, `coinValue`, `turretCapacity`, `turretRate` ; effets immédiats (`hp`, `fort`, `turret`) dans `choosePerk` |
| Changement de refuge | `travel` dans `flow.js` | `G.level++`, `G.lw = 0`, `resetHud`, `buildLevel`, `startWave` |
| Construction du niveau | `buildLevel` dans `flow.js` | `prepareGround`, `genProps`, remise à zéro des entités, du rempart, du survivant, de la caméra, neige |
| Mode infini | `G.endless` | activé par `#btnEndless` (`src/input/ui.js`) après la victoire ; boss cyclés sur `BOSS_ORDER`, `bossHp` scalé au-delà de `BOSS_ENDLESS_HP_FROM_WAVE` |
| Fin de partie | `gameOver(reason)` dans `flow.js` | `reason` `player` ou `base`, record dans `localStorage` (`dernier-rempart-best`), `showOver` |
| Victoire | `showWin` dans `src/render/screens.js` | `localStorage` `dernier-rempart-win` |

Points déjà tranchés ou ouverts dans `docs/decisions.md` : `G.reinforce` non remis à zéro
entre refuges, `G.lw` forcé à 0 au passage en infini, tirage des atouts non déterministe.

## Ajouter un refuge

1. `LEVELS` dans `src/config.js` : nouvel objet avec `ground` (palettes `base`, `clear`,
   `road`, `edge`, `speck`, éventuellement `patch`, `vroads`, `ruts`, `marks`, `side`),
   `decor`, `boss`, `seed`, `mix` de cinq entrées.
2. `src/render/ground.js` `genProps` : branche sur `L.decor` si le décor est nouveau ;
   `genGround` lit `L.ground` et `roadY`.
3. Déverrouillage d'armes : `WLVL` dans `config.js` si des armes arrivent avec ce refuge.
4. Le texte de l'écran titre (`index.html`, « Campagne · 4 refuges · 20 vagues ») et le
   `README.md` doivent suivre.

## Ajouter un boss ou une capacité de boss

1. `BOSSES` et `BOSS_ORDER` dans `config.js` ; `BCFG` (palette) dans `src/render/sprites.js`.
2. Capacité : `bossAI` dans `src/loop/update.js` gère `z.state` (`walk`, `tele`, `charge`,
   `stomp`…), les cooldowns `z.cd`, et appelle `shockwave`, `summon`, `spit`. Les seuils
   d'aggro et d'onde de choc sont dans `config.js` (`BOSS_AGGRO_*`, `SHOCKWAVE_*`).
3. Télégraphes visuels dans `drawTelegraphs` (`src/render/draw.js`), sons dans `SND`.

## Ajouter un atout

1. `PERKS` dans `config.js` (`id`, `name`, `desc`, `glyph`, `max`).
2. Constante d'effet `PERK_<X>` dans `config.js`.
3. Lire `perks.<id>` dans la règle pure concernée (ou `PK('<id>')` dans `loop/`), et écrire
   le test macro correspondant dans `tests/`.
4. Effet immédiat à la sélection : `choosePerk` dans `src/loop/flow.js`.

## Modifier la progression

Toute formule (taille, rythme, prime, scaling) vit dans `src/rules/progression.js` avec ses
constantes dans `config.js` et ses tests dans `tests/progression.test.js`. Ne pas remettre
de nombre dans `flow.js`.
