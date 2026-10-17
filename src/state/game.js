import { BASE_HP,BD,BHT,BW,BX,BY,H,LEVELS,PLAYER_HP,W } from '../config.js';
import { isUnlocked,magSize,reloadTime } from '../rules/weapons.js';
import { turretCapacity } from '../rules/turrets.js';

export let G=null;
export function setGame(g){G=g;}
export let paused=false;
export function setPaused(v){paused=v;}
export let CX=0;
export let CY=0;
export function setCamera(x,y){CX=x;CY=y;}
export const cam={x:BX-W/2,y:BY-H/2};
export const mouse={sx:W/2+40,sy:H/2,down:false,latched:false};
export const K={};
export const PK=id=>(G&&G.perks[id])||0;
export const MAG=id=>magSize(id,G.perks);
export const RLD=w=>reloadTime(w,G.perks);
export const unlocked=id=>isUnlocked(id,G.level,G.endless);
export const levelOf=()=>LEVELS[Math.min(G.level,LEVELS.length-1)];
export const turretCap=()=>turretCapacity(G.perks);
export function statsLine(){return{acc:G.shots?Math.round(G.hits/G.shots*100):0};}

export function newGame(){
  return{state:'title',level:0,lw:0,wave:0,endless:false,money:0,kills:0,waveKills:0,shots:0,hits:0,earned:0,perks:{},
    queue:[],spawnT:0,spawnGap:1,waveActive:false,bossWave:false,bossPending:null,bossT:0,bossRef:null,levelDone:false,
    collectAll:false,over:false,reinforce:0,
    trauma:0,freeze:0,ts:1,slowT:0,ckx:0,cky:0,hurtV:0,flashScr:0,hitMark:0,killMark:0,dry:0,time:0,heartT:0,
    combo:0,comboT:0,coinStreakT:0,snow:[],
    player:{x:BX,y:BY+34,vx:0,vy:0,kx:0,ky:0,r:4,hp:PLAYER_HP,maxHp:PLAYER_HP,ang:0,face:1,w:'pistol',owned:{pistol:true},mag:{pistol:12},res:{pistol:Infinity},
      reload:0,reloadMax:1,rlIn:false,spin:0,charging:0,cd:0,kick:0,bloom:0,inv:0,swap:0,melee:0,meleeAnim:0,anim:0,stepT:0,moving:false,dead:false},
    base:{x:BX,y:BY,x0:BX-BW/2,x1:BX+BW/2,y0:BY-BD/2,y1:BY+BD/2,h:BHT,hp:BASE_HP,maxHp:BASE_HP,flash:0,shake:0,alert:0,emit:0,alarm:0},
    zombies:[],bullets:[],grenades:[],flames:[],globs:[],parts:[],coins:[],floats:[],lights:[],turrets:[],timers:[],props:[],
    fx:{baseHit:false,lifeHit:false,money:false,combo:false,shot:false,bossHit:false},ghostB:1,ghostL:1,ghostBD:0,ghostLD:0,ghostBoss:1};
}
