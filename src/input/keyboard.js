import { ORDER } from '../config.js';
import { choosePerk,nextFromShop,setPause } from '../loop/flow.js';
import { melee,startReload,switchWeapon } from '../loop/weapons.js';
import { AU,initAudio,setMute } from '../render/audio.js';
import { G,K,mouse,paused } from '../state/game.js';

/* =========================================================
   Entrées
   ========================================================= */
addEventListener('keydown',e=>{
  if(G.state==='play'&&['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  K[e.code]=true;if(e.repeat)return;
  if(e.code==='KeyM'){initAudio();setMute(!AU.muted);}
  if(G.state==='play'&&!G.over){
    if(e.code==='Escape'||e.code==='KeyP'){setPause(!paused);return;}
    if(paused)return;
    if(e.code==='KeyR')startReload();
    if(e.code==='KeyF')melee();
    const m=e.code.match(/^Digit([0-9])$/);if(m)switchWeapon(ORDER[m[1]==='0'?9:+m[1]-1]);
  }else if(G.state==='perk'){
    const m=e.code.match(/^(?:Digit|Numpad)([1-3])$/);if(m)choosePerk(+m[1]-1);
  }else if(G.state==='shop'&&(e.code==='Space'||e.code==='Enter')){
    const a=document.activeElement;if(!(a&&a.tagName==='BUTTON')){e.preventDefault();nextFromShop();}
  }
});
addEventListener('keyup',e=>{K[e.code]=false;});
addEventListener('blur',()=>{for(const k in K)K[k]=false;mouse.down=false;if(G.state==='play'&&!G.over&&!paused)setPause(true);});
