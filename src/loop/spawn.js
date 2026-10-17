import { BOSSES,ZT } from '../config.js';
import { bossHp,zombieHp } from '../rules/progression.js';
import { edgePoint } from '../rules/wave.js';
import { damageBase,hitZombie,hurtPlayer } from './damage.js';
import { sfx } from '../render/audio.js';
import { P,blood,boomFX,shake } from '../render/effects.js';
import { banner } from '../render/hud.js';
import { BCFG,SPR,SPRB,ZCFG } from '../render/sprites.js';
import { G } from '../state/game.js';
import { pick,rand,ri,rng } from '../state/random.js';
import { clamp } from '../util.js';

export function explode(x,y,R,dmg,kind){
  const acid=kind==='acid';
  boomFX(x,y,R,acid);
  for(const z of G.zombies){if(z.dead)continue;const dx=z.x-x,dy=z.y-y,d=Math.hypot(dx,dy);
    if(d<R+z.t.r){const f=1-Math.min(1,d/(R+z.t.r))*.6;hitZombie(z,dmg*f,dx||rand(-1,1),dy||rand(-1,1),260*f,'boom');}}
  const p=G.player;if(!G.over){const d=Math.hypot(p.x-x,p.y-y);if(d<R*.75)hurtPlayer(Math.round((acid?14:22)*(1-d/(R*.75)*.5)),{x,y});}
  if(acid){const b=G.base,cx=clamp(x,b.x0,b.x1),cy=clamp(y,b.y0,b.y1);if(Math.hypot(x-cx,y-cy)<R*.8)damageBase(45,cx,cy);}
  for(const o of G.props)if(o.kind==='barrel'&&!o.dead&&o.hp>0){const d=Math.hypot(o.x-x,o.y-y);
    if(d<R+4){o.hp=0;G.timers.push({t:.07+d*.002,fn:()=>barrelBoom(o)});}}
}
export function barrelBoom(o){if(o.dead)return;o.dead=true;explode(o.x,o.y,50,170,'fire');}
export function goreBurst(x,y){
  blood(x,y,0,1,30);shake(.3);sfx('killBig',x,y);
  for(let i=0;i<8;i++){const a=rand(0,6.283),s=rand(30,100);P({type:'gib',x,y,z:rand(5,12),vx:Math.cos(a)*s,vy:Math.sin(a)*s*.8,vz:rand(50,120),life:3,col:pick(['#7f9e5c','#8a1c1a','#c0281f']),col2:'#c0281f',dcol:'#4a0c0c'});}
  P({type:'ring',x,y,z:0,R:30,life:.22,blood:true});
  for(const z of G.zombies){if(z.dead)continue;const dx=z.x-x,dy=z.y-y,d=Math.hypot(dx,dy);if(d<28+z.t.r)hitZombie(z,45,dx||1,dy,180,'gore');}
}

/* =========================================================
   Vagues, boss et refuges
   ========================================================= */
export function spawnZombieAt(type,x,y){
  const t=ZT[type],hp=zombieHp(t.hp,G.wave);
  const variant=ri(0,SPR[type].length-1);
  const z={type,t,x,y,vx:0,vy:0,kx:0,ky:0,hp,max:hp,flash:0,squash:0,stun:0,atk:rand(.3,1),atkAnim:0,
    anim:rng()*4,face:1,S:SPR[type][variant],cfg:ZCFG[type],speed:t.speed*rand(.85,1.15),groan:rand(1,6),dead:false,fr:0,tp:false};
  G.zombies.push(z);return z;
}
export function spawnZombie(type,side){const[x,y]=edgePoint(side,rng);spawnZombieAt(type,x+rand(-8,8),y+rand(-8,8));}
export function spawnBoss(id){
  const d=BOSSES[id],side=ri(0,3),[x,y]=edgePoint(side,rng);
  const hp=bossHp(d.hp,G.wave,G.endless);
  const z={type:'boss',boss:true,id,t:d,x,y,vx:0,vy:0,kx:0,ky:0,hp,max:hp,flash:0,squash:0,stun:0,atk:1,atkAnim:0,anim:0,face:1,
    S:SPRB[id],cfg:BCFG[id],speed:d.speed,groan:3,dead:false,fr:0,tp:false,state:'walk',stT:0,cd:{charge:3,stomp:2,summon:4,spit:2}};
  G.zombies.push(z);G.bossRef=z;G.ghostBoss=1;
  banner(d.name,'Il arrive par '+['le nord','l’est','le sud','l’ouest'][side],'danger','Boss');
  sfx('roar');sfx('horn');shake(.6);G.slowT=.5;
}
