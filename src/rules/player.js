/* Mouvement du joueur : vitesse selon arme, rechargement et atout Jambes de
   coureur, inertie, recul, collisions et bornes du monde. Pure. */
import { WW,WH,PLAYER_SPEED,PLAYER_ACCEL,PLAYER_KNOCK_DECAY,PERK_SPEED_BONUS,PLAYER_RELOAD_SPEED_FACTOR,MINIGUN_SPIN_SLOW,WORLD_MARGIN_X,WORLD_MARGIN_Y_TOP,WORLD_MARGIN_Y_BOT } from '../config.js';
import { pushOutOfRect,pushOutOfProps } from './collision.js';

const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;

/* p : joueur courant ; {ix,iy} : direction demandée (-1, 0, 1 par axe).
   Retourne les nouveaux x, y, vx, vy, kx, ky et moving. */
export function movePlayer(p,{ix,iy},dt,{weapon,perks,base,props}){
  const il=Math.hypot(ix,iy)||1;ix/=il;iy/=il;
  const sp=PLAYER_SPEED*(1+PERK_SPEED_BONUS*(perks.speed||0))*(p.reload>0?PLAYER_RELOAD_SPEED_FACTOR:1)*(weapon.spin?1-MINIGUN_SPIN_SLOW*p.spin:1);
  const vx=lerp(p.vx,ix*sp,Math.min(1,dt*PLAYER_ACCEL)),vy=lerp(p.vy,iy*sp,Math.min(1,dt*PLAYER_ACCEL));
  const kx=p.kx*Math.exp(-dt*PLAYER_KNOCK_DECAY),ky=p.ky*Math.exp(-dt*PLAYER_KNOCK_DECAY);
  let pos={x:p.x+(vx+kx)*dt,y:p.y+(vy+ky)*dt};
  pos=pushOutOfProps(pos,p.r,props);pos=pushOutOfRect(pos,p.r,base);
  return{x:clamp(pos.x,WORLD_MARGIN_X,WW-WORLD_MARGIN_X),y:clamp(pos.y,WORLD_MARGIN_Y_TOP,WH-WORLD_MARGIN_Y_BOT),vx,vy,kx,ky,moving:ix!==0||iy!==0};
}
