import { createRng } from '../rules/rng.js';

export let rng=null;
/* Seul main décide de la graine. */
export function seedGame(seed){rng=createRng(seed);}
export const rand=(a,b)=>a+rng()*(b-a);
export const ri=(a,b)=>Math.floor(a+rng()*(b-a+1));
export const pick=a=>a[Math.floor(rng()*a.length)];
export function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
