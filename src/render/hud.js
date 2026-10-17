import { ORDER,WEAP } from '../config.js';
import { $,stage } from './dom.js';
import { pulse } from './effects.js';
import { G,MAG,levelOf,paused } from '../state/game.js';
import { clamp,lerp } from '../util.js';

/* =========================================================
   HUD (DOM)
   ========================================================= */
export const hud={root:$('#hud'),mBase:$('#mBase'),mLife:$('#mLife'),tBase:$('#tBase'),tLife:$('#tLife'),fBase:$('#fBase'),gBase:$('#gBase'),fLife:$('#fLife'),gLife:$('#gLife'),
  wave:$('#hWave'),left:$('#hLeft'),money:$('#hMoney'),combo:$('#hCombo'),comboN:$('#hComboN'),slots:$('#hSlots'),wname:$('#hWName'),ammo:$('#hAmmo'),pips:$('#hPips'),
  rl:$('#hRl'),rlF:$('#hRlF'),prompt:$('#hPrompt'),boss:$('#hBoss'),bossName:$('#hBossName'),fBoss:$('#fBoss'),gBoss:$('#gBoss')};
export const hc={};
export function setT(el,key,v){if(hc[key]!==v){hc[key]=v;el.textContent=v;}}
export function setH(el,key,v){if(hc[key]!==v){hc[key]=v;el.innerHTML=v;}}
export function setWd(el,key,r){const v=(clamp(r,0,1)*100).toFixed(1)+'%';if(hc[key]!==v){hc[key]=v;el.style.width=v;}}
export let pipEls=[];
export let pipKey=null;
export let pipMag=-1;
export let gaugeEl=null;
export function hudUpdate(dt){
  if(G.state==='title')return;
  const p=G.player,b=G.base,w=WEAP[p.w],L=levelOf();
  const br=b.hp/b.maxHp,lr=p.hp/p.maxHp;
  if(G.fx.baseHit){G.fx.baseHit=false;pulse(hud.mBase,'hit');G.ghostBD=.4;}
  if(G.fx.lifeHit){G.fx.lifeHit=false;pulse(hud.mLife,'hit');G.ghostLD=.4;}
  G.ghostBD-=dt;G.ghostLD-=dt;
  if(br>G.ghostB)G.ghostB=br;else if(G.ghostBD<=0)G.ghostB=lerp(G.ghostB,br,Math.min(1,dt*3));
  if(lr>G.ghostL)G.ghostL=lr;else if(G.ghostLD<=0)G.ghostL=lerp(G.ghostL,lr,Math.min(1,dt*3));
  setWd(hud.fBase,'fb',br);setWd(hud.gBase,'gb',G.ghostB);setWd(hud.fLife,'fl',lr);setWd(hud.gLife,'gl',G.ghostL);
  setT(hud.tBase,'tb',`${Math.ceil(b.hp)}/${b.maxHp}`);setT(hud.tLife,'tl',`${Math.ceil(p.hp)}/${p.maxHp}`);
  const crit=lr<.3;if(hc.crit!==crit){hc.crit=crit;hud.mLife.classList.toggle('crit',crit);}
  const bcrit=br<.3;if(hc.bcrit!==bcrit){hc.bcrit=bcrit;hud.mBase.classList.toggle('crit',bcrit);}
  setT(hud.wave,'wave',G.endless?`Vague ${G.wave} · infini`:`${L.name} · ${Math.max(1,G.lw)}/5`);
  const left=G.queue.length+G.zombies.length+(G.bossPending?1:0);
  setH(hud.left,'left',G.waveActive?`<b>${left}</b> zombie${left>1?'s':''} restant${left>1?'s':''}`:G.over?'':'Vague repoussée');
  const bz=G.bossRef&&!G.bossRef.dead?G.bossRef:null;
  if(hc.bossOn!==!!bz){hc.bossOn=!!bz;hud.boss.hidden=!bz;}
  if(bz){setT(hud.bossName,'bn',bz.t.name);const r=bz.hp/bz.max;
    if(G.fx.bossHit){G.fx.bossHit=false;pulse(hud.boss,'hit');}
    G.ghostBoss=r>G.ghostBoss?r:lerp(G.ghostBoss,r,Math.min(1,dt*2.5));
    setWd(hud.fBoss,'fbo',r);setWd(hud.gBoss,'gbo',G.ghostBoss);}
  setT(hud.money,'money','$'+G.money);
  if(G.fx.money){G.fx.money=false;pulse(hud.money,'bump');}
  const showC=G.combo>=2;if(hc.showC!==showC){hc.showC=showC;hud.combo.hidden=!showC;}
  if(showC){setT(hud.comboN,'cn','x'+G.combo);if(G.fx.combo)pulse(hud.combo,'bump');}
  G.fx.combo=false;
  const sk=ORDER.map(id=>(p.owned[id]?1:0)+(p.owned[id]&&p.mag[id]===0&&p.res[id]<=0?'d':'')).join('')+p.w;
  if(hc.slots!==sk){hc.slots=sk;
    hud.slots.innerHTML=ORDER.map((id,i)=>{const own=p.owned[id],cl=['slot',own?'':'locked',p.w===id?'on':'',own&&p.mag[id]===0&&p.res[id]<=0?'dry':''].join(' ');
      return`<div class="${cl}"><span class="k">${(i+1)%10}</span><img src="${WEAP[id].icon}" alt="" style="width:calc(var(--px)*${Math.min(17,WEAP[id].spr.img.width)})"></div>`;}).join('');}
  setT(hud.wname,'wn',w.name);
  const mag=p.mag[p.w],res=p.res[p.w],mx=MAG(p.w);
  setH(hud.ammo,'ammo',`${mag}<small> / ${res===Infinity?'∞':res}</small>`);
  const low=mag<=Math.ceil(mx*.25);if(hc.low!==low){hc.low=low;hud.ammo.classList.toggle('low',low);}
  const key=p.w+':'+mx;
  if(pipKey!==key){pipKey=key;pipMag=mag;hud.pips.innerHTML='';pipEls=[];gaugeEl=null;
    if(mx>40){hud.pips.className='pips';hud.pips.innerHTML=`<span class="gauge${w.flame?' fuel':''}"><i></i></span>`;gaugeEl=hud.pips.querySelector('i');gaugeEl.style.width=(mag/mx*100)+'%';}
    else{hud.pips.className='pips'+(mx<=12?' big':'');
      for(let i=0;i<mx;i++){const e=document.createElement('i');e.className='pip'+(i<mag?'':' empty');hud.pips.appendChild(e);pipEls.push(e);}}}
  else if(gaugeEl&&pipMag!==mag){gaugeEl.style.width=(mag/mx*100)+'%';if(mag<pipMag&&!w.flame)pulse(hud.ammo,'kick');pipMag=mag;}
  else if(pipMag!==mag){
    if(mag<pipMag){for(let i=mag;i<pipMag&&i<pipEls.length;i++){pipEls[i].className='pip empty';void pipEls[i].offsetWidth;pipEls[i].className='pip empty spend';}pulse(hud.ammo,'kick');}
    else for(let i=0;i<pipEls.length;i++)pipEls[i].className='pip'+(i<mag?'':' empty');
    pipMag=mag;}
  const rl=p.reload>0;if(hc.rl!==rl){hc.rl=rl;hud.rl.hidden=!rl;}
  if(rl)setWd(hud.rlF,'rlf',1-p.reload/p.reloadMax);
  let pr='',bad=false;
  if(!p.dead&&!G.over&&G.state==='play'&&!rl&&mag===0){if(res>0)pr='<kbd>R</kbd> Recharger';else{pr='À sec · changez d’arme (1-0)';bad=true;}}
  if(hc.pr!==pr){hc.pr=pr;hud.prompt.innerHTML=pr;hud.prompt.hidden=!pr;hud.prompt.classList.toggle('bad',bad);}
  stage.classList.toggle('aim',G.state==='play'&&!paused&&!G.over);
}

export let bannerT=0;
export function banner(t,s,tone,eyebrow){
  const el=$('#banner');el.querySelector('.e').textContent=eyebrow||'';el.querySelector('.t').textContent=t;el.querySelector('.s').textContent=s||'';
  el.className='';void el.offsetWidth;el.className='show '+(tone||'');
  clearTimeout(bannerT);bannerT=setTimeout(()=>{el.className='out '+(tone||'');},2300);
}

/* =========================================================
   Menus : atouts, boutique, fin
   ========================================================= */
export const OVERLAYS=['start','shop','pause','over','perk','win'];
export function hideOverlays(){for(const id of OVERLAYS)$('#'+id).hidden=true;}
export function showOverlay(id){hideOverlays();$('#'+id).hidden=false;const f=$('#'+id).querySelector('.btn,.perk');if(f)f.focus({preventScroll:true});}

/* Vide le cache du HUD pour forcer un rendu complet (nouvelle partie, nouveau refuge). */
export function resetHud(){for(const k in hc)delete hc[k];pipKey=null;}
