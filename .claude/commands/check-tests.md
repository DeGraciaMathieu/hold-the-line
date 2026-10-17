# /check-tests

Analyse la couverture des changements en cours par des tests macro, propose les tests
manquants, attend l'accord de l'utilisateur avant de les écrire, puis relance la suite.

## Procédure

1. Lire `CLAUDE.md` et le skill `testing`.
2. Déterminer le périmètre :
   ```bash
   git status
   git diff
   git diff --cached
   git log --oneline -5
   ```
   S'il n'y a aucun changement, s'arrêter et le dire.
3. Pour chaque fonction de `src/rules/` ajoutée ou modifiée, et chaque constante de
   `src/config.js` qui entre dans une règle, chercher dans `tests/<module>.test.js` le test
   qui l'exerce. Noter chaque item **OK** (couvert), **VIOLATION** (règle sans test, ou test
   qui ne décrit qu'une implémentation) ou **N/A** (orchestration dans `loop/`, rendu,
   entrée : non testable sous Node).
4. Pour une décision ajoutée dans `loop/` sans règle pure correspondante, signaler qu'elle
   devrait d'abord être extraite dans `src/rules/` pour être testable.
5. Proposer les tests manquants : pour chacun, le fichier, le titre (une phrase de règle du
   jeu en français), l'état littéral d'entrée, l'assertion attendue, et le `rng` stub si un
   tirage est en jeu.
6. **S'arrêter et attendre l'accord explicite de l'utilisateur** avant d'écrire quoi que ce
   soit. Ne pas écrire les tests de sa propre initiative.
7. Une fois l'accord obtenu, écrire les tests approuvés dans les fichiers indiqués, puis
   lancer `npm test` et reporter le résultat exact.

## Rapport

```
## Tests — <résumé du périmètre>

### Couverture
- [OK|VIOLATION|N/A] <règle ou fonction> — <test existant ou manque>

### Tests proposés
1. `tests/<module>.test.js` — « <titre> » : <entrée> → <attendu>
…

En attente d'accord pour les écrire.
```

Après écriture :

```
npm test : <n> tests, <p> réussis, <f> échoués
Verdict : <COUVERT | À COMPLÉTER>
```
