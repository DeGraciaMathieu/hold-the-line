/* Ramassage des pièces : rayon d'attraction et valeur selon l'atout Aimant. Pures. */
import { COIN_RADIUS,PERK_MAGNET_RADIUS_BONUS,PERK_MAGNET_COIN_BONUS } from '../config.js';

export function pickupRadius(perks){return COIN_RADIUS*(1+PERK_MAGNET_RADIUS_BONUS*(perks.magnet||0));}

export function coinValue(v,perks){return Math.round(v*(1+PERK_MAGNET_COIN_BONUS*(perks.magnet||0)));}
