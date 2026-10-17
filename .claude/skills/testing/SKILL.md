---
name: testing
description: Use when writing, running or reviewing tests for Dernier Rempart, to know the command, the macro-test philosophy, which test file covers which rule, and where a new test goes.
auto_invoke: true
---

# Tests de Dernier Rempart

## Commande

```bash
npm test            # node --test, tous les tests/*.test.js
npm run test:watch
node --test tests/combat.test.js   # un seul fichier
```

Runner `node:test`, assertions `node:assert/strict`, aucune dépendance. Les tests
s'exécutent sous Node : **ils ne peuvent importer que `src/rules/`, `src/config.js` et
`src/util.js`**. Tout import de `render/`, `state/`, `loop/` ou `input/` échoue
(`document` indéfini) et serait de toute façon une erreur de conception.

## Philosophie : tests macro

Un test énonce une règle du jeu dans son vocabulaire, pas un détail d'implémentation.

- Bon : « le survivant ne peut pas entrer dans le rempart », « l'armure du blindé encaisse
  6 points sur les petits calibres, pas sur le fusil de précision ni le feu ».
- Mauvais : « `clamp` retourne 4 », « le tableau a une longueur de 3 après `push` ».

Forme attendue (voir `tests/player.test.js`) :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { movePlayer } from '../src/rules/player.js';

test('le survivant ne peut pas entrer dans le rempart', () => {
  const m = movePlayer({ ...player, x: 348, y: 240 }, { ix: 1, iy: 0 }, 0.1, world);
  assert.equal(m.x, 348);
});
```

- État construit par un petit littéral explicite, pas par un helper qui cache la mise en place.
- Un ou deux tests par règle : le cas nominal et le cas limite qui justifie la règle.
- Aléatoire : passer `createRng(graine)` de `src/rules/rng.js`, ou un stub `() => 0` /
  `() => 0.999` pour forcer un tirage (voir `tests/combat.test.js`).
- Flottants : `assert.ok(Math.abs(a - b) < 1e-9)` plutôt que `assert.equal`.
- Titres en français, avec le vocabulaire du jeu (survivant, rempart, vague, atout, prime).
- Pas d'objectif de couverture en pourcentage.

## Fichier de test → périmètre couvert

| Fichier | Module | Règles couvertes |
| --- | --- | --- |
| `tests/progression.test.js` | `rules/progression.js` | vague de boss, taille de vague, intervalle de spawn, scaling PV, rempart intact, prime, vague à atout, prix du renforcement |
| `tests/weapons.test.js` | `rules/weapons.js` | chargeur et rechargement selon atouts, déverrouillage par refuge, bouche du canon |
| `tests/turrets.test.js` | `rules/turrets.js` | capacité et cadence des tourelles |
| `tests/collision.test.js` | `rules/collision.js` | repousser hors du rempart, hors des accessoires, accessoire détruit |
| `tests/wave.test.js` | `rules/wave.js` | fin de vague, composition de la file (graine fixe), point d'apparition |
| `tests/player.test.js` | `rules/player.js` | vitesse, rechargement, atout Jambes de coureur, rempart infranchissable, immobilité |
| `tests/combat.test.js` | `rules/combat.js` | dégâts et atouts, critique, armure, minimum 1, Pyromane, pièces et combo, Vampire, blessure du survivant, dégâts au rempart |
| `tests/coins.test.js` | `rules/coins.js` | rayon de ramassage, valeur avec Aimant |
| `tests/shop.test.js` | `rules/shop.js` | prix de chaque article, effet de chaque achat |

Non couvert par les tests (orchestration avec effets) : `loop/update.js` (IA des zombies et
des boss, projectiles, flammes, grenades, tourelles), `loop/weapons.js` (`fire`, `fireRail`,
`melee`), `loop/flow.js` (déroulé des vagues), tout `render/`. Pour tester une décision qui
s'y trouve, l'extraire d'abord en règle pure (voir `architecture`).

## Où écrire un nouveau test

1. Un fichier par module de règles : `tests/<module>.test.js` pour `src/rules/<module>.js`.
   Ajouter au fichier existant si le module existe déjà, sinon le créer.
2. Importer uniquement la règle testée et, au besoin, `config.js` (`WEAP`, `LEVELS`…) pour
   lire les valeurs réelles plutôt que de les recopier.
3. Lancer `npm test` : la suite doit être verte avant de considérer la tâche finie.
