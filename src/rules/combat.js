/* Résolution des dégâts infligés à un zombie : bonus Gâchette lourde, coup
   critique (Œil de lynx), armure et armes perforantes, mise à feu (Pyromane). Pure. */
import { WEAP,PIERCE_ARMOR,PERK_DMG_BONUS,CRIT_BASE_CHANCE,PERK_CRIT_BONUS,CRIT_MULT,PERK_PYRO_CHANCE,COMBO_CAP,COMBO_COIN_BONUS,PERK_LEECH_HP } from '../config.js';

/* target : {armor} ; src : clé d'arme, 'melee', 'boom', 'fire', 'gore', 'turret'…
   Retourne {dmg, crit, armored, own, fl, burn}. */
export function resolveHit({dmg,src,target,perks},rng){
  const fl=src==='flamer',own=!!WEAP[src]||src==='melee';
  if(own)dmg*=1+PERK_DMG_BONUS*(perks.dmg||0);
  let crit=false;if(own&&src!=='melee'&&!fl&&rng()<CRIT_BASE_CHANCE+PERK_CRIT_BONUS*(perks.crit||0)){crit=true;dmg*=CRIT_MULT;}
  let armored=false;
  if(target.armor&&src!=='boom'&&src!=='fire'&&src!=='gore'&&!PIERCE_ARMOR[src]){armored=true;dmg=Math.max(1,dmg-target.armor);}
  dmg=Math.max(1,Math.round(dmg));
  const burn=own&&!!(perks.pyro||0)&&!fl&&rng()<PERK_PYRO_CHANCE*perks.pyro;
  return{dmg,crit,armored,own,fl,burn};
}

const clamp=(v,a,b)=>v<a?a:v>b?b:v;

/* Pièces lâchées par un zombie abattu : la récompense grimpe avec le combo
   (plafonné), répartie en n pièces de valeur v. huge : boss. */
export function coinDrop(baseReward,combo,huge){
  const reward=Math.round(baseReward*(1+Math.min(combo,COMBO_CAP)*COMBO_COIN_BONUS)),n=clamp(Math.round(reward/8),1,huge?30:7),v=Math.max(1,Math.round(reward/n));
  return{reward,n,v};
}

/* Vampire : chaque kill rend 2 PV par niveau au survivant vivant et blessé.
   Retourne {hp, h} ou null quand rien n'est rendu. */
export function leechHeal(p,perks){
  const h=PERK_LEECH_HP*(perks.leech||0);
  if(!h||p.dead||p.hp>=p.maxHp)return null;
  return{hp:Math.min(p.maxHp,p.hp+h),h};
}
