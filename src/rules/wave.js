/* Règles de vague : fin de vague, composition de la file de zombies, point d'apparition. Pures. */
import { WW,WH,WAVES_PER_LEVEL,SPAWN_EDGE_MARGIN,SPAWN_CORNER_BUFFER } from '../config.js';
import { waveSize } from './progression.js';

const clamp=(v,a,b)=>v<a?a:v>b?b:v;

/* Une vague est repoussée quand elle est active, qu'aucun boss n'est en attente,
   que la file est vide et qu'aucun zombie n'est encore debout. */
export function isWaveCleared({waveActive,bossPending,queue,zombies}){
  return waveActive&&!bossPending&&queue.length===0&&!zombies.some(q=>!q.dead);
}

/* Compose la file des zombies d'une vague en tirant chaque type au sort dans le
   mix du refuge (le quatrième mix sert au mode infini). rng : fonction () => [0,1[. */
export function buildWaveQueue(level,{lw,wave,bossWave,endless},rng){
  const mix=endless?level.mix[3]:level.mix[clamp(lw,1,WAVES_PER_LEVEL)-1];
  const total=waveSize(wave,bossWave,endless);
  const keys=Object.keys(mix),sum=keys.reduce((a,k)=>a+mix[k],0),q=[];
  for(let i=0;i<total;i++){let r=rng()*sum;for(const k of keys){r-=mix[k];if(r<=0){q.push(k);break;}}if(q.length<=i)q.push(keys[0]);}
  return q;
}

/* Point d'apparition juste hors du monde, sur le bord demandé (0 nord, 1 est, 2 sud, 3 ouest). */
export function edgePoint(side,rng){const m=SPAWN_EDGE_MARGIN,c=SPAWN_CORNER_BUFFER,rand=(a,b)=>a+rng()*(b-a);
  if(side===0)return[rand(c,WW-c),-m];if(side===1)return[WW+m,rand(c,WH-c)];if(side===2)return[rand(c,WW-c),WH+m];return[-m,rand(c,WH-c)];}
