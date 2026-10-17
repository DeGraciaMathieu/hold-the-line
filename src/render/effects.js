import { sfx } from './audio.js';
import { reduced } from './dom.js';
import { stamp } from './ground.js';
import { G,levelOf } from '../state/game.js';
import { pick,rand,ri } from '../state/random.js';

/* =========================================================
   Données de jeu
   ========================================================= */
export const BLOOD={c:['#a01d1a','#c0281f','#7a1414'],d:['#5c1010','#6e1414','#4a0c0c']};
export const ACID={c:['#a9c23a','#d0dc58','#7f9a2a'],d:['#56671c','#6b7d22','#46551a']};

/* =========================================================
   Effets : particules, lumière, secousses
   ========================================================= */
export function shake(v){G.trauma=Math.min(1,G.trauma+v*(reduced?.3:1));}
export function P(o){if(G.parts.length>1700)G.parts.splice(0,150);o.max=o.max||o.life;o.z=o.z||0;G.parts.push(o);return o;}
export function addLight(x,y,r,a,life,col){if(G.lights.length<160)G.lights.push({x,y,r,a,life,max:life,col});}
export function floatTxt(x,y,text,col,sc=1,life=.7){G.floats.push({x,y,text,col,sc,life,max:life,vy:-34});}
export function pulse(el,cls){el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);}

export function blood(x,y,dx,dy,n,acid){
  const C=acid?ACID:BLOOD,a0=Math.atan2(dy,dx);
  for(let i=0;i<n;i++){const a=a0+rand(-.75,.75),s=rand(20,85),k=ri(0,2);
    P({type:acid?'goo':'blood',x,y,z:rand(5,10),vx:Math.cos(a)*s,vy:Math.sin(a)*s*.8,vz:rand(-10,55),life:2,col:C.c[k],dcol:C.d[k],s:Math.random()<.25?2:1});}
  for(let i=0;i<Math.ceil(n/2);i++){const t=rand(4,16);stamp(x+dx*t+rand(-2,2),y+dy*t*.8+rand(-2,2),C.d[ri(0,2)]);}
}
export function dust(x,y,n,col){col=col||(levelOf().snow?'#dfe6ee':'#5a4c3a');for(let i=0;i<n;i++)P({type:'dust',x:x+rand(-2,2),y:y+rand(-1,1),z:rand(0,2),vx:rand(-14,14),vy:rand(-6,6),vz:rand(3,10),life:rand(.3,.6),size:rand(1,2),grow:3,col,alpha:.55});}
export function sparks(x,y,z,n,dx=0,dy=0,col='#ffd36a'){for(let i=0;i<n;i++){const a=Math.atan2(dy,dx)+rand(-1.2,1.2),s=rand(30,120);
  P({type:'spark',x,y,z,vx:Math.cos(a)*s+rand(-20,20),vy:Math.sin(a)*s*.8+rand(-20,20),vz:rand(0,60),life:rand(.12,.3),col});}}
export function chips(x,y,z,n,cols,dx=0,dy=0){for(let i=0;i<n;i++){const a=Math.atan2(dy,dx)+rand(-1.4,1.4),s=rand(20,70);
  P({type:'chip',x,y,z,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.8,vz:rand(30,80),life:2.5,col:pick(cols),dcol:pick(cols),s:Math.random()<.3?2:1});}}

export function boomFX(x,y,R,acid){
  G.freeze=Math.max(G.freeze,.07);shake(acid?.45:.85);G.flashScr=acid?.03:.06;
  addLight(x,y-6,acid?120:180,1,.35,acid?'acid':'fire');
  P({type:'boomflash',x,y,z:4,r:R*.55,life:.08,acid});
  P({type:'ring',x,y,z:0,R:R*1.25,life:.3,acid});
  for(let i=0;i<24;i++){const a=rand(0,6.283),s=rand(15,90);
    P({type:acid?'goo':'fire',x,y,z:rand(2,10),vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7,vz:rand(10,65),life:rand(.3,.75),col:pick(acid?ACID.c:BLOOD.c),dcol:pick(acid?ACID.d:['#1a1410','#241a12']),s:2});}
  for(let i=0;i<14;i++)P({type:'smoke',x:x+rand(-R*.3,R*.3),y:y+rand(-R*.2,R*.2),z:rand(4,14),vx:rand(-16,16),vy:rand(-10,10),vz:rand(8,22),life:rand(1,2),
    size:rand(2,4),grow:rand(2,5),col:acid?'#4e5a24':'#3a3633',alpha:.75});
  chips(x,y,2,12,acid?ACID.d:['#4a3c2c','#2c241b','#5a4834']);
  if(!acid)sparks(x,y,6,16);
  const r2=R*.5;
  for(let i=0;i<R*R*.7;i++){const a=rand(0,6.283),d=Math.sqrt(Math.random())*r2;
    stamp(x+Math.cos(a)*d,y+Math.sin(a)*d*.7,acid?pick(['#5b6a1c','#4a5716','#6e7f24']):pick(['#0f0c0a','#1a1410','#241a12']));}
  sfx(acid?'acid':'boom',x,y);
}
