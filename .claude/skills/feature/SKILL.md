---
name: feature
description: Use when the user asks to add or change a game feature in Dernier Rempart. Full workflow - restate, clarify, implement within the architecture, test at macro level, update the docs, summarise.
user_invocable: true
---

# Workflow : implémenter une fonctionnalité

## 1. Comprendre

1. Reformuler la demande en une ou deux phrases, dans le vocabulaire du jeu (survivant,
   rempart, vague, refuge, atout, prime, combo).
2. Invoquer le skill `architecture` et le skill de domaine concerné (`waves-progression`,
   `weapons-combat`, `entities-update`, `rendering-effects`).
3. Vérifier `docs/decisions.md` : le point est-il déjà tranché, listé dans « Deliberately
   left alone » ou dans « Open questions » ?
4. Poser les questions de clarification **avant** de coder, uniquement celles que le code ne
   tranche pas :
   - valeurs numériques (vitesse, prix, dégâts, durée, pourcentage, refuge d'arrivée) ;
   - interactions avec l'existant (quel atout, quelle arme, quel type de zombie, mode infini
     inclus ou non, boss concernés) ;
   - cas limites (vague de boss, survivant mort, partie finie, argent insuffisant, pause).
   Ne pas inventer une valeur : la demander ou la signaler comme hypothèse explicite.

## 2. Implémenter

Dans cet ordre, en respectant `CLAUDE.md` :

1. Constantes dans `src/config.js`, dans la section adaptée.
2. Décision pure dans `src/rules/<module>.js` : prend l'état, retourne un résultat, `rng`
   injecté si tirage au sort.
3. Branchement dans `src/loop/` (application du résultat, effets `sfx`, `P`, `floatTxt`,
   `shake`), ou dans `src/state/game.js` pour un accesseur dérivé de `G`.
4. Rendu dans `src/render/`, entrée dans `src/input/` si une touche ou un bouton apparaît.
5. Textes visibles (`index.html`, écran titre, aides) si le joueur doit le voir.

Interdits à vérifier à la fin : nombre magique hors `config.js`, `Math.random()` ou DOM dans
`rules/`, mutation d'argument dans une règle, logique de jeu dans un listener.

## 3. Tester

1. Test macro dans `tests/<module>.test.js` pour chaque règle ajoutée ou modifiée, nommé
   comme une phrase de règle du jeu (voir le skill `testing`).
2. `npm test` ; corriger jusqu'à ce que la suite soit verte.
3. Si une approche échoue deux fois, s'arrêter et revenir au plan avec l'utilisateur.
4. Pour ce qui n'est pas testable sous Node (rendu, boucle), décrire à l'utilisateur quoi
   vérifier en jouant (`npm run dev`).

## 4. Documenter

Si le périmètre a bougé, mettre à jour dans la même tâche :

- `CLAUDE.md` (conventions, vocabulaire) et le skill de domaine concerné (tableaux, procédures) ;
- `README.md` (commandes en jeu) et les textes de `index.html` (écran titre, légende,
  aides) : le hook de synchronisation bloque la fin de tâche si un texte est périmé ;
- `docs/decisions.md` si une question ouverte a été tranchée.

## 5. Résumer

Terminer par : fichiers modifiés et pourquoi, tests ajoutés avec leur titre, résultat de
`npm test`, ce que l'utilisateur doit vérifier à la main, hypothèses prises.
