import { H,W } from '../config.js';
import { applyPurchase,purchasePrice } from '../rules/shop.js';
import { addTurret } from '../loop/damage.js';
import { choosePerk,newRun,nextFromShop,setPause } from '../loop/flow.js';
import { AU,initAudio,setMute,sfx } from '../render/audio.js';
import { $,shell,stage } from '../render/dom.js';
import { pulse } from '../render/effects.js';
import { openShop,renderShop } from '../render/screens.js';
import { G } from '../state/game.js';

$('#perkList').addEventListener('click',e=>{const b=e.target.closest('[data-perk]');if(b)choosePerk(+b.dataset.perk);});
$('#shop').addEventListener('click',e=>{
  const bt=e.target.closest('[data-act]');if(!bt||bt.disabled)return;
  const act=bt.dataset.act,id=bt.dataset.id,price=purchasePrice(act,id,G.reinforce);
  const key=id||act;
  if(G.money<price){sfx('deny');renderShop(key,false);pulse($('#wallet'),'nope');return;}
  G.money-=price;
  const bought=applyPurchase(act,id,{player:G.player,base:G.base,reinforce:G.reinforce,perks:G.perks});
  if(bought.player)Object.assign(G.player,bought.player);if(bought.base)Object.assign(G.base,bought.base);
  if(bought.reinforce!==undefined)G.reinforce=bought.reinforce;if(bought.addTurret)addTurret();
  sfx('buy');renderShop(key,true);pulse($('#wallet'),'bump');
});
$('#btnStart').addEventListener('click',newRun);
$('#btnRetry').addEventListener('click',newRun);
$('#btnRestart').addEventListener('click',newRun);
$('#btnEndless').addEventListener('click',()=>{G.endless=true;G.levelDone=false;G.lw=0;openShop();});
$('#btnNext').addEventListener('click',nextFromShop);
$('#btnResume').addEventListener('click',()=>setPause(false));
document.querySelectorAll('[data-sound]').forEach(b=>b.addEventListener('click',()=>{initAudio();setMute(!AU.muted);}));
document.querySelectorAll('[data-fs]').forEach(b=>b.addEventListener('click',()=>{
  try{if(document.fullscreenElement)document.exitFullscreen();else{const r=shell.requestFullscreen&&shell.requestFullscreen();if(r&&r.catch)r.catch(()=>{});}}catch(e){}}));
export let lastHover=null;
stage.addEventListener('pointerover',e=>{const b=e.target.closest('button');if(b&&b!==lastHover){lastHover=b;sfx('tick');}if(!b)lastHover=null;});
setMute(AU.muted);
try{const best=+localStorage.getItem('dernier-rempart-best')||0,won=localStorage.getItem('dernier-rempart-win')==='1';
  if(best>0)$('#best').textContent=`Record : ${best} vague${best>1?'s':''} tenue${best>1?'s':''}${won?' · campagne terminée':''}.`;}catch(e){}

export function layout(){
  const aw=shell.clientWidth,ah=shell.clientHeight;let s=Math.min(aw/W,ah/H);if(s>=2)s=Math.floor(s);s=Math.max(.5,s);
  stage.style.width=W*s+'px';stage.style.height=H*s+'px';stage.style.setProperty('--px',s+'px');
}
addEventListener('resize',layout);document.addEventListener('fullscreenchange',layout);
