# Dernier Rempart

Jeu de défense de refuge en vue de dessus : quatre refuges, cinq vagues chacun, un boss par
refuge, puis un mode infini. Canvas 384×216, sprites et sons générés en code, aucune
dépendance d'exécution.

## Lancer

> **Le double-clic sur `index.html` ne fonctionne plus.** Le jeu est découpé en modules ESM
> natifs, que les navigateurs refusent de charger en `file://`. Il faut le servir :

```bash
npm run dev
```

puis ouvrir l'adresse affichée (par défaut http://localhost:3000). Le script utilise
`npx serve .` ; n'importe quel serveur statique fait l'affaire (`python3 -m http.server`,
par exemple).

Node 22 ou plus récent.

## Tester

```bash
npm test          # node --test, suite complète
npm run test:watch
```

Les tests sont des tests macro : ils énoncent une règle du jeu dans son vocabulaire (« le
survivant ne peut pas entrer dans le rempart ») et ne testent que `src/rules/`.

## Arborescence

```
index.html            page, styles et écrans ; charge src/main.js
src/
  config.js           toutes les valeurs nommées (armes, zombies, boss, refuges, atouts, prix…)
  util.js             clamp, lerp
  rules/              décisions pures, testables : progression, armes, tourelles,
                      collisions, vagues, mouvement du joueur, combat, pièces, boutique, rng
  state/              état du jeu (G, caméra, souris, clavier) et RNG à graine
  render/             DOM, outils pixel, sprites, sol, audio, effets, dessin, HUD, écrans
  input/              clavier, souris, boutons des écrans
  loop/               orchestration : boucle, update, déroulé des vagues, tir, dégâts, spawn
  main.js             graine, état initial, mise en page, démarrage
tests/                un fichier de tests par module de règles
docs/decisions.md     choix de découpage, aléatoire, comportements volontairement conservés
```

Dépendances entre couches : `config` ← `rules` ← `state` ← `render` ← `loop` ← `input`,
`main` câble le tout. Une règle n'importe jamais le rendu, l'entrée ni la boucle.

## Commandes en jeu

ZQSD / WASD / flèches pour se déplacer, souris pour viser et tirer, R recharger, F ou clic
droit coup de crosse, 1 à 0 changer d'arme, molette pour faire défiler les armes,
Échap ou P pause, M couper le son.
