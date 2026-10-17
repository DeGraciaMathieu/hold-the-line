import { BARREL_HP,BOSS_DELAY,BOSS_ORDER,BX,BY,FIRST_SPAWN_DELAY,H,LEVELS,PERKS,PERK_FORT_BONUS,PERK_HP_BONUS,W,WAVES_PER_LEVEL,WH,WW,WAVE_CLEAR_SLOW,WAVE_CLEAR_TS,WAVE_CLEAR_FREEZE,WAVE_CLEAR_DELAY } from '../config.js';
import { isBaseIntact,isBossWave,isPerkWave,spawnGap,waveBonus } from '../rules/progression.js';
import { buildWaveQueue } from '../rules/wave.js';
import { addTurret } from './damage.js';
import { initAudio,sfx } from '../render/audio.js';
import { $ } from '../render/dom.js';
import { P,blood,boomFX,shake } from '../render/effects.js';
import { gctx,genProps,groundClean,prepareGround } from '../render/ground.js';
import { banner,hideOverlays,resetHud,showOverlay } from '../render/hud.js';
import { openShop,showOver,showWin } from '../render/screens.js';
import { PSPR } from '../render/sprites.js';
import { G,turretCap,PK,cam,levelOf,mouse,newGame,setGame,setPaused } from '../state/game.js';
import { pick,rand,rng,shuffle } from '../state/random.js';
import { clamp } from '../util.js';

export function buildLevel(){
  const L=levelOf();
  prepareGround(G.level,L);
  G.props=genProps(L);
  Object.assign(G,{zombies:[],bullets:[],grenades:[],flames:[],globs:[],parts:[],coins:[],floats:[],lights:[],timers:[]});
  const b=G.base;b.hp=b.maxHp;b.flash=0;b.alert=0;
  const p=G.player;Object.assign(p,{x:BX,y:BY+34,vx:0,vy:0,kx:0,ky:0,reload:0,spin:0,charging:0});
  cam.x=clamp(p.x-W/2,0,WW-W);cam.y=clamp(p.y-H/2,0,WH-H);
  G.snow=L.snow?Array.from({length:110},()=>({x:rand(0,W),y:rand(0,H),v:rand(10,28),s:Math.random()<.2?2:1,ph:rand(0,6)})):[];
}
export function startWave(){
  hideOverlays();G.state='play';setPaused(false);G.wave++;G.lw++;G.waveKills=0;
  const L=levelOf();
  G.bossWave=isBossWave(G.lw,G.endless);
  G.queue=buildWaveQueue(L,G,rng);G.spawnT=FIRST_SPAWN_DELAY;G.spawnGap=spawnGap(G.wave);G.waveActive=true;G.collectAll=false;
  G.bossPending=G.bossWave?(G.endless?BOSS_ORDER[(G.lw/WAVES_PER_LEVEL-1)%BOSS_ORDER.length]:L.boss):null;G.bossT=BOSS_DELAY;G.bossRef=null;
  for(const o of G.props)if(o.kind==='barrel'&&o.dead&&o.home){o.dead=false;o.hp=BARREL_HP;}
  if(G.lw>1){gctx.globalAlpha=.32;gctx.drawImage(groundClean,0,0);gctx.globalAlpha=1;}
  if(G.lw===1&&!G.endless){
    banner(L.name,L.sub+' · '+L.intro,'',`Refuge ${G.level+1} sur ${LEVELS.length}`);sfx('travel');
    G.timers.push({t:2.6,fn:()=>{if(!G.over)banner('Vague 1',`${G.queue.length+G.zombies.length} zombies en approche`,'',L.name);}});
  }else{
    const sub=G.bossWave?'Le gardien du refuge arrive':`${G.queue.length} zombies en approche`;
    banner(`Vague ${G.endless?G.wave:G.lw}`,sub,G.bossWave?'danger':'',G.endless?'Mode infini':L.name);
  }
  sfx('horn');shake(.25);
  $('#hud').hidden=false;
}
export function waveCleared(){
  G.waveActive=false;G.slowT=WAVE_CLEAR_SLOW;G.ts=WAVE_CLEAR_TS;G.freeze=Math.max(G.freeze,WAVE_CLEAR_FREEZE);shake(.4);G.collectAll=true;
  G.timers.push({t:.9,fn:()=>{
    const intact=isBaseIntact(G.base.hp,G.base.maxHp),bonus=waveBonus(G.wave,G.bossWave,intact);
    G.money+=bonus;G.earned+=bonus;G.fx.money=true;
    const title=G.bossWave&&!G.endless?`${levelOf().name} tient bon`:`Vague ${G.endless?G.wave:G.lw} repoussée`;
    banner(title,`Prime +$${bonus}${intact?' · rempart intact':''}`,'');sfx('clear');
  }});
  G.timers.push({t:WAVE_CLEAR_DELAY,fn:afterWave});
}
export function afterWave(){
  if(G.over)return;
  if(G.bossWave&&!G.endless&&G.level===LEVELS.length-1){showWin();return;}
  if(G.bossWave&&!G.endless)G.levelDone=true;
  const perkNow=isPerkWave(G.lw,G.bossWave,G.endless);
  if(perkNow)openPerk();else openShop();
}
export function travel(){
  G.level++;G.lw=0;G.levelDone=false;
  resetHud();
  buildLevel();startWave();
}
export function gameOver(reason){
  if(G.over)return;G.over=true;G.reason=reason;mouse.down=false;
  G.slowT=1.3;G.ts=.15;shake(1);G.freeze=.16;G.waveActive=false;
  const p=G.player;
  if(reason==='player'){
    p.dead=true;
    for(let i=0;i<10;i++){const a=rand(0,6.283),s=rand(25,90);P({type:'gib',x:p.x,y:p.y,z:rand(5,12),vx:Math.cos(a)*s,vy:Math.sin(a)*s*.8,vz:rand(40,110),life:3,col:pick(['#d0782f','#e2a97c','#8a1c1a']),col2:'#c0281f',dcol:'#4a0c0c'});}
    blood(p.x,p.y,0,1,30);
    gctx.save();gctx.translate(Math.round(p.x),Math.round(p.y-2));gctx.rotate(Math.PI/2);gctx.drawImage(PSPR.dark,-PSPR.ax,-PSPR.H+2);gctx.restore();
  }else{
    const b=G.base;
    boomFX(b.x,b.y+4,60,false);
    for(let i=1;i<5;i++)G.timers.push({t:i*.18,fn:()=>boomFX(rand(b.x0,b.x1),rand(b.y0,b.y1)+6,rand(30,45),false)});
  }
  sfx('down');
  const survived=G.wave-1;let best=0;
  try{best=+localStorage.getItem('dernier-rempart-best')||0;if(survived>best)localStorage.setItem('dernier-rempart-best',String(survived));}catch(e){}
  G.best=Math.max(best,survived);G.newBest=survived>best&&survived>0;
  G.timers.push({t:.5,fn:showOver});
}

export let perkLock=false;
export function openPerk(){
  if(G.over)return;G.state='perk';mouse.down=false;$('#banner').className='';perkLock=false;
  const pool=shuffle(PERKS.filter(pk=>PK(pk.id)<pk.max));G.perkChoices=pool.slice(0,3);
  if(!G.perkChoices.length){openShop();return;}
  $('#perkEyebrow').textContent=G.bossWave&&!G.endless?`${levelOf().name} libérée`:`Vague ${G.endless?G.wave:G.lw} tenue`;
  $('#perkList').innerHTML=G.perkChoices.map((pk,i)=>{const lv=PK(pk.id);
    return`<button class="perk" data-perk="${i}" style="--i:${i}"><span class="pg">${pk.glyph}</span><span class="pn">${pk.name}</span><span class="pd">${pk.desc}</span>
      <span class="pl"><span class="pk">${i+1}</span> · niveau ${lv} → ${lv+1} sur ${pk.max}</span></button>`;}).join('');
  showOverlay('perk');sfx('perkOpen');
}
export function choosePerk(i){
  if(perkLock||G.state!=='perk')return;const pk=G.perkChoices[i];if(!pk)return;perkLock=true;
  G.perks[pk.id]=PK(pk.id)+1;
  const p=G.player,b=G.base;
  if(pk.id==='hp'){p.maxHp+=PERK_HP_BONUS;p.hp=p.maxHp;}
  if(pk.id==='fort'){b.maxHp+=PERK_FORT_BONUS;b.hp=b.maxHp;}
  if(pk.id==='turret'&&G.turrets.length<turretCap())addTurret();
  sfx('perk');
  document.querySelectorAll('#perkList .perk').forEach((el,j)=>el.classList.add(j===i?'picked':'gone'));
  setTimeout(openShop,520);
}
export function nextFromShop(){initAudio();if(G.levelDone)travel();else startWave();}
export function setPause(v){
  if(G.state!=='play'||G.over)return;setPaused(v);mouse.down=false;
  if(v)showOverlay('pause');else hideOverlays();
}
export function newRun(){
  initAudio();
  setGame(newGame());
  resetHud();
  buildLevel();
  startWave();
}
