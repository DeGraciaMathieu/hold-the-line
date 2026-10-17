---
name: rendering-effects
description: Use when working on anything the player sees or hears in Dernier Rempart: canvas drawing, generated sprites, the stamped ground, particles, lighting, screen shake, HUD, overlays and screens, or the synthesized audio.
auto_invoke: true
---

# Rendu, effets, HUD et audio

Tout est généré en code : aucun fichier image ni son. Le canvas de jeu fait 384×216
(`W`, `H`), le monde 768×480 (`WW`, `WH`), la caméra `CX/CY` est soustraite au dessin.
`ctx.imageSmoothingEnabled = false`, coordonnées arrondies : pixel art strict.

## Concepts → implémentation

| Concept | Où | Détail |
| --- | --- | --- |
| Canvas et DOM | `src/render/dom.js` | `$`, `stage`, `shell`, `cv`, `ctx`, `reduced` (`prefers-reduced-motion`) ; `layout()` dans `src/input/ui.js` met `stage` à l'échelle entière |
| Outils pixel | `src/render/pixel.js` | `mk(w, h)` → `[canvas, ctx]`, `mulberry32(seed)` (PRNG déterministe du rendu), `outline`, `tint`, `shade`, `hash`/`vnoise` (bruit du terrain), `BAYER` (tramage) |
| Sprites humanoïdes | `humanoid(o, seed)` dans `src/render/sprites.js` | 5 frames + versions `white`/`dark`/`char` ; `ZCFG` (zombies), `BCFG` (boss), `PSPR` (survivant) |
| Décor | `pine`, `roundTree`, `rockSpr`, `carSpr`, `simpleSpr` → `PINES`, `SNOWPINES`, `ROUNDS`, `ROCKS`, `SROCKS`, `CARS`, `BIN`, `LAMP`, `CRATE`, `BALE`, `BARREL` | tirés par `genProps` selon `L.decor` |
| Rempart | `BASE` dans `sprites.js` | `img`, `white`, `dmg` (fissures par palier de PV), `snowCap` |
| Armes | `gunSpr(rects, muzzle)` | enrichit `WEAP[id].spr` et `.icon` (data URL pour la boutique) |
| Police bitmap | `FONT`, `drawText(s, x, y, col, sc)` | chiffres et symboles `+ $ x ! -` pour les textes flottants |
| Sol | `src/render/ground.js` | `ground` (tamponné), `groundClean` (copie propre recopiée à 32 % à chaque vague par `startWave`), `light` (demi-résolution) ; `genGround(L)` depuis `L.ground` et `L.seed`, `zoneAt`, `roadY` ; `stamp(x, y, col, s)` pour sang, traces, corps |
| Accessoires | `genProps(L)` dans `ground.js` | placement déterministe par `mulberry32(L.seed)`, `scatter` avec zones et distances |
| Particules | `P(o)` dans `src/render/effects.js` → `G.parts` | `type` (`blood`, `goo`, `gib`, `chip`, `spark`, `fire`, `smoke`, `casing`, `shell`, `slash`, `flash`, `ring`, `beam`, `rail`…), `x, y, z, vx, vy, vz, life, col` ; pool plafonné |
| Effets prêts à l'emploi | `blood`, `dust`, `sparks`, `chips`, `boomFX` dans `effects.js` | palettes `BLOOD`, `ACID` |
| Lumières | `addLight(x, y, r, a, life, col)` → `G.lights` | consommées par `lightPass` |
| Secousse et ralenti | `shake(v)` → `G.trauma` ; `G.freeze`, `G.slowT`, `G.ts` | `trauma` décroît dans `update`, tremblement appliqué par `setCamera` dans `render` |
| Textes flottants | `floatTxt(x, y, text, col, sc, life)` → `G.floats` | dessinés par `drawText` |
| Rendu d'une frame | `render(dt)` dans `src/render/draw.js` | ordre : sol → ombres → télégraphes → liste triée par `y` (accessoires, rempart, zombies, survivant, pièces, grenades) → particules → `lightPass` → `drawEmissive` → neige → textes → `drawAlert` → vignette `VIG` → overlay rouge `RED` → `drawCross` |
| Dessins unitaires | `drawZombie`, `drawPlayer`, `drawGun`, `drawBase`, `drawProp`, `drawCoin`, `drawGrenade`, `drawParts`, `shadow`, `drawSpr` | `drawSpr(img, ax, x, y, flip, sx, sy)` gère le miroir et le squash |
| Lumière | `lightPass`, `glow` | passe sombre `L.dark` sur le canvas `light`, trouée par les sources (fenêtres, lampadaires `o.light`/`o.flick`, lampe du survivant, `G.lights`) |
| HUD | `src/render/hud.js` : `hud` (refs DOM), `hudUpdate(dt)` | cache `hc` via `setT`/`setH`/`setWd` (n'écrit que si la valeur change), pip-bar des munitions (`pipEls`, `gaugeEl`), jauges fantômes `ghostB`/`ghostL`/`ghostBoss`, drapeaux `G.fx` consommés une frame |
| Bannière | `banner(t, s, tone, eyebrow)` | `#banner`, disparition par `setTimeout` 2300 ms |
| Overlays | `OVERLAYS`, `hideOverlays`, `showOverlay(id)` | `start`, `shop`, `pause`, `over`, `perk`, `win` dans `index.html` |
| Écrans | `src/render/screens.js` | `openShop`/`renderShop`/`renderRoute`, `showOver`, `showWin` ; liste d'atouts par `openPerk` (`src/loop/flow.js`) |
| Audio | `src/render/audio.js` | `initAudio()` au premier geste, `AU` (contexte, bus master, bruit blanc), générateurs `nz` (bruit filtré), `tn` (ton), `voice` (voix de zombie), table `SND[name](dst)`, anti-spam `GAP`, `sfx(name, x, y, v)` avec pan et atténuation par distance au survivant, `setMute` persistée dans `localStorage` |
| Aléatoire cosmétique | `Math.random()` toléré ici uniquement | scintillement, tremblement caméra, tailles de particules, offsets audio (liste dans `docs/decisions.md`) |

## Ajouter un effet visuel

1. Si c'est une particule : appel à `P({type, x, y, z, vx, vy, vz, life, col, …})` depuis
   `effects.js` (helper réutilisable) ou directement depuis `loop/`.
2. Nouveau `type` : branche de dessin dans `drawParts` (`draw.js`) ; ajouter à `EMI` s'il
   doit briller dans `drawEmissive` ; physique dans `updateParts` (`src/loop/update.js`).
3. Lumière associée : `addLight`.
4. Pas de nombre de règle ici : seuls les réglages purement visuels restent inline.

## Ajouter un son

1. Entrée dans `SND` (`audio.js`) construite avec `nz`, `tn` ou `voice`, le paramètre `d`
   étant le bus de sortie fourni par `sfx`.
2. Entrée dans `GAP` si le son peut être spammé.
3. Appeler `sfx('nom', x, y)` depuis `loop/` ; omettre `x, y` pour un son d'interface.

## Modifier le HUD ou un écran

1. Structure HTML et styles dans `index.html` (une seule page, CSS inline, variables
   `--px`, `--brass`, `--blood`…).
2. Référence DOM dans `hud` (`hud.js`), mise à jour dans `hudUpdate` via `setT`/`setH`/`setWd`
   pour profiter du cache ; vider le cache avec `resetHud` quand tout doit se redessiner.
3. Texte dynamique : construit dans `hud.js` ou `screens.js` ; texte fixe : dans
   `index.html`, et garder `README.md` cohérent.
