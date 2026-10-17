/* Règles d'arme : capacité du chargeur et temps de rechargement selon les
   atouts, déverrouillage par refuge, position de la bouche du canon. Pures. */
import { WEAP,WLVL,GH,PERK_MAG_BONUS,PERK_RELOAD_FACTOR } from '../config.js';

export function magSize(id,perks){return Math.round(WEAP[id].mag*(1+PERK_MAG_BONUS*(perks.mag||0)));}

export function reloadTime(w,perks){return w.reload*Math.pow(PERK_RELOAD_FACTOR,(perks.reload||0));}

export function isUnlocked(id,level,endless){return endless||WLVL[id]<=level;}

export function muzzlePos(p,w){
  const hx=p.x+p.face*2,hy=p.y-GH,[mx,my]=w.muzzle,ly=p.face<0?-my:my,c=Math.cos(p.ang),s=Math.sin(p.ang),k=mx-p.kick;
  return[hx+c*k-s*ly,hy+s*k+c*ly,hx,hy];
}
