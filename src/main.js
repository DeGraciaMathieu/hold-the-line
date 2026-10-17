/* Point d'entrée : graine du RNG, état initial, mise en page et boucle.
   Les modules d'entrée enregistrent leurs listeners à l'import. */
import './input/keyboard.js';
import './input/pointer.js';
import { layout } from './input/ui.js';
import { buildLevel } from './loop/flow.js';
import { frame } from './loop/frame.js';
import { newGame,setGame } from './state/game.js';
import { seedGame } from './state/random.js';

seedGame(Date.now()>>>0);
setGame(newGame());buildLevel();
layout();
requestAnimationFrame(frame);
