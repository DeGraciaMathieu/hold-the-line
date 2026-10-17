import { COMBO_TIME,GH,H,PERK_GORE_CHANCE,PYRO_BURN_TIME,TURRET_POS,W,WEAP } from '../config.js';
import { pushOutOfProps,pushOutOfRect } from '../rules/collision.js';
import { baseTakesHit,coinDrop,leechHeal,playerTakesHit,resolveHit } from '../rules/combat.js';
import { isWaveCleared } from '../rules/wave.js';
import { gameOver,waveCleared } from './flow.js';
import { explode,goreBurst } from './spawn.js';
import { sfx } from '../render/audio.js';
import { BLOOD,P,blood,chips,dust,floatTxt,shake,sparks } from '../render/effects.js';
import { gctx,stamp } from '../render/ground.js';
import { CX,CY,G,PK } from '../state/game.js';
import { pick,rand,rng } from '../state/random.js';

/* =========================================================
   Dégâts
   ========================================================= */
export function hitZombie(z,dmg,dx,dy,knock,src){
  if(z.dead)return;
  const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  const hit=resolveHit({dmg,src,target:z.t,perks:G.perks},rng),{fl,own,crit,armored}=hit;dmg=hit.dmg;
  z.hp-=dmg;z.flash=fl?.03:.07;z.squash=fl?.04:(z.boss?.05:.1);z.stun=Math.max(z.stun,z.boss?.03:.1);
  const kb=knock/z.t.mass;z.kx+=dx*kb;z.ky+=dy*kb;
  if(armored&&!fl){sparks(z.x,z.y,GH,3,-dx,-dy,'#e8eef4');sfx('clang',z.x,z.y);}
  blood(z.x,z.y,dx,dy,fl?1:(armored?2:4+Math.min(10,dmg/6)|0),z.type==='bloater'||(z.boss&&z.t.acid));
  if(!fl||rng()<.12)floatTxt(z.x+rand(-3,3),z.y-z.S.H+2,String(dmg),crit?'#ffe36a':fl?'#ff9a3a':armored?'#9aa4b4':'#f4efe0',crit?2:1);
  if(own){G.hitMark=.09;if(!fl){sfx('hit',z.x,z.y);sfx('marker');}if(crit)sfx('crit');
    if(hit.burn)z.burn=Math.max(z.burn||0,PYRO_BURN_TIME);}
  if(z.boss)G.fx.bossHit=true;
  if(WEAP[src]&&WEAP[src].hitstop)G.freeze=Math.max(G.freeze,WEAP[src].hitstop);
  if(z.hp<=0)killZombie(z,dx,dy,src);
}
export function killZombie(z,dx,dy,src){
  z.dead=true;
  const huge=!!z.boss,big=huge||z.type==='brute',S=z.S,cfg=z.cfg,acid=z.type==='bloater'||(huge&&z.t.acid),own=!!WEAP[src]||src==='melee';
  G.freeze=Math.max(G.freeze,huge?.25:big?.1:.04);shake(huge?1:big?.5:.14);
  if(!acid){
    for(let i=0;i<(huge?90:big?40:22);i++){const a=rand(0,6.283),d=Math.sqrt(rng())*(huge?14:big?8:5);stamp(z.x+Math.cos(a)*d,z.y+Math.sin(a)*d*.6,pick(BLOOD.d));}
    gctx.save();gctx.translate(Math.round(z.x),Math.round(z.y-2));gctx.rotate((dx>=0?1:-1)*Math.PI/2*rand(.8,1.15));
    gctx.globalAlpha=.92;gctx.drawImage(src==='fire'||src==='flamer'?S.char:S.dark,-S.ax,-S.H+2);gctx.restore();
  }
  const a0=Math.atan2(dy,dx);
  for(let i=0;i<(huge?30:big?11:5);i++){const a=a0+rand(-1.2,1.2),s=rand(25,huge?130:95);
    P({type:'gib',x:z.x,y:z.y,z:rand(5,12),vx:Math.cos(a)*s,vy:Math.sin(a)*s*.8,vz:rand(40,huge?150:110),life:3,col:pick([cfg.skin,cfg.skinD,'#8a1c1a',cfg.shirts[0]]),col2:'#c0281f',dcol:'#4a0c0c'});}
  blood(z.x,z.y,dx,dy,huge?50:big?28:16,acid);
  const{n,v}=coinDrop(z.t.reward,G.combo,huge);
  for(let i=0;i<n;i++)G.coins.push({x:z.x,y:z.y,z:8,vx:rand(-40,40)*(huge?2:1),vy:rand(-30,30)*(huge?2:1),vz:rand(60,huge?160:105),v,t:0,seed:rng()*4,mag:false,clink:false});
  G.combo++;G.comboT=COMBO_TIME+(huge?2:0);G.fx.combo=true;G.kills++;G.waveKills++;
  if(own){G.hitMark=.13;G.killMark=.13;
    if(PK('leech')){const p=G.player,heal=leechHeal(p,G.perks);if(heal){p.hp=heal.hp;floatTxt(p.x+rand(-3,3),p.y-24,'+'+heal.h,'#7fe07a',1,.5);sfx('heal');}}
    if(PK('gore')&&!huge&&rng()<PERK_GORE_CHANCE*PK('gore'))G.timers.push({t:.05,fn:()=>goreBurst(z.x,z.y)});}
  sfx(big?'killBig':'kill',z.x,z.y);
  if(huge){
    sfx('roar',z.x,z.y,.7);G.slowT=1.6;G.ts=.15;G.flashScr=.06;
    for(let i=1;i<6;i++)G.timers.push({t:i*.12,fn:()=>{blood(z.x+rand(-10,10),z.y+rand(-6,6),rand(-1,1),rand(-1,1),20,acid);shake(.3);sfx('killBig',z.x,z.y,.6);}});
    if(acid)explode(z.x,z.y,62,120,'acid');
    G.bossRef=null;
  }
  if(z.type==='bloater')explode(z.x,z.y,40,80,'acid');
  checkWaveEnd();
}
export function checkWaveEnd(){if(isWaveCleared(G))waveCleared();}
export function hurtPlayer(n,src){
  const p=G.player,hit=playerTakesHit(p,n,src,G.over);if(!hit)return;
  const{nx,ny}=hit;p.hp=hit.hp;p.inv=hit.inv;p.kx=hit.kx;p.ky=hit.ky;G.freeze=Math.max(G.freeze,.06);shake(.5);G.hurtV=1;G.fx.lifeHit=true;
  blood(p.x,p.y,nx,ny,9);sfx('hurt');
  floatTxt(p.x,p.y-20,'-'+n,'#ff5a48',1);
  if(hit.down)gameOver('player');
}
export function damageBase(n,x,y){
  const b=G.base,hit=baseTakesHit(b,n,G.over);if(!hit)return;
  b.hp=hit.hp;b.flash=.1;b.shake=.18;b.alert=1.4;G.fx.baseHit=true;
  chips(x,y,rand(4,14),5,['#6b4a31','#5e412b','#8c7c55','#3f2b1d'],x-b.x,y-b.y);
  dust(x,y,3,'#6a5a46');
  sfx('baseHit',x,y);sfx('wood',x,y);
  if(x>CX&&x<CX+W&&y>CY&&y<CY+H)shake(.1);
  floatTxt(x,y-b.h-4,'-'+n,'#ff8a3a',1);
  if(hit.down)gameOver('base');
}
export function addTurret(){
  const b=G.base,i=G.turrets.length;if(i>=TURRET_POS.length)return;
  G.turrets.push({x:b.x+TURRET_POS[i][0],y:b.y0+TURRET_POS[i][1],ang:Math.PI/2,cd:0,flash:0});
}

/* =========================================================
   Collisions
   ========================================================= */
export function pushRect(e,r){const n=pushOutOfRect(e,r,G.base);e.x=n.x;e.y=n.y;return n.hit;}
export function pushProps(e,r){const n=pushOutOfProps(e,r,G.props);e.x=n.x;e.y=n.y;}
