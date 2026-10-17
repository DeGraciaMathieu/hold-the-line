/* Boutique : prix de chaque article et effet d'un achat sur le survivant,
   le rempart et le compteur de renforcement. Pures. */
import { WEAP,REPAIR_PRICE,REPAIR_HP,REINFORCE_HP,HEAL_PRICE,TURRET_PRICE } from '../config.js';
import { reinforcePrice } from './progression.js';
import { magSize } from './weapons.js';

/* act : 'buy' | 'ammo' | 'repair' | 'reinforce' | 'heal' | 'turret' ; id : clé d'arme pour buy/ammo. */
export function purchasePrice(act,id,reinforce){
  if(act==='buy')return WEAP[id].price;
  if(act==='ammo')return WEAP[id].ammo.p;
  if(act==='repair')return REPAIR_PRICE;
  if(act==='reinforce')return reinforcePrice(reinforce);
  if(act==='heal')return HEAL_PRICE;
  if(act==='turret')return TURRET_PRICE;
  return 0;
}

/* Retourne les parties d'état modifiées : {player?, base?, reinforce?, addTurret?}. */
export function applyPurchase(act,id,{player:p,base:b,reinforce,perks}){
  if(act==='buy'){const w=WEAP[id];return{player:{...p,owned:{...p.owned,[id]:true},mag:{...p.mag,[id]:magSize(id,perks)},res:{...p.res,[id]:w.ammo?w.ammo.n:Infinity},w:id}};}
  if(act==='ammo'){const w=WEAP[id];return{player:{...p,res:{...p.res,[id]:p.res[id]+w.ammo.n}}};}
  if(act==='repair')return{base:{...b,hp:Math.min(b.maxHp,b.hp+REPAIR_HP)}};
  if(act==='reinforce'){const maxHp=b.maxHp+REINFORCE_HP;return{base:{...b,maxHp,hp:Math.min(maxHp,b.hp+REINFORCE_HP)},reinforce:reinforce+1};}
  if(act==='heal')return{player:{...p,hp:p.maxHp}};
  if(act==='turret')return{addTurret:true};
  return{};
}
