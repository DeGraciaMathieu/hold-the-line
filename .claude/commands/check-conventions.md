# /check-conventions

Vérification légère des changements en cours : conventions de `CLAUDE.md`, cohérence
tests et documentation, exécution de la suite.

## Procédure

1. Lire `CLAUDE.md`.
2. Déterminer le périmètre :
   ```bash
   git status
   git diff
   git diff --cached
   git log --oneline -5
   ```
   S'il n'y a aucun changement, s'arrêter et le dire.
3. Vérifier point par point, chaque item noté **OK**, **VIOLATION** ou **N/A** avec le
   fichier et la ligne.

### Conventions

- Valeurs magiques : tout nombre de règle nouveau ou modifié est une constante nommée dans
  `src/config.js`.
- Pureté de `src/rules/` : pas de `document`, `window`, canvas, `Math.random`, `Date.now`,
  `performance.now`, pas de mutation des arguments, imports limités à `config.js` et aux
  autres règles.
- Aléatoire dans `loop/` via `src/state/random.js`, jamais `Math.random()`.
- Setters pour les variables partagées (`setGame`, `setPaused`, `setCamera`, `seedGame`,
  `prepareGround`, `resetHud`), pas de réassignation d'un import.
- Sens des dépendances respecté (`config ← rules ← state ← render ← loop ← input`).
- Français dans les commentaires, les titres de tests et les textes visibles.

### Cohérence tests / doc

- Toute règle touchée dans `src/rules/` a son test dans `tests/<module>.test.js`.
- Les titres de tests décrivent un comportement du jeu, pas une implémentation.
- Les textes visibles concernés (`index.html` : écran titre, légende des touches, aides ;
  `README.md` : commandes en jeu) reflètent le changement.
- Le skill de domaine concerné reste exact (fonctions renommées, nouveaux fichiers).

4. Lancer `npm test` et reporter le résultat exact.

## Rapport

```
## Conventions — <résumé du périmètre>

- [OK|VIOLATION|N/A] <item> — <fichier:ligne, détail>
…

npm test : <n> tests, <p> réussis, <f> échoués

Verdict : <CONFORME | À CORRIGER> — <violations à traiter>
```
