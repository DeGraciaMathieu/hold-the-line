---
name: prd
description: Use when the user wants a specification (PRD) for a change to Dernier Rempart before any implementation. Explores the code for the technical baseline, asks only the product decisions, writes the document, implements nothing.
---

# Workflow : rédiger un PRD

Ce skill produit un document de spécification. Il n'écrit aucun code, aucun test.

## 1. Base technique (à déduire du code, sans question)

1. Invoquer `architecture` et le skill de domaine concerné.
2. Lire les fichiers réellement touchés : constantes dans `src/config.js`, règles dans
   `src/rules/`, orchestration dans `src/loop/`, rendu dans `src/render/`, entrées dans
   `src/input/`, tests dans `tests/`.
3. Relever ce qui existe déjà : valeurs actuelles, fonctions à étendre, textes visibles
   concernés, arbitrages de `docs/decisions.md`.

## 2. Décisions produit (seules questions à poser)

Valeurs chiffrées, interactions avec l'existant (atouts, armes, boss, mode infini), cas
limites, ce qui est hors périmètre. Une question par point non tranché ; aucune question
dont la réponse est dans le code.

## 3. Rédiger le PRD

Format fixe, en français, enregistré dans `docs/prd/<slug>.md` :

```
# <Titre>

## Objectif
Une phrase : ce que le joueur gagne.

## Base technique
Ce qui existe aujourd'hui, avec les fichiers et fonctions concernés et les valeurs actuelles
de `config.js`.

## Comportement
Règles attendues, dans le vocabulaire du jeu, avec les valeurs décidées. Cas limites inclus.

## Hors périmètre
Ce qui ne sera pas fait, explicitement.

## Impact par couche
| Couche | Fichiers | Changement |
config / rules / state / render / input / loop / index.html / README.md

## Critères d'acceptation
Liste vérifiable, un critère par ligne.

## Tests
Tests macro à écrire : fichier, titre en phrase de règle, ce qu'ils vérifient.

## Risques et questions ouvertes
Ce que le code ne tranche pas, ce qui pourrait casser (ordre de `render()`, cycles
d'import, textes visibles à synchroniser).
```

## 4. Livrer

Présenter le chemin du document et ses questions ouvertes. Ne pas implémenter : proposer
`/feature` pour la suite.
