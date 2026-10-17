/* Formules de progression : taille et rythme des vagues, scaling des PV,
   primes, vagues à atout, prix du renforcement. Pures. */
import {
  WAVES_PER_LEVEL,WAVE_BASE_SIZE,WAVE_SIZE_PER_WAVE,BOSS_WAVE_SIZE_FACTOR,ENDLESS_WAVE_SIZE_FACTOR,
  ZOMBIE_HP_PER_WAVE,BOSS_ENDLESS_HP_FROM_WAVE,BOSS_ENDLESS_HP_PER_WAVE,
  SPAWN_GAP_BASE,SPAWN_GAP_PER_WAVE,SPAWN_GAP_MIN,
  WAVE_BONUS_BASE,WAVE_BONUS_PER_WAVE,WAVE_BONUS_INTACT,WAVE_BONUS_BOSS,INTACT_BASE_RATIO,
  PERK_WAVES,ENDLESS_PERK_EVERY,REINFORCE_PRICE_BASE,REINFORCE_PRICE_STEP,
} from '../config.js';

export function isBossWave(lw,endless){return endless?lw%WAVES_PER_LEVEL===0:lw===WAVES_PER_LEVEL;}

export function waveSize(wave,bossWave,endless){
  let total=Math.round(WAVE_BASE_SIZE+wave*WAVE_SIZE_PER_WAVE);
  if(bossWave)total=Math.round(total*BOSS_WAVE_SIZE_FACTOR);
  if(endless)total=Math.round(total*ENDLESS_WAVE_SIZE_FACTOR);
  return total;
}

export function spawnGap(wave){return Math.max(SPAWN_GAP_MIN,SPAWN_GAP_BASE-wave*SPAWN_GAP_PER_WAVE);}

export function zombieHp(baseHp,wave){return baseHp*(1+(wave-1)*ZOMBIE_HP_PER_WAVE);}

export function bossHp(baseHp,wave,endless){
  const scale=endless?1+(wave-BOSS_ENDLESS_HP_FROM_WAVE)*BOSS_ENDLESS_HP_PER_WAVE:1;
  return baseHp*scale;
}

export function isBaseIntact(hp,maxHp){return hp/maxHp>INTACT_BASE_RATIO;}

export function waveBonus(wave,bossWave,intact){
  return WAVE_BONUS_BASE+wave*WAVE_BONUS_PER_WAVE+(intact?WAVE_BONUS_INTACT:0)+(bossWave?WAVE_BONUS_BOSS:0);
}

export function isPerkWave(lw,bossWave,endless){
  return bossWave||(!endless&&PERK_WAVES.includes(lw))||(endless&&lw%ENDLESS_PERK_EVERY===0);
}

export function reinforcePrice(reinforce){return REINFORCE_PRICE_BASE+reinforce*REINFORCE_PRICE_STEP;}
