import { GH,MELEE_DMG,MELEE_KNOCK,MELEE_RANGE,ORDER,WEAP } from '../config.js';
import { muzzlePos } from '../rules/weapons.js';
import { hitZombie } from './damage.js';
import { barrelBoom } from './spawn.js';
import { sfx } from '../render/audio.js';
import { reduced } from '../render/dom.js';
import { P,addLight,shake,sparks } from '../render/effects.js';
import { stamp } from '../render/ground.js';
import { CX,CY,G,MAG,PK,RLD,mouse } from '../state/game.js';
import { pick,rand,rng } from '../state/random.js';

/* =========================================================
   Joueur et armes
   ========================================================= */
export function ejectCasing(kind,hx,hy,ang,face){
  const c=Math.cos(ang),s=Math.sin(ang),pxp=-s*face,pyp=c*face,big=kind==='shell';
  P({type:big?'shell':'casing',x:hx,y:hy+GH,z:GH,vx:-c*rand(10,30)+pxp*-rand(20,45),vy:-s*rand(10,30)+pyp*-rand(20,45)*.6,vz:rand(55,90),life:3,
    col:'#e2b24a',dcol:big?'#7a2620':'#9a7a32',spin:0,vs:rand(18,32)});
}
export function fire(){
  const p=G.player,w=WEAP[p.w];
  p.mag[p.w]--;p.cd=w.rate;
  const[fx,fy,hx,hy]=muzzlePos(p,w);
  if(w.flame){
    for(let i=0;i<2;i++){const a=p.ang+rand(-1,1)*w.spread,sp=w.speed*rand(.85,1.15),life=w.range/w.speed*rand(.8,1.1);
      G.flames.push({x:fx,y:fy+GH,z:GH,vx:Math.cos(a)*sp+p.vx*.5,vy:Math.sin(a)*sp+p.vy*.5,life,max:life,hit:[]});}
    addLight(fx+Math.cos(p.ang)*30,fy+Math.sin(p.ang)*30,90,.8,.06,'fire');
    p.kick=w.kick;G.ckx-=Math.cos(p.ang)*w.camKick;G.cky-=Math.sin(p.ang)*w.camKick;shake(w.shake);
    sfx('flame');G.fx.shot=true;
    if(p.mag[p.w]===0&&p.res[p.w]>0)G.timers.push({t:.2,fn:()=>{if(G.player.w==='flamer'&&G.player.mag.flamer===0)startReload();}});
    return;
  }
  const spread=w.spread+p.bloom+(p.moving?w.spread*.5+.015:0);
  if(w.grenade){
    const mwx=mouse.sx+CX,mwy=mouse.sy+CY+GH,dx=mwx-p.x,dy=mwy-p.y,d=Math.max(24,Math.min(w.range,Math.hypot(dx,dy))),a=Math.atan2(dy,dx)+rand(-1,1)*spread;
    G.grenades.push({sx:fx,sy:fy+GH,tx:p.x+Math.cos(a)*d,ty:p.y+Math.sin(a)*d,t:0,T:d/w.speed,peak:14+d*.1,x:fx,y:fy+GH,z:GH});
    G.shots++;
  }else{
    for(let i=0;i<w.pellets;i++){const a=p.ang+rand(-1,1)*spread,sp=w.speed*rand(.93,1.06);
      G.bullets.push({x:fx,y:fy+GH,z:GH,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:w.range/w.speed*rand(.85,1.1),dmg:w.dmg,pierce:(w.pierce||1)+PK('pierce'),knock:w.knock,src:p.w});}
    G.shots+=w.pellets;
  }
  const c=Math.cos(p.ang),s=Math.sin(p.ang);
  p.bloom=Math.min(w.maxBloom||.3,p.bloom+(w.bloom||0));
  p.kick=w.kick;p.kx-=c*(w.push||0);p.ky-=s*(w.push||0);
  G.ckx-=c*w.camKick*(reduced?.3:1);G.cky-=s*w.camKick*(reduced?.3:1);
  shake(w.shake);
  P({type:'flash',x:fx,y:fy,z:0,a:p.ang,L:w.flashL,life:.05,big:w.flashL>7});
  addLight(fx,fy,w.flashL>7?110:76,1,.07,'fire');
  for(let i=0;i<(w.pellets>1?5:2);i++)P({type:'smoke',x:fx+c*2,y:fy+GH,z:GH,vx:c*rand(8,30)+rand(-6,6),vy:s*rand(8,30)+rand(-6,6),vz:rand(4,12),life:rand(.35,.7),size:1,grow:rand(3,6),col:'#8a8679',alpha:.45});
  sparks(fx,fy+GH,GH,w.pellets>1?6:2,c,s,'#ffe08a');
  if(w.casing&&!w.delayEject)ejectCasing(w.casing,hx,hy,p.ang,p.face);
  if(w.delayEject){const id=p.w;G.timers.push({t:w.delayEject,fn:()=>{if(G.player.w!==id)return;sfx(w.ejectSnd);ejectCasing(w.casing,G.player.x+G.player.face*2,G.player.y-GH,G.player.ang,G.player.face);}});}
  sfx(w.snd);
  G.fx.shot=true;
  if(p.mag[p.w]===0&&p.res[p.w]>0){const id=p.w;G.timers.push({t:.2,fn:()=>{if(G.player.w===id&&G.player.mag[id]===0)startReload();}});}
}
export function startReload(){
  const p=G.player,w=WEAP[p.w];
  if(p.reload>0||G.over||p.charging>0||p.mag[p.w]>=MAG(p.w)||p.res[p.w]<=0)return;
  p.reload=RLD(w);p.reloadMax=p.reload;p.rlIn=false;
  sfx('magOut');
  if(w.dump){for(let i=0;i<MAG(p.w)-p.mag[p.w];i++)P({type:'casing',x:p.x+p.face*2+rand(-1,1),y:p.y,z:GH,vx:rand(-15,15),vy:rand(-8,8),vz:rand(10,40),life:3,col:'#e2b24a',dcol:'#9a7a32',spin:0,vs:rand(10,30)});}
  else if(!w.perShell)P({type:'mag',x:p.x+p.face*3,y:p.y,z:GH-2,vx:p.face*rand(5,15),vy:rand(-5,5),vz:rand(10,30),life:3,col:'#2a2d33',dcol:'#1d1f24'});
}
export function finishReload(){
  const p=G.player,w=WEAP[p.w];
  if(w.perShell){p.mag[p.w]++;p.res[p.w]--;sfx('shellIn');
    if(p.mag[p.w]<MAG(p.w)&&p.res[p.w]>0){p.reload=RLD(w);p.reloadMax=p.reload;}else sfx('pump');}
  else{const take=Math.min(MAG(p.w)-p.mag[p.w],p.res[p.w]);p.mag[p.w]+=take;p.res[p.w]-=take;sfx('rack');}
}
export function switchWeapon(id){
  const p=G.player;if(!id||!p.owned[id]||p.w===id||G.over)return;
  p.w=id;p.reload=0;p.spin=0;p.charging=0;p.swap=.26;p.cd=Math.max(p.cd,.08);p.bloom=0;sfx('swap');
}
export function cycleWeapon(dir){
  const p=G.player,own=ORDER.filter(id=>p.owned[id]);if(own.length<2)return;
  const i=own.indexOf(p.w);switchWeapon(own[(i+dir+own.length)%own.length]);
}
export function fireRail(){
  const p=G.player,w=WEAP.railgun;if(p.w!=='railgun'||p.mag.railgun<=0||G.over)return;
  p.mag.railgun--;p.cd=w.rate;G.shots++;
  const[fx,fy]=muzzlePos(p,w),c=Math.cos(p.ang),s=Math.sin(p.ang),gx=fx,gy=fy+GH,L=w.range;
  let any=false;
  for(const z of G.zombies){if(z.dead)continue;const px=z.x-gx,py=z.y-gy,t=px*c+py*s;if(t<0||t>L)continue;
    if(Math.abs(-px*s+py*c)<z.t.r+3){hitZombie(z,w.dmg,c,s,w.knock,'railgun');z.stun=.7;any=true;}}
  if(any)G.hits++;
  for(const o of G.props)if(o.kind==='barrel'&&!o.dead&&o.hp>0){const px=o.x-gx,py=o.y-gy,t=px*c+py*s;
    if(t>0&&t<L&&Math.abs(-px*s+py*c)<6){o.hp=0;G.timers.push({t:.05+t*.0006,fn:()=>barrelBoom(o)});}}
  P({type:'rail',x:fx,y:fy,x2:fx+c*L,y2:fy+s*L,z:0,life:.45});
  for(let i=0;i<=6;i++)addLight(fx+c*L*i/6,fy+s*L*i/6,80,.9,.3,'rail');
  for(let i=0;i<26;i++){const t=rand(0,L);P({type:'spark',x:gx+c*t,y:gy+s*t,z:GH,vx:rand(-50,50),vy:rand(-40,40),vz:rand(10,60),life:rand(.15,.4),col:pick(['#5fe0ff','#e8fdff','#2ab0e0'])});}
  for(let t=8;t<L;t+=2)if(rng()<.5)stamp(gx+c*t+rand(-1,1),gy+s*t+rand(-1,1),pick(['#1d3440','#24485a','#16242c']));
  p.kick=w.kick;p.kx-=c*w.push;p.ky-=s*w.push;G.ckx-=c*w.camKick*(reduced?.3:1);G.cky-=s*w.camKick*(reduced?.3:1);
  shake(w.shake);G.freeze=Math.max(G.freeze,.08);G.flashScr=.035;
  P({type:'flash',x:fx,y:fy,z:0,a:p.ang,L:10,life:.06,big:true});
  sfx('rail');G.fx.shot=true;
  if(p.mag.railgun===0&&p.res.railgun>0)G.timers.push({t:.3,fn:()=>{if(G.player.w==='railgun'&&G.player.mag.railgun===0)startReload();}});
}
export function melee(){
  const p=G.player;if(p.melee>0||G.over||p.swap>0||p.dead)return;
  p.melee=.5;p.meleeAnim=.18;sfx('whoosh');
  const c=Math.cos(p.ang),s=Math.sin(p.ang);let hit=false;
  for(let i=-3;i<=3;i++){const a=p.ang+i*.22;P({type:'slash',x:p.x+Math.cos(a)*14,y:p.y-GH+Math.sin(a)*12,z:0,life:.1+Math.abs(i)*.008});}
  for(const z of G.zombies){if(z.dead)continue;const dx=z.x-p.x,dy=z.y-p.y,d=Math.hypot(dx,dy);
    if(d<MELEE_RANGE+z.t.r&&(dx*c+dy*s)/(d||1)>.3){hitZombie(z,MELEE_DMG,dx,dy,MELEE_KNOCK,'melee');z.stun=Math.max(z.stun,z.boss?.2:.6);hit=true;}}
  if(hit){G.freeze=Math.max(G.freeze,.06);shake(.3);sfx('thump',p.x,p.y);}
}
