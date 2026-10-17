# /review

Revue complète des changements en cours : conventions, couverture de tests, maintenabilité,
cohérence avec le système existant.

## Procédure

1. Lire `CLAUDE.md` et, selon les fichiers touchés, le skill de domaine concerné
   (`waves-progression`, `weapons-combat`, `entities-update`, `rendering-effects`).
2. Déterminer le périmètre :
   ```bash
   git status
   git diff
   git diff --cached
   git log --oneline -5
   ```
   S'il n'y a aucun changement (diff vide, index vide), s'arrêter et le dire.
3. Vérifier point par point, chaque item noté **OK**, **VIOLATION** ou **N/A** avec le
   fichier et la ligne.

### Conventions (`CLAUDE.md`)

- Aucune valeur magique hors `src/config.js` (nombres de règle, prix, durées, pourcentages).
- `src/rules/` pur : pas de DOM, pas de `Math.random`/`Date.now`/`performance.now`, pas de
  mutation d'argument, pas d'import depuis `render/`, `input/`, `loop/`.
- Aléatoire via `rng`/`rand`/`ri`/`pick` de `src/state/random.js` dans `loop/` ;
  `Math.random()` seulement pour du cosmétique dans `render/`.
- Pas de nouvelle lecture de l'horloge hors `loop/frame.js`.
- Variables partagées modifiées par leurs setters (`setGame`, `setPaused`, `setCamera`,
  `seedGame`, `prepareGround`, `resetHud`).
- Dépendances descendantes : `config ← rules ← state ← render ← loop ← input`.
- Listeners dans `input/` sans logique de jeu au-delà du filtrage d'état.
- Entités en objets plats, pas de classe.
- Français dans les commentaires, les tests et les textes visibles ; apostrophes
  typographiques dans les textes affichés.

### Couverture de tests

- Chaque règle ajoutée ou modifiée dans `src/rules/` a un test macro dans
  `tests/<module>.test.js`, formulé comme une règle du jeu.
- Les tests n'importent que `src/rules/`, `src/config.js`, `src/util.js`.
- Un changement de constante dans `config.js` qui modifie une valeur attendue par un test a
  mis le test à jour (et non l'inverse).

### Maintenabilité

- Couplage : un module de `loop/` ou `render/` n'importe pas plus que nécessaire ; pas de
  nouvelle arête `render → loop` ou `state → render`.
- Responsabilité unique : une règle décide, un site d'appel applique et déclenche les effets.
- Duplication : pas de formule recopiée entre `rules/` et `loop/`, pas de constante en double.
- Longueur et complexité : une fonction de `loop/` qui dépasse l'existant (`updateZombies`,
  `bossAI`) mérite une extraction.
- Nommage : identifiants anglais courts cohérents avec l'existant (`waveSize`, `hitZombie`,
  `PERK_*`, `WAVE_*`), vocabulaire du jeu dans les tests.

### Cohérence du système

- Intégration : nouvelles entités ajoutées à `newGame()`, `buildLevel`, `startWave`, à
  `update` et à l'ordre de `render()`.
- Forme de l'état : nouveaux champs sur `G`, `player`, `base` ou les entités, initialisés
  dans `newGame()` / `spawnZombieAt`, remis à zéro où il faut.
- Patterns établis : accesseurs dérivés de `G` dans `state/game.js`, effets via `sfx`, `P`,
  `floatTxt`, `shake`, HUD via `hud.js` et son cache.
- Textes visibles (`index.html`, `README.md`) et `docs/decisions.md` à jour si le périmètre
  a bougé ; comportements « Deliberately left alone » non modifiés sans décision.

4. Lancer `npm test` et reporter le résultat exact (nombre de tests, réussis, échoués).

## Rapport

```
## Revue — <résumé du périmètre>

### Conventions
- [OK|VIOLATION|N/A] <item> — <fichier:ligne, détail>

### Tests
- [OK|VIOLATION|N/A] <item>

### Maintenabilité
- [OK|VIOLATION|N/A] <item>

### Cohérence
- [OK|VIOLATION|N/A] <item>

### Suite de tests
npm test : <n> tests, <p> réussis, <f> échoués

### Verdict
<ACCEPTÉ | À CORRIGER> — <les violations à traiter, par ordre d'importance>
```
