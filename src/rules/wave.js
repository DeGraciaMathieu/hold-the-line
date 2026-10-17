/* Règles de vague : fin de vague, composition de la file de zombies, point d'apparition. Pures. */
import { WW,WH,WAVES_PER_LEVEL } from '../config.js';
import { waveSize } from './progression.js';

const clamp=(v,a,b)=>v<a?a:v>b?b:v;

/* Une vague est repoussée quand elle est active, qu'aucun boss n'est en attente,
   que la file est vide et qu'aucun zombie n'est encore debout. */
export function isWaveCleared({waveActive,bossPending,queue,zombies}){
  return waveActive&&!bossPending&&queue.length===0&&!zombies.some(q=>!q.dead);
}
