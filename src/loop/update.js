import { BX,GH,HEARTBEAT_INTERVAL,PLAYER_LOW_HP,TURRET_RANGE,WEAP,WH,WW,BOSS_AGGRO_MIXED,BOSS_AGGRO_BASE,SHOCKWAVE_RADIUS,SHOCKWAVE_DMG,SHOCKWAVE_KNOCK } from '../config.js';
import { coinValue,pickupRadius } from '../rules/coins.js';
import { movePlayer } from '../rules/player.js';
import { turretRate } from '../rules/turrets.js';
import { muzzlePos } from '../rules/weapons.js';
import { damageBase,hitZombie,hurtPlayer,killZombie,pushProps,pushRect } from './damage.js';
import { barrelBoom,explode,spawnBoss,spawnZombie,spawnZombieAt } from './spawn.js';
import { finishReload,fire,fireRail,startReload } from './weapons.js';
import { AU,sfx } from '../render/audio.js';
import { ACID,P,addLight,blood,chips,dust,floatTxt,shake,sparks } from '../render/effects.js';
import { gctx,stamp } from '../render/ground.js';
import { CX,CY,G,K,PK,levelOf,mouse,paused } from '../state/game.js';
import { pick,rand,ri,rng } from '../state/random.js';
import { clamp,lerp } from '../util.js';

/* =========================================================
   Mise à jour
   ========================================================= */
export function update(dtR){
  if(G.slowT>0){G.slowT-=dtR;G.ts=lerp(G.ts,.22,.3);}else G.ts=lerp(G.ts,1,Math.min(1,dtR*4));
  G.trauma=Math.max(0,G.trauma-dtR*1.6);
  G.hurtV=Math.max(0,G.hurtV-dtR*2.2);
  G.flashScr=Math.max(0,G.flashScr-dtR);
  if(G.freeze>0){G.freeze-=dtR;return;}
  const dt=dtR*G.ts;G.time+=dt;

  for(let i=G.timers.length-1;i>=0;i--){const t=G.timers[i];t.t-=dt;if(t.t<=0){G.timers.splice(i,1);t.fn();}}

  if(G.waveActive&&G.queue.length){G.spawnT-=dt;if(G.spawnT<=0){
    const gsz=Math.min(G.queue.length,rng()<.3?ri(2,4):1),side=ri(0,3);
    for(let i=0;i<gsz;i++)spawnZombie(G.queue.shift(),side);
    G.spawnT=G.spawnGap*(gsz>1?1.8:1)*rand(.7,1.3);}}
  if(G.waveActive&&G.bossPending){G.bossT-=dt;if(G.bossT<=0){spawnBoss(G.bossPending);G.bossPending=null;}}

  updatePlayer(dt);
  updateZombies(dt);
  updateBullets(dt);
  updateFlames(dt);
  updateGrenades(dt);
  updateGlobs(dt);
  updateTurrets(dt);
  updateBase(dt);
  updateParts(dt);
  updateCoins(dt);
  for(const f of G.floats){f.life-=dt;f.y+=f.vy*dt;f.vy*=Math.exp(-dt*4);}
  G.floats=G.floats.filter(f=>f.life>0);
  for(const l of G.lights)l.life-=dt;
  G.lights=G.lights.filter(l=>l.life>0);
  for(const o of G.props)if(o.flash>0)o.flash-=dt;
  G.comboT-=dt;if(G.comboT<=0)G.combo=0;
  G.coinStreakT-=dt;if(G.coinStreakT<=0)AU.streak=0;
}

export function updatePlayer(dt){
  const p=G.player,w=WEAP[p.w];
  if(p.dead)return;
  let ix=0,iy=0;
  if(!G.over){ix=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0);iy=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0);}
  Object.assign(p,movePlayer(p,{ix,iy},dt,{weapon:w,perks:G.perks,base:G.base,props:G.props}));
  if(p.moving){p.anim+=dt*9;p.stepT-=dt;if(p.stepT<=0){p.stepT=.27;dust(p.x-p.face*2,p.y,2);sfx('step');}}else p.anim=0;

  const mwx=mouse.sx+CX,mwy=mouse.sy+CY;
  if(!G.over){p.ang=Math.atan2(mwy-(p.y-GH),mwx-p.x);p.face=Math.cos(p.ang)>=0?1:-1;}
  p.cd-=dt;p.kick=lerp(p.kick,0,Math.min(1,dt*18));p.bloom=Math.max(0,p.bloom-dt*(w.recover||.6));
  p.inv-=dt;p.swap-=dt;p.melee-=dt;p.meleeAnim-=dt;G.dry-=dt;
  if(p.reload>0){
    p.reload-=dt;
    if(!w.perShell&&!p.rlIn&&p.reload<p.reloadMax*.35){p.rlIn=true;sfx('magIn');}
    if(p.reload<=0){p.reload=0;finishReload();}
  }
  if(w.spin){
    const want=mouse.down&&!G.over&&!paused&&p.mag[p.w]>0&&p.reload<=0&&p.swap<=0;
    p.spin=want?Math.min(1,p.spin+dt/w.spin):Math.max(0,p.spin-dt/.7);
    if(p.spin>0){p.spinT=(p.spinT||0)-dt;if(p.spinT<=0){p.spinT=.07;sfx('spin');}}
  }
  if(p.charging>0){
    p.charging-=dt;const[mx2,my2]=muzzlePos(p,w);
    for(let i=0;i<2;i++){const a=rand(0,6.283),r=rand(8,14);
      P({type:'spark',x:mx2+Math.cos(a)*r,y:my2+GH+Math.sin(a)*r,z:GH,vx:-Math.cos(a)*r*8,vy:-Math.sin(a)*r*8,vz:0,life:.12,col:'#7fe8ff'});}
    addLight(mx2,my2,40+(1-p.charging/w.charge)*50,.8,.04,'rail');
    if(p.charging<=0){p.charging=0;fireRail();}
  }
  if(mouse.down&&!G.over&&!paused){
    if(p.swap<=0&&p.meleeAnim<=0&&p.cd<=0&&!(p.charging>0)&&(!w.spin||p.spin>=1)&&(w.auto||!mouse.latched)){
      if(p.mag[p.w]>0){
        if(p.reload>0&&w.perShell)p.reload=0;
        if(p.reload<=0){
          if(w.charge){p.charging=w.charge;p.cd=w.charge+.05;sfx('charge');}else fire();
          mouse.latched=true;}
      }else{
        if(!mouse.latched){sfx('empty');G.dry=.3;mouse.latched=true;p.cd=.15;}
        if(p.reload<=0)startReload();
      }
    }
  }else mouse.latched=false;
  if(p.hp<PLAYER_LOW_HP&&!G.over){G.heartT-=dt;if(G.heartT<=0){G.heartT=HEARTBEAT_INTERVAL;sfx('heart');}}
}

export function spit(z,tx,ty,dmg,baseDmg){
  const d=Math.hypot(tx-z.x,ty-z.y);
  G.globs.push({sx:z.x,sy:z.y,tx:tx+rand(-5,5),ty:ty+rand(-5,5),t:0,T:Math.max(.35,d/150),peak:14+d*.12,x:z.x,y:z.y,z:10,dmg,baseDmg});
  for(let i=0;i<4;i++)P({type:'goo',x:z.x+z.face*3,y:z.y,z:12,vx:z.face*rand(10,30),vy:rand(-10,10),vz:rand(10,30),life:1,col:pick(ACID.c),dcol:pick(ACID.d),s:1});
  sfx('spit',z.x,z.y);
}
export function bossAI(z,dt,dp,dpx,dpy,pAlive){
  const t=z.t,b=G.base,p=G.player;
  for(const k in z.cd)z.cd[k]-=dt;
  z.stT-=dt;
  const wantP=pAlive&&(t.target==='player'||(t.target==='mixed'&&dp<BOSS_AGGRO_MIXED)||(t.target==='base'&&dp<BOSS_AGGRO_BASE));
  z.tp=wantP;
  if(z.state==='tele'){z.vx*=.85;z.vy*=.85;if(Math.floor(z.stT*12)%2)z.flash=.04;if(rng()<.5)dust(z.x,z.y,1);
    if(z.stT<=0){z.state='charge';z.stT=.75;z.chit=false;sfx('roar',z.x,z.y,.8);}return true;}
  if(z.state==='charge'){
    z.vx=z.cdx*180;z.vy=z.cdy*180;z.face=z.cdx>=0?1:-1;
    z.stepT=(z.stepT||0)-dt;if(z.stepT<=0){z.stepT=.12;dust(z.x,z.y,3);shake(.06);sfx('stomp',z.x,z.y,.35);}
    if(pAlive&&!z.chit&&dp<t.r+p.r+4){z.chit=true;hurtPlayer(Math.round(t.dmg*1.3),z);p.kx+=z.cdx*240;p.ky+=z.cdy*240;}
    for(const o of G.zombies){if(o===z||o.dead)continue;const dx=o.x-z.x,dy=o.y-z.y,d=Math.hypot(dx,dy);
      if(d<t.r+o.t.r+2){const side=(dx*-z.cdy+dy*z.cdx)>=0?1:-1;o.kx+=-z.cdy*side*220;o.ky+=z.cdx*side*220;o.stun=.5;}}
    if(z.stT<=0)z.state='walk';return true;}
  if(z.state==='stomp'){z.vx=0;z.vy=0;if(z.stT<=0){shockwave(z);z.state='walk';}return true;}
  const A=t.abil;
  if(pAlive&&A.includes('charge')&&z.cd.charge<=0&&dp>40&&dp<230){z.state='tele';z.stT=.85;z.cd.charge=rand(5,7.5);z.cdx=dpx/dp;z.cdy=dpy/dp;z.face=z.cdx>=0?1:-1;sfx('growl',z.x,z.y);shake(.15);return true;}
  if(pAlive&&A.includes('stomp')&&z.cd.stomp<=0&&dp<52){z.state='stomp';z.stT=.6;z.cd.stomp=rand(3.5,5);sfx('growl',z.x,z.y);return true;}
  if(A.includes('summon')&&z.cd.summon<=0){z.cd.summon=rand(6.5,8.5);summon(z);}
  if(A.includes('spit')&&z.cd.spit<=0){z.cd.spit=rand(2.6,3.4);let tx,ty;if(pAlive&&dp<170){tx=p.x;ty=p.y;}else{tx=clamp(z.x,b.x0,b.x1);ty=clamp(z.y,b.y0,b.y1);}
    for(let k=-1;k<=1;k++)spit(z,tx+k*16,ty+k*7,12,10);z.atkAnim=.4;}
  let tx,ty;if(wantP){tx=p.x;ty=p.y;}else{tx=clamp(z.x,b.x0,b.x1);ty=clamp(z.y,b.y0,b.y1);}
  const dx=tx-z.x,dy=ty-z.y,d=Math.hypot(dx,dy)||1,want=wantP?(d>t.r+p.r?1:0):(d>t.r+.5?1:0);
  const spd=z.speed*(z.stun>0?.5:1)*(z.atkAnim>0?.4:1),k=Math.min(1,dt*4);
  z.vx=lerp(z.vx,dx/d*spd*want,k);z.vy=lerp(z.vy,dy/d*spd*want,k);
  z.stepT=(z.stepT||0)-dt;if(want&&z.stepT<=0){z.stepT=.5;sfx('stomp',z.x,z.y,.22);shake(.03);}
  return false;
}
export function bossHitWall(z){
  if(z.state!=='charge')return;const b=G.base;z.state='walk';
  damageBase(z.t.baseDmg,clamp(z.x,b.x0,b.x1),clamp(z.y,b.y0,b.y1));shake(.7);G.freeze=Math.max(G.freeze,.08);
  z.stun=.8;z.kx=-z.cdx*80;z.ky=-z.cdy*80;
}
export function shockwave(z){
  P({type:'ring',x:z.x,y:z.y,z:0,R:64,life:.32});P({type:'ring',x:z.x,y:z.y,z:0,R:40,life:.22});
  dust(z.x,z.y,18);chips(z.x,z.y,2,10,levelOf().snow?['#dfe6ee','#a8b4c4']:['#4a3c2c','#5a4834','#2c241b']);
  shake(.6);G.freeze=Math.max(G.freeze,.05);sfx('stomp',z.x,z.y);
  const p=G.player,dx=p.x-z.x,dy=p.y-z.y,d=Math.hypot(dx,dy)||1;
  if(!p.dead&&d<SHOCKWAVE_RADIUS){hurtPlayer(SHOCKWAVE_DMG,z);p.kx+=dx/d*SHOCKWAVE_KNOCK;p.ky+=dy/d*SHOCKWAVE_KNOCK;}
  for(const o of G.zombies){if(o===z||o.dead)continue;const ox=o.x-z.x,oy=o.y-z.y,od=Math.hypot(ox,oy)||1;if(od<50){o.kx+=ox/od*160;o.ky+=oy/od*160;o.stun=.4;}}
}
export function summon(z){
  for(let i=0;i<3;i++){const a=rand(0,6.283);const n=spawnZombieAt(pick(['runner','walker','runner']),z.x+Math.cos(a)*16,z.y+Math.sin(a)*12);n.stun=.4;}
  blood(z.x,z.y,0,1,14,true);sfx('roar',z.x,z.y,.6);z.atkAnim=.5;
}

export function updateZombies(dt){
  const p=G.player,b=G.base,zs=G.zombies,pAlive=!p.dead&&!G.over;
  for(const z of zs){
    if(z.dead)continue;
    const t=z.t;
    z.flash-=dt;z.squash-=dt;z.stun-=dt;z.atk-=dt;z.atkAnim-=dt;
    if(z.burn>0){
      z.burn-=dt;z.burnT=(z.burnT||0)-dt;const zh=z.S.H;
      if(rng()<.6)P({type:'fire',x:z.x+rand(-3,3),y:z.y+rand(-1,1),z:rand(3,zh*.7),vx:rand(-6,6),vy:rand(-3,3),vz:rand(12,28),life:rand(.25,.5),s:rng()<.5?2:1});
      if(rng()<.3)addLight(z.x,z.y-8,44,.6,.06,'fire');
      if(z.burnT<=0){z.burnT=.3;z.hp-=5;if(rng()<.5)floatTxt(z.x,z.y-zh,'5','#ff9a3a');if(z.hp<=0){killZombie(z,0,1,'fire');continue;}}
    }
    const dpx=p.x-z.x,dpy=p.y-z.y,dp=Math.hypot(dpx,dpy)||1;
    let busy=false;
    if(z.boss)busy=bossAI(z,dt,dp,dpx,dpy,pAlive);
    else{
      let tx,ty,tp=false;
      if(t.ranged){if(pAlive&&dp<170){tx=p.x;ty=p.y;tp=true;}else{tx=clamp(z.x,b.x0,b.x1);ty=clamp(z.y,b.y0,b.y1);}}
      else if(pAlive&&dp<t.aggro){tx=p.x;ty=p.y;tp=true;}else{tx=clamp(z.x,b.x0,b.x1);ty=clamp(z.y,b.y0,b.y1);}
      const dx=tx-z.x,dy=ty-z.y,d=Math.hypot(dx,dy)||1;
      let want=tp?(d>t.r+p.r?1:0):(d>t.r+.5?1:0);
      if(t.ranged&&d<t.ranged.range){
        want=d<t.ranged.range*.45?-.6:0;
        if(z.spitT>0){z.spitT-=dt;if(z.spitT<=0)spit(z,tx,ty,t.ranged.dmg,t.ranged.baseDmg);}
        else if(z.atk<=0){z.spitT=.45;z.atk=t.atk;z.atkAnim=.45;}
      }
      const spd=z.speed*(z.stun>0?.25:1)*(z.atkAnim>0?.3:1),k=Math.min(1,dt*5);
      z.vx=lerp(z.vx,dx/d*spd*want,k);z.vy=lerp(z.vy,dy/d*spd*want,k);
      z.tp=tp;z.dirx=dx;
    }
    z.kx*=Math.exp(-dt*7);z.ky*=Math.exp(-dt*7);
    z.x+=(z.vx+z.kx)*dt;z.y+=(z.vy+z.ky)*dt;
    z.x=clamp(z.x,-30,WW+30);z.y=clamp(z.y,-30,WH+30);
    if(!(z.boss&&z.state!=='walk')){if(Math.abs(z.vx)>2)z.face=z.vx>0?1:-1;else z.face=(z.tp?dpx:(BX-z.x))>0?1:-1;}
    z.anim+=dt*Math.hypot(z.vx,z.vy)/6;
    pushProps(z,t.r);
    const touching=pushRect(z,t.r+.5);
    if(z.boss&&z.state==='charge'&&touching)bossHitWall(z);
    if(!busy){
      if(z.tp){if(dp<t.r+p.r+2&&z.atk<=0&&t.dmg>0){z.atk=t.atk;z.atkAnim=.22;hurtPlayer(t.dmg,z);}}
      else{
        const ddx=Math.max(b.x0-z.x,0,z.x-b.x1),ddy=Math.max(b.y0-z.y,0,z.y-b.y1);
        if(touching||Math.hypot(ddx,ddy)<t.r+1.5){
          if(z.type==='bloater'){killZombie(z,0,1,'base');continue;}
          if(z.atk<=0&&t.baseDmg>0){z.atk=t.atk;z.atkAnim=.25;damageBase(t.baseDmg,clamp(z.x,b.x0,b.x1),clamp(z.y,b.y0,b.y1));}
        }
      }
    }
    z.groan-=dt;if(z.groan<=0){z.groan=rand(3,9);sfx(z.boss?'growl':'groan',z.x,z.y,.9);}
  }
  for(let i=0;i<zs.length;i++){const a=zs[i];if(a.dead)continue;
    for(let j=i+1;j<zs.length;j++){const c=zs[j];if(c.dead)continue;
      const dx=c.x-a.x,dy=c.y-a.y,rr=a.t.r+c.t.r,d2=dx*dx+dy*dy;
      if(d2<rr*rr&&d2>1e-4){const d=Math.sqrt(d2),push=(rr-d),ma=a.t.mass,mc=c.t.mass,nx=dx/d,ny=dy/d;
        if(a.burn>0&&!(c.burn>0)&&rng()<.04)c.burn=1.6;else if(c.burn>0&&!(a.burn>0)&&rng()<.04)a.burn=1.6;
        a.x-=nx*push*mc/(ma+mc);a.y-=ny*push*mc/(ma+mc);c.x+=nx*push*ma/(ma+mc);c.y+=ny*push*ma/(ma+mc);}}
    if(!p.dead){const dx=p.x-a.x,dy=p.y-a.y,rr=a.t.r+p.r,d2=dx*dx+dy*dy;
      if(d2<rr*rr&&d2>1e-4){const d=Math.sqrt(d2),push=rr-d;p.x+=dx/d*push*.35;p.y+=dy/d*push*.35;a.x-=dx/d*push*.65;a.y-=dy/d*push*.65;}}
  }
  G.zombies=zs.filter(z=>!z.dead);
}

export function bulletHitsProp(bl){
  for(const o of G.props){
    if(o.dead||!o.hit||Math.abs(o.x-bl.x)>16||Math.abs(o.y-bl.y)>16)continue;
    for(const[cx,cy,cr]of o.cols){const dx=o.x+cx-bl.x,dy=o.y+cy-bl.y,rr=cr*.85;
      if(dx*dx+dy*dy<rr*rr){
        if(o.hit==='wood'){chips(bl.x,bl.y,GH,4,['#3b2a1d','#5a3e28','#2a1d14','#8e6a3e'],-bl.vx,-bl.vy);sparks(bl.x,bl.y,GH,2,-bl.vx,-bl.vy,'#c89a58');sfx('wood',bl.x,bl.y,.6);}
        else if(o.hit==='straw'){chips(bl.x,bl.y,GH,5,['#d8b464','#c19a4e','#e8c87a'],-bl.vx,-bl.vy);sfx('wood',bl.x,bl.y,.4);}
        else if(o.hit==='metal'){sparks(bl.x,bl.y,GH,5,-bl.vx,-bl.vy,'#fff0b0');sfx('metal',bl.x,bl.y);o.flash=.05;}
        else{o.hp-=bl.dmg;o.flash=.06;sparks(bl.x,bl.y,5,4,-bl.vx,-bl.vy);sfx('barrel',bl.x,bl.y);if(o.hp<=0)barrelBoom(o);}
        return true;}}
  }
  return false;
}
export function updateBullets(dt){
  for(const bl of G.bullets){
    if(bl.dead)continue;
    const sp=Math.hypot(bl.vx,bl.vy),steps=Math.max(1,Math.ceil(sp*dt/3)),sx=bl.vx*dt/steps,sy=bl.vy*dt/steps;
    const ox=bl.x,oy=bl.y;
    for(let k=0;k<steps&&!bl.dead;k++){
      bl.x+=sx;bl.y+=sy;
      for(const z of G.zombies){
        if(z.dead||(bl.hit&&bl.hit.includes(z)))continue;
        const dx=z.x-bl.x,dy=z.y-bl.y,rr=z.t.r+1.5;
        if(dx*dx+dy*dy<rr*rr){
          if(bl.src!=='turret'&&!bl.counted){bl.counted=true;G.hits++;}
          hitZombie(z,bl.dmg,bl.vx,bl.vy,bl.knock,bl.src);
          (bl.hit||(bl.hit=[])).push(z);bl.dmg*=.8;bl.pierce--;
          if(bl.pierce<=0||z.boss){bl.dead=true;break;}
        }
      }
      if(bl.dead)break;
      if(bulletHitsProp(bl)){bl.dead=true;break;}
    }
    if(bl.src==='sniper')P({type:'beam',x:ox,y:oy-bl.z,x2:bl.x,y2:bl.y-bl.z,z:0,life:.45});
    bl.life-=dt;
    if(bl.life<=0&&!bl.dead){bl.dead=true;dust(bl.x,bl.y,1);}
  }
  G.bullets=G.bullets.filter(b=>!b.dead);
}

export function updateFlames(dt){
  const w=WEAP.flamer;
  for(const f of G.flames){
    f.life-=dt;
    if(f.life<=0){f.dead=true;
      if(rng()<.35)stamp(f.x+rand(-2,2),f.y+rand(-2,2),pick(['#1a1410','#241a12','#2e2016']));
      if(rng()<.25)P({type:'smoke',x:f.x,y:f.y,z:f.z,vx:f.vx*.1,vy:f.vy*.1,vz:rand(8,16),life:rand(.5,.9),size:2,grow:4,col:'#3a3430',alpha:.5});
      continue;}
    f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=Math.exp(-dt*2.5);f.vy*=Math.exp(-dt*2.5);f.z=Math.max(3,f.z-dt*6);
    const rr=2+(1-f.life/f.max)*4;
    for(const z of G.zombies){if(z.dead||f.hit.includes(z))continue;const dx=z.x-f.x,dy=z.y-f.y,r=z.t.r+rr;
      if(dx*dx+dy*dy<r*r){f.hit.push(z);hitZombie(z,w.dmg,f.vx,f.vy,w.knock,'flamer');if(!z.dead)z.burn=z.boss?1.2:2.6;}}
    for(const o of G.props)if(o.kind==='barrel'&&!o.dead&&o.hp>0&&Math.hypot(o.x-f.x,o.y-f.y)<rr+4){o.hp-=1.5;o.flash=.04;if(o.hp<=0)barrelBoom(o);}
  }
  G.flames=G.flames.filter(f=>!f.dead);
}

export function updateGrenades(dt){
  for(const g of G.grenades){
    g.t+=dt;const f=Math.min(1,g.t/g.T);
    g.x=lerp(g.sx,g.tx,f);g.y=lerp(g.sy,g.ty,f);g.z=lerp(GH,0,f)+g.peak*4*f*(1-f);
    if(rng()<.7)P({type:'smoke',x:g.x,y:g.y,z:g.z,vx:rand(-4,4),vy:rand(-4,4),vz:rand(2,6),life:rand(.3,.5),size:1,grow:3,col:'#7c786c',alpha:.5});
    let boom=f>=1;
    if(!boom&&g.z<14&&f>.15)for(const z of G.zombies){if(!z.dead&&Math.hypot(z.x-g.x,z.y-g.y)<z.t.r+2){boom=true;break;}}
    if(boom){g.dead=true;explode(g.x,g.y,WEAP.launcher.radius,WEAP.launcher.dmg*(1+.2*PK('dmg')),'fire');}
  }
  G.grenades=G.grenades.filter(g=>!g.dead);
}

export function updateGlobs(dt){
  const p=G.player,b=G.base;
  for(const g of G.globs){
    g.t+=dt;const f=Math.min(1,g.t/g.T);
    g.x=lerp(g.sx,g.tx,f);g.y=lerp(g.sy,g.ty,f);g.z=lerp(10,0,f)+g.peak*4*f*(1-f);
    if(rng()<.5)P({type:'goo',x:g.x,y:g.y,z:g.z,vx:rand(-5,5),vy:rand(-5,5),vz:0,life:.4,col:pick(ACID.c),dcol:pick(ACID.d),s:1});
    if(f>=1){g.dead=true;
      for(let i=0;i<40;i++){const a=rand(0,6.283),d=Math.sqrt(rng())*7;stamp(g.x+Math.cos(a)*d,g.y+Math.sin(a)*d*.6,pick(ACID.d));}
      for(let i=0;i<10;i++){const a=rand(0,6.283),s=rand(15,50);P({type:'goo',x:g.x,y:g.y,z:1,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7,vz:rand(20,50),life:1,col:pick(ACID.c),dcol:pick(ACID.d),s:1});}
      addLight(g.x,g.y,40,.6,.15,'acid');sfx('splat',g.x,g.y);
      if(!p.dead&&Math.hypot(p.x-g.x,p.y-g.y)<11)hurtPlayer(g.dmg,{x:g.x,y:g.y});
      const cx=clamp(g.x,b.x0,b.x1),cy=clamp(g.y,b.y0,b.y1);if(Math.hypot(g.x-cx,g.y-cy)<8)damageBase(g.baseDmg,cx,cy);
    }
  }
  G.globs=G.globs.filter(g=>!g.dead);
}

export function updateTurrets(dt){
  const b=G.base,rate=turretRate(G.perks);
  for(const t of G.turrets){
    t.cd-=dt;t.flash-=dt;let best=null,bd=TURRET_RANGE;
    for(const z of G.zombies){if(z.dead)continue;const d=Math.hypot(z.x-t.x,z.y-t.y);if(d<bd){bd=d;best=z;}}
    if(!best)continue;
    const ta=Math.atan2(best.y-t.y,best.x-t.x);let da=ta-t.ang;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;
    t.ang+=da*Math.min(1,dt*12);
    if(t.cd<=0&&Math.abs(da)<.3&&!G.over){
      t.cd=rate;t.flash=.05;const c=Math.cos(t.ang),s=Math.sin(t.ang),z=b.h+3;
      G.bullets.push({x:t.x+c*7,y:t.y+s*7,z,vx:c*460,vy:s*460,life:.36,dmg:10,pierce:1,knock:40,src:'turret'});
      P({type:'flash',x:t.x+c*9,y:t.y+s*9-z,z:0,a:t.ang,L:3,life:.04});
      addLight(t.x,t.y-z,50,.8,.05,'fire');
      P({type:'casing',x:t.x,y:t.y,z,vx:rand(-25,25),vy:rand(-10,20),vz:rand(30,60),life:3,col:'#e2b24a',dcol:'#9a7a32',spin:0,vs:24});
      sfx('turret',t.x,t.y,.55);
    }
  }
}

export function updateBase(dt){
  const b=G.base,ratio=b.hp/b.maxHp;
  b.flash-=dt;b.shake-=dt;b.alert-=dt;b.emit-=dt;
  if(ratio<.45&&b.emit<=0&&!G.over){
    b.emit=ratio<.2?.05:.14;
    const x=rand(b.x0+4,b.x1-4),y=rand(b.y0+2,b.y1-6);
    P({type:'smoke',x,y,z:b.h,vx:rand(-4,4),vy:rand(-3,3),vz:rand(10,20),life:rand(1.2,2.2),size:2,grow:rand(3,5),col:'#2c2a29',alpha:.7});
    if(ratio<.25)P({type:'fire',x,y,z:b.h,vx:rand(-6,6),vy:rand(-3,3),vz:rand(14,30),life:rand(.3,.6),s:2});
  }
  if(ratio<.3&&!G.over&&G.state==='play'){b.alarm-=dt;if(b.alarm<=0){b.alarm=1.4;sfx('alarm');}}
}

export function updateParts(dt){
  const GR=260;
  for(const q of G.parts){
    q.life-=dt;if(q.life<=0){q.dead=true;continue;}
    switch(q.type){
      case'blood':case'goo':
        q.vz-=GR*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;
        if(q.z<=0){stamp(q.x,q.y,q.dcol,q.s||1);q.dead=true;}break;
      case'gib':case'casing':case'shell':case'chip':case'mag':
        q.vz-=GR*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.spin=(q.spin||0)+dt*(q.vs||10);
        if(q.z<=0){q.z=0;
          if(q.vz<-28){q.vz*=-.42;q.vx*=.55;q.vy*=.55;q.b=(q.b||0)+1;
            if(q.type==='casing'&&q.b<3)sfx('tink',q.x,q.y,q.b===1?1:.5);
            else if(q.type==='shell'&&q.b<3)sfx('shellTink',q.x,q.y);
            else if(q.type==='gib'){stamp(q.x,q.y,'#5c1010',2);}
          }else{
            const x=Math.round(q.x),y=Math.round(q.y);gctx.fillStyle=q.dcol;
            if(q.type==='casing')gctx.fillRect(x,y,(q.spin|0)%2?2:1,(q.spin|0)%2?1:2);
            else if(q.type==='shell'){gctx.fillRect(x,y,3,2);gctx.fillStyle='#9a7a32';gctx.fillRect(x+2,y,1,2);}
            else if(q.type==='mag')gctx.fillRect(x,y,2,3);
            else if(q.type==='gib'){gctx.fillRect(x,y,2,2);gctx.fillStyle=q.col;gctx.fillRect(x,y,1,1);}
            else gctx.fillRect(x,y,q.s||1,q.s||1);
            q.dead=true;}
        }break;
      case'smoke':case'dust':
        q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.vx*=.97;q.vy*=.97;q.size+=q.grow*dt;break;
      case'fire':
        q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.vx*=.92;q.vy*=.92;q.vz+=18*dt;break;
      case'spark':
        q.px=q.x;q.py=q.y-q.z;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.vz-=GR*.6*dt;q.vx*=.92;q.vy*=.92;if(q.z<0){q.z=0;q.vz*=-.3;}break;
    }
  }
  G.parts=G.parts.filter(q=>!q.dead);
}

export function updateCoins(dt){
  const p=G.player,rad=pickupRadius(G.perks);
  for(const c of G.coins){
    c.t+=dt;
    const dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy)||1;
    if(c.t>.35&&!p.dead&&(d<rad||G.collectAll))c.mag=true;
    if(c.mag){c.vx+=dx/d*900*dt;c.vy+=dy/d*900*dt;c.vx*=.9;c.vy*=.9;c.z=lerp(c.z,5,.15);c.vz=0;}
    else{c.vz-=230*dt;c.z+=c.vz*dt;
      if(c.z<0){c.z=0;if(c.vz<-30){c.vz*=-.45;c.vx*=.6;c.vy*=.6;if(!c.clink){c.clink=true;sfx('coinDrop',c.x,c.y);}}else{c.vz=0;c.vx*=.8;c.vy*=.8;}}}
    c.x+=c.vx*dt;c.y+=c.vy*dt;
    if(c.mag&&d<7){c.dead=true;const v=coinValue(c.v,G.perks);G.money+=v;G.earned+=v;AU.streak=Math.min(AU.streak+1,12);G.coinStreakT=.7;G.fx.money=true;sfx('coin');
      floatTxt(p.x+rand(-4,4),p.y-22,'+'+v,'#e9b949',1,.5);
      for(let i=0;i<3;i++)P({type:'spark',x:p.x,y:p.y,z:10,vx:rand(-30,30),vy:rand(-20,20),vz:rand(20,50),life:.25,col:'#ffe08a'});}
  }
  G.coins=G.coins.filter(c=>!c.dead);
}
