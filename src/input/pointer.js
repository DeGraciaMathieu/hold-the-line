import { H,W } from '../config.js';
import { cycleWeapon,melee } from '../loop/weapons.js';
import { cv,stage } from '../render/dom.js';
import { G,mouse,paused } from '../state/game.js';
import { clamp } from '../util.js';

addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();if(!r.width)return;mouse.sx=clamp((e.clientX-r.left)/r.width*W,0,W-1);mouse.sy=clamp((e.clientY-r.top)/r.height*H,0,H-1);});
cv.addEventListener('mousedown',e=>{if(G.state!=='play'||paused||G.over)return;e.preventDefault();if(e.button===0)mouse.down=true;else if(e.button===2)melee();});
addEventListener('mouseup',e=>{if(e.button===0)mouse.down=false;});
stage.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{if(G.state!=='play'||paused||G.over)return;e.preventDefault();if(Math.abs(e.deltaY)>2)cycleWeapon(Math.sign(e.deltaY));},{passive:false});
